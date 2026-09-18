"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { revalidatePath } from "next/cache";

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
        where: { membershipId: payment.membershipId, status: "PENDING" },
        _sum: { amount: true },
      });
      const pendingSum = remaining._sum.amount ?? 0;
      await prisma.membership.update({
        where: { id: payment.membershipId },
        data: {
          pendingAmount: pendingSum,
          status: pendingSum === 0 ? "ACTIVE" : "PARTIALLY_PAID",
        },
      });
    }

    // Check if user has any other pending payments
    const userPending = await prisma.payment.count({
      where: { userId: payment.userId, status: "PENDING" },
    });

    if (userPending === 0) {
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { membershipStatus: true },
      });
      if (user && user.membershipStatus === "PAYMENT_PENDING") {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { membershipStatus: "ACTIVE" },
        });
      }
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
