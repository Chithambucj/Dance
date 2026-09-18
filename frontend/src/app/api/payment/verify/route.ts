import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function generateMembershipNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${year}-${rand}`;
}

function calcExpiryDate(startDate: Date, durationDays: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + durationDays);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    // ── Verify HMAC signature ─────────────────────────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated !== razorpay_signature) {
      console.error("Signature mismatch:", { generated, razorpay_signature });
      return NextResponse.json({ error: "Payment verification failed. Invalid signature." }, { status: 400 });
    }

    // ── Signature valid — activate membership ─────────────────────────────────
    const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    }

    const startDate  = new Date();
    const expiryDate = calcExpiryDate(startDate, plan.durationDays);

    // Create Membership record
    const membership = await prisma.membership.create({
      data: {
        membershipNumber: generateMembershipNumber(),
        userId: session.userId,
        planId,
        startDate,
        expiryDate,
        status: "ACTIVE",
        totalFee: plan.price,
        amountPaid: plan.price,
        pendingAmount: 0,
        source: "ONLINE",
      },
    });

    // Create Payment record
    await prisma.payment.create({
      data: {
        userId: session.userId,
        membershipId: membership.id,
        planId,
        amount: plan.price,
        status: "COMPLETED",
        source: "ONLINE",
        paymentMethod: "RAZORPAY",
        description: `${plan.name} — Online Payment`,
        paidAt: new Date(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        referenceNumber: razorpay_payment_id,
      },
    });

    // Update Razorpay order status
    await prisma.razorpayOrder.updateMany({
      where: { orderId: razorpay_order_id },
      data: { status: "PAID" },
    });

    // Activate user membership status
    await prisma.user.update({
      where: { id: session.userId },
      data: { membershipStatus: "ACTIVE" },
    });

    // Update session cookie with new status
    session.membershipStatus = "ACTIVE";
    await session.save();

    return NextResponse.json({
      success: true,
      membershipNumber: membership.membershipNumber,
      planName: plan.name,
      expiryDate: expiryDate.toISOString(),
      membershipId: membership.id,
    });
  } catch (err) {
    console.error("verify-payment error:", err);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
