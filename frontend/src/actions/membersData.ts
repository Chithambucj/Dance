"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";

// DUAL-SOURCE FILTER CONDITIONS HAVE BEEN REMOVED
// All members are now strictly required to have a Membership record.

import {
  HAS_PENDING_INVOICE,
  IS_PAID_MEMBER_WHERE,
  IS_FREE_TRIAL_WHERE,
  getExpiredFreeTrialWhere,
  HAS_ACTIVE_PAID_MEMBERSHIP,
  ALL_PENDING_WHERE,
  CURRENT_PENDING_WHERE,
  OLD_PENDING_WHERE,
  PAID_MEMBERSHIP_WHERE,
  getExpiredPaidMemberWhere,
  getActivePaidMemberWhere,
  getOverduePaidMemberWhere,
  getPendingPaidMemberWhere,
} from "@/lib/memberQueries";
import { syncMembershipExpiries } from "@/lib/membershipExpiry";

// ── getPaginatedMembers ────────────────────────────────────────────────────────

export async function getPaginatedMembers(params: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  batch?: string;
  payment?: string;
  memberType?: string;
  sortBy?: string;
}) {
  await requireAuth(["ADMIN"]);

  const { page, limit, search, status, batch, payment, memberType, sortBy } = params;
  const skip = (page - 1) * limit;
  const now = new Date();

  // Ensure expiries are synced with database
  await syncMembershipExpiries(now);

  const whereConditions: any[] = [{ role: "MEMBER" }];

  if (memberType && memberType !== "ALL") {
    if (memberType === "FREE_TRIAL") {
      whereConditions.push(IS_FREE_TRIAL_WHERE);
    } else if (memberType === "TRIAL_EXPIRED") {
      whereConditions.push(getExpiredFreeTrialWhere(now));
    } else if (memberType === "PAID") {
      whereConditions.push(IS_PAID_MEMBER_WHERE);
    } else if (memberType === "FEES_PENDING") {
      // Summary cards use CURRENT_PENDING — members whose current fee is unpaid
      whereConditions.push(CURRENT_PENDING_WHERE);
    }
  }

  if (status && status !== "ALL") {
    whereConditions.push({ status });
  }

  if (search && search.trim() !== "") {
    whereConditions.push({
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (batch && batch !== "ALL") {
    whereConditions.push({
      enrollments: {
        some: { batchId: batch },
      },
    });
  }

  // Payment status filter
  if (payment === "ALL_PENDING") {
    whereConditions.push(ALL_PENDING_WHERE);
  } else if (payment === "CURRENT_PENDING") {
    whereConditions.push(CURRENT_PENDING_WHERE);
  } else if (payment === "OLD_PENDING") {
    whereConditions.push(OLD_PENDING_WHERE);
  } else if (payment === "PAID") {
    whereConditions.push(getActivePaidMemberWhere(now));
  } else if (payment === "EXPIRED") {
    whereConditions.push(getExpiredPaidMemberWhere(now));
  } else if (payment === "OVERDUE") {
    whereConditions.push(getOverduePaidMemberWhere(now));
  } else if (payment === "PENDING") {
    whereConditions.push(getPendingPaidMemberWhere(now));
  }

  const where: any = { AND: whereConditions };

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "name_asc") orderBy = { firstName: "asc" };
  if (sortBy === "name_desc") orderBy = { firstName: "desc" };
  if (sortBy === "date_asc") orderBy = { createdAt: "asc" };
  if (sortBy === "date_desc") orderBy = { createdAt: "desc" };

  const total = await prisma.user.count({ where });

  const members = await prisma.user.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      enrollments: {
        include: {
          batch: {
            include: { classStyle: true, instructor: true },
          },
        },
      },
      payments: {
        include: { plan: true },
        orderBy: { createdAt: "desc" },
      },
      attendances: {
        include: { batch: { include: { classStyle: true } } },
        orderBy: { date: "desc" },
      },
      freeTrial: true,
      memberships: {
        include: { plan: true },
        orderBy: { createdAt: "desc" }, // [0] = most recent = current
      },
    },
  });

  return {
    members,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ── getActiveBatchesList ───────────────────────────────────────────────────────

export async function getActiveBatchesList() {
  await requireAuth(["ADMIN"]);
  return prisma.batch.findMany({
    where: { isActive: true },
    select: { id: true, name: true, classStyle: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

// ── getMemberCounts ────────────────────────────────────────────────────────────

export async function getMemberCounts() {
  await requireAuth(["ADMIN"]);
  const now = new Date();

  // Sync any expired memberships before aggregating
  await syncMembershipExpiries(now);

  const [
    total,
    freeTrial,
    trialExpired,
    paid,
    feesPending,
    outstandingCount,
    paymentSum,
  ] = await Promise.all([
    // Total members
    prisma.user.count({ where: { role: "MEMBER" } }),

    // Free trial members = active or expired trial who have NOT converted to PAID MEMBER
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...IS_FREE_TRIAL_WHERE,
      },
    }),

    // Trial expired = trial period actually expired and who have NOT converted to PAID MEMBER
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...getExpiredFreeTrialWhere(now),
      },
    }),

    // PAID = any member who has a paid plan (membership, payment > 0, or active paid status)
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...IS_PAID_MEMBER_WHERE,
      },
    }),

    // CURRENT FEES PENDING = CURRENT_PENDING only
    prisma.user.count({
      where: {
        role: "MEMBER",
        AND: CURRENT_PENDING_WHERE.AND,
      },
    }),

    // OUTSTANDING FEES COUNT = unique members with at least one unpaid fee/invoice (ALL_PENDING)
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...ALL_PENDING_WHERE,
      },
    }),

    // OUTSTANDING FEES AMOUNT - Invoice pending sum for valid members (excluding free trials)
    prisma.payment.aggregate({
      where: {
        status: { in: ["PENDING", "OVERDUE"] },
        amount: { gt: 0 },
        user: {
          role: "MEMBER",
          NOT: IS_FREE_TRIAL_WHERE,
        },
      },
      _sum: { amount: true },
    }),
  ]);

  const outstandingAmount = paymentSum._sum.amount || 0;

  return {
    total,
    paid,
    freeTrial,
    trialExpired,
    feesPending,
    outstandingCount,
    outstandingAmount,
  };
}

// ── getOutstandingInvoices (Shared backend source for Dashboard & Members) ──────

export async function getOutstandingInvoices() {
  await requireAuth(["ADMIN"]);

  return prisma.payment.findMany({
    where: {
      status: { in: ["PENDING", "OVERDUE"] },
      amount: { gt: 0 },
      user: {
        role: "MEMBER",
        NOT: IS_FREE_TRIAL_WHERE,
      },
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      status: true,
      createdAt: true,
      dueDate: true,
      description: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          membershipStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export const getPendingInvoices = getOutstandingInvoices;

