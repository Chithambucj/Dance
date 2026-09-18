"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createPricingPlan(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name            = (formData.get("name")            as string)?.trim();
  const description     = (formData.get("description")     as string)?.trim();
  const price           = parseFloat(formData.get("price") as string);
  const period          = (formData.get("period")          as string)?.trim() || "/ month";
  const billingPeriod   = (formData.get("billingPeriod")   as string)?.trim() || "MONTHLY";
  const classesIncluded = (formData.get("classesIncluded") as string)?.trim() || "8 Classes / Month";
  const validity        = (formData.get("validity")        as string)?.trim() || "30 Days";
  const featuresRaw     = (formData.get("features")        as string)?.trim() || "[]";
  const badge           = (formData.get("badge")           as string)?.trim() || null;
  const isFeatured      = formData.get("isFeatured") === "on";
  const isPublished     = formData.get("isPublished") !== "off";

  if (!name || isNaN(price) || price < 0) {
    return { success: false, error: "Valid plan name and price are required." };
  }

  // Parse features as JSON array
  let features = "[]";
  try {
    if (featuresRaw.startsWith("[")) {
      features = featuresRaw;
    } else {
      const lines = featuresRaw.split("\n").map((l) => l.trim()).filter(Boolean);
      features = JSON.stringify(lines);
    }
  } catch {
    features = "[]";
  }

  try {
    await prisma.pricingPlan.create({
      data: {
        name,
        description: description || null,
        price,
        period,
        billingPeriod,
        classesIncluded,
        validity,
        features,
        badge,
        isFeatured,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/pricing");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("createPricingPlan error:", err);
    return { success: false, error: "Failed to create pricing plan." };
  }
}

export async function editPricingPlan(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const name            = (formData.get("name")            as string)?.trim();
  const description     = (formData.get("description")     as string)?.trim();
  const price           = parseFloat(formData.get("price") as string);
  const period          = (formData.get("period")          as string)?.trim() || "/ month";
  const billingPeriod   = (formData.get("billingPeriod")   as string)?.trim() || "MONTHLY";
  const classesIncluded = (formData.get("classesIncluded") as string)?.trim() || "8 Classes / Month";
  const validity        = (formData.get("validity")        as string)?.trim() || "30 Days";
  const featuresRaw     = (formData.get("features")        as string)?.trim() || "[]";
  const badge           = (formData.get("badge")           as string)?.trim() || null;
  const isFeatured      = formData.get("isFeatured") === "on";
  const isPublished     = formData.get("isPublished") === "on";

  if (!name || isNaN(price) || price < 0) {
    return { success: false, error: "Valid plan name and price are required." };
  }

  let features = "[]";
  try {
    if (featuresRaw.startsWith("[")) {
      features = featuresRaw;
    } else {
      const lines = featuresRaw.split("\n").map((l) => l.trim()).filter(Boolean);
      features = JSON.stringify(lines);
    }
  } catch {
    features = "[]";
  }

  try {
    await prisma.pricingPlan.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price,
        period,
        billingPeriod,
        classesIncluded,
        validity,
        features,
        badge,
        isFeatured,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/pricing");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("editPricingPlan error:", err);
    return { success: false, error: "Failed to update pricing plan." };
  }
}

export async function deletePricingPlan(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.pricingPlan.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/pricing");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deletePricingPlan error:", err);
    return { success: false, error: "Failed to delete pricing plan." };
  }
}
