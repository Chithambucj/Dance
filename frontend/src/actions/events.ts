"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title                = (formData.get("title")                as string)?.trim();
  const description          = (formData.get("description")          as string)?.trim();
  const image                = (formData.get("image")                as string)?.trim() || null;
  const eventDateStr         = (formData.get("eventDate")            as string)?.trim();
  const startTime            = (formData.get("startTime")            as string)?.trim() || null;
  const endTime              = (formData.get("endTime")              as string)?.trim() || null;
  const location             = (formData.get("location")             as string)?.trim() || "Main Studio Hall";
  const registrationLink     = (formData.get("registrationLink")     as string)?.trim() || null;
  const registrationRequired = formData.get("registrationRequired") === "on";
  const category             = (formData.get("category")             as string)?.trim() || "Workshop";
  const isPublished          = formData.get("isPublished") !== "off";

  if (!title || !description || !eventDateStr) {
    return { success: false, error: "Title, description, and event date are required." };
  }

  const eventDate = new Date(eventDateStr);
  if (isNaN(eventDate.getTime())) {
    return { success: false, error: "Invalid event date." };
  }

  try {
    await prisma.event.create({
      data: {
        title,
        description,
        image,
        eventDate,
        startTime,
        endTime,
        location,
        registrationRequired,
        registrationLink,
        category,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("createEvent error:", err);
    return { success: false, error: "Failed to create event." };
  }
}

export async function editEvent(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const title                = (formData.get("title")                as string)?.trim();
  const description          = (formData.get("description")          as string)?.trim();
  const image                = (formData.get("image")                as string)?.trim() || null;
  const eventDateStr         = (formData.get("eventDate")            as string)?.trim();
  const startTime            = (formData.get("startTime")            as string)?.trim() || null;
  const endTime              = (formData.get("endTime")              as string)?.trim() || null;
  const location             = (formData.get("location")             as string)?.trim() || "Main Studio Hall";
  const registrationLink     = (formData.get("registrationLink")     as string)?.trim() || null;
  const registrationRequired = formData.get("registrationRequired") === "on";
  const category             = (formData.get("category")             as string)?.trim() || "Workshop";
  const isPublished          = formData.get("isPublished") === "on";

  if (!title || !description || !eventDateStr) {
    return { success: false, error: "Title, description, and event date are required." };
  }

  const eventDate = new Date(eventDateStr);
  if (isNaN(eventDate.getTime())) {
    return { success: false, error: "Invalid event date." };
  }

  try {
    await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        image,
        eventDate,
        startTime,
        endTime,
        location,
        registrationRequired,
        registrationLink,
        category,
        isPublished,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("editEvent error:", err);
    return { success: false, error: "Failed to update event." };
  }
}

export async function deleteEvent(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.event.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/events");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("deleteEvent error:", err);
    return { success: false, error: "Failed to delete event." };
  }
}
