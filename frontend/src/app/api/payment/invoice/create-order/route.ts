import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required." }, { status: 400 });
    }

    // Fetch the Payment record from DB — amount is authoritative from here, not the frontend
    const invoice = await prisma.payment.findUnique({
      where: { id: invoiceId },
      include: { plan: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    // Security: ensure this invoice belongs to the current user
    if (invoice.userId !== session.userId) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Only allow payment of PENDING invoices
    if (invoice.status !== "PENDING") {
      return NextResponse.json(
        { error: `Invoice is already ${invoice.status.toLowerCase()}.` },
        { status: 400 }
      );
    }

    if (invoice.amount <= 0) {
      return NextResponse.json({ error: "Invalid invoice amount." }, { status: 400 });
    }

    const amountInPaise = Math.round(invoice.amount * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `inv_${invoiceId.slice(0, 16)}_${Date.now()}`,
      notes: {
        invoiceId: invoice.id,
        userId: session.userId,
        description: invoice.description || "Fee Payment",
      },
    });

    // Store for reconciliation
    await prisma.razorpayOrder.create({
      data: {
        userId: session.userId,
        planId: invoice.planId || "invoice",
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        status: "CREATED",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      description: invoice.description || "Fee Payment",
      invoiceId: invoice.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "",
    });
  } catch (err) {
    console.error("invoice/create-order error:", err);
    return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
  }
}
