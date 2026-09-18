"use client";

import { useState } from "react";
import { X, Phone, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PendingMember {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  pendingAmount: number;
  dueDate: string | null;
  status: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildWhatsAppUrl(phone: string, name: string, amount: number) {
  const clean = phone.replace(/\D/g, "");
  const withCC = clean.startsWith("91") ? clean : `91${clean}`;
  const msg = encodeURIComponent(
    `Hi ${name}, this is a reminder that your dance class fee of ${fmt(amount)} is pending. Please make the payment at your earliest convenience. Thank you! 🙏`
  );
  return `https://wa.me/${withCC}?text=${msg}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  count: number;
  members: PendingMember[];
}

export default function PendingMembersModal({ count, members }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger Card */}
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-2xl border-0 shadow-sm bg-white p-5 flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="p-3 rounded-xl text-orange-600 bg-orange-50 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Fees Pending</p>
          <p className="text-2xl font-black text-gray-900">{count} Members</p>
          <p className="text-xs text-indigo-500 font-semibold mt-0.5">Click to view →</p>
        </div>
      </div>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">Pending Members</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {count} member{count !== 1 ? "s" : ""} with outstanding fees
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1">
              {members.length === 0 ? (
                <div className="py-16 text-center text-gray-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="font-semibold">No pending members</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm">
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3">Member</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3">Due Date</th>
                      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide py-3">Status</th>
                      <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide py-3 px-6">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                        {/* Member */}
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-gray-900 text-sm">
                            {m.firstName} {m.lastName}
                          </p>
                          {m.phone ? (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              {m.phone}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-300 italic mt-0.5">No phone</p>
                          )}
                        </td>
                        {/* Amount */}
                        <td className="py-3.5">
                          <p className="font-black text-orange-600 text-sm">{fmt(m.pendingAmount)}</p>
                        </td>
                        {/* Due Date */}
                        <td className="py-3.5">
                          <p className="text-sm text-gray-600">{fmtDate(m.dueDate)}</p>
                        </td>
                        {/* Status */}
                        <td className="py-3.5">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 uppercase">
                            {m.status === "PAYMENT_PENDING" ? "PENDING" : m.status === "PARTIALLY_PAID" ? "PARTIAL" : m.status}
                          </span>
                        </td>
                        {/* WhatsApp */}
                        <td className="py-3.5 px-6 text-right">
                          {m.phone ? (
                            <a
                              href={buildWhatsAppUrl(m.phone, `${m.firstName} ${m.lastName}`, m.pendingAmount)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              WhatsApp
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 italic">No phone</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
