/**
 * Shared Member & Free Trial Database Query Definitions
 * (Kept in /lib so they can be exported as sync objects/functions without violating Next.js "use server" rules)
 */

/** Member has at least one unpaid Payment (invoice) record with amount > 0 */
export const HAS_PENDING_INVOICE = {
  payments: {
    some: {
      status: { in: ["PENDING", "OVERDUE"] as string[] },
      amount: { gt: 0 },
    },
  },
};

/** Member has purchased a paid plan or has an invoice/membership for a paid plan */
export const IS_PAID_MEMBER_WHERE = {
  OR: [
    { memberships: { some: {} } },
    { payments: { some: { amount: { gt: 0 } } } },
    { membershipStatus: { in: ["ACTIVE", "PAYMENT_PENDING", "PARTIALLY_PAID", "EXPIRED"] } },
  ],
};

/** Member is on a free trial (has a trial record or trial status and has NOT converted to paid) */
export const IS_FREE_TRIAL_WHERE = {
  AND: [
    {
      OR: [
        { freeTrial: { isNot: null } },
        { membershipStatus: { in: ["FREE_TRIAL", "TRIAL_EXPIRED"] } },
      ],
    },
    { NOT: IS_PAID_MEMBER_WHERE },
  ],
};

/** Member is on an expired free trial and has NOT converted to paid */
export function getExpiredFreeTrialWhere(now = new Date()) {
  return {
    AND: [
      IS_FREE_TRIAL_WHERE,
      {
        OR: [
          { membershipStatus: "TRIAL_EXPIRED" },
          { freeTrial: { status: "EXPIRED" } },
          { freeTrial: { trialEndDate: { lt: now } } },
        ],
      },
    ],
  };
}

export const HAS_ACTIVE_PAID_MEMBERSHIP = {
  memberships: {
    some: {
      status: "ACTIVE" as string,
      pendingAmount: 0,
    },
  },
};

/** Member has an unpaid invoice for a paid plan (excluding Free Trial members) */
export const ALL_PENDING_WHERE = {
  AND: [
    HAS_PENDING_INVOICE,
    { NOT: IS_FREE_TRIAL_WHERE },
  ],
};

/**
 * CURRENT_PENDING: Member's current fee is unpaid.
 *   - Has an unpaid Membership (or standalone PENDING payment)
 *   - AND does NOT have a newer active fully-paid Membership
 */
export const CURRENT_PENDING_WHERE = {
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
export const OLD_PENDING_WHERE = {
  AND: [
    HAS_ACTIVE_PAID_MEMBERSHIP,
    ALL_PENDING_WHERE,
  ],
};

/**
 * PAID: Current fee is paid AND no outstanding fees of any kind.
 */
export const PAID_MEMBERSHIP_WHERE = {
  AND: [
    HAS_ACTIVE_PAID_MEMBERSHIP,
    { NOT: ALL_PENDING_WHERE },
  ],
};

export function getExpiredPaidMemberWhere(now = new Date()) {
  return {
    AND: [
      IS_PAID_MEMBER_WHERE,
      {
        OR: [
          { membershipStatus: "EXPIRED" },
          {
            memberships: {
              some: { expiryDate: { lt: now } },
              none: { expiryDate: { gte: now }, status: "ACTIVE" },
            },
          },
        ],
      },
    ],
  };
}

export function getActivePaidMemberWhere(now = new Date()) {
  return {
    AND: [
      IS_PAID_MEMBER_WHERE,
      {
        memberships: {
          some: {
            status: "ACTIVE",
            pendingAmount: 0,
            expiryDate: { gte: now },
          },
        },
      },
      { NOT: ALL_PENDING_WHERE },
    ],
  };
}

export function getOverduePaidMemberWhere(now = new Date()) {
  return {
    AND: [
      IS_PAID_MEMBER_WHERE,
      {
        memberships: {
          some: {
            expiryDate: { gte: now },
          },
        },
      },
      {
        payments: {
          some: {
            amount: { gt: 0 },
            OR: [
              { status: "OVERDUE" },
              { status: "PENDING", dueDate: { lt: now } },
            ],
          },
        },
      },
    ],
  };
}

export function getPendingPaidMemberWhere(now = new Date()) {
  return {
    AND: [
      IS_PAID_MEMBER_WHERE,
      {
        memberships: {
          some: {
            expiryDate: { gte: now },
          },
        },
      },
      {
        payments: {
          some: {
            status: "PENDING",
            amount: { gt: 0 },
            OR: [
              { dueDate: null },
              { dueDate: { gte: now } },
            ],
          },
        },
      },
    ],
  };
}

