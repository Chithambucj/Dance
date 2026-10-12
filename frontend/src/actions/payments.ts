"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";
import { createAdminNotification } from "@/actions/notifications";

export async function createPaymentRecord(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const userId          = formData.get("userId")          as string;
  const amount          = parseFloat(formData.get("amount") as string);
  const method          = (formData.get("method")         as string)?.trim();
  const description     = (formData.get("description")    as string)?.trim();
  const status          = (formData.get("status")         as string) || "COMPLETED";
  const dueDateStr      = (formData.get("dueDate")        as string)?.trim();
  const referenceNumber = (formData.get("referenceNumber") as string)?.trim();
  const notes           = (formData.get("notes")          as string)?.trim();

  if (!userId || isNaN(amount) || amount <= 0) {
    return { success: false, error: "Valid member and positive amount are required." };
  }

  const dueDate = dueDateStr ? new Date(dueDateStr) : null;
  const paidAt = status === "COMPLETED" ? new Date() : null;

  try {
    await prisma.payment.create({
      data: {
        userId,
        amount,
        status,
        paymentMethod: method || null,
        description: description || null,
        dueDate,
        paidAt,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
      },
    });

    // Fire notification for offline payment (admin manually recording)
    const member = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
    if (member) {
      const isOffline = !method || ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"].includes(method.toUpperCase());
      createAdminNotification({
        type: isOffline ? "OFFLINE_PAYMENT" : "PAYMENT_RECEIVED",
        title: isOffline ? "Offline Payment Recorded" : "Payment Received",
        message: `₹${amount.toLocaleString()} ${isOffline ? "recorded" : "received"} from ${member.firstName} ${member.lastName}${method ? ` via ${method}` : ""}`,
        relatedUserId: userId,
      }).catch(console.error);
    }

    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("createPaymentRecord error:", err);
    return { success: false, error: "Failed to create payment record." };
  }
}

export async function markPaymentCompleted(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
      include: {
        membership: true,
      },
    });

    if (payment.membershipId) {
      const remaining = await prisma.payment.aggregate({
        where: { membershipId: payment.membershipId, status: { in: ["PENDING", "OVERDUE"] }, amount: { gt: 0 } },
        _sum: { amount: true },
      });
      const pendingSum = remaining._sum.amount ?? 0;

      let newExpiryDate = payment.membership?.expiryDate;
      if (payment.planId && payment.membership) {
        const plan = await prisma.pricingPlan.findUnique({ where: { id: payment.planId } });
        if (plan && plan.durationDays) {
          if (payment.description?.includes("Renewal") || new Date(payment.membership.expiryDate) < new Date()) {
            const baseDate = new Date(payment.membership.expiryDate) < new Date() ? new Date() : new Date(payment.membership.expiryDate);
            baseDate.setDate(baseDate.getDate() + plan.durationDays);
            newExpiryDate = baseDate;
          }
        }
      }

      await prisma.membership.update({
        where: { id: payment.membershipId },
        data: {
          pendingAmount: pendingSum,
          status: pendingSum === 0 ? "ACTIVE" : "PARTIALLY_PAID",
          ...(newExpiryDate ? { expiryDate: newExpiryDate } : {}),
        },
      });
    }

    // Check if user has any other pending payments
    const userPending = await prisma.payment.count({
      where: { userId: payment.userId, status: { in: ["PENDING", "OVERDUE"] }, amount: { gt: 0 } },
    });

    if (userPending === 0) {
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { membershipStatus: true },
      });
      if (user && (user.membershipStatus === "PAYMENT_PENDING" || user.membershipStatus === "EXPIRED" || user.membershipStatus === "REGISTERED")) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { membershipStatus: "ACTIVE" },
        });
      }
    }

    // Notify admins about payment completion
    const paidMember = await prisma.user.findUnique({ where: { id: payment.userId }, select: { firstName: true, lastName: true } });
    if (paidMember) {
      createAdminNotification({
        type: "PAYMENT_RECEIVED",
        title: "Payment Received",
        message: `₹${payment.amount.toLocaleString()} received from ${paidMember.firstName} ${paidMember.lastName}`,
        relatedUserId: payment.userId,
        relatedPaymentId: payment.id,
      }).catch(console.error);
    }

    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("markPaymentCompleted error:", err);
    return { success: false, error: "Failed to update payment status." };
  }
}

export async function editPaymentRecord(id: string, formData: FormData) {
  await requireAuth(["ADMIN"]);

  const amount          = parseFloat(formData.get("amount") as string);
  const method          = (formData.get("method")          as string)?.trim();
  const description     = (formData.get("description")     as string)?.trim();
  const status          = (formData.get("status")          as string) || "COMPLETED";
  const dueDateStr      = (formData.get("dueDate")         as string)?.trim();
  const referenceNumber = (formData.get("referenceNumber")  as string)?.trim();
  const notes           = (formData.get("notes")           as string)?.trim();

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Valid positive amount is required." };
  }

  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  try {
    await prisma.payment.update({
      where: { id },
      data: {
        amount,
        status,
        paymentMethod: method || null,
        description: description || null,
        dueDate,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        ...(status === "COMPLETED" ? { paidAt: new Date() } : {}),
      },
    });
    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("editPaymentRecord error:", err);
    return { success: false, error: "Failed to update payment record." };
  }
}

export async function deletePayment(id: string) {
  await requireAuth(["ADMIN"]);
  try {
    await prisma.payment.delete({ where: { id } });
    revalidatePath("/admin");
    revalidatePath("/member");
    return { success: true };
  } catch (err) {
    console.error("deletePayment error:", err);
    return { success: false, error: "Failed to delete payment record." };
  }
}
