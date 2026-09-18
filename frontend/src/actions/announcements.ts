"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title   = (formData.get("title")   as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!title || !content) {
    return { success: false, error: "Title and content are required." };
  }

  try {
    await prisma.announcement.create({ data: { title, content } });
    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("createAnnouncement error:", err);
    return { success: false, error: "Failed to create announcement." };
  }
}

export async function deleteAnnouncement(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("deleteAnnouncement error:", err);
    return { success: false, error: "Failed to delete announcement." };
  }
}

export async function editAnnouncement(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title   = (formData.get("title")   as string)?.trim();
  const content = (formData.get("content") as string)?.trim();

  if (!title || !content) {
    return { success: false, error: "Title and content are required." };
  }

  try {
    await prisma.announcement.update({
      where: { id },
      data: { title, content },
    });
    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("editAnnouncement error:", err);
    return { success: false, error: "Failed to update announcement." };
  }
}

