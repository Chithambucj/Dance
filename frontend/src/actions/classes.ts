"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createClassStyle(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name        = (formData.get("name")        as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const image       = (formData.get("image")       as string)?.trim() || null;
  const level       = (formData.get("level")       as string)?.trim() || "All Levels";
  const priceRaw    = formData.get("price") as string;
  const price       = priceRaw ? parseFloat(priceRaw) : 1500;
  const duration    = (formData.get("duration")    as string)?.trim() || "60 mins";
  const isPublished = formData.get("isPublished") !== "off";

  if (!name) {
    return { success: false, error: "Class style name is required." };
  }

  try {
    const existing = await prisma.classStyle.findUnique({ where: { name } });
    if (existing) return { success: false, error: "A class style with this name already exists." };

    await prisma.classStyle.create({
      data: {
        name,
        description: description || null,
        image,
        level,
        price,
        duration,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("createClassStyle error:", err);
    return { success: false, error: "Failed to create class style." };
  }
}

export async function editClassStyle(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name        = (formData.get("name")        as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const image       = (formData.get("image")       as string)?.trim() || null;
  const level       = (formData.get("level")       as string)?.trim() || "All Levels";
  const priceRaw    = formData.get("price") as string;
  const price       = priceRaw ? parseFloat(priceRaw) : 1500;
  const duration    = (formData.get("duration")    as string)?.trim() || "60 mins";
  const isPublished = formData.get("isPublished") === "on";

  if (!name) {
    return { success: false, error: "Class style name is required." };
  }

  try {
    const existing = await prisma.classStyle.findFirst({ where: { name, NOT: { id } } });
    if (existing) return { success: false, error: "Another class style with this name already exists." };

    await prisma.classStyle.update({
      where: { id },
      data: {
        name,
        description: description || null,
        image,
        level,
        price,
        duration,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("editClassStyle error:", err);
    return { success: false, error: "Failed to edit class style." };
  }
}

export async function deleteClassStyle(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    const batchCount = await prisma.batch.count({ where: { classStyleId: id } });
    if (batchCount > 0) {
      return {
        success: false,
        error: `Cannot delete — ${batchCount} batch(es) are using this style. Remove or reassign those batches first.`,
      };
    }
    await prisma.classStyle.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deleteClassStyle error:", err);
    return { success: false, error: "Failed to delete class style." };
  }
}

export async function toggleClassStylePublish(id: string, isPublished: boolean) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.classStyle.update({
      where: { id },
      data: { isPublished },
    });
    revalidatePath("/admin");
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("toggleClassStylePublish error:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}
