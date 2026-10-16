"use client";

import { useState, useEffect } from "react";
import { getPaginatedMembers, getActiveBatchesList, getMemberCounts } from "@/actions/membersData";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Plus,
  Users,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Phone,
  Mail,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MemberActionsMenu from "@/components/admin/members/MemberActionsMenu";
import MemberDetailModal from "@/components/admin/MemberDetailModal";
import WhatsAppReminderModal from "@/components/admin/WhatsAppReminderModal";
import WhatsAppReminderAction from "@/components/admin/members/WhatsAppReminderAction";

export function getMemberTypeInfo(member: any) {
  const hasSuccessfulPayment = member.payments?.some(
    (p: any) => p.status === "COMPLETED" && p.amount > 0
  );
  const hasAnyMembership = member.memberships && member.memberships.length > 0;
  const hasPaidInvoice = member.payments?.some(
    (p: any) => p.amount > 0
  );
  const isPaidStatus = ["ACTIVE", "PAYMENT_PENDING", "PARTIALLY_PAID", "EXPIRED"].includes(member.membershipStatus);

  if (hasSuccessfulPayment || hasAnyMembership || hasPaidInvoice || isPaidStatus) {
    return {
      label: "PAID MEMBER",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-100",
    };
  }

  const isTrial = Boolean(
    member.freeTrial ||
    member.membershipStatus === "FREE_TRIAL" ||
    member.membershipStatus === "TRIAL_EXPIRED"
  );

  if (isTrial) {
    return {
      label: "FREE TRIAL",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
    };
  }

  return {
    label: "REGISTERED",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  };
}

export interface MemberRowComputed {
  typeInfo: { label: string; badgeClass: string };
  isPaidMember: boolean;
  isTrial: boolean;
  isTrialExpired: boolean;
  isExpiredFreeTrial: boolean;
  hasOutstandingFees: boolean;
  totalOutstanding: number;
  currentFeeAmount: number;
  displayPlanName: string;
  dueDateText: string;
  dueDateSubtext?: string;
  rawDueDate: Date | null;
  paymentStatus: "PAID" | "ACTIVE" | "PENDING" | "OVERDUE" | "EXPIRED" | "REGISTERED";
  paymentBadgeClass: string;
  pendingInvoices: any[];
  numPendingFees: number;
  hasOldPending: boolean;
}

export function computeMemberRowData(member: any): MemberRowComputed {
  const now = new Date();
  const typeInfo = getMemberTypeInfo(member);
  const isPaidMember = typeInfo.label === "PAID MEMBER";
  const isTrial = typeInfo.label === "FREE TRIAL";

  // 1. Pending / Unpaid Invoices (Free Trial members must never have fee invoices)
  const pendingPayments = isTrial
    ? []
    : (member.payments || []).filter(
        (p: any) => (p.status === "PENDING" || p.status === "OVERDUE") && p.amount > 0
      );

  const pendingDue = pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const numPendingFees = pendingPayments.length;
  const hasOutstandingFees = !isTrial && pendingDue > 0;

  // Memberships & completed payments
  const latestMembership = member.memberships?.[0];
  const activeMembership = member.memberships?.find((m: any) => m.status === "ACTIVE") || latestMembership;
  const hasActivePaidMembership = member.memberships?.some(
    (m: any) => m.status === "ACTIVE" && m.pendingAmount === 0
  );
  const hasOldPending = pendingDue > 0 && hasActivePaidMembership;

  const completedPayments = (member.payments || []).filter(
    (p: any) => p.status === "COMPLETED" && p.amount > 0
  );
  const latestCompletedPayment = completedPayments[0];

  // 2. Free Trial checks
  const isTrialExpired = Boolean(
    isTrial &&
    (
      member.membershipStatus === "TRIAL_EXPIRED" ||
      member.freeTrial?.status === "EXPIRED" ||
      (member.freeTrial?.trialEndDate && new Date(member.freeTrial.trialEndDate) < now)
    )
  );

  const isTrialActive = Boolean(isTrial && !isTrialExpired);
  const isExpiredFreeTrial = Boolean(isTrial && isTrialExpired);

  // 3. Fee Amount Calculation (Free Trial fee amount must remain ₹0)
  let currentFeeAmount = 0;
  if (isTrial) {
    currentFeeAmount = 0;
  } else if (pendingDue > 0) {
    currentFeeAmount = pendingDue;
  } else if (isPaidMember) {
    currentFeeAmount =
      activeMembership?.totalFee ||
      activeMembership?.plan?.price ||
      latestCompletedPayment?.amount ||
      0;
  } else {
    currentFeeAmount = 0;
  }

  // 4. Invoices payload for WhatsApp & modal
  const pendingInvoices = isTrial
    ? []
    : (pendingPayments.length > 0
        ? pendingPayments.map((p: any) => ({
            id: p.id,
            amount: p.amount,
            status: p.status,
            dueDate: p.dueDate || activeMembership?.expiryDate,
            planName: p.plan?.name || activeMembership?.plan?.name || p.description || "Monthly Plan",
            description: p.description,
          }))
        : (activeMembership?.pendingAmount > 0
            ? [{
                amount: activeMembership.pendingAmount,
                planName: activeMembership.plan?.name || "Monthly Plan",
                dueDate: activeMembership.expiryDate,
                description: `${activeMembership.plan?.name || "Membership"} Renewal Fee`,
              }]
            : []));

  // 5. Plan Name Display
  let displayPlanName = "General Membership";
  if (isTrial) {
    if (member.freeTrial?.program) {
      displayPlanName = isTrialActive ? `${member.freeTrial.program} (Trial)` : `${member.freeTrial.program}`;
    } else {
      displayPlanName = "Free Trial";
    }
  } else if (activeMembership?.plan?.name) {
    displayPlanName = activeMembership.plan.name;
  } else if (pendingPayments[0]?.plan?.name) {
    displayPlanName = pendingPayments[0].plan.name;
  } else if (pendingPayments[0]?.description) {
    displayPlanName = pendingPayments[0].description;
  } else if (latestCompletedPayment?.plan?.name) {
    displayPlanName = latestCompletedPayment.plan.name;
  } else if (latestCompletedPayment?.description) {
    displayPlanName = latestCompletedPayment.description;
  } else if (member.enrollments?.[0]?.batch?.classStyle?.name) {
    displayPlanName = `${member.enrollments[0].batch.classStyle.name} Plan`;
  }

  // 6. Due Date / Renewal Date Calculation
  let dueDateText = "—";
  let dueDateSubtext: string | undefined = undefined;
  let rawDueDate: Date | null = null;

  if (isTrial) {
    if (member.freeTrial?.trialEndDate) {
      const trialEnd = new Date(member.freeTrial.trialEndDate);
      rawDueDate = trialEnd;
      dueDateText = trialEnd.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  } else if (pendingPayments.length > 0) {
    // Sort by dueDate ascending so earliest due date is shown
    const sortedPending = [...pendingPayments].sort((a: any, b: any) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateA - dateB;
    });
    const earliestPending = sortedPending[0];
    const targetDate = earliestPending.dueDate
      ? new Date(earliestPending.dueDate)
      : (activeMembership?.expiryDate ? new Date(activeMembership.expiryDate) : null);

    if (targetDate) {
      rawDueDate = targetDate;
      dueDateText = targetDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (pendingPayments.length > 1) {
        dueDateSubtext = `${pendingPayments.length} Invoices`;
      }
    }
  } else if (isPaidMember) {
    // Paid member who paid current fee -> renewal date is their membership expiry date!
    const renewalDate = activeMembership?.expiryDate
      ? new Date(activeMembership.expiryDate)
      : (latestCompletedPayment ? new Date(new Date(latestCompletedPayment.createdAt).getTime() + 30 * 86400000) : null);

    if (renewalDate) {
      rawDueDate = renewalDate;
      dueDateText = renewalDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }

  // 7. Payment Status Calculation
  // CRITICAL REQUIREMENT 1:
  // - Free Trial members must never be marked as OVERDUE for membership fees.
  // - Free Trial fee amount must remain ₹0.
  // - When a Free Trial period expires, show the status as EXPIRED.
  let paymentStatus: "PAID" | "ACTIVE" | "PENDING" | "OVERDUE" | "EXPIRED" | "REGISTERED" = "ACTIVE";
  let paymentBadgeClass = "bg-green-50 text-green-700 border-green-100";

  if (isTrial) {
    if (isTrialExpired) {
      paymentStatus = "EXPIRED";
      paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
    } else {
      paymentStatus = "ACTIVE";
      paymentBadgeClass = "bg-blue-50 text-blue-700 border-blue-100";
    }
  } else if (pendingPayments.length > 0) {
    // Unpaid invoices exist for a paid member
    const hasOverdueInvoice = pendingPayments.some((p: any) => {
      if (p.status === "OVERDUE") return true;
      if (p.dueDate && new Date(p.dueDate) < now) return true;
      return false;
    });

    if (hasOverdueInvoice) {
      paymentStatus = "OVERDUE";
      paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
    } else {
      paymentStatus = "PENDING";
      paymentBadgeClass = "bg-orange-50 text-orange-700 border-orange-100";
    }
  } else if (isPaidMember) {
    // Paid member with 0 unpaid invoices
    const isMembershipExpired = activeMembership?.expiryDate && new Date(activeMembership.expiryDate) < now;
    if (isMembershipExpired) {
      paymentStatus = "EXPIRED";
      paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
    } else {
      paymentStatus = "PAID";
      paymentBadgeClass = "bg-green-50 text-green-700 border-green-100";
    }
  } else {
    // General registered user with no invoices
    paymentStatus = "REGISTERED";
    paymentBadgeClass = "bg-gray-50 text-gray-700 border-gray-200";
  }

  return {
    typeInfo,
    isPaidMember,
    isTrial,
    isTrialExpired,
    isExpiredFreeTrial,
    hasOutstandingFees,
    totalOutstanding: pendingDue,
    currentFeeAmount,
    displayPlanName,
    dueDateText,
    dueDateSubtext,
    rawDueDate,
    paymentStatus,
    paymentBadgeClass,
    pendingInvoices,
    numPendingFees,
    hasOldPending,
  };
}

interface MemberManagementTableProps {
  initialCounts?: {
    total: number;
    paid: number;
    freeTrial: number;
    trialExpired: number;
    feesPending: number;
    outstandingCount?: number;
    outstandingAmount?: number;
  };
}

export default function MemberManagementTable({ initialCounts }: MemberManagementTableProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Counts state
  const [counts, setCounts] = useState(
    initialCounts || {
      total: 0,
      paid: 0,
      freeTrial: 0,
      trialExpired: 0,
      feesPending: 0,
      outstandingCount: 0,
      outstandingAmount: 0,
    }
  );

  // Filters state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [memberType, setMemberType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [batch, setBatch] = useState("ALL");
  const [payment, setPayment] = useState("ALL");
  const [sort, setSort] = useState("date_desc");

  // Filter options
  const [batchesList, setBatchesList] = useState<{ id: string; name: string }[]>([]);

  // Selected member for deep profile view (direct click)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isGeneratingRenewals, setIsGeneratingRenewals] = useState(false);

  useEffect(() => {
    getActiveBatchesList().then(setBatchesList).catch(console.error);
    getMemberCounts().then(setCounts).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialCounts) {
      setCounts(initialCounts);
    }
  }, [initialCounts]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const data = await getPaginatedMembers({
          page,
          limit,
          search,
          memberType,
          status,
          batch,
          payment,
          sortBy: sort,
        });
        setMembers(data.members);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(fetchMembers, 300);
    return () => clearTimeout(timer);
  }, [page, limit, search, memberType, status, batch, payment, sort]);

  // If a filter changes (except page), reset to page 1
  useEffect(() => {
    setPage(1);
  }, [search, memberType, status, batch, payment, sort, limit]);

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const countCards = [
    {
      id: "ALL",
      label: "TOTAL MEMBERS",
      value: counts.total,
      subtext: null,
      icon: Users,
      color: "text-indigo-600 bg-indigo-50",
      activeBorder: "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10",
      onClick: () => {
        setMemberType("ALL");
        setPayment("ALL");
      },
      isActive: memberType === "ALL" && payment === "ALL",
    },
    {
      id: "PAID",
      label: "PAID MEMBERS",
      value: counts.paid,
      subtext: null,
      icon: ShieldCheck,
      color: "text-green-600 bg-green-50",
      activeBorder: "border-green-500 ring-2 ring-green-500/20 bg-green-50/10",
      onClick: () => {
        setMemberType("PAID");
        setPayment("ALL");
      },
      isActive: memberType === "PAID",
    },
    {
      id: "FREE_TRIAL",
      label: "FREE TRIAL",
      value: counts.freeTrial,
      subtext: null,
      icon: Sparkles,
      color: "text-blue-600 bg-blue-50",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10",
      onClick: () => {
        setMemberType("FREE_TRIAL");
        setPayment("ALL");
      },
      isActive: memberType === "FREE_TRIAL",
    },
    {
      id: "OUTSTANDING_FEES",
      label: "OUTSTANDING FEES",
      value: counts.outstandingCount ?? counts.feesPending,
      subtext: `₹${(counts.outstandingAmount || 0).toLocaleString()} total`,
      icon: AlertCircle,
      color: "text-red-600 bg-red-50",
      activeBorder: "border-red-500 ring-2 ring-red-500/20 bg-red-50/10",
      onClick: () => {
        setPayment("ALL_PENDING");
        setMemberType("ALL");
      },
      isActive: payment === "ALL_PENDING",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Interactive Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {countCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className={`group cursor-pointer rounded-2xl bg-white p-2.5 min-[360px]:p-3.5 sm:p-5 border transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                card.isActive
                  ? `${card.activeBorder} shadow-sm`
                  : "border-gray-100/80 hover:border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-1 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight break-words">
                    {card.label}
                  </p>
                  <p className="text-lg min-[360px]:text-xl sm:text-3xl font-black text-gray-900 mt-0.5 sm:mt-1">
                    {card.value}
                  </p>
                  {card.subtext && (
                    <p className="text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold text-red-600 mt-0.5 leading-tight">
                      {card.subtext}
                    </p>
                  )}
                </div>
                <div className={`p-1.5 min-[360px]:p-2 sm:p-3.5 rounded-xl sm:rounded-2xl ${card.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <div className="hidden sm:flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700 mt-3 pt-3 border-t border-gray-50">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-xs border border-gray-100 space-y-2.5 md:space-y-0 md:flex md:items-center md:gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 md:h-10 text-sm font-medium w-full rounded-xl border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
        </div>

        {/* Generate Renewals Button */}
        <Button
          disabled={isGeneratingRenewals}
          onClick={async () => {
            if (!confirm("Generate missing renewal invoices for expired paid members?")) return;
            setIsGeneratingRenewals(true);
            try {
              const res = await fetch("/api/admin/members/generate-renewals", { method: "POST" });
              const data = await res.json();
              if (res.ok) {
                alert(data.message);
                window.location.reload();
              } else {
                alert("Failed: " + data.error);
              }
            } catch (err) {
              alert("Error generating renewals.");
            } finally {
              setIsGeneratingRenewals(false);
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold h-11 md:h-10 px-4 w-full md:w-auto shrink-0 transition-colors shadow-xs active:scale-[0.99]"
        >
          {isGeneratingRenewals ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate Renewals"
          )}
        </Button>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 md:gap-3 w-full md:w-auto">
          {/* Member Type Filter */}
          <div className="relative w-full md:w-auto">
            <select
              aria-label="Filter by member type"
              className="h-11 md:h-10 text-sm rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-50 px-3.5 pr-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:min-w-[140px] font-medium text-gray-700 transition-colors appearance-none"
              value={memberType}
              onChange={(e) => setMemberType(e.target.value)}
            >
              <option value="ALL">All Members</option>
              <option value="PAID">Paid Members</option>
              <option value="FREE_TRIAL">Free Trial</option>
              <option value="TRIAL_EXPIRED">Trial Expired</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Payment Status Filter */}
          <div className="relative w-full md:w-auto">
            <select
              aria-label="Filter by payment status"
              className="h-11 md:h-10 text-sm rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-50 px-3.5 pr-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:min-w-[155px] font-medium text-gray-700 transition-colors appearance-none"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="ALL">Payment Status</option>
              <option value="CURRENT_PENDING">Current Pending</option>
              <option value="OLD_PENDING">Old Pending</option>
              <option value="ALL_PENDING">All Pending</option>
              <option value="PAID">Paid</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Filter */}
          <div className="relative w-full md:w-auto">
            <select
              aria-label="Sort members"
              className="h-11 md:h-10 text-sm rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-50 px-3.5 pr-9 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full md:min-w-[140px] font-medium text-gray-700 transition-colors appearance-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Unable to load members</h3>
          <p className="text-gray-500 mb-4">There was an error communicating with the server.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="animate-pulse flex flex-col">
            <div className="h-12 bg-gray-50 border-b border-gray-100 hidden md:block"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white border-b border-gray-50 flex items-center px-6 gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                </div>
                <div className="w-24 h-6 bg-gray-200 rounded-full hidden md:block"></div>
              </div>
            ))}
          </div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No members found</h3>
          <p className="text-gray-500 mb-4">Try changing your filters or add a new member.</p>
          <Button onClick={() => document.getElementById("add-member-btn")?.click()} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add Member
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-4 py-4 font-bold">Contact</th>

                  <th className="px-4 py-4 font-bold text-center">Member Type</th>
                  <th className="px-4 py-4 font-bold">Plan</th>
                  <th className="px-4 py-4 font-bold text-center">Fee Amount</th>
                  <th className="px-4 py-4 font-bold text-center">Due Date</th>
                  <th className="px-4 py-4 font-bold text-center">Payment Status</th>

                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {members.map((member) => {
                  const c = computeMemberRowData(member);

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors h-[75px] group">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0 shadow-inner">
                            {member.firstName.charAt(0)}
                            {member.lastName.charAt(0)}
                          </div>
                          <div className="flex flex-col max-w-[200px]">
                            <p
                              className="font-bold text-gray-900 truncate"
                              title={`${member.firstName} ${member.lastName}`}
                            >
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-gray-400 truncate" title={member.email}>
                              {member.email}
                            </p>
                            <button
                              onClick={() => setActiveProfileId(member.id)}
                              className="text-[10px] font-bold text-primary hover:underline mt-0.5 self-start opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col max-w-[150px]">
                          <span className="text-gray-700 font-medium truncate" title={member.phone || "No phone"}>
                            {member.phone ? `📞 ${member.phone}` : "—"}
                          </span>
                          <span className="text-gray-400 text-xs truncate" title={member.email}>
                            ✉ {member.email}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${c.typeInfo.badgeClass}`}
                        >
                          {c.typeInfo.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                        {c.hasOldPending ? (
                          <div className="flex flex-col">
                            <span>{c.numPendingFees} Pending Fee{c.numPendingFees > 1 ? "s" : ""}</span>
                            <span className="text-xs text-orange-600">Historical Unpaid</span>
                          </div>
                        ) : (
                          c.displayPlanName
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-center font-bold text-gray-900">
                         ₹{c.currentFeeAmount.toLocaleString("en-IN")}
                      </td>
                      
                      <td className="px-4 py-3 text-center text-xs text-gray-500 font-medium">
                        <div className="flex flex-col items-center">
                          <span>{c.dueDateText}</span>
                          {c.dueDateSubtext && (
                            <span className="text-[10px] text-gray-400 font-normal">{c.dueDateSubtext}</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${c.paymentBadgeClass}`}
                        >
                          {c.paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.hasOutstandingFees && (
                            <WhatsAppReminderAction
                              clientId={member.id}
                              clientName={`${member.firstName} ${member.lastName}`}
                              phone={member.phone}
                              type="payment"
                              totalOutstanding={c.totalOutstanding}
                              invoices={c.pendingInvoices}
                            />
                          )}
                          {c.isExpiredFreeTrial && (
                            <WhatsAppReminderAction
                              clientId={member.id}
                              clientName={`${member.firstName} ${member.lastName}`}
                              phone={member.phone}
                              type="trial_followup"
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 h-8 px-3 rounded-lg"
                            onClick={() => setActiveProfileId(member.id)}
                          >
                            View
                          </Button>
                          <MemberActionsMenu member={member} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3 p-3 sm:p-4 bg-gray-50/50">
            {members.map((member) => {
              const c = computeMemberRowData(member);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200/80 shadow-xs space-y-3 transition-all hover:border-gray-300"
                >
                  {/* Card Header: Avatar, Name & Member Type Badge */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm shrink-0 shadow-2xs">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="font-bold text-gray-900 text-[15px] sm:text-base leading-snug truncate"
                          title={`${member.firstName} ${member.lastName}`}
                        >
                          {member.firstName} {member.lastName}
                        </h3>
                        {/* Contact details: Phone and Email */}
                        <div className="flex flex-col gap-0.5 mt-1 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{member.phone || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 truncate">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border shrink-0 ${c.typeInfo.badgeClass}`}
                    >
                      {c.typeInfo.label}
                    </span>
                  </div>

                  {/* Two-Column Financial & Schedule Details */}
                  <div className="grid grid-cols-2 gap-2.5 bg-gray-50/90 rounded-xl p-3 border border-gray-100/90 text-xs">
                    {/* Left Column: Plan & Fee Amount */}
                    <div className="space-y-2 min-w-0">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Plan
                        </span>
                        <span
                          className="text-xs sm:text-sm font-bold text-gray-800 truncate block mt-0.5"
                          title={c.displayPlanName}
                        >
                          {c.hasOldPending ? `${c.numPendingFees} Old Pending Fee(s)` : c.displayPlanName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Fee Amount
                        </span>
                        <span
                          className={`text-sm sm:text-base font-black block mt-0.5 ${
                            c.hasOutstandingFees ? "text-red-600" : "text-gray-900"
                          }`}
                        >
                          ₹{c.currentFeeAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Right Column: Due/Renewal Date & Payment Status */}
                    <div className="space-y-2 min-w-0">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          {c.hasOutstandingFees
                            ? "Due Date"
                            : c.isPaidMember
                            ? "Renewal Date"
                            : c.isTrialExpired
                            ? "Trial Ended"
                            : c.isTrial
                            ? "Trial Ends"
                            : "Due Date"}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 block mt-0.5 truncate">
                          {c.dueDateText}
                          {c.dueDateSubtext && (
                            <span className="text-[10px] text-gray-400 font-normal ml-1">
                              ({c.dueDateSubtext})
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Payment Status
                        </span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${c.paymentBadgeClass}`}
                          >
                            {c.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100/80">
                    {/* WhatsApp Action (Payment Reminder) */}
                    {c.hasOutstandingFees && (
                      <div className="flex-1 min-w-0">
                        <WhatsAppReminderAction
                          clientId={member.id}
                          clientName={`${member.firstName} ${member.lastName}`}
                          phone={member.phone}
                          type="payment"
                          totalOutstanding={c.totalOutstanding}
                          invoices={c.pendingInvoices}
                          className="w-full h-10 text-xs font-bold justify-center rounded-xl"
                        />
                      </div>
                    )}

                    {/* WhatsApp Action (Trial Follow-up) */}
                    {c.isExpiredFreeTrial && (
                      <div className="flex-1 min-w-0">
                        <WhatsAppReminderAction
                          clientId={member.id}
                          clientName={`${member.firstName} ${member.lastName}`}
                          phone={member.phone}
                          type="trial_followup"
                          className="w-full h-10 text-xs font-bold justify-center rounded-xl"
                        />
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 text-xs font-bold rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => setActiveProfileId(member.id)}
                    >
                      View Profile
                    </Button>

                    <div className="shrink-0">
                      <MemberActionsMenu
                        member={member}
                        className="w-10 h-10 border border-gray-200/80 hover:bg-gray-50 text-gray-500 hover:text-gray-800"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && members.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <p className="text-xs font-medium text-gray-500 text-center sm:text-left">
            Showing <span className="font-bold text-gray-800">{(page - 1) * limit + 1}</span>–
            <span className="font-bold text-gray-800">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-bold text-gray-800">{total}</span> members
          </p>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <select
              aria-label="Members per page"
              className="h-10 text-xs font-medium rounded-xl border border-gray-200 bg-gray-50/80 px-2.5 focus:ring-2 focus:ring-indigo-500/20"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                className="h-10 px-3 rounded-xl border-gray-200 font-bold text-xs"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <div className="px-2 text-xs font-bold text-gray-700 min-w-[50px] text-center">
                {page} <span className="text-gray-400 font-normal">/ {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                className="h-10 px-3 rounded-xl border-gray-200 font-bold text-xs"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Controlled Member Profile Modal */}
      {activeProfileId && (
        <MemberDetailModal
          memberId={activeProfileId}
          triggerContext="none"
          isOpen={true}
          onClose={() => setActiveProfileId(null)}
        />
      )}
    </div>
  );
}
