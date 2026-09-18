"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function updateWebsiteSection(sectionKey: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title            = (formData.get("title")            as string)?.trim() || null;
  const subtitle         = (formData.get("subtitle")         as string)?.trim() || null;
  const heading          = (formData.get("heading")          as string)?.trim() || null;
  const highlightedText  = (formData.get("highlightedText")  as string)?.trim() || null;
  const description      = (formData.get("description")      as string)?.trim() || null;
  const badgeText        = (formData.get("badgeText")        as string)?.trim() || null;
  const primaryBtnText   = (formData.get("primaryBtnText")   as string)?.trim() || null;
  const primaryBtnLink   = (formData.get("primaryBtnLink")   as string)?.trim() || null;
  const secondaryBtnText = (formData.get("secondaryBtnText") as string)?.trim() || null;
  const secondaryBtnLink = (formData.get("secondaryBtnLink") as string)?.trim() || null;
  const image            = (formData.get("image")            as string)?.trim() || null;
  const data             = (formData.get("data")             as string)?.trim() || null;
  const isPublished      = formData.get("isPublished") !== "off";

  try {
    await prisma.websiteSection.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle,
        heading,
        highlightedText,
        description,
        badgeText,
        primaryBtnText,
        primaryBtnLink,
        secondaryBtnText,
        secondaryBtnLink,
        image,
        data,
        isPublished,
      },
      create: {
        sectionKey,
        title,
        subtitle,
        heading,
        highlightedText,
        description,
        badgeText,
        primaryBtnText,
        primaryBtnLink,
        secondaryBtnText,
        secondaryBtnLink,
        image,
        data,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/classes");
    revalidatePath("/contact");
    return { success: true };
  } catch (err) {
    console.error("updateWebsiteSection error:", err);
    return { success: false, error: "Failed to save website content section." };
  }
}
