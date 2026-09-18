import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all users whose member type is PAID MEMBER
    const paidMembers = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        membershipStatus: { notIn: ["FREE_TRIAL", "TRIAL_EXPIRED"] },
      },
      include: {
        memberships: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    let generatedCount = 0;

    for (const member of paidMembers) {
      const activeMembership = member.memberships[0];
      if (!activeMembership || !activeMembership.plan) continue;

      // Check if it's expired
      if (new Date(activeMembership.expiryDate) < new Date()) {
        // Check if there's already a pending payment for this exact membership that acts as the renewal
        const existingPending = await prisma.payment.findFirst({
          where: {
            userId: member.id,
            membershipId: activeMembership.id,
            status: { in: ["PENDING", "OVERDUE"] },
            // To ensure we don't duplicate, check if a payment was created recently for this renewal
            createdAt: { gte: activeMembership.expiryDate },
          },
        });

        if (!existingPending) {
          // Generate new invoice
          const feeAmount = activeMembership.plan.price;
          
          if (feeAmount > 0) {
            await prisma.$transaction([
              // 1. Create the Payment (invoice)
              prisma.payment.create({
                data: {
                  userId: member.id,
                  membershipId: activeMembership.id,
                  planId: activeMembership.planId,
                  amount: feeAmount,
                  status: "PENDING",
                  source: "ONLINE",
                  description: `${activeMembership.plan.name} - Renewal`,
                  dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
                },
              }),
              // 2. Update Membership to PENDING and increase pending amounts
              prisma.membership.update({
                where: { id: activeMembership.id },
                data: {
                  pendingAmount: activeMembership.pendingAmount + feeAmount,
                  totalFee: activeMembership.totalFee + feeAmount,
                  status: "PAYMENT_PENDING",
                },
              }),
              // 3. Ensure user membershipStatus reflects pending if it was active
              prisma.user.update({
                where: { id: member.id },
                data: { membershipStatus: "PAYMENT_PENDING" }
              })
            ]);
            generatedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${generatedCount} renewal invoice(s).`,
      generatedCount,
    });
  } catch (err: any) {
    console.error("Failed to generate renewals:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
