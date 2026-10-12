"use client";

import { MessageCircle } from "lucide-react";
import { recordWhatsAppReminder } from "@/actions/whatsapp";
import { cn } from "@/lib/utils";
import {
  buildWhatsAppReminderMessage,
  buildExpiredTrialReminderMessage,
  getWhatsAppUrl,
  isValidPhone,
  PendingInvoiceDetail,
} from "@/lib/whatsappReminder";

interface WhatsAppReminderActionProps {
  clientId: string;
  clientName: string;
  phone?: string | null;
  type?: "payment" | "trial_followup";
  totalOutstanding?: number;
  invoices?: PendingInvoiceDetail[];
  className?: string;
}

export default function WhatsAppReminderAction({
  clientId,
  clientName,
  phone,
  type = "payment",
  totalOutstanding = 0,
  invoices = [],
  className = "",
}: WhatsAppReminderActionProps) {
  const hasValidPhone = isValidPhone(phone);

  // Payment reminders require an outstanding balance > 0
  if (type === "payment" && totalOutstanding <= 0) {
    return null;
  }

  // If no valid phone on file, show a disabled action with a clear explanation
  if (!hasValidPhone || !phone) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        data-action="whatsapp-reminder"
        data-reminder-type={type}
        data-client-id={clientId}
        title="No valid registered phone number on file for this member. Please add a phone number in their profile to enable WhatsApp reminders."
        className={cn(
          "inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1.5 h-8 rounded-lg bg-gray-100 text-gray-400 border border-gray-200/80 cursor-not-allowed shadow-xs shrink-0 select-none",
          className
        )}
      >
        <MessageCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="whitespace-nowrap">No Phone</span>
      </button>
    );
  }

  const isTrial = type === "trial_followup";

  const message = isTrial
    ? buildExpiredTrialReminderMessage({
        memberName: clientName,
        studioName: "StepUp Dance Studio",
      })
    : buildWhatsAppReminderMessage({
        memberName: clientName,
        totalOutstanding,
        invoices,
        studioName: "StepUp Dance Studio",
      });

  const waUrl = getWhatsAppUrl({ phone, message });

  const handleClick = () => {
    // Record reminder initiation in database as CLICK_TO_CHAT
    recordWhatsAppReminder({
      clientId,
      phone,
      pendingAmount: isTrial ? 0 : totalOutstanding,
      customMessage: message,
    }).catch((err) => {
      console.warn("Could not record WhatsApp reminder interaction:", err);
    });
  };

  const actionTitle = isTrial
    ? `Send WhatsApp Dance Class Invitation to ${clientName} (${phone})`
    : `Send WhatsApp Payment Reminder to ${clientName} (${phone})`;

  const ariaLabel = isTrial
    ? `Send WhatsApp invitation to ${clientName}`
    : `Send WhatsApp payment reminder to ${clientName}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      data-action="whatsapp-reminder"
      data-reminder-type={type}
      data-client-id={clientId}
      data-phone={phone}
      data-amount={isTrial ? 0 : totalOutstanding}
      title={actionTitle}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 text-xs font-bold px-2.5 py-1.5 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 shadow-xs transition-all shrink-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
        className
      )}
    >
      <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20 shrink-0" />
      <span className="whitespace-nowrap">WhatsApp</span>
    </a>
  );
}
