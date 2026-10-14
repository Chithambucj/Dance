"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

function revalidateAnnouncementPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin?tab=announcements");
  revalidatePath("/member");
  revalidatePath("/member", "layout");
  revalidatePath("/member?tab=announcements");
}

export async function createAnnouncement(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title   = (formData.get("title")   as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const isPublished = formData.has("isPublished")
    ? formData.get("isPublished") === "on" || formData.get("isPublished") === "true"
    : true;

  if (!title || !content) {
    return { success: false, error: "Title and content are required." };
  }

  try {
    await prisma.announcement.create({
      data: {
        title,
        content,
        isPublished,
        publishDate: new Date(),
      },
    });
    revalidateAnnouncementPaths();
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
    revalidateAnnouncementPaths();
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
  const isPublished = formData.has("isPublished")
    ? formData.get("isPublished") === "on" || formData.get("isPublished") === "true"
    : undefined;

  if (!title || !content) {
    return { success: false, error: "Title and content are required." };
  }

  try {
    await prisma.announcement.update({
      where: { id },
      data: {
        title,
        content,
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });
    revalidateAnnouncementPaths();
    return { success: true };
  } catch (err) {
    console.error("editAnnouncement error:", err);
    return { success: false, error: "Failed to update announcement." };
  }
}

export async function togglePublishAnnouncement(id: string, isPublished: boolean) {
  await requireAuth(["ADMIN"]);

  try {
    await prisma.announcement.update({
      where: { id },
      data: { isPublished },
    });
    revalidateAnnouncementPaths();
    return { success: true };
  } catch (err) {
    console.error("togglePublishAnnouncement error:", err);
    return { success: false, error: "Failed to update announcement publication status." };
  }
}

