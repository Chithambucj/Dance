"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createBatch(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name          = (formData.get("name")         as string)?.trim();
  const classStyleId  = (formData.get("classStyleId") as string)?.trim();
  const instructorId  = (formData.get("instructorId") as string)?.trim() || null;
  const schedule      = (formData.get("schedule")     as string)?.trim();
  const days          = (formData.get("days")         as string)?.trim() || null;
  const startTime     = (formData.get("startTime")    as string)?.trim() || null;
  const endTime       = (formData.get("endTime")      as string)?.trim() || null;
  const capacityRaw   = formData.get("capacity") as string;
  const capacity      = capacityRaw ? parseInt(capacityRaw, 10) : 20;
  const feeMonthly    = parseFloat((formData.get("feeMonthly") as string) || "1500");
  const feeQuarterly  = parseFloat((formData.get("feeQuarterly") as string) || "4000");
  const feeYearly     = parseFloat((formData.get("feeYearly") as string) || "12000");
  const isActive      = formData.get("isActive") !== "off";

  if (!name || !classStyleId || !schedule) {
    return { success: false, error: "Batch name, class style, and schedule are required." };
  }
  if (isNaN(capacity) || capacity < 1) {
    return { success: false, error: "Capacity must be a positive number." };
  }

  try {
    await prisma.batch.create({
      data: {
        name,
        classStyleId,
        instructorId: instructorId || null,
        schedule,
        days,
        startTime,
        endTime,
        capacity,
        feeMonthly: isNaN(feeMonthly) ? 1500 : feeMonthly,
        feeQuarterly: isNaN(feeQuarterly) ? 4000 : feeQuarterly,
        feeYearly: isNaN(feeYearly) ? 12000 : feeYearly,
        isActive,
      },
    });
    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("createBatch error:", err);
    return { success: false, error: "Failed to create batch." };
  }
}

export async function editBatch(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name          = (formData.get("name")         as string)?.trim();
  const classStyleId  = (formData.get("classStyleId") as string)?.trim();
  const instructorId  = (formData.get("instructorId") as string)?.trim() || null;
  const schedule      = (formData.get("schedule")     as string)?.trim();
  const days          = (formData.get("days")         as string)?.trim() || null;
  const startTime     = (formData.get("startTime")    as string)?.trim() || null;
  const endTime       = (formData.get("endTime")      as string)?.trim() || null;
  const capacityRaw   = formData.get("capacity") as string;
  const capacity      = capacityRaw ? parseInt(capacityRaw, 10) : 20;
  const feeMonthly    = parseFloat((formData.get("feeMonthly") as string) || "1500");
  const feeQuarterly  = parseFloat((formData.get("feeQuarterly") as string) || "4000");
  const feeYearly     = parseFloat((formData.get("feeYearly") as string) || "12000");
  const isActive      = formData.get("isActive") === "on";

  if (!name || !classStyleId || !schedule) {
    return { success: false, error: "Batch name, class style, and schedule are required." };
  }
  if (isNaN(capacity) || capacity < 1) {
    return { success: false, error: "Capacity must be a positive number." };
  }

  try {
    await prisma.batch.update({
      where: { id },
      data: {
        name,
        classStyleId,
        instructorId: instructorId || null,
        schedule,
        days,
        startTime,
        endTime,
        capacity,
        feeMonthly: isNaN(feeMonthly) ? 1500 : feeMonthly,
        feeQuarterly: isNaN(feeQuarterly) ? 4000 : feeQuarterly,
        feeYearly: isNaN(feeYearly) ? 12000 : feeYearly,
        isActive,
      },
    });
    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("editBatch error:", err);
    return { success: false, error: "Failed to edit batch." };
  }
}

export async function deleteBatch(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.attendance.deleteMany({ where: { batchId: id } });
    await prisma.enrollment.deleteMany({ where: { batchId: id } });
    await prisma.batch.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deleteBatch error:", err);
    return { success: false, error: "Failed to delete batch." };
  }
}
