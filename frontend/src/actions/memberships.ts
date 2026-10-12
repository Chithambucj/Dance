"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminNotification } from "@/actions/notifications";

// ── Utilities ──────────────────────────────────────────────────────────────────

function generateMembershipNumber(): string {
  const year  = new Date().getFullYear();
  const rand  = Math.floor(10000 + Math.random() * 90000);
  return `MEM-${year}-${rand}`;
}

function calcExpiryDate(startDate: Date, durationDays: number): Date {
  const d = new Date(startDate);
  d.setDate(d.getDate() + durationDays);
  return d;
}

// ── Get active membership for current session user ────────────────────────────

export async function getCurrentMembership() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.userId,
      status: { in: ["ACTIVE", "PARTIALLY_PAID", "EXPIRED"] },
    },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  return membership;
}

// ── Get membership by user ID (admin) ─────────────────────────────────────────

export async function getMembershipByUserId(userId: string) {
  await requireAuth(["ADMIN"]);
  return prisma.membership.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
}

// ── Get memberships expiring within N days ────────────────────────────────────

export async function getExpiringMemberships(days = 7) {
  await requireAuth(["ADMIN"]);
  const now    = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);

  return prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      expiryDate: { gte: now, lte: cutoff },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      plan: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
  });
}

// ── Get pending memberships ────────────────────────────────────────────────────

export async function getPendingMemberships() {
  await requireAuth(["ADMIN"]);
  return prisma.membership.findMany({
    where: { status: { in: ["PAYMENT_PENDING", "PARTIALLY_PAID"] } },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      plan: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Activate a pending membership (admin) ─────────────────────────────────────

export async function activateMembership(membershipId: string) {
  await requireAuth(["ADMIN"]);
  try {
    const mem = await prisma.membership.update({
      where: { id: membershipId },
      data: { status: "ACTIVE" },
    });
    await prisma.user.update({
      where: { id: mem.userId },
      data: { membershipStatus: "ACTIVE" },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("activateMembership error:", err);
    return { success: false, error: "Failed to activate membership." };
  }
}

// ── Create offline membership (admin) ─────────────────────────────────────────

export async function createUnifiedMember(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const memberType      = (formData.get("memberType")      as string)?.trim() || "PAID_MEMBER"; // "FREE_TRIAL" or "PAID_MEMBER"
  const firstName       = (formData.get("firstName")       as string)?.trim();
  const lastName        = (formData.get("lastName")        as string)?.trim();
  const email           = (formData.get("email")           as string)?.trim().toLowerCase();
  const phone           = (formData.get("phone")           as string)?.trim();
  const gender          = (formData.get("gender")          as string)?.trim();
  const address         = (formData.get("address")         as string)?.trim();
  const dobStr          = (formData.get("dob")             as string)?.trim();
  const batchId         = (formData.get("batchId")         as string)?.trim();
  const existingUserId  = (formData.get("existingUserId")  as string)?.trim();
  
  const loginEmail      = (formData.get("loginEmail")      as string)?.trim() || email;
  const tempPassword    = (formData.get("tempPassword")    as string)?.trim() || "123456";

  // Paid Member fields
  const planId          = (formData.get("planId")          as string)?.trim();
  const startDateStr    = (formData.get("startDate")       as string)?.trim();
  const paymentMethod   = (formData.get("paymentMethod")   as string)?.trim() || "CASH";
  const paymentStatus   = (formData.get("paymentStatus")   as string)?.trim() || "PAID";
  const amountPaidStr   = (formData.get("amountPaid")      as string)?.trim();
  const referenceNumber = (formData.get("referenceNumber") as string)?.trim();
  const notes           = (formData.get("notes")           as string)?.trim();

  if (!email && !existingUserId) return { success: false, error: "Email is required." };
  
  if (memberType === "PAID_MEMBER" && !planId) {
    return { success: false, error: "Please select a membership plan for paid members." };
  }

  try {
    let userId: string;
    const finalEmail = loginEmail || email;

    if (existingUserId) {
      userId = existingUserId;
    } else {
      const existing = await prisma.user.findUnique({ where: { email: finalEmail! } });
      if (existing) {
        userId = existing.id;
      } else {
        if (!firstName || !lastName) {
          return { success: false, error: "Name is required for new members." };
        }
        const bcrypt = await import("bcryptjs");
        const hashed = await bcrypt.hash(tempPassword, 12);

        const newUser = await prisma.user.create({
          data: {
            email: finalEmail!,
            password: hashed,
            role: "MEMBER",
            firstName,
            lastName,
            phone: phone || null,
            gender: gender || null,
            address: address || null,
            dateOfBirth: dobStr ? new Date(dobStr) : null,
            status: "ACTIVE",
            membershipStatus: memberType === "FREE_TRIAL" ? "FREE_TRIAL" : "ACTIVE",
            accountType: "OFFLINE",
          },
        });
        userId = newUser.id;
      }
    }

    let membershipNumber = "";
    let amountPaidForNotification = 0;

    if (memberType === "PAID_MEMBER") {
      const plan = await prisma.pricingPlan.findUnique({ where: { id: planId! } });
      if (!plan) return { success: false, error: "Selected plan not found." };

      const startDate  = startDateStr ? new Date(startDateStr) : new Date();
      const expiryDate = calcExpiryDate(startDate, plan.durationDays);
      const totalFee   = plan.price;
      const amountPaid = amountPaidStr ? parseFloat(amountPaidStr) : totalFee;
      amountPaidForNotification = amountPaid;
      const pending    = Math.max(0, totalFee - amountPaid);

      let memStatus = "ACTIVE";
      if (paymentStatus === "PENDING") {
        memStatus = "PAYMENT_PENDING";
      } else if (pending > 0) {
        memStatus = "PARTIALLY_PAID";
      }
      
      membershipNumber = generateMembershipNumber();

      const membership = await prisma.membership.create({
        data: {
          membershipNumber,
          userId,
          planId: plan.id,
          startDate,
          expiryDate,
          status: memStatus,
          totalFee,
          amountPaid,
          pendingAmount: pending,
          source: "OFFLINE",
          notes: notes || null,
        },
      });

      if (amountPaid > 0) {
        await prisma.payment.create({
          data: {
            userId,
            membershipId: membership.id,
            planId: plan.id,
            amount: amountPaid,
            status: "COMPLETED",
            source: "OFFLINE",
            paymentMethod,
            description: `${plan.name} — Offline Payment`,
            paidAt: new Date(),
            referenceNumber: referenceNumber || null,
            notes: notes || null,
          },
        });
      }

      if (pending > 0) {
        await prisma.payment.create({
          data: {
            userId,
            membershipId: membership.id,
            planId: plan.id,
            amount: pending,
            status: "PENDING",
            source: "OFFLINE",
            description: `${plan.name} — Balance Due`,
            dueDate: expiryDate,
          },
        });
      }
      
      await prisma.user.update({
        where: { id: userId },
        data: { membershipStatus: memStatus },
      });
    } else {
      // FREE TRIAL
      await prisma.user.update({
        where: { id: userId },
        data: { membershipStatus: "FREE_TRIAL" },
      });
    }

    if (batchId) {
      const alreadyEnrolled = await prisma.enrollment.findFirst({ where: { userId, batchId } });
      if (!alreadyEnrolled) {
        await prisma.enrollment.create({ data: { userId, batchId, status: "ACTIVE" } });
      }
    }

    revalidatePath("/admin");

    // Fire notifications (non-blocking)
    if (amountPaidForNotification > 0) {
      const member = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
      if (member) {
        createAdminNotification({
          type: "OFFLINE_PAYMENT",
          title: "Offline Payment Recorded",
          message: `₹${amountPaidForNotification.toLocaleString()} recorded for ${member.firstName} ${member.lastName}${paymentMethod ? ` via ${paymentMethod}` : ""}`,
          relatedUserId: userId,
        }).catch(console.error);
      }
    } else {
      const member = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true } });
      if (member) {
        createAdminNotification({
          type: "NEW_FREE_TRIAL",
          title: "New Free Trial",
          message: `${member.firstName} ${member.lastName} added as a Free Trial member`,
          relatedUserId: userId,
        }).catch(console.error);
      }
    }

    return { success: true, membershipNumber };
  } catch (err) {
    console.error("createUnifiedMember error:", err);
    return { success: false, error: "Failed to create membership. Please try again." };
  }
}

// ── Renew membership (creates a new membership) ───────────────────────────────

export async function renewMembership(userId: string, planId: string) {
  const session = await getSession();
  if (!session.isLoggedIn) redirect("/login");

  // Only the member themselves or admin can renew
  if (session.role !== "ADMIN" && session.userId !== userId) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
    if (!plan) return { success: false, error: "Plan not found." };

    // Expire any current active memberships
    await prisma.membership.updateMany({
      where: { userId, status: { in: ["ACTIVE", "PARTIALLY_PAID"] } },
      data: { status: "EXPIRED" },
    });

    const startDate  = new Date();
    const expiryDate = calcExpiryDate(startDate, plan.durationDays);

    const membership = await prisma.membership.create({
      data: {
        membershipNumber: generateMembershipNumber(),
        userId,
        planId,
        startDate,
        expiryDate,
        status: "PAYMENT_PENDING",
        totalFee: plan.price,
        amountPaid: 0,
        pendingAmount: plan.price,
        source: "ONLINE",
      },
    });

    // Update user status
    await prisma.user.update({
      where: { id: userId },
      data: { membershipStatus: "PAYMENT_PENDING" },
    });

    revalidatePath("/member");
    return { success: true, membershipId: membership.id };
  } catch (err) {
    console.error("renewMembership error:", err);
    return { success: false, error: "Failed to start renewal." };
  }
}

// ── Check existing client by phone or email ───────────────────────────────────

export async function findExistingClient(email: string, phone: string) {
  await requireAuth(["ADMIN"]);
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() },
      ],
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, phone: true, membershipStatus: true,
    },
  });
  return user;
}
