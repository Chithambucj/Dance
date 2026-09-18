import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import AddMemberModal from "@/components/admin/AddMemberModal";
import AddOfflineMemberModal from "@/components/admin/AddOfflineMemberModal";
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
  searchParams: Promise<{ tab?: string; filter?: string }>;
}) {
  await requireAuth(["ADMIN"]);
  const params = await searchParams;
  const tab    = params.tab || "dashboard";

  // ══════════════════════════════════════════════════════════════════════════
  // 1. DASHBOARD TAB (Income & Business Overview)
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "dashboard") {
    const now = new Date();

    const [completedPayments, pendingMembers] = await Promise.all([
      // Income = completed payments (unchanged)
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

      // ✅ FIXED: Current pending = users whose most recent membership is still unpaid.
      // Query users (not payment records) to get one entry per member with their
      // current pending amount. Excludes members who have a newer ACTIVE paid membership.
      prisma.user.findMany({
        where: {
          role: "MEMBER",
          memberships: {
            some: {
              status: { in: ["PAYMENT_PENDING", "PARTIALLY_PAID"] },
              pendingAmount: { gt: 0 },
            },
          },
          NOT: {
            memberships: {
              some: {
                status: "ACTIVE",
                pendingAmount: 0,
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          memberships: {
            where: {
              status: { in: ["PAYMENT_PENDING", "PARTIALLY_PAID"] },
              pendingAmount: { gt: 0 },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              pendingAmount: true,
              expiryDate: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
          pendingPayments={pendingMembers.map((u) => ({
            id: u.memberships[0]?.id ?? u.id,
            amount: u.memberships[0]?.pendingAmount ?? 0,
            createdAt: u.memberships[0]?.createdAt.toISOString() ?? new Date().toISOString(),
            userName: `${u.firstName} ${u.lastName}`,
            dueDate: u.memberships[0]?.expiryDate?.toISOString() ?? null,
          }))}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. MEMBERS & FEES TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "members") {
    const [allPlans, allBatches] = await Promise.all([
      prisma.pricingPlan.findMany({ where: { isPublished: true, billingPeriod: { not: "TRIAL" } }, orderBy: { displayOrder: "asc" } }),
      prisma.batch.findMany({ where: { isActive: true }, include: { classStyle: true }, orderBy: { createdAt: "desc" } }),
    ]);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Members &amp; Fees</h1>
            <p className="text-gray-400 mt-1 text-sm font-medium">Every member, their plan, and current payment status — in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <AddOfflineMemberModal plans={allPlans} batches={allBatches} />
            <AddMemberModal />
          </div>
        </div>

        <MemberManagementTable />
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

    const [todayAgg, weekAgg, monthAgg, yearAgg, allPayments] = await Promise.all([
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: weekStart  } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: monthStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED", createdAt: { gte: yearStart  } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { firstName: true, lastName: true } }, plan: { select: { name: true } } },
      }),
    ]);

    // Monthly breakdown (last 6 months)
    const monthlyData: { month: string; total: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const payments = allPayments.filter((p) => {
        const cd = new Date(p.createdAt);
        return cd >= d && cd < end;
      });
      monthlyData.push({
        month: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        total: payments.reduce((s, p) => s + p.amount, 0),
        count: payments.length,
      });
    }

    const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Income</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">Revenue collected from memberships and fees.</p>
        </div>

        {/* Period cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Today"      value={fmt(todayAgg._sum.amount ?? 0)} icon={Calendar}   color="text-indigo-600 bg-indigo-50"  sub={`${todayAgg._count.id} payments`} />
          <StatCard label="This Week"  value={fmt(weekAgg._sum.amount ?? 0)}  icon={TrendingUp} color="text-blue-600 bg-blue-50"     sub={`${weekAgg._count.id} payments`} />
          <StatCard label="This Month" value={fmt(monthAgg._sum.amount ?? 0)} icon={Banknote}   color="text-green-600 bg-green-50"   sub={`${monthAgg._count.id} payments`} />
          <StatCard label="This Year"  value={fmt(yearAgg._sum.amount ?? 0)}  icon={DollarSign} color="text-purple-600 bg-purple-50" sub={`${yearAgg._count.id} payments`} />
        </div>

        {/* Monthly trend */}
        <Card className="rounded-2xl border-0 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">Monthly Income Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex items-center gap-4">
                  <p className="text-xs font-bold text-gray-500 w-20 shrink-0">{m.month}</p>
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-lg flex items-center px-3 transition-all"
                      style={{ width: `${Math.max((m.total / maxMonthly) * 100, m.total > 0 ? 4 : 0)}%` }}
                    >
                      {m.total > 0 && <span className="text-[10px] text-white font-bold whitespace-nowrap">{fmt(m.total)}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 w-16 text-right shrink-0">{m.count} paid</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent income payments */}
        <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-gray-50 pb-4">
            <CardTitle className="text-base font-bold text-gray-900">Recent Income</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-50">
                  <TableHead className="font-semibold text-gray-400 px-5 py-3 text-xs">Member</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-xs">Plan</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-xs">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-400 text-xs">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPayments.slice(0, 20).map((p) => (
                  <TableRow key={p.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                    <TableCell className="px-5 py-3 font-semibold text-gray-900 text-sm">{p.user.firstName} {p.user.lastName}</TableCell>
                    <TableCell className="text-xs text-gray-500">{p.plan?.name || "—"}</TableCell>
                    <TableCell className="font-bold text-gray-900">{fmt(p.amount)}</TableCell>
                    <TableCell className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. WHATSAPP REMINDERS TAB
  // ══════════════════════════════════════════════════════════════════════════
  if (tab === "whatsapp") {
    // Members with pending fees who could receive a reminder (from single source of truth: Payment table)
    const pendingPayments = await prisma.payment.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        plan: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group pending payments by member
    const pendingByUser = new Map<string, {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string;
      planName: string;
      pendingAmount: number;
    }>();

    for (const p of pendingPayments) {
      const existing = pendingByUser.get(p.userId);
      if (!existing) {
        pendingByUser.set(p.userId, {
          id: p.id,
          userId: p.userId,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          phone: p.user.phone,
          email: p.user.email,
          planName: p.plan?.name || "Standard Plan",
          pendingAmount: p.amount,
        });
      } else {
        existing.pendingAmount += p.amount;
      }
    }

    const pendingMembers = Array.from(pendingByUser.values());
    const withPhone    = pendingMembers.filter((m) => !!m.phone);
    const withoutPhone = pendingMembers.filter((m) => !m.phone);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">WhatsApp Reminders</h1>
          <p className="text-gray-400 mt-1 text-sm font-medium">Send fee reminders to members with pending payments.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Can Receive Reminder"    value={withPhone.length}    icon={MessageCircle} color="text-green-600 bg-green-50" />
          <StatCard label="No Phone on File"        value={withoutPhone.length} icon={Phone}         color="text-gray-600 bg-gray-100" />
          <StatCard label="Total Pending"           value={pendingMembers.length} icon={AlertCircle} color="text-orange-600 bg-orange-50" />
        </div>

        {/* How it works */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-sm font-bold text-indigo-700 mb-1 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> How WhatsApp Reminders Work
          </p>
          <p className="text-xs text-indigo-600 leading-relaxed">
            Click "Send Reminder" to open WhatsApp with a pre-filled message for that member. The message includes their name, pending amount, and your studio name. No WhatsApp API needed — it opens directly on your phone or browser.
          </p>
        </div>

        {/* Members with phone */}
        {withPhone.length > 0 ? (
          <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="text-base font-bold text-gray-900">Members Ready to Remind</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-50">
                    <TableHead className="font-semibold text-gray-400 px-5 py-3 text-xs">Member</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-xs">Phone</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-xs">Plan</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-xs">Amount Due</TableHead>
                    <TableHead className="font-semibold text-gray-400 text-xs text-right px-5">Send Reminder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withPhone.map((m) => (
                    <TableRow key={m.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                      <TableCell className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 font-black text-xs shrink-0">
                            {initials(m.firstName, m.lastName)}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{m.firstName} {m.lastName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">{m.phone}</TableCell>
                      <TableCell className="text-sm text-gray-600">{m.planName}</TableCell>
                      <TableCell className="font-bold text-orange-600">{fmt(m.pendingAmount)}</TableCell>
                      <TableCell className="text-right px-5">
                        <WhatsAppReminderModal
                          clientId={m.userId}
                          clientName={`${m.firstName} ${m.lastName}`}
                          phone={m.phone!}
                          pendingAmount={m.pendingAmount}
                          membershipId={m.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-2xl border-0 shadow-sm bg-white">
            <CardContent className="py-14 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No pending reminders!</p>
              <p className="text-sm text-gray-400 mt-1">All members with phone numbers are up to date.</p>
            </CardContent>
          </Card>
        )}

        {/* Members without phone */}
        {withoutPhone.length > 0 && (
          <Card className="rounded-2xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-50 pb-3">
              <CardTitle className="text-sm font-bold text-gray-500 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Members Without Phone — Can&apos;t Send WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {withoutPhone.map((m) => (
                    <TableRow key={m.id} className="border-b border-gray-50">
                      <TableCell className="px-5 py-3 font-semibold text-gray-700 text-sm">{m.firstName} {m.lastName}</TableCell>
                      <TableCell className="text-xs text-gray-400">{m.email}</TableCell>
                      <TableCell className="font-bold text-orange-600 text-sm">{fmt(m.pendingAmount)}</TableCell>
                      <TableCell><span className="text-xs text-gray-400 italic">Add phone number to send reminder</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default fallback — redirect to dashboard
  return (
    <div className="text-center py-20 text-gray-400">
      <p>Redirecting…</p>
    </div>
  );
}
