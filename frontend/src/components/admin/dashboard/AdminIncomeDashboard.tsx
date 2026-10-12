"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Clock,
  Calendar,
  Award,
  BarChart3,
  ChevronDown,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CompletedPayment {
  id: string;
  amount: number;
  createdAt: string;
  userName: string;
  paymentMethod: string | null;
  paidAt: string | null;
}

export interface PendingPayment {
  id: string;
  userId?: string;
  amount: number;
  createdAt: string;
  userName: string;
  dueDate: string | null;
}

interface AdminIncomeDashboardProps {
  completedPayments: CompletedPayment[];
  pendingPayments: PendingPayment[];
  expiredTrialsCount?: number;
}

type CardId = "thisMonth" | "lastMonth" | "growth" | "pending";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtMethod(method: string | null) {
  if (!method) return "—";
  const map: Record<string, string> = {
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Card",
    BANK_TRANSFER: "Bank",
    RAZORPAY: "Razorpay",
    OTHER: "Other",
  };
  return map[method.toUpperCase()] ?? method;
}

function daysSince(iso: string | null, fallback: string): number {
  const base = iso ?? fallback;
  const diff = Date.now() - new Date(base).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// ── Expandable Card Wrapper ────────────────────────────────────────────────────

function ExpandableCard({
  id,
  expandedCard,
  onToggle,
  colorScheme,
  children,
  expandedContent,
}: {
  id: CardId;
  expandedCard: CardId | null;
  onToggle: (id: CardId) => void;
  colorScheme: "indigo" | "gray" | "growth" | "orange";
  children: React.ReactNode;
  expandedContent: React.ReactNode;
}) {
  const isExpanded = expandedCard === id;
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState("0px");

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setMaxH(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxH("0px");
    }
  }, [isExpanded]);

  const borderMap = {
    indigo: "border-indigo-100/60 hover:border-indigo-200 hover:shadow-indigo-50/60",
    gray: "border-gray-100 hover:border-gray-200",
    growth: "border-gray-100 hover:border-gray-200",
    orange: "border-orange-100/70 hover:border-orange-200 hover:shadow-orange-50/60",
  };

  const bgMap = {
    indigo: "bg-gradient-to-br from-indigo-50/50 to-white",
    gray: "bg-white",
    growth: "bg-white",
    orange: "bg-gradient-to-br from-orange-50/40 to-white",
  };

  const ringMap = {
    indigo: isExpanded ? "ring-2 ring-indigo-200/60 shadow-md shadow-indigo-50" : "",
    gray: isExpanded ? "ring-2 ring-gray-200/60 shadow-md" : "",
    growth: isExpanded ? "ring-2 ring-gray-200/60 shadow-md" : "",
    orange: isExpanded ? "ring-2 ring-orange-200/60 shadow-md shadow-orange-50" : "",
  };

  return (
    <div
      className={`
        p-5 rounded-2xl border shadow-sm cursor-pointer select-none
        transition-all duration-300
        ${bgMap[colorScheme]}
        ${borderMap[colorScheme]}
        ${ringMap[colorScheme]}
        hover:shadow-md
      `}
      onClick={() => onToggle(id)}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(id);
        }
      }}
    >
      {/* Collapsed content — always visible */}
      {children}

      {/* Expand/collapse indicator */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/5">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
            isExpanded ? "text-gray-400" : "text-gray-300"
          }`}
        >
          {isExpanded ? "Click to collapse" : "Click to view details"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {/* Expandable area */}
      <div
        ref={contentRef}
        style={{
          maxHeight: maxH,
          overflow: "hidden",
          transition: "max-height 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease",
          opacity: isExpanded ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-4">{expandedContent}</div>
      </div>
    </div>
  );
}

// ── Mini Detail Row (label + value) ───────────────────────────────────────────

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400 font-semibold">{label}</span>
      <span className={`text-xs font-black ${highlight ? "text-indigo-600" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}

// ── Mini Payment Table ─────────────────────────────────────────────────────────

function MiniPaymentTable({
  rows,
  colorAccent,
}: {
  rows: { name: string; amount: number; date: string; method: string | null }[];
  colorAccent: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-2">No payments to show.</p>
    );
  }
  return (
    <div className="mt-1 rounded-xl overflow-hidden border border-gray-100">
      <div className="grid grid-cols-4 bg-gray-50/80 px-3 py-1.5 border-b border-gray-100">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Member</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Amount</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Date</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Method</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-4 px-3 py-2 ${
            i < rows.length - 1 ? "border-b border-gray-50" : ""
          } hover:bg-gray-50/50 transition-colors`}
        >
          <span className="text-[11px] font-semibold text-gray-800 truncate pr-1">{r.name}</span>
          <span className={`text-[11px] font-black text-right ${colorAccent}`}>{fmt(r.amount)}</span>
          <span className="text-[10px] text-gray-400 text-right">{fmtDate(r.date)}</span>
          <span className="text-[10px] text-gray-500 font-medium text-right">{fmtMethod(r.method)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Mini Pending Table ─────────────────────────────────────────────────────────

function MiniPendingTable({
  rows,
}: {
  rows: { name: string; amount: number; dueDate: string | null; createdAt: string }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-2">No pending members.</p>
    );
  }
  return (
    <div className="mt-1 rounded-xl overflow-hidden border border-orange-100/60">
      <div className="grid grid-cols-4 bg-orange-50/60 px-3 py-1.5 border-b border-orange-100/60">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Member</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Pending</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Due Date</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide text-right">Days</span>
      </div>
      {rows.map((r, i) => {
        const days = daysSince(r.dueDate, r.createdAt);
        return (
          <div
            key={i}
            className={`grid grid-cols-4 px-3 py-2 ${
              i < rows.length - 1 ? "border-b border-orange-50" : ""
            } hover:bg-orange-50/30 transition-colors`}
          >
            <span className="text-[11px] font-semibold text-gray-800 truncate pr-1">{r.name}</span>
            <span className="text-[11px] font-black text-orange-600 text-right">{fmt(r.amount)}</span>
            <span className="text-[10px] text-gray-400 text-right">
              {r.dueDate ? fmtDate(r.dueDate) : "—"}
            </span>
            <span
              className={`text-[10px] font-bold text-right ${
                days > 30 ? "text-red-500" : days > 7 ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {days}d
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AdminIncomeDashboard({
  completedPayments,
  pendingPayments,
  expiredTrialsCount,
}: AdminIncomeDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<"this_month" | "last_3_months" | "last_6_months" | "this_year">(
    "last_6_months"
  );
  const [expandedCard, setExpandedCard] = useState<CardId | null>(null);

  function toggleCard(id: CardId) {
    setExpandedCard((prev) => (prev === id ? null : id));
  }

  const now = new Date();

  // ── 1. Income Overview Metrics ─────────────────────────────────────────────
  const {
    thisMonthIncome,
    lastMonthIncome,
    growthPercent,
    growthDisplay,
    thisMonthCount,
    lastMonthCount,
    thisMonthPaid,
    lastMonthPaid,
  } = useMemo(() => {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const startThisMonth = new Date(currentYear, currentMonth, 1);
    const startLastMonth = new Date(currentYear, currentMonth - 1, 1);

    const thisMonthPaid = completedPayments.filter(
      (p) => new Date(p.createdAt) >= startThisMonth
    );
    const lastMonthPaid = completedPayments.filter((p) => {
      const d = new Date(p.createdAt);
      return d >= startLastMonth && d < startThisMonth;
    });

    const thisTotal = thisMonthPaid.reduce((s, p) => s + p.amount, 0);
    const lastTotal = lastMonthPaid.reduce((s, p) => s + p.amount, 0);

    let growth: number | null = null;
    let growthDisplay = "—";

    if (lastTotal > 0) {
      const actualGrowth = ((thisTotal - lastTotal) / lastTotal) * 100;
      if (actualGrowth > 0) {
        growth = Math.min(actualGrowth, 100);
      } else {
        growth = actualGrowth;
      }
      growth = Number(growth.toFixed(1));
      growthDisplay = `${growth >= 0 ? "+" : ""}${growth}%`;
    } else if (thisTotal > 0) {
      growth = 100;
      growthDisplay = "New / N/A";
    }

    return {
      thisMonthIncome: thisTotal,
      lastMonthIncome: lastTotal,
      growthPercent: growth,
      growthDisplay,
      thisMonthCount: thisMonthPaid.length,
      lastMonthCount: lastMonthPaid.length,
      thisMonthPaid,
      lastMonthPaid,
    };
  }, [completedPayments]);

  const totalPendingAmount = useMemo(
    () => pendingPayments.reduce((s, p) => s + p.amount, 0),
    [pendingPayments]
  );

  const uniquePendingMembersCount = useMemo(() => {
    return new Set(pendingPayments.filter((p) => p.amount > 0).map((p) => p.userId || p.userName)).size;
  }, [pendingPayments]);

  const totalCompletedAmount = useMemo(
    () => completedPayments.reduce((s, p) => s + p.amount, 0),
    [completedPayments]
  );

  // ── 2. Chart Data for Monthly Income ──────────────────────────────────────
  const monthlyChartData = useMemo(() => {
    if (timePeriod === "this_month") {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const todayDate = now.getDate();

      const daysData: { label: string; income: number; count: number }[] = [];
      for (let day = 1; day <= Math.min(todayDate, daysInMonth); day++) {
        const dayStart = new Date(currentYear, currentMonth, day, 0, 0, 0);
        const dayEnd = new Date(currentYear, currentMonth, day, 23, 59, 59, 999);

        const paidThatDay = completedPayments.filter((p) => {
          const cd = new Date(p.createdAt);
          return cd >= dayStart && cd <= dayEnd;
        });

        daysData.push({
          label: `${day} ${now.toLocaleDateString("en-IN", { month: "short" })}`,
          income: paidThatDay.reduce((s, p) => s + p.amount, 0),
          count: paidThatDay.length,
        });
      }
      return daysData;
    }

    let monthsCount = 6;
    if (timePeriod === "last_3_months") monthsCount = 3;
    else if (timePeriod === "this_year") monthsCount = now.getMonth() + 1;

    const data: { label: string; income: number; count: number }[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const paidInMonth = completedPayments.filter((p) => {
        const cd = new Date(p.createdAt);
        return cd >= d && cd < end;
      });

      data.push({
        label: d.toLocaleDateString("en-IN", {
          month: "short",
          year: monthsCount > 6 ? "2-digit" : undefined,
        }),
        income: paidInMonth.reduce((s, p) => s + p.amount, 0),
        count: paidInMonth.length,
      });
    }
    return data;
  }, [completedPayments, timePeriod]);

  // ── 3. Payment Collection Trend (Last 7 days) ──────────────────────────────
  const collectionTrendData = useMemo(() => {
    const last7Days: { label: string; amount: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const paid = completedPayments.filter((p) => {
        const cd = new Date(p.createdAt);
        return cd >= start && cd <= end;
      });

      last7Days.push({
        label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
        amount: paid.reduce((s, p) => s + p.amount, 0),
        count: paid.length,
      });
    }
    return last7Days;
  }, [completedPayments]);

  // ── 4. Financial Insights ──────────────────────────────────────────────────
  const { highestMonth, averageMonthlyIncome, collectionEfficiency } = useMemo(() => {
    const monthTotals = new Map<string, number>();
    for (const p of completedPayments) {
      const d = new Date(p.createdAt);
      const key = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      monthTotals.set(key, (monthTotals.get(key) || 0) + p.amount);
    }

    let topMonth = { month: "—", amount: 0 };
    let totalSum = 0;
    const entries = Array.from(monthTotals.entries());

    for (const [m, amt] of entries) {
      totalSum += amt;
      if (amt > topMonth.amount) {
        topMonth = { month: m, amount: amt };
      }
    }

    const monthCount = entries.length > 0 ? entries.length : 1;
    const avgMonthly = Math.round(totalSum / monthCount);

    const totalBilled = totalCompletedAmount + totalPendingAmount;
    const efficiency =
      totalBilled > 0 ? Math.round((totalCompletedAmount / totalBilled) * 100) : 100;

    return {
      highestMonth: topMonth,
      averageMonthlyIncome: avgMonthly,
      collectionEfficiency: efficiency,
    };
  }, [completedPayments, totalCompletedAmount, totalPendingAmount]);

  // ── 5. Pie Chart — Income vs Pending ──────────────────────────────────────
  const incomeVsPendingData = useMemo(
    () => [
      { name: "Collected", value: thisMonthIncome, color: "#10b981" },
      { name: "Pending", value: totalPendingAmount, color: "#f97316" },
    ],
    [thisMonthIncome, totalPendingAmount]
  );

  const totalThisMonthAndPending = thisMonthIncome + totalPendingAmount;
  const collectedPct =
    totalThisMonthAndPending > 0
      ? Math.round((thisMonthIncome / totalThisMonthAndPending) * 100)
      : 100;

  // ── 6. Derived detail data ─────────────────────────────────────────────────

  // This Month details
  const thisMonthAvg = thisMonthCount > 0 ? thisMonthIncome / thisMonthCount : 0;
  const thisMonthLatest = thisMonthPaid[0]; // already sorted desc
  const thisMonthTableRows = thisMonthPaid.slice(0, 5).map((p) => ({
    name: p.userName,
    amount: p.amount,
    date: p.paidAt ?? p.createdAt,
    method: p.paymentMethod,
  }));

  // Last Month details
  const lastMonthAvg = lastMonthCount > 0 ? lastMonthIncome / lastMonthCount : 0;
  const lastMonthHighest = lastMonthPaid.reduce(
    (max, p) => (p.amount > max.amount ? p : max),
    lastMonthPaid[0] ?? { amount: 0 }
  );
  const lastMonthTableRows = lastMonthPaid.slice(0, 5).map((p) => ({
    name: p.userName,
    amount: p.amount,
    date: p.paidAt ?? p.createdAt,
    method: p.paymentMethod,
  }));

  // Growth sentence
  const growthSentence = useMemo(() => {
    if (growthPercent === null) return "Not enough data to calculate growth.";
    if (lastMonthIncome === 0 && thisMonthIncome === 0) return "No income recorded in either month.";
    if (lastMonthIncome === 0) return "No income last month — growth cannot be calculated.";
    const abs = Math.abs(growthPercent);
    const dir = growthPercent >= 0 ? "increased" : "decreased";
    return `Income ${dir} by ${abs}% compared with last month.`;
  }, [growthPercent, lastMonthIncome, thisMonthIncome]);

  // Pending details — grouped by unique member with earliest due date and total amount
  const pendingTableRows = useMemo(() => {
    const memberMap = new Map<string, { name: string; amount: number; dueDate: string | null; createdAt: string }>();
    for (const p of pendingPayments) {
      if (p.amount <= 0) continue;
      const key = p.userId || p.userName;
      const existing = memberMap.get(key);
      if (!existing) {
        memberMap.set(key, {
          name: p.userName,
          amount: p.amount,
          dueDate: p.dueDate,
          createdAt: p.createdAt,
        });
      } else {
        existing.amount += p.amount;
        // Keep the earliest dueDate if multiple invoices exist
        if (p.dueDate && (!existing.dueDate || new Date(p.dueDate) < new Date(existing.dueDate))) {
          existing.dueDate = p.dueDate;
        }
      }
    }
    return Array.from(memberMap.values());
  }, [pendingPayments]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── Section 1: Income Overview Banner ─────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Financial Overview
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2 tracking-tight">
              Income &amp; Business Overview
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
              Real-time studio revenue, growth rate, and cash collection.
            </p>
          </div>
          <div className="text-sm font-semibold text-gray-500 self-start md:self-auto mt-1 md:mt-0">
            {now.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Expired Free Trials Reminder Banner */}
        {expiredTrialsCount !== undefined && expiredTrialsCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-extrabold text-sm text-gray-900">
                  {expiredTrialsCount} Expired Free {expiredTrialsCount === 1 ? "Trial" : "Trials"} Ready for Follow-up
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  Invite them with a friendly WhatsApp message to explore regular dance classes.
                </p>
              </div>
            </div>
            <Link
              href="/admin?tab=whatsapp"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
            >
              <span>Send WhatsApp Invitations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 4 Interactive Expandable Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* ── This Month ── */}
          <ExpandableCard
            id="thisMonth"
            expandedCard={expandedCard}
            onToggle={toggleCard}
            colorScheme="indigo"
            expandedContent={
              <div>
                <div className="divide-y divide-gray-100/80">
                  <DetailRow label="Total Collected" value={fmt(thisMonthIncome)} highlight />
                  <DetailRow label="Successful Payments" value={`${thisMonthCount}`} />
                  <DetailRow label="Avg Payment" value={fmt(thisMonthAvg)} />
                  <DetailRow
                    label="Latest Payment"
                    value={
                      thisMonthLatest
                        ? fmtDate(thisMonthLatest.paidAt ?? thisMonthLatest.createdAt)
                        : "—"
                    }
                  />
                </div>
                {thisMonthPaid.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Recent Payments
                    </p>
                    <MiniPaymentTable rows={thisMonthTableRows} colorAccent="text-indigo-600" />
                  </div>
                )}
              </div>
            }
          >
            {/* Collapsed header */}
            <div className="flex items-center justify-between text-indigo-600 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                This Month
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-100/80 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {fmt(thisMonthIncome)}
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              {thisMonthCount} paid payments
            </p>
          </ExpandableCard>

          {/* ── Last Month ── */}
          <ExpandableCard
            id="lastMonth"
            expandedCard={expandedCard}
            onToggle={toggleCard}
            colorScheme="gray"
            expandedContent={
              <div>
                <div className="divide-y divide-gray-100/80">
                  <DetailRow label="Total Collected" value={fmt(lastMonthIncome)} highlight />
                  <DetailRow label="Successful Payments" value={`${lastMonthCount}`} />
                  <DetailRow label="Avg Payment" value={fmt(lastMonthAvg)} />
                  <DetailRow
                    label="Highest Payment"
                    value={lastMonthHighest ? fmt(lastMonthHighest.amount) : "—"}
                  />
                </div>
                {lastMonthPaid.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Payments Last Month
                    </p>
                    <MiniPaymentTable rows={lastMonthTableRows} colorAccent="text-gray-700" />
                  </div>
                )}
              </div>
            }
          >
            <div className="flex items-center justify-between text-gray-600 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Last Month
              </span>
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {fmt(lastMonthIncome)}
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              {lastMonthCount} paid payments
            </p>
          </ExpandableCard>

          {/* ── Monthly Growth ── */}
          <ExpandableCard
            id="growth"
            expandedCard={expandedCard}
            onToggle={toggleCard}
            colorScheme="growth"
            expandedContent={
              <div>
                <div className="divide-y divide-gray-100/80">
                  <DetailRow label="This Month Income" value={fmt(thisMonthIncome)} />
                  <DetailRow label="Last Month Income" value={fmt(lastMonthIncome)} />
                  <DetailRow
                    label="Growth"
                    value={growthDisplay}
                    highlight={growthPercent !== null && growthPercent >= 0}
                  />
                </div>
                <div
                  className={`mt-3 rounded-xl p-3 text-xs font-semibold leading-relaxed ${
                    growthPercent !== null && growthPercent >= 0
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {growthSentence}
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Monthly Growth
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  growthPercent !== null && growthPercent >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {growthPercent !== null && growthPercent >= 0 ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  growthPercent !== null && growthPercent >= 0
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {growthDisplay}
              </p>
            </div>
            <p className="text-xs text-gray-400 font-semibold mt-1">vs previous month</p>
          </ExpandableCard>

          {/* ── Current Pending ── */}
          <ExpandableCard
            id="pending"
            expandedCard={expandedCard}
            onToggle={toggleCard}
            colorScheme="orange"
            expandedContent={
              <div>
                <div className="divide-y divide-orange-100/60">
                  <DetailRow label="Total Pending Fees" value={fmt(totalPendingAmount)} />
                  <DetailRow
                    label="Members with Dues"
                    value={`${pendingTableRows.length}`}
                  />
                </div>
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Pending Members
                  </p>
                  <MiniPendingTable rows={pendingTableRows} />
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-between text-orange-600 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Current Pending
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-100/80 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
              {fmt(totalPendingAmount)}
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              {uniquePendingMembersCount} pending dues
            </p>
          </ExpandableCard>

        </div>
      </div>

      {/* ── Section 2: Large Monthly Income Graph with Time Period Filter ─ */}
      <Card className="rounded-3xl border-0 shadow-sm bg-white flex flex-col">
        <CardHeader className="p-5 sm:p-6 pb-2 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <CardTitle className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                Monthly Income
              </CardTitle>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Total successfully collected revenue ({timePeriod.replace(/_/g, " ")})
            </p>
          </div>

          {/* Time Period Filter Selector */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 self-start sm:self-auto">
            {(
              [
                { id: "this_month", label: "This Month" },
                { id: "last_3_months", label: "Last 3 Months" },
                { id: "last_6_months", label: "Last 6 Months" },
                { id: "this_year", label: "This Year" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimePeriod(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timePeriod === opt.id
                    ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-5">
          <div className="w-full" style={{ height: "clamp(200px, 25vh, 250px)" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      const count = payload[0].payload.count;
                      return (
                        <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-xl border border-gray-800 text-xs space-y-1">
                          <p className="font-bold text-gray-300">{label}</p>
                          <p className="text-base font-black text-indigo-400">{fmt(val)}</p>
                          <p className="text-[11px] text-gray-400">{count} completed payments</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7, fill: "#4f46e5", strokeWidth: 3, stroke: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Income vs Pending & Payment Collection Trend (2-Cols) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Income vs Pending */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white flex flex-col">
          <CardHeader className="p-5 sm:p-6 pb-2 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-gray-900 tracking-tight">
                  Income vs Pending
                </CardTitle>
                <p className="text-xs text-gray-400 font-medium mt-0.5">
                  This Month Collected vs Pending Dues
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                {collectedPct}% Collected
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-6">
            {/* Donut Chart with Centered Metric */}
            <div className="relative h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeVsPendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {incomeVsPendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Collected
                </span>
                <span className="text-lg font-black text-gray-900">{collectedPct}%</span>
              </div>
            </div>

            {/* Collected vs Pending Details */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Collected
                </div>
                <p className="text-base font-black text-emerald-900">{fmt(thisMonthIncome)}</p>
                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">This Month</p>
              </div>

              <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-700 mb-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  Pending
                </div>
                <p className="text-base font-black text-orange-900">{fmt(totalPendingAmount)}</p>
                <p className="text-[10px] font-semibold text-orange-600 mt-0.5">Active Dues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Collection Trend */}
        <Card className="rounded-3xl border-0 shadow-sm bg-white flex flex-col">
          <CardHeader className="p-5 sm:p-6 pb-2 border-b border-gray-50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black text-gray-900 tracking-tight">
                Payment Collection Trend
              </CardTitle>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Daily collection velocity (Last 7 Days)
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 pt-4 flex-1 flex flex-col justify-center">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={collectionTrendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
                    dy={5}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(val) => (val >= 1000 ? `₹${val / 1000}k` : `₹${val}`)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const val = payload[0].value as number;
                        const count = payload[0].payload.count;
                        return (
                          <div className="bg-gray-900 text-white p-2.5 rounded-xl shadow-lg border border-gray-800 text-xs">
                            <p className="font-bold text-gray-300">{label}</p>
                            <p className="text-sm font-black text-purple-400">{fmt(val)}</p>
                            <p className="text-[10px] text-gray-400">{count} payments collected</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32}>
                    {collectionTrendData.map((entry, index) => (
                      <Cell
                        key={`trend-${index}`}
                        fill={entry.amount > 0 ? "#8b5cf6" : "#e2e8f0"}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 4: Quick Financial Summary (Insights) ────────────────── */}
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 sm:px-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 mb-6">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300">
              Financial Insights &amp; Health
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-800">
            {/* Highest Month */}
            <div className="pt-4 md:pt-0 md:pr-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Highest Revenue Month
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
                {highestMonth.amount > 0 ? fmt(highestMonth.amount) : "—"}
              </p>
              <p className="text-xs text-indigo-300 font-semibold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {highestMonth.month}
              </p>
            </div>

            {/* Average Monthly Income */}
            <div className="pt-4 md:pt-0 md:px-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Average Monthly Income
              </p>
              <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 tracking-tight">
                {fmt(averageMonthlyIncome)}
              </p>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Across active revenue months
              </p>
            </div>

            {/* Total All-Time Revenue */}
            <div className="pt-4 md:pt-0 md:pl-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Total All-Time Revenue
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5 tracking-tight">
                {fmt(totalCompletedAmount)}
              </p>
              <p className="text-xs text-emerald-300/80 font-semibold mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {collectionEfficiency}% overall collection rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
