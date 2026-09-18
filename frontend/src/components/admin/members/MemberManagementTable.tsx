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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MemberActionsMenu from "@/components/admin/members/MemberActionsMenu";
import MemberDetailModal from "@/components/admin/MemberDetailModal";
import WhatsAppReminderModal from "@/components/admin/WhatsAppReminderModal";

export function getMemberTypeInfo(member: any) {
  const hasSuccessfulPayment = member.payments?.some(
    (p: any) => p.status === "COMPLETED" && p.amount > 0
  );
  const hasAnyMembership = member.memberships && member.memberships.length > 0;
  
  if (hasSuccessfulPayment || hasAnyMembership) {
    return {
      label: "PAID MEMBER",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-100",
    };
  }

  return {
    label: "FREE TRIAL",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-100",
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

  useEffect(() => {
    getActiveBatchesList().then(setBatchesList).catch(console.error);
    getMemberCounts().then(setCounts).catch(console.error);
  }, []);

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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {countCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className={`group cursor-pointer rounded-2xl bg-white p-5 border transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                card.isActive
                  ? `${card.activeBorder} shadow-sm`
                  : "border-gray-100/80 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-3xl font-black text-gray-900 mt-1">
                    {card.value}
                  </p>
                  {card.subtext && (
                    <p className="text-xs font-bold text-red-600 mt-1">
                      {card.subtext}
                    </p>
                  )}
                </div>
                <div className={`p-3.5 rounded-2xl ${card.color} shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-700 mt-3 pt-3 border-t border-gray-50">
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm w-full rounded-xl border-gray-200"
          />
        </div>
        <Button
          onClick={async () => {
            if (!confirm("Generate missing renewal invoices for expired paid members?")) return;
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
            }
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm h-10 whitespace-nowrap px-4"
        >
          Generate Renewals
        </Button>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Member Type Filter */}
          <select
            className="h-10 text-sm rounded-xl border-gray-200 bg-gray-50 px-3 focus:ring-primary focus:border-primary min-w-[140px] font-medium"
            value={memberType}
            onChange={(e) => setMemberType(e.target.value)}
          >
            <option value="ALL">All Members</option>
            <option value="PAID">Paid Members</option>
            <option value="FREE_TRIAL">Free Trial</option>
            <option value="TRIAL_EXPIRED">Trial Expired</option>
          </select>

          <select
            className="h-10 text-sm rounded-xl border-gray-200 bg-gray-50 px-3 focus:ring-primary focus:border-primary min-w-[150px]"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
          >
            <option value="ALL">Payment Status</option>
            <option value="CURRENT_PENDING">Current Pending</option>
            <option value="OLD_PENDING">Old Pending</option>
            <option value="ALL_PENDING">All Pending</option>
            <option value="PAID">Paid</option>
          </select>

          <select
            className="h-10 text-sm rounded-xl border-gray-200 bg-gray-50 px-3 focus:ring-primary focus:border-primary min-w-[140px]"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
          </select>
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
                  // ── Pending amounts: purely from Payment (invoice) records ──
                  const pendingPayments = member.payments?.filter(
                    (p: any) => p.status === "PENDING" || p.status === "OVERDUE"
                  ) || [];
                  const pendingDue = pendingPayments.reduce(
                    (sum: number, p: any) => sum + p.amount,
                    0
                  );
                  const numPendingFees = pendingPayments.length;

                  // OLD PENDING: has a current paid membership but also has older pending dues
                  const hasActivePaidMembership = member.memberships?.some(
                    (m: any) => m.status === "ACTIVE" && m.pendingAmount === 0
                  );
                  const hasOldPending = pendingDue > 0 && hasActivePaidMembership;

                  const typeInfo = getMemberTypeInfo(member);
                  const activeMembership = member.memberships?.[0];

                  // Plan name: prefer Membership plan, then invoice description, then batch
                  const planName =
                    activeMembership?.plan?.name ||
                    (pendingPayments[0]?.description) ||
                    (member.payments?.[0]?.description) ||
                    (member.enrollments?.[0]?.batch?.classStyle?.name
                      ? `${member.enrollments[0].batch.classStyle.name} Plan`
                      : "General Membership");

                  const membershipEndDate = activeMembership?.expiryDate
                    ? new Date(activeMembership.expiryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const trialStart = member.freeTrial?.trialStartDate
                    ? new Date(member.freeTrial.trialStartDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : new Date(member.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                  const trialEnd = member.freeTrial?.trialEndDate
                    ? new Date(member.freeTrial.trialEndDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—";

                  const isTrialExpired =
                    member.membershipStatus === "TRIAL_EXPIRED" ||
                    (member.membershipStatus === "FREE_TRIAL" && member.freeTrial?.trialEndDate && new Date(member.freeTrial.trialEndDate) < new Date());

                  const isTrial = typeInfo.label === "FREE TRIAL";

                  const currentFeeAmount = isTrial
                    ? 0
                    : (pendingDue > 0 ? pendingDue : (activeMembership?.plan?.price || 0));

                  let paymentStatus = "";
                  let paymentBadgeClass = "";

                  if (currentFeeAmount === 0) {
                    paymentStatus = "EXPIRED";
                    paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
                  } else {
                    if (pendingDue === 0) {
                      paymentStatus = "PAID";
                      paymentBadgeClass = "bg-green-50 text-green-700 border-green-100";
                    } else {
                      // Check for overdue (assume overdue if activeMembership is expired or expiryDate passed)
                      if (activeMembership?.status === "EXPIRED" || (activeMembership?.expiryDate && new Date(activeMembership.expiryDate) < new Date())) {
                        paymentStatus = "OVERDUE";
                        paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
                      } else {
                        paymentStatus = "PENDING";
                        paymentBadgeClass = "bg-orange-50 text-orange-700 border-orange-100";
                      }
                    }
                  }

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
                          className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${typeInfo.badgeClass}`}
                        >
                          {typeInfo.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                        {hasOldPending ? (
                          <div className="flex flex-col">
                            <span>{numPendingFees} Pending Fee{numPendingFees > 1 ? "s" : ""}</span>
                            <span className="text-xs text-orange-600">Historical Unpaid</span>
                          </div>
                        ) : (
                          member.membershipStatus === "FREE_TRIAL" || isTrialExpired 
                            ? (member.freeTrial?.program || "Trial") 
                            : planName
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-center font-bold text-gray-900">
                         ₹{currentFeeAmount.toLocaleString()}
                      </td>
                      
                      <td className="px-4 py-3 text-center text-xs text-gray-500 font-medium">
                        {member.membershipStatus === "FREE_TRIAL" || isTrialExpired 
                          ? trialEnd 
                          : (pendingDue > 0 ? (hasOldPending ? "Multiple Dates" : "Now") : membershipEndDate)}
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${paymentBadgeClass}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pendingDue > 0 && member.phone && (
                            <WhatsAppReminderModal clientId={member.id} clientName={`${member.firstName} ${member.lastName}`} phone={member.phone} pendingAmount={pendingDue} />
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
          <div className="md:hidden divide-y divide-gray-100">
            {members.map((member) => {
              // Mobile Pending amounts calculation
              const pendingPayments = member.payments?.filter(
                (p: any) => p.status === "PENDING" || p.status === "OVERDUE"
              ) || [];
              const pendingDue = pendingPayments.reduce(
                (sum: number, p: any) => sum + p.amount, 0
              );
              const numPendingFees = pendingPayments.length;
              const hasActivePaidMembership = member.memberships?.some(
                (m: any) => m.status === "ACTIVE" && m.pendingAmount === 0
              );
              const hasOldPending = pendingDue > 0 && hasActivePaidMembership;

              const typeInfo = getMemberTypeInfo(member);
              const activeMembership = member.memberships?.[0];
              const planName =
                activeMembership?.plan?.name ||
                (member.enrollments?.[0]?.batch?.classStyle?.name
                  ? `${member.enrollments[0].batch.classStyle.name} Plan`
                  : "General Membership");

              const isTrialExpired =
                member.membershipStatus === "TRIAL_EXPIRED" ||
                (member.membershipStatus === "FREE_TRIAL" && member.freeTrial?.trialEndDate && new Date(member.freeTrial.trialEndDate) < new Date());

              const isTrial = typeInfo.label === "FREE TRIAL";

              const currentFeeAmount = isTrial
                ? 0
                : (pendingDue > 0 ? pendingDue : (activeMembership?.plan?.price || 0));

              let paymentStatus = "";
              let paymentBadgeClass = "";

              if (currentFeeAmount === 0) {
                paymentStatus = "EXPIRED";
                paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
              } else {
                if (pendingDue === 0) {
                  paymentStatus = "PAID";
                  paymentBadgeClass = "bg-green-50 text-green-700 border-green-100";
                } else {
                  if (activeMembership?.status === "EXPIRED" || (activeMembership?.expiryDate && new Date(activeMembership.expiryDate) < new Date())) {
                    paymentStatus = "OVERDUE";
                    paymentBadgeClass = "bg-red-50 text-red-700 border-red-100";
                  } else {
                    paymentStatus = "PENDING";
                    paymentBadgeClass = "bg-orange-50 text-orange-700 border-orange-100";
                  }
                }
              }

              const membershipEndDate = activeMembership?.expiryDate
                ? new Date(activeMembership.expiryDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "—";

              const trialEnd = member.freeTrial?.trialEndDate
                ? new Date(member.freeTrial.trialEndDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "—";

              return (
                <div key={member.id} className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${typeInfo.badgeClass}`}
                      >
                        {typeInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Unified Mobile Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-1 truncate">
                      <span title={member.phone || "No phone"}>📞 {member.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-gray-800 truncate">
                      🏷️ {hasOldPending ? `${numPendingFees} Old Pending Fee(s)` : (member.membershipStatus === "FREE_TRIAL" || isTrialExpired ? (member.freeTrial?.program || "Trial") : planName)}
                    </div>
                    <div className="flex items-center gap-1">
                      💰{" "}
                      <span className={pendingDue > 0 ? "text-orange-600 font-bold" : "text-gray-900 font-bold"}>
                        ₹{currentFeeAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      📅{" "}
                      {member.membershipStatus === "FREE_TRIAL" || isTrialExpired 
                        ? `Ends: ${trialEnd}` 
                        : (pendingDue > 0 ? (hasOldPending ? "Multiple Dates" : "Due: Now") : `Expires: ${membershipEndDate}`)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      className={`inline-flex items-center justify-center text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${paymentBadgeClass}`}
                    >
                      {paymentStatus}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs rounded-lg flex-1 mx-2"
                      onClick={() => setActiveProfileId(member.id)}
                    >
                      View Profile
                    </Button>
                    <MemberActionsMenu member={member} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && members.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-xs font-medium text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} members
          </p>
          <div className="flex items-center gap-4">
            <select
              className="h-8 text-xs rounded-lg border-gray-200 bg-white px-2 focus:ring-primary focus:border-primary"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-lg"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 text-sm font-bold text-gray-700">
                {page} <span className="text-gray-400 font-normal">/ {totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-lg"
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
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
