"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function setUserSession(user: {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  membershipStatus: string;
}) {
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as "ADMIN" | "MEMBER";
  session.firstName = user.firstName;
  session.lastName = user.lastName;
  session.email = user.email;
  session.phone = user.phone ?? undefined;
  session.membershipStatus = user.membershipStatus;
  session.isLoggedIn = true;
  await session.save();
}

// ── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData) {
  const firstName   = (formData.get("firstName")   as string)?.trim();
  const lastName    = (formData.get("lastName")    as string)?.trim();
  const email       = (formData.get("email")       as string)?.trim().toLowerCase();
  const phone       = (formData.get("phone")       as string)?.trim();
  const gender      = (formData.get("gender")      as string)?.trim();
  const address     = (formData.get("address")     as string)?.trim();
  const dobStr      = (formData.get("dob")         as string)?.trim();
  const password    = (formData.get("password")    as string);
  const confirm     = (formData.get("confirmPassword") as string);

  if (!firstName || !lastName || !email || !password) {
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
    const trialStart = new Date();
    const trialEnd   = new Date(trialStart);
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Create user + FreeTrial in a single transaction
    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
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
          userId: u.id,
          program: "General",
          preferredBatch: null,
          experienceLevel: "BEGINNER",
          trialStartDate: trialStart,
          trialEndDate: trialEnd,
          status: "ACTIVE",
        },
      });
      return u;
    });

    await setUserSession(user);
  } catch (err) {
    console.error("registerAction error:", err);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // Redirect after session save — must be outside try/catch
  redirect("/member");
}


// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Support both hashed passwords and legacy plaintext (for migration)
    let passwordMatch = false;
    if (user.password.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
      if (passwordMatch) {
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      }
    }

    if (!passwordMatch) {
      return { success: false, error: "Invalid email or password." };
    }

    await setUserSession(user);
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }

  // Redirect after session is saved — must be outside try/catch
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.role === "ADMIN") {
    redirect("/admin");
  }
  // MEMBER: gate by membership status
  const ms = user?.membershipStatus;
  if (
    ms === "ACTIVE" ||
    ms === "PARTIALLY_PAID" ||
    ms === "FREE_TRIAL" ||
    ms === "TRIAL_EXPIRED" ||
    ms === "EXPIRED"
  ) {
    redirect("/member");
  }
  redirect("/plans");
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

// ── requireAuth ───────────────────────────────────────────────────────────────

export async function requireAuth(allowedRoles?: Array<"ADMIN" | "MEMBER">) {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    if (session.role === "ADMIN") redirect("/admin");
    if (session.role === "MEMBER") redirect("/member");
    redirect("/login");
  }

  return session;
}

// ── requireActiveMember ───────────────────────────────────────────────────────
// Use this in member portal pages to ensure only ACTIVE/PARTIALLY_PAID members
// can access full portal features

export async function requireActiveMember() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }
  if (session.role !== "MEMBER") {
    redirect("/admin");
  }
  const status = session.membershipStatus;
  // Allow free trial, expired trial, and standard active/partial/expired members
  const allowed = ["ACTIVE", "PARTIALLY_PAID", "EXPIRED", "FREE_TRIAL", "TRIAL_EXPIRED"];
  if (!allowed.includes(status ?? "")) {
    redirect("/plans");
  }

  return session;
}
