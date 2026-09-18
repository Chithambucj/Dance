"use client";

import { useState } from "react";
import { MessageCircle, X, Loader2, Phone, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordWhatsAppReminder } from "@/actions/whatsapp";

interface Props {
  clientId: string;
  clientName: string;
  phone: string;
  pendingAmount: number;
  membershipId?: string;
}

export default function WhatsAppReminderModal({
  clientId, clientName, phone, pendingAmount, membershipId
}: Props) {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  const previewMessage = `Hi ${clientName.split(" ")[0]}, this is a gentle reminder from Dance Studio. Your membership fee of ₹${pendingAmount.toLocaleString()} is currently pending. Please complete the payment at your earliest convenience. Thank you! 🙏`;

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
      });

      if (result.success && result.waUrl) {
        setSent(true);
        // Open WhatsApp in new tab
        window.open(result.waUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(result.error || "Failed to send reminder.");
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
        onClick={() => { setOpen(true); setSent(false); setError(""); }}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors border border-green-200"
        title="Send WhatsApp Reminder"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-7 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg leading-tight">Send Payment Reminder</h2>
                  <p className="text-white/70 text-xs font-medium">via WhatsApp</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7 space-y-5">
              {!sent ? (
                <>
                  {/* Client info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                      {clientName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{clientName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
                        <Phone className="w-3 h-3" />
                        {phone || <span className="text-red-500">No phone number</span>}
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Pending</p>
                      <p className="font-black text-orange-600 text-xl">₹{pendingAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div>
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">
                      Message Preview
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                      <p className="text-sm text-gray-700 font-medium leading-relaxed">&ldquo;{previewMessage}&rdquo;</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      This message will open in WhatsApp. Click send in WhatsApp to deliver it.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
                      {error}
                    </div>
                  )}

                  {!phone && (
                    <div className="p-3 bg-orange-50 text-orange-700 text-sm rounded-xl border border-orange-100 font-medium">
                      ⚠ No phone number on file for this client. Please update their profile first.
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" onClick={() => setOpen(false)}
                      className="flex-1 h-11 rounded-2xl font-bold border-gray-200">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={loading || !phone}
                      className="flex-1 h-11 rounded-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Sending…</span>
                      ) : (
                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Send Reminder</span>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">WhatsApp Opened!</h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      The reminder message has been pre-filled in WhatsApp. Click Send in WhatsApp to deliver it to {clientName}.
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">
                    This reminder has been recorded in the system.
                  </p>
                  <Button onClick={() => setOpen(false)}
                    className="w-full h-11 rounded-2xl font-bold bg-primary text-white">
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
