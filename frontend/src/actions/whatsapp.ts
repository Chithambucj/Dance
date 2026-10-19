"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";

// ── Record and prepare WhatsApp reminder ──────────────────────────────────────
// Uses wa.me links — official WhatsApp shortlink, safe and no API keys needed.
// For official WhatsApp Business API, replace with:
//   POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
//   with Authorization: Bearer {WHATSAPP_ACCESS_TOKEN}
import { formatWhatsAppPhone } from "@/lib/whatsappReminder";

export async function recordWhatsAppReminder({
  clientId,
  phone,
  pendingAmount = 0,
  membershipId,
  studioName = "StepUp Dance Studio",
  customMessage,
  type = "payment",
}: {
  clientId: string;
  phone: string;
  pendingAmount?: number;
  membershipId?: string;
  studioName?: string;
  customMessage?: string;
  type?: "payment" | "trial_followup" | "membership_expired";
}) {
  await requireAuth(["ADMIN"]);

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { firstName: true, lastName: true },
  });
  const name = client?.firstName ? `${client.firstName} ${client.lastName || ""}`.trim() : "there";

  const message =
    customMessage ||
    (type === "trial_followup"
      ? `Hi ${name}! 😊 Hope you enjoyed your free trial at ${studioName}! 💃 We'd love to have you join our regular dance classes. Feel free to contact us if you'd like to explore our membership plans. Hope to see you dancing with us again! 🎶`
      : type === "membership_expired"
      ? `Hello ${name},\n\nThis is a friendly reminder from ${studioName}.\n\nYour dance membership has expired. Please contact or visit the studio to renew your membership and continue your dance classes without interruption.\n\nThank you! 🙏`
      : `Hello ${name},\n\nThis is a gentle payment reminder from ${studioName}.\n\nYour outstanding fee of ₹${(pendingAmount || 0).toLocaleString("en-IN")} is pending. Please complete the payment at your earliest convenience to continue your dance classes without interruption.\n\nThank you! 🙏`);

  try {
    // Record click-to-chat initiation in DB (clearly marked as click-to-chat, not automated delivery)
    await prisma.whatsAppReminder.create({
      data: {
        clientId,
        phone,
        message,
        pendingAmount,
        membershipId: membershipId || null,
        status: "CLICK_TO_CHAT",
      },
    });

    const withCode = formatWhatsAppPhone(phone);
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
