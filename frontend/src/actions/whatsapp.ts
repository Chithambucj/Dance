"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";

// ── Record and prepare WhatsApp reminder ──────────────────────────────────────
// Uses wa.me links — official WhatsApp shortlink, safe and no API keys needed.
// For official WhatsApp Business API, replace with:
//   POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
//   with Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}

export async function recordWhatsAppReminder({
  clientId,
  phone,
  pendingAmount,
  membershipId,
  studioName = "Dance Studio",
}: {
  clientId: string;
  phone: string;
  pendingAmount: number;
  membershipId?: string;
  studioName?: string;
}) {
  await requireAuth(["ADMIN"]);

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { firstName: true },
  });
  const name = client?.firstName || "there";

  const message = `Hi ${name}, this is a gentle reminder from ${studioName}. Your membership fee of ₹${pendingAmount.toLocaleString()} is currently pending. Please complete the payment at your earliest convenience. Thank you! 🙏`;

  try {
    // Record the reminder in DB
    await prisma.whatsAppReminder.create({
      data: {
        clientId,
        phone,
        message,
        pendingAmount,
        membershipId: membershipId || null,
        status: "SENT",
      },
    });

    // Clean phone number (remove spaces, dashes; ensure country code)
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");
    const withCode = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

    const waUrl = `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`;

    return { success: true, waUrl, message };
  } catch (err) {
    console.error("recordWhatsAppReminder error:", err);
    return { success: false, error: "Failed to record reminder." };
  }
}

// ── Get reminder history for a client ─────────────────────────────────────────

export async function getReminderHistory(clientId: string) {
  await requireAuth(["ADMIN"]);
  return prisma.whatsAppReminder.findMany({
    where: { clientId },
    orderBy: { sentAt: "desc" },
  });
}

// ── Get all reminders (for admin panel) ───────────────────────────────────────

export async function getAllReminders() {
  await requireAuth(["ADMIN"]);
  return prisma.whatsAppReminder.findMany({
    include: {
      client: { select: { firstName: true, lastName: true, email: true } },
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  });
}
