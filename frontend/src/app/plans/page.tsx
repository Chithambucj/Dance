import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { getSession } from "@/lib/session";
import { getMemberLifecycleState } from "@/lib/memberStatus";
import PlanSelectionClient from "./PlanSelectionClient";

export const metadata = {
  title: "Choose Your Membership Plan | Dance Studio",
  description: "Select the perfect membership plan for your dance journey.",
};

export default async function PlansPage() {
  await requireAuth(["MEMBER"]);
  const session = await getSession();

  const lifecycle = await getMemberLifecycleState(session.userId);

  // Filter out TRIAL plans so only paid plans (Monthly, Quarterly, Annual) are available
  const plans = await prisma.pricingPlan.findMany({
    where: { 
      isPublished: true,
      billingPeriod: { not: "TRIAL" },
    },
    orderBy: { displayOrder: "asc" },
  });

  // Check if user already has an active membership
  const currentMembership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      status: { in: ["ACTIVE", "PARTIALLY_PAID"] },
    },
    include: { plan: true },
  });

  // Check if user has an expired membership
  const expiredMembership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      status: "EXPIRED",
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  // Check if user has a free trial record
  const freeTrial = await prisma.freeTrial.findUnique({
    where: { userId: session.userId },
  });

  return (
    <PlanSelectionClient
      plans={plans}
      currentMembership={currentMembership || expiredMembership}
      userName={session.firstName}
      membershipStatus={lifecycle.userStatus}
      freeTrial={freeTrial}
      isExpired={lifecycle.isExpired}
      hasPaidMembership={lifecycle.hasPaidMembership}
    />
  );
}
