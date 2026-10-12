import { prisma } from "@/lib/prisma";

export type MemberLifecycleState =
  | "NEW_MEMBER"
  | "EXISTING_ACTIVE_MEMBER"
  | "EXISTING_EXPIRED_MEMBER"
  | "ACTIVE_FREE_TRIAL_MEMBER"
  | "EXPIRED_FREE_TRIAL_MEMBER";

export interface MemberStatusResult {
  state: MemberLifecycleState;
  hasPaidMembership: boolean;
  isActive: boolean;
  isExpired: boolean;
  isFreeTrial: boolean;
  isTrialExpired: boolean;
  userStatus: string;
  latestMembership: any;
  freeTrial: any;
  pendingInvoices: any[];
}

/**
 * Accurately determines a member's lifecycle state based on actual
 * historical payment and membership records, NOT solely on current status field.
 *
 * States:
 * 1. NEW_MEMBER: Has never completed a paid membership/payment and has no active free trial.
 * 2. EXISTING_ACTIVE_MEMBER: Has previous paid membership/payment and membership is currently active.
 * 3. EXISTING_EXPIRED_MEMBER: Has previous paid membership/payment, but subscription has expired.
 * 4. ACTIVE_FREE_TRIAL_MEMBER: Currently in an active 7-day free trial.
 * 5. EXPIRED_FREE_TRIAL_MEMBER: Had a free trial that expired without ever purchasing a paid plan.
 */
export async function getMemberLifecycleState(userId: string): Promise<MemberStatusResult> {
  const [
    user,
    latestMembershipFromDb,
    freeTrial,
    completedPaymentsCount,
    allCompletedPayments,
    allMembershipsCount,
    pendingInvoices,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, membershipStatus: true, role: true },
    }),
    prisma.membership.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.freeTrial.findUnique({
      where: { userId },
    }),
    prisma.payment.count({
      where: {
        userId,
        status: "COMPLETED",
        amount: { gt: 0 },
      },
    }),
    prisma.payment.findMany({
      where: {
        userId,
        status: "COMPLETED",
        amount: { gt: 0 },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membership.count({
      where: { userId },
    }),
    prisma.payment.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const now = new Date();
  let userStatus = user?.membershipStatus ?? "REGISTERED";

  // Has this user EVER purchased or completed a paid membership or payment?
  // An existing paid customer is anyone with completed payments OR existing membership record.
  const hasPaidMembership = completedPaymentsCount > 0 || allMembershipsCount > 0;

  // Determine membership details (derive from DB membership, or from latest completed payment if membership record is missing)
  let latestMembership = latestMembershipFromDb;
  if (!latestMembership && allCompletedPayments.length > 0) {
    const latestPayment = allCompletedPayments[0];
    const paymentDate = latestPayment.paidAt || latestPayment.createdAt;
    let durationDays = 30;
    let planName = latestPayment.description || "Monthly Plan";
    if (latestPayment.plan) {
      durationDays = latestPayment.plan.durationDays;
      planName = latestPayment.plan.name;
    } else if (latestPayment.description) {
      const desc = latestPayment.description.toLowerCase();
      if (desc.includes("annual") || desc.includes("year")) durationDays = 365;
      else if (desc.includes("quarter")) durationDays = 90;
      else durationDays = 30;
    }

    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    const isPaymentExpired = expiryDate < now || userStatus === "EXPIRED";

    latestMembership = {
      id: `payment-${latestPayment.id}`,
      membershipNumber: latestPayment.referenceNumber || `MEM-${latestPayment.id.substring(0, 8).toUpperCase()}`,
      userId,
      planId: latestPayment.planId || "custom",
      startDate: paymentDate,
      expiryDate,
      status: isPaymentExpired ? "EXPIRED" : "ACTIVE",
      totalFee: latestPayment.amount,
      amountPaid: latestPayment.amount,
      pendingAmount: 0,
      source: latestPayment.source || "OFFLINE",
      notes: latestPayment.notes,
      createdAt: latestPayment.createdAt,
      updatedAt: latestPayment.updatedAt,
      plan: (latestPayment.plan || {
        id: latestPayment.planId || "custom",
        name: planName,
        description: latestPayment.description || "Membership Plan",
        price: latestPayment.amount,
        period: durationDays === 365 ? "/ year" : durationDays === 90 ? "/ 3 months" : "/ month",
        billingPeriod: durationDays === 365 ? "YEARLY" : durationDays === 90 ? "QUARTERLY" : "MONTHLY",
        durationDays,
        validity: `${durationDays} Days`,
        classesIncluded: durationDays === 365 ? "Unlimited Classes" : durationDays === 90 ? "24 Classes / 3 Months" : "8 Classes / Month",
        features: JSON.stringify(["Full studio access", "Batch schedule flexibility", "Practice hall access"]),
      }) as any,
    };
  }

  // Check if latest membership is expired
  let isExpired = false;
  let isActive = false;

  if (latestMembership) {
    const expiryDate = latestMembership.expiryDate ? new Date(latestMembership.expiryDate) : null;
    isExpired =
      latestMembership.status === "EXPIRED" ||
      userStatus === "EXPIRED" ||
      (expiryDate !== null && expiryDate < now);

    isActive =
      (latestMembership.status === "ACTIVE" || latestMembership.status === "PARTIALLY_PAID") &&
      !isExpired;

    // Auto-sync status in DB if membership has expired but DB status is still ACTIVE or REGISTERED
    if (isExpired && (userStatus === "ACTIVE" || userStatus === "REGISTERED")) {
      userStatus = "EXPIRED";
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { membershipStatus: "EXPIRED" },
        });
        if (latestMembershipFromDb && latestMembershipFromDb.status !== "EXPIRED") {
          await prisma.membership.update({
            where: { id: latestMembershipFromDb.id },
            data: { status: "EXPIRED" },
          });
        }
      } catch (err) {
        console.error("Failed to auto-sync expired status:", err);
      }
    } else if (isActive && userStatus === "REGISTERED") {
      userStatus = latestMembership.status;
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { membershipStatus: latestMembership.status },
        });
      } catch (err) {
        console.error("Failed to sync active status:", err);
      }
    }
  } else if (userStatus === "EXPIRED") {
    isExpired = true;
  }

  // Check Free Trial status
  let isFreeTrial = false;
  let isTrialExpired = false;

  if (freeTrial) {
    const trialEnd = new Date(freeTrial.trialEndDate);
    if (trialEnd < now || freeTrial.status === "EXPIRED" || userStatus === "TRIAL_EXPIRED") {
      isTrialExpired = true;
    } else {
      isFreeTrial = true;
    }
  } else if (userStatus === "FREE_TRIAL") {
    isFreeTrial = true;
  } else if (userStatus === "TRIAL_EXPIRED") {
    isTrialExpired = true;
  }

  // Determine state
  let state: MemberLifecycleState;

  if (hasPaidMembership) {
    if (isExpired) {
      state = "EXISTING_EXPIRED_MEMBER";
      userStatus = "EXPIRED";
    } else {
      state = "EXISTING_ACTIVE_MEMBER";
      if (userStatus === "REGISTERED") userStatus = "ACTIVE";
    }
  } else if (isFreeTrial) {
    state = "ACTIVE_FREE_TRIAL_MEMBER";
    userStatus = "FREE_TRIAL";
  } else if (isTrialExpired) {
    state = "EXPIRED_FREE_TRIAL_MEMBER";
    userStatus = "TRIAL_EXPIRED";
  } else {
    state = "NEW_MEMBER";
    userStatus = "REGISTERED";
  }

  return {
    state,
    hasPaidMembership,
    isActive,
    isExpired,
    isFreeTrial,
    isTrialExpired,
    userStatus,
    latestMembership,
    freeTrial,
    pendingInvoices,
  };
}
