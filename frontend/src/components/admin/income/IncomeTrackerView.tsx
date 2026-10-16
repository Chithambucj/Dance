"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Calendar,
  TrendingUp,
  Banknote,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export interface IncomePaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  amount: number;
  status: string;
  createdAt: string; // ISO string
  paidAt?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  description?: string | null;
}

export interface IncomeMetrics {
  todayTotal: number;
  todayCount: number;
  weekTotal: number;
  weekCount: number;
  monthTotal: number;
  monthCount: number;
  yearTotal: number;
  yearCount: number;
}

export interface MonthlyTrendItem {
  month: string;
  total: number;
  count: number;
}

export interface PlanOption {
  id: string;
  name: string;
  billingPeriod?: string;
}

export interface IncomeTrackerViewProps {
  initialPayments: IncomePaymentRecord[];
  metrics: IncomeMetrics;
  monthlyTrend: MonthlyTrendItem[];
  availablePlans: PlanOption[];
}

function fmt(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function initials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return (name.charAt(0) || "M").toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

type DateRangeOption = "ALL" | "TODAY" | "WEEK" | "MONTH" | "YEAR" | "CUSTOM";
type AmountPreset = "ALL" | "UNDER_2000" | "2000_5000" | "5000_10000" | "ABOVE_10000" | "CUSTOM";
type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

export default function IncomeTrackerView({
  initialPayments,
  metrics,
  monthlyTrend,
  availablePlans,
}: IncomeTrackerViewProps) {
  // ── Search & Filter State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeOption>("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string>("ALL");
  const [amountFilter, setAmountFilter] = useState<AmountPreset>("ALL");
  const [customMinAmount, setCustomMinAmount] = useState<string>("");
  const [customMaxAmount, setCustomMaxAmount] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // ── Sort & Pagination State ────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Max value for monthly chart width scaling
  const maxMonthly = useMemo(() => {
    return Math.max(...monthlyTrend.map((m) => m.total), 1);
  }, [monthlyTrend]);

  // Handle resetting all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setDateRange("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedPlan("ALL");
    setAmountFilter("ALL");
    setCustomMinAmount("");
    setCustomMaxAmount("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  // Check if any filter is actively applied
  const isFiltered = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      dateRange !== "ALL" ||
      selectedPlan !== "ALL" ||
      amountFilter !== "ALL" ||
      statusFilter !== "ALL" ||
      customMinAmount !== "" ||
      customMaxAmount !== ""
    );
  }, [
    searchQuery,
    dateRange,
    selectedPlan,
    amountFilter,
    statusFilter,
    customMinAmount,
    customMaxAmount,
  ]);

  // ── Filtered & Sorted Payments ─────────────────────────────────────────────
  const filteredPayments = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const yearStart = new Date(now.getFullYear(), 0, 1).getTime();

    return initialPayments.filter((payment) => {
      // 1. Search Query (Member name, email, plan name, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = payment.userName.toLowerCase().includes(q);
        const matchesEmail = payment.userEmail.toLowerCase().includes(q);
        const matchesPlan = payment.planName.toLowerCase().includes(q);
        const matchesDesc = (payment.description || "").toLowerCase().includes(q);
        const matchesRef = (payment.referenceNumber || "").toLowerCase().includes(q);

        if (!matchesName && !matchesEmail && !matchesPlan && !matchesDesc && !matchesRef) {
          return false;
        }
      }

      // 2. Date Range Filter
      const paymentTime = new Date(payment.createdAt).getTime();

      if (dateRange === "TODAY") {
        if (paymentTime < todayStart) return false;
      } else if (dateRange === "WEEK") {
        if (paymentTime < weekStart) return false;
      } else if (dateRange === "MONTH") {
        if (paymentTime < monthStart) return false;
      } else if (dateRange === "YEAR") {
        if (paymentTime < yearStart) return false;
      } else if (dateRange === "CUSTOM") {
        if (customStartDate) {
          const start = new Date(`${customStartDate}T00:00:00`).getTime();
          if (paymentTime < start) return false;
        }
        if (customEndDate) {
          const end = new Date(`${customEndDate}T23:59:59.999`).getTime();
          if (paymentTime > end) return false;
        }
      }

      // 3. Membership Plan Filter
      if (selectedPlan !== "ALL") {
        if (selectedPlan === "OTHER") {
          // Payments without a known plan
          const hasKnownPlan = availablePlans.some(
            (p) => p.name.toLowerCase() === payment.planName.toLowerCase()
          );
          if (hasKnownPlan) return false;
        } else {
          if (payment.planName.toLowerCase() !== selectedPlan.toLowerCase()) {
            return false;
          }
        }
      }

      // 4. Amount Filter
      if (amountFilter === "UNDER_2000") {
        if (payment.amount >= 2000) return false;
      } else if (amountFilter === "2000_5000") {
        if (payment.amount < 2000 || payment.amount > 5000) return false;
      } else if (amountFilter === "5000_10000") {
        if (payment.amount < 5000 || payment.amount > 10000) return false;
      } else if (amountFilter === "ABOVE_10000") {
        if (payment.amount <= 10000) return false;
      } else if (amountFilter === "CUSTOM") {
        const min = customMinAmount ? parseFloat(customMinAmount) : null;
        const max = customMaxAmount ? parseFloat(customMaxAmount) : null;
        if (min !== null && !isNaN(min) && payment.amount < min) return false;
        if (max !== null && !isNaN(max) && payment.amount > max) return false;
      }

      // 5. Payment Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "PAID" && payment.status !== "COMPLETED") return false;
        if (statusFilter === "PENDING" && payment.status !== "PENDING") return false;
        if (
          statusFilter === "FAILED" &&
          payment.status !== "FAILED" &&
          payment.status !== "CANCELLED"
        )
          return false;
      }

      return true;
    });
  }, [
    initialPayments,
    searchQuery,
    dateRange,
    customStartDate,
    customEndDate,
    selectedPlan,
    amountFilter,
    customMinAmount,
    customMaxAmount,
    statusFilter,
    availablePlans,
  ]);

  // Sort Payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      if (sortField === "amount") {
        const diff = a.amount - b.amount;
        return sortOrder === "asc" ? diff : -diff;
      }
      // Default: date
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      const diff = timeA - timeB;
      return sortOrder === "asc" ? diff : -diff;
    });
  }, [filteredPayments, sortField, sortOrder]);

  // Paginated Payments
  const totalPages = Math.max(1, Math.ceil(sortedPayments.length / pageSize));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPayments.slice(start, start + pageSize);
  }, [sortedPayments, currentPage, pageSize]);

  // Calculate filtered collected revenue (only COMPLETED payments)
  const filteredCollectedRevenue = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  // Toggle Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Income</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">
            Revenue collected from memberships and fees.
          </p>
        </div>
      </div>

      {/* ── Period Summary Cards (Studio Revenue Overview) ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Studio Revenue Overview
          </span>
          <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">
            Collected Revenue (Completed Payments)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today */}
          <Card className="rounded-2xl border-0 shadow-xs bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl text-indigo-600 bg-indigo-50">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Today
                </p>
                <p className="text-2xl font-black text-gray-900 truncate">
                  {fmt(metrics.todayTotal)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {metrics.todayCount} {metrics.todayCount === 1 ? "payment" : "payments"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card className="rounded-2xl border-0 shadow-xs bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl text-blue-600 bg-blue-50">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  This Week
                </p>
                <p className="text-2xl font-black text-gray-900 truncate">
                  {fmt(metrics.weekTotal)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {metrics.weekCount} {metrics.weekCount === 1 ? "payment" : "payments"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="rounded-2xl border-0 shadow-xs bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl text-green-600 bg-green-50">
                <Banknote className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  This Month
                </p>
                <p className="text-2xl font-black text-gray-900 truncate">
                  {fmt(metrics.monthTotal)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {metrics.monthCount} {metrics.monthCount === 1 ? "payment" : "payments"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* This Year */}
          <Card className="rounded-2xl border-0 shadow-xs bg-white hover:shadow-sm transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl text-purple-600 bg-purple-50">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  This Year
                </p>
                <p className="text-2xl font-black text-gray-900 truncate">
                  {fmt(metrics.yearTotal)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {metrics.yearCount} {metrics.yearCount === 1 ? "payment" : "payments"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Monthly Income Trend Chart (Last 6 Months) ───────────────────────── */}
      <Card className="rounded-2xl border-0 shadow-xs bg-white">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <CardTitle className="text-base font-bold text-gray-900">
              Monthly Income Trend
            </CardTitle>
            <span className="text-xs font-medium text-gray-400">
              Historical Trend (Last 6 Months)
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {monthlyTrend.map((m) => (
              <div key={m.month} className="flex items-center gap-4">
                <p className="text-xs font-bold text-gray-500 w-20 shrink-0">{m.month}</p>
                <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-lg flex items-center px-3 transition-all"
                    style={{
                      width: `${Math.max((m.total / maxMonthly) * 100, m.total > 0 ? 5 : 0)}%`,
                    }}
                  >
                    {m.total > 0 && (
                      <span className="text-[10px] text-white font-bold whitespace-nowrap">
                        {fmt(m.total)}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-400 w-16 text-right shrink-0">{m.count} paid</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Income Table Card with Integrated Search & Filter Toolbar ─── */}
      <Card className="rounded-2xl border-0 shadow-xs bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-gray-900">
                Recent Income
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Detailed transaction records with live search, filters, and sorting.
              </p>
            </div>
            {/* Live Filtered Total Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto">
              <span>Filtered Revenue:</span>
              <span className="font-black text-indigo-900">{fmt(filteredCollectedRevenue)}</span>
              <span className="text-[11px] text-indigo-500 font-semibold">
                ({filteredPayments.length} {filteredPayments.length === 1 ? "record" : "records"})
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* 1. Search Bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by member name or membership plan..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50/80 border border-gray-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Filter Icon Tag */}
            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px] mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
              <span>Filters:</span>
            </div>

            {/* Date Range Select */}
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value as DateRangeOption);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-gray-300"
            >
              <option value="ALL">Date: All Time</option>
              <option value="TODAY">Date: Today</option>
              <option value="WEEK">Date: This Week</option>
              <option value="MONTH">Date: This Month</option>
              <option value="YEAR">Date: This Year</option>
              <option value="CUSTOM">Date: Custom Range...</option>
            </select>

            {/* Membership Plan Select */}
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-gray-300 max-w-[200px] truncate"
            >
              <option value="ALL">Plan: All Plans</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.name}>
                  Plan: {plan.name}
                </option>
              ))}
              <option value="OTHER">Plan: Other / Custom</option>
            </select>

            {/* Payment Amount Select */}
            <select
              value={amountFilter}
              onChange={(e) => {
                setAmountFilter(e.target.value as AmountPreset);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-gray-300"
            >
              <option value="ALL">Amount: All Amounts</option>
              <option value="UNDER_2000">Under ₹2,000</option>
              <option value="2000_5000">₹2,000 - ₹5,000</option>
              <option value="5000_10000">₹5,000 - ₹10,000</option>
              <option value="ABOVE_10000">Above ₹10,000</option>
              <option value="CUSTOM">Custom Amount Range...</option>
            </select>

            {/* Payment Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-gray-300"
            >
              <option value="ALL">Status: All Statuses</option>
              <option value="PAID">Status: Paid (Completed)</option>
              <option value="PENDING">Status: Pending</option>
              <option value="FAILED">Status: Failed</option>
            </select>

            {/* Reset Filters Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-8 px-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1.5 ml-auto transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>

          {/* 3. Custom Date Inputs (when Date: Custom Range is active) */}
          {dateRange === "CUSTOM" && (
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-gray-600">Custom Dates:</span>
              <div className="flex items-center gap-2">
                <label className="text-gray-500 font-medium">From:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-500 font-medium">To:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-700 font-semibold underline text-[11px]"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}

          {/* 4. Custom Amount Inputs (when Amount: Custom Range is active) */}
          {amountFilter === "CUSTOM" && (
            <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200/70 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-gray-600">Custom Amount (₹):</span>
              <div className="flex items-center gap-2">
                <label className="text-gray-500 font-medium">Min:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={customMinAmount}
                  onChange={(e) => {
                    setCustomMinAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-24 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-500 font-medium">Max:</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Unlimited"
                  value={customMaxAmount}
                  onChange={(e) => {
                    setCustomMaxAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-24 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {(customMinAmount || customMaxAmount) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomMinAmount("");
                    setCustomMaxAmount("");
                    setCurrentPage(1);
                  }}
                  className="text-gray-400 hover:text-gray-700 font-semibold underline text-[11px]"
                >
                  Clear amounts
                </button>
              )}
            </div>
          )}

          {/* 5. Active Filter Badges */}
          {isFiltered && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 mr-1">
                Active:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  <span>Search: &quot;{searchQuery}&quot;</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-red-500 p-0.5"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {dateRange !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-indigo-100">
                  <span>
                    Date:{" "}
                    {dateRange === "TODAY"
                      ? "Today"
                      : dateRange === "WEEK"
                      ? "This Week"
                      : dateRange === "MONTH"
                      ? "This Month"
                      : dateRange === "YEAR"
                      ? "This Year"
                      : `${customStartDate || "Start"} to ${customEndDate || "Now"}`}
                  </span>
                  <button
                    onClick={() => {
                      setDateRange("ALL");
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                    className="hover:text-red-500 p-0.5"
                    aria-label="Remove date filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPlan !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-purple-100">
                  <span>Plan: {selectedPlan}</span>
                  <button
                    onClick={() => setSelectedPlan("ALL")}
                    className="hover:text-red-500 p-0.5"
                    aria-label="Remove plan filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {amountFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-100">
                  <span>
                    Amount:{" "}
                    {amountFilter === "UNDER_2000"
                      ? "< ₹2,000"
                      : amountFilter === "2000_5000"
                      ? "₹2,000 - ₹5,000"
                      : amountFilter === "5000_10000"
                      ? "₹5,000 - ₹10,000"
                      : amountFilter === "ABOVE_10000"
                      ? "> ₹10,000"
                      : `₹${customMinAmount || 0} - ₹${customMaxAmount || "∞"}`}
                  </span>
                  <button
                    onClick={() => {
                      setAmountFilter("ALL");
                      setCustomMinAmount("");
                      setCustomMaxAmount("");
                    }}
                    className="hover:text-red-500 p-0.5"
                    aria-label="Remove amount filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-100">
                  <span>
                    Status:{" "}
                    {statusFilter === "PAID"
                      ? "Paid"
                      : statusFilter === "PENDING"
                      ? "Pending"
                      : "Failed"}
                  </span>
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="hover:text-red-500 p-0.5"
                    aria-label="Remove status filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:underline font-bold ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* 6. Recent Income Table */}
          <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
            <Table className="min-w-[700px]">
              <TableHeader className="bg-gray-50/60">
                <TableRow className="border-b border-gray-100">
                  <TableHead className="font-bold text-gray-400 px-5 py-3 text-xs uppercase tracking-wider">
                    Member
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                    Plan
                  </TableHead>
                  {/* Amount with Sort */}
                  <TableHead
                    onClick={() => handleSort("amount")}
                    className="font-bold text-gray-400 text-xs uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Amount</span>
                      {sortField === "amount" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </TableHead>
                  {/* Date with Sort */}
                  <TableHead
                    onClick={() => handleSort("date")}
                    className="font-bold text-gray-400 text-xs uppercase tracking-wider cursor-pointer hover:text-gray-900 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      {sortField === "date" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-400 text-xs uppercase tracking-wider">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Search className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-gray-800 text-sm">
                          No income records found
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                          {isFiltered
                            ? "No transactions match your current search and filter criteria. Try adjusting or resetting your filters."
                            : "No payment transactions are currently recorded in the database."}
                        </p>
                        {isFiltered && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="mt-2 rounded-xl text-xs font-bold"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Reset All Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((p) => {
                    const isCompleted = p.status === "COMPLETED";
                    const isPending = p.status === "PENDING";
                    const isFailed = p.status === "FAILED" || p.status === "CANCELLED";

                    return (
                      <TableRow
                        key={p.id}
                        className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors"
                      >
                        {/* Member */}
                        <TableCell className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                              {initials(p.userName)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {p.userName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {p.userEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="text-xs font-medium text-gray-600">
                          {p.planName}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-bold text-gray-900 text-sm">
                          {fmt(p.amount)}
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-xs text-gray-500 font-medium">
                          {formatDate(p.createdAt)}
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paid</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-orange-600" />
                              <span>Pending</span>
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Failed</span>
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {p.status}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 7. Pagination Controls */}
          {sortedPayments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-gray-500">
              <p className="font-medium">
                Showing{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(
                    (currentPage - 1) * pageSize + 1,
                    sortedPayments.length
                  )}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-800">
                  {Math.min(currentPage * pageSize, sortedPayments.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-800">
                  {sortedPayments.length}
                </span>{" "}
                records
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-semibold disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                    <span>Prev</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="h-8 px-2.5 rounded-lg border-gray-200 text-xs font-semibold disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
