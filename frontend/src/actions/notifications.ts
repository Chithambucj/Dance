"use server";

import { requireAuth } from "./auth";
import { prisma } from "@/lib/prisma";

export async function getAdminNotifications() {
  const session = await requireAuth(["ADMIN"]);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount };
}

export async function markNotificationAsRead(id: string) {
  const session = await requireAuth(["ADMIN"]);

  await prisma.notification.updateMany({
    where: {
      id,
      userId: session.userId, // Ensure the notification belongs to this user
    },
    data: { isRead: true },
  });

  return { success: true };
}

export async function markAllAdminNotificationsAsRead() {
  const session = await requireAuth(["ADMIN"]);

  await prisma.notification.updateMany({
    where: { userId: session.userId, isRead: false },
    data: { isRead: true },
  });

  return { success: true };
}

/**
 * Sync function to evaluate missing notifications.
 * Should be called when the admin dashboard loads.
 */
export async function generateSystemNotifications() {
  const session = await requireAuth(["ADMIN"]);
  
  // We only generate system notifications if an admin is viewing, 
  // but they are generated for ALL admins.
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  if (admins.length === 0) return;
  
  const now = new Date();

  // 1. Pending Fees
  const pendingMemberships = await prisma.membership.findMany({
    where: { status: "PAYMENT_PENDING" },
    include: { user: true, plan: true },
  });

  for (const mem of pendingMemberships) {
    // Check if notification already exists for this pending fee
    const exists = await prisma.notification.findFirst({
      where: { type: "PENDING_FEE", relatedUserId: mem.user.id } // simple deduplication
    });
    
    if (!exists) {
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "PENDING_FEE",
            title: "Payment Pending",
            message: `₹${mem.totalFee.toLocaleString()} pending from ${mem.user.firstName} ${mem.user.lastName}`,
            relatedUserId: mem.user.id,
          }
        });
      }
    }
  }

  // 2. Overdue Fees (Pending Payments that passed due date)
  const overduePayments = await prisma.payment.findMany({
    where: {
      status: "PENDING",
      dueDate: { lt: now }
    },
    include: { user: true }
  });

  for (const pay of overduePayments) {
    const exists = await prisma.notification.findFirst({
      where: { type: "OVERDUE_FEE", relatedPaymentId: pay.id }
    });
    
    if (!exists) {
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "OVERDUE_FEE",
            title: "Payment Overdue",
            message: `₹${pay.amount.toLocaleString()} overdue from ${pay.user.firstName} ${pay.user.lastName}`,
            relatedUserId: pay.user.id,
            relatedPaymentId: pay.id,
          }
        });
      }
    }
  }
}

/**
 * Internal helper to create notifications for all admins.
 */
export async function createAdminNotification(data: {
  type: string;
  title: string;
  message: string;
  relatedUserId?: string;
  relatedPaymentId?: string;
}) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  
  for (const admin of admins) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        ...data,
      }
    });
  }
}
