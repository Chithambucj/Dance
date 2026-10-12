import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !invoiceId) {
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
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 }
      );
    }

    const invoice = await prisma.payment.findUnique({
      where: { id: invoiceId },
      include: { 
        membership: true,
        plan: true 
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    if (invoice.userId !== session.userId) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (invoice.status !== "PENDING" && invoice.status !== "OVERDUE") {
      return NextResponse.json({ error: "Invoice is not pending." }, { status: 400 });
    }

    // ── Signature valid — settle the invoice ──────────────────────────────────
    await prisma.payment.update({
      where: { id: invoiceId },
      data: {
        status: "COMPLETED",
        paymentMethod: "RAZORPAY",
        paidAt: new Date(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        referenceNumber: razorpay_payment_id,
      },
    });

    // ── If invoice is linked to a Membership, update pending amount ───────────
    if (invoice.membershipId && invoice.membership) {
      const membership = invoice.membership;
      const newPending = Math.max(0, membership.pendingAmount - invoice.amount);
      const newAmountPaid = membership.amountPaid + invoice.amount;
      const newStatus =
        newPending === 0
          ? "ACTIVE"
          : membership.status === "PAYMENT_PENDING"
          ? "PARTIALLY_PAID"
          : membership.status;

      // Extend expiryDate if it's a renewal (i.e. the current expiry Date is in the past)
      // and this invoice is fully paid. Or just extend it from its current expiry date.
      // Wait, if it's a renewal, the expiryDate shouldn't just jump from today, it should be extended by plan.durationDays.
      let newExpiryDate = membership.expiryDate;
      if (invoice.plan && invoice.plan.durationDays) {
        // If the membership has expired, we extend it from the moment it expired, or from today?
        // Standard approach: if it's expired, it's safer to extend from its previous expiry to avoid skipping payment periods.
        // Wait, for simplicity, let's just add the durationDays to the existing expiryDate if this invoice acts as a renewal payment.
        // We can check if the invoice was created for renewal.
        if (invoice.description?.includes("Renewal")) {
           const currentExpiry = new Date(membership.expiryDate);
           currentExpiry.setDate(currentExpiry.getDate() + invoice.plan.durationDays);
           newExpiryDate = currentExpiry;
        } else if (new Date(membership.expiryDate) < new Date() && newPending === 0) {
           // Fallback in case description isn't strictly 'Renewal'
           const currentExpiry = new Date(membership.expiryDate);
           currentExpiry.setDate(currentExpiry.getDate() + invoice.plan.durationDays);
           newExpiryDate = currentExpiry;
        }
      }

      await prisma.membership.update({
        where: { id: invoice.membershipId },
        data: {
          pendingAmount: newPending,
          amountPaid: newAmountPaid,
          status: newStatus,
          expiryDate: newExpiryDate,
        },
      });

      // Update user membership status if fully paid
      if (newPending === 0) {
        await prisma.user.update({
          where: { id: session.userId },
          data: { membershipStatus: "ACTIVE" },
        });
        session.membershipStatus = "ACTIVE";
        session.hasPaidMembership = true;
        await session.save();
      }
    }

    // ── Update RazorpayOrder reconciliation record ────────────────────────────
    await prisma.razorpayOrder.updateMany({
      where: { orderId: razorpay_order_id },
      data: { status: "PAID" },
    });

    // ── Revalidate cache for admin and member dashboards ─────────────────────
    revalidatePath("/admin");
    revalidatePath("/member");

    return NextResponse.json({
      success: true,
      invoiceId,
      message: "Payment verified and invoice settled.",
    });
  } catch (err) {
    console.error("invoice/verify error:", err);
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
