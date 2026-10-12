"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { createAdminNotification } from "./notifications";

const TRIAL_DURATION_DAYS = 7;

// ── Register Free Trial ────────────────────────────────────────────────────────

export async function registerFreeTrialAction(formData: FormData) {
  const firstName       = (formData.get("firstName")       as string)?.trim();
  const lastName        = (formData.get("lastName")        as string)?.trim();
  const email           = (formData.get("email")           as string)?.trim().toLowerCase();
  const phone           = (formData.get("phone")           as string)?.trim();
  const gender          = (formData.get("gender")          as string)?.trim();
  const dobStr          = (formData.get("dob")             as string)?.trim();
  const address         = (formData.get("address")         as string)?.trim();
  const password        = (formData.get("password")        as string);
  const confirm         = (formData.get("confirmPassword") as string);
  const program         = (formData.get("program")         as string)?.trim();
  const preferredBatch  = (formData.get("preferredBatch")  as string)?.trim();
  const experienceLevel = (formData.get("experienceLevel") as string)?.trim() || "BEGINNER";

  if (!firstName || !lastName || !email || !phone || !password || !program) {
    return { success: false, error: "Please fill in all required fields." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { success: false, error: "Passwords do not match." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "An account with this email already exists. Please log in." };
    }

    const hashed = await bcrypt.hash(password, 12);

    const trialStartDate = new Date();
    const trialEndDate   = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS);

    // Create user + free trial record in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
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
          membershipStatus: "FREE_TRIAL",
          accountType: "ONLINE",
        },
      });

      await tx.freeTrial.create({
        data: {
          userId: newUser.id,
          program,
          preferredBatch: preferredBatch || null,
          experienceLevel,
          trialStartDate,
          trialEndDate,
          status: "ACTIVE",
        },
      });

      return newUser;
    });

    // Auto-login
    const session = await getSession();
    session.userId           = user.id;
    session.role             = "MEMBER";
    session.firstName        = user.firstName;
    session.lastName         = user.lastName;
    session.email            = user.email;
    session.phone            = user.phone ?? undefined;
    session.membershipStatus = "FREE_TRIAL";
    session.isLoggedIn       = true;
    await session.save();

    // Fire notification in background (not blocking transaction)
    createAdminNotification({
      type: "NEW_FREE_TRIAL",
      title: "New Free Trial",
      message: `${user.firstName} ${user.lastName} joined as a Free Trial member`,
      relatedUserId: user.id,
    }).catch(console.error);
  } catch (err) {
    console.error("registerFreeTrialAction error:", err);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // Redirect must be outside try/catch
  redirect("/member/dashboard");
}

// ── Check & Expire Trials (call on member page load) ──────────────────────────

export async function checkAndExpireCurrentUserTrial() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return;
  if (session.membershipStatus !== "FREE_TRIAL") return;

  const trial = await prisma.freeTrial.findUnique({
    where: { userId: session.userId },
  });

  if (!trial) return;

  const now = new Date();
  if (trial.trialEndDate < now) {
    // Mark as expired
    await prisma.$transaction([
      prisma.freeTrial.update({
        where: { userId: session.userId },
        data: { status: "EXPIRED" },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { membershipStatus: "TRIAL_EXPIRED" },
      }),
    ]);
    session.membershipStatus = "TRIAL_EXPIRED";
    await session.save();
  }
}

// ── Get Free Trial for current user ───────────────────────────────────────────

export async function getCurrentUserFreeTrial() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;

  return prisma.freeTrial.findUnique({
    where: { userId: session.userId },
  });
}

// ── Admin: Get all free trial members ─────────────────────────────────────────

export async function getAllFreeTrials() {
  return prisma.freeTrial.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          membershipStatus: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Admin: Expire all overdue trials (batch job) ───────────────────────────────

export async function expireOverdueTrials() {
  const now = new Date();
  const overdueTrials = await prisma.freeTrial.findMany({
    where: { status: "ACTIVE", trialEndDate: { lt: now } },
    select: { userId: true },
  });

  if (overdueTrials.length === 0) return { expired: 0 };

  const userIds = overdueTrials.map((t) => t.userId);

  await prisma.$transaction([
    prisma.freeTrial.updateMany({
      where: { userId: { in: userIds } },
      data: { status: "EXPIRED" },
    }),
    prisma.user.updateMany({
      where: {
        id: { in: userIds },
        memberships: { none: {} },
        payments: { none: { status: "COMPLETED", amount: { gt: 0 } } },
      },
      data: { membershipStatus: "TRIAL_EXPIRED" },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/member");

  return { expired: overdueTrials.length };
}
