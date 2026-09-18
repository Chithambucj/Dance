import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { getSession } from "@/lib/session";
import PlanSelectionClient from "./PlanSelectionClient";

export const metadata = {
  title: "Choose Your Membership Plan | Dance Studio",
  description: "Select the perfect membership plan for your dance journey.",
};

export default async function PlansPage() {
  await requireAuth(["MEMBER"]);
  const session = await getSession();

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

  // Check if user has a free trial record
  const freeTrial = await prisma.freeTrial.findUnique({
    where: { userId: session.userId },
  });

  return (
    <PlanSelectionClient
      plans={plans}
      currentMembership={currentMembership}
      userName={session.firstName}
      membershipStatus={session.membershipStatus}
      freeTrial={freeTrial}
    />
  );
}
