"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function markAttendance(userId: string, batchId: string, present: boolean) {
  await requireAuth(["ADMIN"]);

  // Normalise to start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    await prisma.attendance.upsert({
      where: { userId_batchId_date: { userId, batchId, date: today } },
      create: { userId, batchId, date: today, present },
      update: { present },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("markAttendance error:", err);
    return { success: false, error: "Failed to record attendance." };
  }
}
