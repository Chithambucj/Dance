"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";

// DUAL-SOURCE FILTER CONDITIONS HAVE BEEN REMOVED
// All members are now strictly required to have a Membership record.

/** Member has at least one unpaid Payment (invoice) record */
const HAS_PENDING_INVOICE = {
  payments: {
    some: {
      status: { in: ["PENDING", "OVERDUE"] as string[] },
      amount: { gt: 0 },
    },
  },
};

/** Member has successfully purchased a paid plan (completed payment OR has a membership) */
const IS_PAID_MEMBER_WHERE = {
  OR: [
    { memberships: { some: {} } },
    { payments: { some: { status: "COMPLETED", amount: { gt: 0 } } } }
  ]
};

/** Member is on a free trial (has not successfully purchased a paid plan) */
const IS_FREE_TRIAL_WHERE = {
  NOT: IS_PAID_MEMBER_WHERE
};

const HAS_ACTIVE_PAID_MEMBERSHIP = {
  memberships: {
    some: {
      status: "ACTIVE" as string,
      pendingAmount: 0,
    },
  },
};

const ALL_PENDING_WHERE = HAS_PENDING_INVOICE;

/**
 * CURRENT_PENDING: Member's current fee is unpaid.
 *   - Has an unpaid Membership (or standalone PENDING payment)
 *   - AND does NOT have a newer active fully-paid Membership
 */
const CURRENT_PENDING_WHERE = {
  AND: [
    ALL_PENDING_WHERE,
    { NOT: HAS_ACTIVE_PAID_MEMBERSHIP },
  ],
};

/**
 * OLD_PENDING: Member has paid their current fee (active Membership) but has
 * an older unpaid fee lingering.
 *   - Has an active paid Membership
 *   - AND ALSO has a pending Membership (old period)
 */
const OLD_PENDING_WHERE = {
  AND: [
    HAS_ACTIVE_PAID_MEMBERSHIP,
    ALL_PENDING_WHERE,
  ],
};

/**
 * PAID: Current fee is paid AND no outstanding fees of any kind.
 */
const PAID_MEMBERSHIP_WHERE = {
  AND: [
    HAS_ACTIVE_PAID_MEMBERSHIP,
    { NOT: ALL_PENDING_WHERE },
  ],
};

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

  const whereConditions: any[] = [{ role: "MEMBER" }];

  if (memberType && memberType !== "ALL") {
    if (memberType === "FREE_TRIAL" || memberType === "TRIAL_EXPIRED") {
      whereConditions.push(IS_FREE_TRIAL_WHERE);
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

  // Payment status filter — uses dual-source conditions
  if (payment === "ALL_PENDING") {
    whereConditions.push(ALL_PENDING_WHERE);
  } else if (payment === "CURRENT_PENDING") {
    whereConditions.push(CURRENT_PENDING_WHERE);
  } else if (payment === "OLD_PENDING") {
    whereConditions.push(OLD_PENDING_WHERE);
  } else if (payment === "PAID") {
    whereConditions.push(PAID_MEMBERSHIP_WHERE);
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
      payments: { orderBy: { createdAt: "desc" } },
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

    // Free trial members = everyone who is NOT a PAID MEMBER
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...IS_FREE_TRIAL_WHERE,
      },
    }),

    // Trial expired (Currently not used strictly, but fallback to same)
    prisma.user.count({
      where: {
        role: "MEMBER",
        ...IS_FREE_TRIAL_WHERE,
      },
    }),

    // PAID = any member who has successfully paid for a plan (has membership or completed payment)
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

    // OUTSTANDING FEES AMOUNT - Invoice pending sum
    prisma.payment.aggregate({
      where: {
        status: { in: ["PENDING", "OVERDUE"] },
        amount: { gt: 0 },
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

