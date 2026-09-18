"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/actions/auth";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createOfflineMembership(formData: FormData) {
  await requireAuth(["ADMIN"]);

  const firstName       = (formData.get("firstName")       as string)?.trim();
  const lastName        = (formData.get("lastName")        as string)?.trim();
  const email           = (formData.get("email")           as string)?.trim().toLowerCase();
  const phone           = (formData.get("phone")           as string)?.trim();
  const gender          = (formData.get("gender")          as string)?.trim();
  const address         = (formData.get("address")         as string)?.trim();
  const dobStr          = (formData.get("dob")             as string)?.trim();
  const planId          = (formData.get("planId")          as string)?.trim();
  const batchId         = (formData.get("batchId")         as string)?.trim();
  const startDateStr    = (formData.get("startDate")       as string)?.trim();
  const paymentMethod   = (formData.get("paymentMethod")   as string)?.trim() || "CASH";
  const paymentStatus   = (formData.get("paymentStatus")   as string)?.trim() || "PAID";
  const amountPaidStr   = (formData.get("amountPaid")      as string)?.trim();
  const referenceNumber = (formData.get("referenceNumber") as string)?.trim();
  const notes           = (formData.get("notes")           as string)?.trim();
  const existingUserId  = (formData.get("existingUserId")  as string)?.trim();

  if (!planId) return { success: false, error: "Please select a membership plan." };
  if (!email && !existingUserId) return { success: false, error: "Email is required." };

  try {
    const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
    if (!plan) return { success: false, error: "Selected plan not found." };

    // Determine user: existing or new
    let userId: string;

    if (existingUserId) {
      userId = existingUserId;
    } else {
      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        userId = existing.id;
      } else {
        if (!firstName || !lastName) {
          return { success: false, error: "Name is required for new members." };
        }
        // Create new offline user
        const bcrypt = await import("bcryptjs");
        const tempPass = phone ? phone.slice(-4) : "1234";
        const hashed = await bcrypt.hash(tempPass, 12);

        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashed,
            role: "MEMBER",
            firstName,
            lastName,
            phone: phone || null,
            gender: gender || null,
            address: address || null,
            dateOfBirth: dobStr ? new Date(dobStr) : null,
            status: "ACTIVE",
            membershipStatus: "REGISTERED",
            accountType: "OFFLINE",
          },
        });
        userId = newUser.id;
      }
    }

    const startDate  = startDateStr ? new Date(startDateStr) : new Date();
    const expiryDate = calcExpiryDate(startDate, plan.durationDays);
    const totalFee   = plan.price;
    const amountPaid = amountPaidStr ? parseFloat(amountPaidStr) : totalFee;
    const pending    = Math.max(0, totalFee - amountPaid);

    // Determine membership status
    let memStatus = "ACTIVE";
    if (paymentStatus === "PENDING") {
      memStatus = "PAYMENT_PENDING";
    } else if (pending > 0) {
      memStatus = "PARTIALLY_PAID";
    }

    // Create membership
    const membership = await prisma.membership.create({
      data: {
        membershipNumber: generateMembershipNumber(),
        userId,
        planId,
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

    // Create payment record if amount was paid
    if (amountPaid > 0) {
      await prisma.payment.create({
        data: {
          userId,
          membershipId: membership.id,
          planId,
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

    // If there's a pending amount, create a pending payment record
    if (pending > 0) {
      await prisma.payment.create({
        data: {
          userId,
          membershipId: membership.id,
          planId,
          amount: pending,
          status: "PENDING",
          source: "OFFLINE",
          description: `${plan.name} — Balance Due`,
          dueDate: expiryDate,
        },
      });
    }

    // Enroll in batch if provided
    if (batchId) {
      const alreadyEnrolled = await prisma.enrollment.findFirst({ where: { userId, batchId } });
      if (!alreadyEnrolled) {
        await prisma.enrollment.create({ data: { userId, batchId, status: "ACTIVE" } });
      }
    }

    // Update user membership status
    await prisma.user.update({
      where: { id: userId },
      data: { membershipStatus: memStatus },
    });

    revalidatePath("/admin");
    return { success: true, membershipNumber: membership.membershipNumber };
  } catch (err) {
    console.error("createOfflineMembership error:", err);
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
