"use client";

import { useMemo, useState } from "react";
import {
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Search,
  ArrowUpDown,
} from "lucide-react";
import WhatsAppReminderButton from "./WhatsAppReminderButton";
import { PendingInvoiceDetail } from "@/lib/whatsappReminder";

export interface PendingMemberFeeItem {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  totalPendingAmount: number;
  earliestDueDate: string | null;
  primaryPlanName: string;
  hasValidPhone: boolean;
  invoices: PendingInvoiceDetail[];
}

export interface ExpiredTrialMemberItem {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string;
  trialEndDate: string | null;
  hasValidPhone: boolean;
}

interface Props {
  canReceiveCount: number;
  totalPendingCount: number;
  pendingMembers: PendingMemberFeeItem[];
  expiredTrialMembers: ExpiredTrialMemberItem[];
}

function initials(f: string, l: string) {
  return `${(f || "").charAt(0)}${(l || "").charAt(0)}`.toUpperCase() || "M";
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Immediate";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Immediate";
  }
}

export default function WhatsAppRemindersView({
  canReceiveCount,
  totalPendingCount,
  pendingMembers,
  expiredTrialMembers,
}: Props) {
  const [activeTab, setActiveTab] = useState<"pending" | "trials">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered lists
  const filteredPending = useMemo(() => {
    if (!searchQuery.trim()) return pendingMembers;
    const q = searchQuery.toLowerCase();
    return pendingMembers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
    );
  }, [pendingMembers, searchQuery]);

  const filteredTrials = useMemo(() => {
    if (!searchQuery.trim()) return expiredTrialMembers;
    const q = searchQuery.toLowerCase();
    return expiredTrialMembers.filter(
      (m) =>
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q))
    );
  }, [expiredTrialMembers, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Title & Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
          WhatsApp Reminders
        </h1>
        <p className="text-gray-400 mt-0.5 text-xs sm:text-sm font-medium">
          Send fee reminders and trial follow-ups directly to members via WhatsApp.
        </p>
      </div>

      {/* 3 Summary Cards: Payment Reminders + Dedicated Expired Free Trials Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 w-full">
        {/* Can Receive Reminder */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`bg-white rounded-2xl p-2.5 sm:p-4 border shadow-xs flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5 text-center sm:text-left transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-emerald-300 ring-2 ring-emerald-100"
              : "border-emerald-100/80 hover:border-emerald-200"
          }`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-600/20" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
              <span className="sm:hidden">Can Remind</span>
              <span className="hidden sm:inline">Can Receive Reminder</span>
            </p>
            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
              {canReceiveCount}
            </p>
          </div>
        </div>

        {/* Total Pending Members */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`bg-white rounded-2xl p-2.5 sm:p-4 border shadow-xs flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5 text-center sm:text-left transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-orange-300 ring-2 ring-orange-100"
              : "border-orange-100/80 hover:border-orange-200"
          }`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
              <span className="sm:hidden">Pending Dues</span>
              <span className="hidden sm:inline">Pending Dues</span>
            </p>
            <p className="text-lg sm:text-2xl font-black text-gray-900 leading-tight">
              {totalPendingCount}
            </p>
          </div>
        </div>

        {/* Dedicated Expired Free Trials Summary Card */}
        <div
          onClick={() => setActiveTab("trials")}
          className={`bg-white rounded-2xl p-2.5 sm:p-4 border shadow-xs flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3.5 text-center sm:text-left transition-all cursor-pointer ${
            activeTab === "trials"
              ? "border-blue-400 ring-2 ring-blue-100 shadow-sm"
              : "border-blue-100/80 hover:border-blue-200"
          }`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
              <span className="sm:hidden">Expired Trials</span>
              <span className="hidden sm:inline">Expired Free Trials</span>
            </p>
            <p className="text-lg sm:text-2xl font-black text-blue-600 leading-tight">
              {expiredTrialMembers.length}
            </p>
          </div>
        </div>
      </div>

      {/* How WhatsApp Reminders Work Info Banner */}
      <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-3 sm:p-4">
        <p className="text-xs sm:text-sm font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
          How WhatsApp Reminders Work
        </p>
        <p className="text-[11px] sm:text-xs text-indigo-600/90 leading-relaxed">
          Click &quot;Send Reminder&quot; to open WhatsApp with a pre-filled, URL-encoded message for that member.
          The message includes their name, outstanding amount, plan, due date, and studio name.
          No WhatsApp API needed — opens directly in your browser or phone app.
        </p>
      </div>

      {/* Navigation Tabs between Fee Reminders & Expired Free Trials */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all
              ${
                activeTab === "pending"
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60"
              }
            `}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending Fees ({pendingMembers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trials")}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all
              ${
                activeTab === "trials"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200/60"
              }
            `}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Expired Trials ({expiredTrialMembers.length})</span>
          </button>
        </div>

        {/* Search input (compact) */}
        <div className="relative max-w-[150px] sm:max-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded-xl bg-white border border-gray-200/80 focus:outline-none focus:ring-2 focus:ring-primary/20 text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ── TAB 1: FEE REMINDERS ────────────────────────────────────────── */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Members Ready to Remind
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                  Members with genuine pending or overdue invoices.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                {filteredPending.length} eligible
              </span>
            </div>

            {filteredPending.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2.5" />
                <p className="font-bold text-gray-800 text-sm">No pending fee reminders!</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {searchQuery
                    ? "No members matched your search query."
                    : "All member fee payments are settled and up to date."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View (hidden on screens < 768px) */}
                <div className="hidden md:block w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-50/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3.5">Member</th>
                        <th className="px-4 py-3.5">Phone</th>
                        <th className="px-4 py-3.5">Plan / Dues</th>
                        <th className="px-4 py-3.5">Due Date</th>
                        <th className="px-4 py-3.5">Amount Due</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredPending.map((m) => (
                        <tr key={m.userId} className="hover:bg-gray-50/40 transition-colors">
                          {/* Member */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-black text-xs shrink-0">
                                {initials(m.firstName, m.lastName)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">
                                  {m.firstName} {m.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{m.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3.5">
                            {m.hasValidPhone ? (
                              <span className="text-sm font-medium text-gray-800">
                                {m.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">
                                —
                              </span>
                            )}
                          </td>

                          {/* Plan */}
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 text-xs">
                                {m.primaryPlanName}
                              </span>
                              {m.invoices.length > 1 && (
                                <span className="text-[10px] text-orange-600 font-bold">
                                  {m.invoices.length} pending invoices
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Due Date */}
                          <td className="px-4 py-3.5 text-xs text-gray-500 font-medium">
                            {formatDate(m.earliestDueDate)}
                          </td>

                          {/* Amount Due */}
                          <td className="px-4 py-3.5">
                            <span className="font-black text-orange-600 text-sm">
                              ₹{m.totalPendingAmount.toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="px-5 py-3.5 text-right">
                            <WhatsAppReminderButton
                              clientId={m.userId}
                              clientName={`${m.firstName} ${m.lastName}`}
                              phone={m.phone}
                              pendingAmount={m.totalPendingAmount}
                              invoices={m.invoices}
                              earliestDueDate={m.earliestDueDate}
                              planName={m.primaryPlanName}
                              type="payment"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (hidden on md+ screens; perfect for 320px - 430px) */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredPending.map((m) => (
                    <div key={m.userId} className="p-3.5 space-y-2.5">
                      {/* Top row: Avatar + Name + Outstanding Amount */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-black text-xs shrink-0">
                            {initials(m.firstName, m.lastName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                            Due Amount
                          </span>
                          <span className="text-base font-black text-orange-600">
                            ₹{m.totalPendingAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Details pill box */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/90 p-2.5 rounded-xl border border-gray-100/90">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400 text-[11px]">📞</span>
                          <span
                            className={
                              m.hasValidPhone
                                ? "font-medium text-gray-700 truncate text-[11px]"
                                : "text-gray-400 font-medium text-[11px] truncate"
                            }
                            title={m.phone || ""}
                          >
                            {m.phone || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400 text-[11px]">🏷️</span>
                          <span
                            className="font-medium text-gray-700 truncate text-[11px]"
                            title={m.primaryPlanName}
                          >
                            {m.primaryPlanName}
                            {m.invoices.length > 1 && ` (${m.invoices.length} inv)`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-gray-500">
                          <span className="text-gray-400 text-[11px]">📅</span>
                          <span>Due: {formatDate(m.earliestDueDate)}</span>
                        </div>
                      </div>

                      {/* Action Button: Full-width for easy tapping */}
                      <div className="pt-0.5">
                        <WhatsAppReminderButton
                          clientId={m.userId}
                          clientName={`${m.firstName} ${m.lastName}`}
                          phone={m.phone}
                          pendingAmount={m.totalPendingAmount}
                          invoices={m.invoices}
                          earliestDueDate={m.earliestDueDate}
                          planName={m.primaryPlanName}
                          type="payment"
                          fullWidth={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: EXPIRED FREE TRIAL FOLLOW-UPS ───────────────────────── */}
      {activeTab === "trials" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-50 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Free Trial Follow-ups (Expired Trials)
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                  Friendly invitations to join regular dance classes. No fee reminder is mentioned.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                {filteredTrials.length} trials
              </span>
            </div>

            {filteredTrials.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <Sparkles className="w-10 h-10 text-blue-400 mx-auto mb-2.5 opacity-60" />
                <p className="font-bold text-gray-800 text-sm">No expired free trials!</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {searchQuery
                    ? "No members matched your search query."
                    : "No expired trial members awaiting follow-up."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-50/60 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3.5">Member</th>
                        <th className="px-4 py-3.5">Phone</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Trial Ended</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                      {filteredTrials.map((m) => (
                        <tr key={m.userId} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                                {initials(m.firstName, m.lastName)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate">
                                  {m.firstName} {m.lastName}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{m.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {m.hasValidPhone ? (
                              <span className="text-sm font-medium text-gray-800">
                                {m.phone}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">
                                —
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Free Trial (Ended)
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-xs text-gray-500 font-medium">
                            {formatDate(m.trialEndDate)}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            <WhatsAppReminderButton
                              clientId={m.userId}
                              clientName={`${m.firstName} ${m.lastName}`}
                              phone={m.phone}
                              type="trial_followup"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {filteredTrials.map((m) => (
                    <div key={m.userId} className="p-3.5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs shrink-0">
                            {initials(m.firstName, m.lastName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{m.email}</p>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                          Trial Ended
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/90 p-2.5 rounded-xl border border-gray-100/90">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400 text-[11px]">📞</span>
                          <span
                            className={
                              m.hasValidPhone
                                ? "font-medium text-gray-700 truncate text-[11px]"
                                : "text-gray-400 font-medium text-[11px] truncate"
                            }
                            title={m.phone || ""}
                          >
                            {m.phone || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-gray-400 text-[11px]">📅</span>
                          <span className="text-gray-600 truncate text-[11px]">
                            Ended: {formatDate(m.trialEndDate)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-0.5">
                        <WhatsAppReminderButton
                          clientId={m.userId}
                          clientName={`${m.firstName} ${m.lastName}`}
                          phone={m.phone}
                          type="trial_followup"
                          fullWidth={true}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
