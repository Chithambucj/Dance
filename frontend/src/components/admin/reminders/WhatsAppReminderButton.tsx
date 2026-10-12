"use client";

import { useState } from "react";
import { MessageCircle, Phone, Eye, CheckCircle2, Copy, Check, Send, X } from "lucide-react";
import { recordWhatsAppReminder } from "@/actions/whatsapp";
import {
  buildWhatsAppReminderMessage,
  buildExpiredTrialReminderMessage,
  getWhatsAppUrl,
  isValidPhone,
  PendingInvoiceDetail,
} from "@/lib/whatsappReminder";
import { Button } from "@/components/ui/button";

interface Props {
  clientId: string;
  clientName: string;
  phone: string | null;
  type?: "payment" | "trial_followup";
  pendingAmount?: number;
  invoices?: PendingInvoiceDetail[];
  earliestDueDate?: string | null;
  planName?: string;
  fullWidth?: boolean;
}

export default function WhatsAppReminderButton({
  clientId,
  clientName,
  phone,
  type = "payment",
  pendingAmount = 0,
  invoices = [],
  earliestDueDate,
  planName = "Dance Class Membership",
  fullWidth = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openedFeedback, setOpenedFeedback] = useState(false);

  const hasPhone = isValidPhone(phone);
  const isTrial = type === "trial_followup";

  // Build message
  const message = isTrial
    ? buildExpiredTrialReminderMessage({
        memberName: clientName,
        studioName: "StepUp Dance Studio",
      })
    : buildWhatsAppReminderMessage({
        memberName: clientName,
        totalOutstanding: pendingAmount,
        invoices: invoices.length > 0 ? invoices : [{
          amount: pendingAmount,
          planName,
          dueDate: earliestDueDate,
        }],
        studioName: "StepUp Dance Studio",
      });

  const waUrl = hasPhone && phone ? getWhatsAppUrl({ phone, message }) : "";

  const handleOpenWhatsApp = () => {
    if (!hasPhone || !phone) return;

    // Asynchronously record click-to-chat in DB
    recordWhatsAppReminder({
      clientId,
      phone,
      pendingAmount: isTrial ? 0 : pendingAmount,
      customMessage: message,
      type,
    }).catch((err) => {
      console.warn("Could not log reminder interaction:", err);
    });

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setOpenedFeedback(true);
    setTimeout(() => setOpenedFeedback(false), 4000);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Copy to clipboard failed:", err);
    }
  };

  // If no phone on file, render disabled button explaining why
  if (!hasPhone) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          data-action="send-reminder"
          data-client-id={clientId}
          title="No valid registered phone number on file for this member. Please add a phone number in their profile."
          className={`
            inline-flex items-center justify-center gap-1.5 text-xs font-bold
            px-3 py-1.5 h-8 sm:h-8.5 rounded-lg
            bg-gray-100 text-gray-400 border border-gray-200/80 cursor-not-allowed
            ${fullWidth ? "w-full" : ""}
          `}
        >
          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="whitespace-nowrap">No Phone on File</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${fullWidth ? "w-full" : ""}`}>
        {/* Main "Send Reminder" / "Send Follow-up" button */}
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          data-action="send-reminder"
          data-action-type={type}
          data-client-id={clientId}
          data-phone={phone}
          data-amount={isTrial ? 0 : pendingAmount}
          data-wa-url={waUrl}
          title={
            isTrial
              ? `Open WhatsApp to invite ${clientName} to regular dance classes`
              : `Open WhatsApp to send payment reminder to ${clientName} (₹${pendingAmount.toLocaleString("en-IN")})`
          }
          className={`
            inline-flex items-center justify-center gap-1.5 text-xs font-bold
            px-3 py-1.5 h-8 sm:h-8.5 rounded-lg
            transition-all duration-150 active:scale-95 shadow-xs shrink-0
            ${
              isTrial
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }
            ${fullWidth ? "flex-1" : ""}
          `}
        >
          <MessageCircle
            className={`w-3.5 h-3.5 shrink-0 ${
              isTrial ? "text-blue-600 fill-blue-600/20" : "text-emerald-600 fill-emerald-600/20"
            }`}
          />
          <span className="whitespace-nowrap font-bold">
            {openedFeedback
              ? "WhatsApp Opened!"
              : isTrial
              ? "Send Follow-up"
              : "Send Reminder"}
          </span>
        </button>

        {/* Message preview icon button */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          data-action="preview-reminder"
          title="Preview pre-filled WhatsApp message"
          aria-label="Preview pre-filled message"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200/70 transition-colors shrink-0"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div
              className={`px-5 py-4 flex items-center justify-between text-white ${
                isTrial
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                  : "bg-gradient-to-r from-emerald-600 to-green-600"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    {isTrial ? "Trial Follow-up Preview" : "Payment Reminder Preview"}
                  </h3>
                  <p className="text-white/80 text-[10px] font-medium">
                    Click-to-chat reminder flow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3.5 text-left">
              {/* Recipient summary card */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{clientName}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{phone}</span>
                  </p>
                </div>
                {!isTrial && pendingAmount > 0 && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending</span>
                    <span className="text-base font-black text-orange-600">
                      ₹{pendingAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {isTrial && (
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Free Trial
                    </span>
                  </div>
                )}
              </div>

              {/* Multiple Invoices breakdown if applicable */}
              {!isTrial && invoices && invoices.length > 1 && (
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Unpaid Invoices ({invoices.length})
                  </p>
                  {invoices.map((inv, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-xl bg-orange-50/60 border border-orange-100"
                    >
                      <span className="font-medium text-gray-700 truncate mr-2">
                        {inv.planName || inv.description || `Invoice #${idx + 1}`}
                      </span>
                      <span className="font-bold text-orange-700 shrink-0">
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message text preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Pre-filled Message
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 max-h-44 overflow-y-auto">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                    {message}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Opens WhatsApp directly with this pre-filled message. Press &apos;Send&apos; in WhatsApp to deliver.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-9 rounded-xl font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleOpenWhatsApp();
                    setModalOpen(false);
                  }}
                  className={`flex-1 h-9 rounded-xl font-bold text-white text-xs ${
                    isTrial
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    Open in WhatsApp
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
