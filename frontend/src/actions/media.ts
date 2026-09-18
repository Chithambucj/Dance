"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";

export async function uploadMediaAction(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title       = (formData.get("title")       as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category    = (formData.get("category")    as string)?.trim() || "General";
  const mediaType   = (formData.get("mediaType")   as string)?.trim() || "IMAGE";
  const isFeatured  = formData.get("isFeatured") === "on";
  const isPublished = formData.get("isPublished") !== "off";
  const file        = formData.get("file") as File | null;
  const externalUrl = (formData.get("externalUrl") as string)?.trim();

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  let finalUrl = externalUrl || "";
  let filePath = externalUrl || "";

  if (file && file.size > 0) {
    const uploadRes = await uploadFile(file, category.toLowerCase());
    if (!uploadRes.success) {
      return { success: false, error: uploadRes.error || "Failed to upload file." };
    }
    finalUrl = uploadRes.url || "";
    filePath = uploadRes.filePath || "";
  }

  if (!finalUrl) {
    return { success: false, error: "Please upload an image file or provide a media URL." };
  }

  try {
    await prisma.media.create({
      data: {
        title,
        description: description || null,
        filePath,
        publicUrl: finalUrl,
        mediaType,
        category,
        isFeatured,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("uploadMediaAction error:", err);
    return { success: false, error: "Failed to save media record." };
  }
}

export async function editMedia(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title       = (formData.get("title")       as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const category    = (formData.get("category")    as string)?.trim() || "General";
  const isFeatured  = formData.get("isFeatured") === "on";
  const isPublished = formData.get("isPublished") === "on";
  const publicUrl   = (formData.get("publicUrl")   as string)?.trim();

  if (!title) {
    return { success: false, error: "Title is required." };
  }

  try {
    await prisma.media.update({
      where: { id },
      data: {
        title,
        description: description || null,
        category,
        isFeatured,
        isPublished,
        ...(publicUrl ? { publicUrl, filePath: publicUrl } : {}),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("editMedia error:", err);
    return { success: false, error: "Failed to update media." };
  }
}

export async function deleteMedia(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.media.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deleteMedia error:", err);
    return { success: false, error: "Failed to delete media." };
  }
}

export async function toggleMediaPublish(id: string, isPublished: boolean) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.media.update({
      where: { id },
      data: { isPublished },
    });
    revalidatePath("/admin");
    revalidatePath("/gallery");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("toggleMediaPublish error:", err);
    return { success: false, error: "Failed to update status." };
  }
}
