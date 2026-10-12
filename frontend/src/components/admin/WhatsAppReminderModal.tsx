"use client";

import { useState } from "react";
import { MessageCircle, X, Phone, CheckCircle2, Send, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordWhatsAppReminder } from "@/actions/whatsapp";
import {
  buildWhatsAppReminderMessage,
  getWhatsAppUrl,
  PendingInvoiceDetail,
} from "@/lib/whatsappReminder";

interface Props {
  clientId: string;
  clientName: string;
  phone: string;
  pendingAmount: number;
  membershipId?: string;
  invoices?: PendingInvoiceDetail[];
}

export default function WhatsAppReminderModal({
  clientId,
  clientName,
  phone,
  pendingAmount,
  membershipId,
  invoices = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const previewMessage = buildWhatsAppReminderMessage({
    memberName: clientName,
    totalOutstanding: pendingAmount,
    invoices,
    studioName: "StepUp Dance Studio",
  });

  const waUrl = getWhatsAppUrl({ phone, message: previewMessage });

  async function handleSend() {
    if (!phone) {
      setError("No phone number on file for this client.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await recordWhatsAppReminder({
        clientId,
        phone,
        pendingAmount,
        membershipId,
        customMessage: previewMessage,
      });

      if (result.success && result.waUrl) {
        setSent(true);
        // Open WhatsApp in new tab
        window.open(result.waUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error || "Failed to open WhatsApp.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setSent(false);
          setError("");
        }}
        data-action="whatsapp-reminder"
        className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-1.5 h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 shrink-0"
        title="Send WhatsApp Reminder"
      >
        <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/20" />
        WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-base leading-tight">WhatsApp Payment Reminder</h2>
                  <p className="text-white/80 text-[11px] font-medium">Click-to-chat flow</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!sent ? (
                <>
                  {/* Client info */}
                  <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm shrink-0">
                      {clientName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 text-sm truncate">{clientName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{phone || <span className="text-red-500">No phone</span>}</span>
                      </div>
                    </div>
                    <div className="ml-auto text-right shrink-0">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Outstanding</p>
                      <p className="font-black text-orange-600 text-lg">₹{pendingAmount.toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  {/* Multiple invoices list if applicable */}
                  {invoices && invoices.length > 1 && (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        Pending Invoices ({invoices.length})
                      </p>
                      {invoices.map((inv, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-orange-50/60 border border-orange-100">
                          <span className="font-semibold text-gray-800 truncate mr-2">
                            {inv.planName || inv.description || `Invoice #${idx + 1}`}
                          </span>
                          <span className="font-bold text-orange-700 shrink-0">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message preview */}
                  <div>
                    <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-1.5">
                      Pre-filled Message Preview
                    </p>
                    <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-3.5 max-h-48 overflow-y-auto">
                      <p className="text-xs text-gray-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {previewMessage}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      Opens official WhatsApp click-to-chat with this pre-filled reminder.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100 font-medium">
                      {error}
                    </div>
                  )}

                  {!phone && (
                    <div className="p-3 bg-orange-50 text-orange-700 text-xs rounded-xl border border-orange-100 font-medium">
                      ⚠ No registered phone number on file for this member.
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(false)}
                      className="flex-1 h-10 rounded-xl font-bold border-gray-200 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={loading || !phone}
                      className="flex-1 h-10 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200 text-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5" />
                        Open in WhatsApp
                      </span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base">WhatsApp Opened!</h3>
                    <p className="text-gray-600 text-xs font-medium mt-1 leading-relaxed">
                      Click-to-chat link opened in WhatsApp. Please press <span className="font-bold">Send</span> in WhatsApp to deliver the message to {clientName}.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={() => setOpen(false)}
                      className="w-full h-10 rounded-xl font-bold bg-[#121020] text-white text-xs"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
