import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import AnnouncementManager from "@/components/admin/AnnouncementManager";

export const dynamic = "force-dynamic";
import AddMemberModal from "@/components/admin/AddMemberModal";
import AddPaymentModal from "@/components/admin/AddPaymentModal";
import EditPaymentModal from "@/components/admin/EditPaymentModal";
import DeletePaymentButton from "@/components/admin/DeletePaymentButton";
import MarkPaidButton from "@/components/admin/MarkPaidButton";
import PaymentReceiptModal from "@/components/admin/PaymentReceiptModal";
import WhatsAppReminderModal from "@/components/admin/WhatsAppReminderModal";
import PendingMembersModal from "@/components/admin/PendingMembersModal";
import MemberManagementTable from "@/components/admin/members/MemberManagementTable";
import EditMemberModal from "@/components/admin/EditMemberModal";
import DeleteMemberButton from "@/components/admin/DeleteMemberButton";
import {
  Users, CreditCard, TrendingUp, AlertCircle, CheckCircle2,
  Clock, DollarSign, MessageCircle, Phone, Calendar, ArrowRight,
  Banknote, Wifi, UserPlus, ShieldCheck, Sparkles,
} from "lucide-react";

import AdminIncomeDashboard from "@/components/admin/dashboard/AdminIncomeDashboard";
import WhatsAppRemindersView from "@/components/admin/reminders/WhatsAppRemindersView";
import IncomeTrackerView, { IncomePaymentRecord, IncomeMetrics } from "@/components/admin/income/IncomeTrackerView";
import { generateSystemNotifications } from "@/actions/notifications";
import { getOutstandingInvoices, getMemberCounts } from "@/actions/membersData";
import { getExpiredFreeTrialWhere, IS_FREE_TRIAL_WHERE } from "@/lib/memberQueries";
import { isValidPhone } from "@/lib/whatsappReminder";

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) { return `₹${n.toLocaleString("en-IN")}`; }
function initials(f: string, l: string) { return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase(); }

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-white">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 font-medium">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; filter?: string; memberType?: string; payment?: string }>;
}) {
  await requireAuth(["ADMIN"]);
  const params = await searchParams;
  const tab    = params.tab || "dashboard";

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD TAB (Income & Business Overview)
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "dashboard") {
    const now = new Date();
    
    // Generate system notifications (pending/overdue) — idempotent, no duplicates
    generateSystemNotifications().catch(console.error);

    const [completedPayments, pendingInvoices, expiredTrialsCount] = await Promise.all([
      // Income = completed payments
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          paymentMethod: true,
          paidAt: true,
          user: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Unpaid invoices = valid PENDING and OVERDUE invoices (shared with Members & Fees)
      getOutstandingInvoices(),

      // Expired Free Trials count awaiting follow-up
      prisma.user.count({
        where: {
          role: "MEMBER",
          ...getExpiredFreeTrialWhere(now),
        },
      }),
    ]);

    return (
      <div className="space-y-6">
        <AdminIncomeDashboard
          completedPayments={completedPayments.map((p) => ({
            id: p.id,
            amount: p.amount,
            createdAt: p.createdAt.toISOString(),
            userName: `${p.user.firstName} ${p.user.lastName}`,
            paymentMethod: p.paymentMethod ?? null,
            paidAt: p.paidAt ? p.paidAt.toISOString() : null,
          }))}
          pendingPayments={pendingInvoices.map((p) => ({
            id: p.id,
            userId: p.userId,
            amount: p.amount,
            createdAt: p.createdAt.toISOString(),
            userName: p.user ? `${p.user.firstName} ${p.user.lastName}` : "Unknown Member",
            dueDate: p.dueDate ? p.dueDate.toISOString() : null,
          }))}
          expiredTrialsCount={expiredTrialsCount}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MEMBERS & FEES TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "members") {
    const [allPlans, allBatches, initialCounts] = await Promise.all([
      prisma.pricingPlan.findMany({ where: { isPublished: true, billingPeriod: { not: "TRIAL" } }, orderBy: { displayOrder: "asc" } }),
      prisma.batch.findMany({ where: { isActive: true }, include: { classStyle: true }, orderBy: { createdAt: "desc" } }),
      getMemberCounts(),
    ]);
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Members &amp; Fees</h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">Every member, their plan, and current payment status — in one place.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AddMemberModal plans={allPlans} batches={allBatches} />
          </div>
        </div>

        <MemberManagementTable
          initialCounts={initialCounts}
          initialMemberType={params.memberType}
          initialPayment={params.payment}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. INCOME TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "income") {
    const now        = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);

    const [todayAgg, weekAgg, monthAgg, yearAgg, allPayments, allPlans] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: weekStart  } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: yearStart  } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          plan: { select: { id: true, name: true, billingPeriod: true } },
        },
      }),
      prisma.pricingPlan.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, billingPeriod: true },
      }),
    ]);

    // Monthly breakdown (last 6 months) - strictly completed payments
    const monthlyData: { month: string; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const completedInMonth = allPayments.filter((p) => {
        if (p.status !== "COMPLETED") return false;
        const cd = new Date(p.createdAt);
        return cd >= d && cd < end;
      });
      monthlyData.push({
        month: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        total: completedInMonth.reduce((s, p) => s + p.amount, 0),
        count: completedInMonth.length,
      });
    }

    const initialPayments: IncomePaymentRecord[] = allPayments.map((p) => ({
      id: p.id,
      userId: p.userId,
      userName: `${p.user.firstName} ${p.user.lastName}`.trim(),
      userEmail: p.user.email,
      planName: p.plan?.name || p.description || "—",
      amount: p.amount,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
      description: p.description,
    }));

    const metrics: IncomeMetrics = {
      todayTotal: todayAgg._sum.amount ?? 0,
      todayCount: todayAgg._count.id,
      weekTotal: weekAgg._sum.amount ?? 0,
      weekCount: weekAgg._count.id,
      monthTotal: monthAgg._sum.amount ?? 0,
      monthCount: monthAgg._count.id,
      yearTotal: yearAgg._sum.amount ?? 0,
      yearCount: yearAgg._count.id,
    };

    return (
      <IncomeTrackerView
        initialPayments={initialPayments}
        metrics={metrics}
        monthlyTrend={monthlyData}
        availablePlans={allPlans}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. WHATSAPP REMINDERS TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "whatsapp") {
    const now = new Date();

    // 1. Members with pending fees (from single source of truth: Payment table where status in PENDING, OVERDUE and amount > 0, excluding free trials)
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: { in: ["PENDING", "OVERDUE"] },
        amount: { gt: 0 },
        user: { role: "MEMBER", NOT: IS_FREE_TRIAL_WHERE },
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        plan: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    // Group pending payments by member without double counting
    const pendingByUser = new Map<string, {
      userId: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string;
      totalPendingAmount: number;
      earliestDueDate: string | null;
      primaryPlanName: string;
      hasValidPhone: boolean;
      invoices: {
        id: string;
        amount: number;
        status: string;
        dueDate: string | null;
        planName: string;
        description?: string | null;
      }[];
    }>();

    for (const p of pendingPayments) {
      const invDueDate = p.dueDate ? p.dueDate.toISOString() : null;
      const invPlanName = p.plan?.name || p.description || "Dance Class Membership";
      const invoiceItem = {
        id: p.id,
        amount: p.amount,
        status: p.status,
        dueDate: invDueDate,
        planName: invPlanName,
        description: p.description,
      };

      const existing = pendingByUser.get(p.userId);
      if (!existing) {
        pendingByUser.set(p.userId, {
          userId: p.userId,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          phone: p.user.phone,
          email: p.user.email,
          totalPendingAmount: p.amount,
          earliestDueDate: invDueDate,
          primaryPlanName: invPlanName,
          hasValidPhone: isValidPhone(p.user.phone),
          invoices: [invoiceItem],
        });
      } else {
        existing.totalPendingAmount += p.amount;
        existing.invoices.push(invoiceItem);
        if (p.dueDate && (!existing.earliestDueDate || new Date(p.dueDate) < new Date(existing.earliestDueDate))) {
          existing.earliestDueDate = invDueDate;
        }
      }
    }

    const pendingMembers = Array.from(pendingByUser.values());
    const canReceiveCount = pendingMembers.filter((m) => m.hasValidPhone).length;
    const totalPendingCount = pendingMembers.length;

    // 2. Expired Free Trial members with ₹0 pending balance (distinct and never mixed with fee reminders)
    // Uses the EXACT SAME shared backend query as getMemberCounts() and getPaginatedMembers()
    const trialUsers = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        ...getExpiredFreeTrialWhere(now),
      },
      include: {
        freeTrial: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const expiredTrialMembers = trialUsers.map((u) => ({
      userId: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      email: u.email,
      trialEndDate: u.freeTrial?.trialEndDate ? u.freeTrial.trialEndDate.toISOString() : null,
      hasValidPhone: isValidPhone(u.phone),
    }));

    return (
      <WhatsAppRemindersView
        canReceiveCount={canReceiveCount}
        totalPendingCount={totalPendingCount}
        pendingMembers={pendingMembers}
        expiredTrialMembers={expiredTrialMembers}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. ANNOUNCEMENTS TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "announcements") {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return <AnnouncementManager initialAnnouncements={announcements} />;
  }

  // Default fallback — redirect to dashboard
  return (
    <div className="text-center py-20 text-gray-400">
      <p>Redirecting…</p>
    </div>
  );
}
