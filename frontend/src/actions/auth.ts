"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getMemberLifecycleState } from "@/lib/memberStatus";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

// ── Helpers ─────────────────────────────────────────────────────────────────

async function setUserSession(
  user: {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    membershipStatus: string;
  },
  hasPaidMembership?: boolean
) {
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role as "ADMIN" | "MEMBER";
  session.firstName = user.firstName;
  session.lastName = user.lastName;
  session.email = user.email;
  session.phone = user.phone ?? undefined;
  session.membershipStatus = user.membershipStatus;
  if (hasPaidMembership !== undefined) {
    session.hasPaidMembership = hasPaidMembership;
  }
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

    // Create user as a REGISTERED new member (no paid plan yet)
    const user = await prisma.user.create({
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
        accountType: "ONLINE",
      },
    });

    await setUserSession(user, false);
  } catch (err) {
    console.error("registerAction error:", err);
    return { success: false, error: "Registration failed. Please try again." };
  }

  // Redirect new member to choose a plan
  redirect("/plans");
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

    // Check member lifecycle state using actual database records
    const memberState = await getMemberLifecycleState(user.id);

    await setUserSession(
      {
        ...user,
        membershipStatus: memberState.userStatus,
      },
      memberState.hasPaidMembership
    );

    // Determine destination using member's actual membership/payment history
    let redirectTo = "/plans";
    if (user.role === "ADMIN") {
      redirectTo = "/admin";
    } else {
      const { state } = memberState;
      if (
        state === "EXISTING_ACTIVE_MEMBER" ||
        state === "EXISTING_EXPIRED_MEMBER" ||
        state === "ACTIVE_FREE_TRIAL_MEMBER"
      ) {
        redirectTo = "/member/dashboard";
      } else {
        redirectTo = "/plans";
      }
    }

    return { success: true, redirectTo };
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
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
    if (session.role === "MEMBER") redirect("/member/dashboard");
    redirect("/login");
  }

  return session;
}

// ── requireActiveMember ───────────────────────────────────────────────────────
// Use this in member portal pages to ensure only paid members (active or expired)
// and active free trial members can access full portal features

export async function requireActiveMember() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }
  if (session.role !== "MEMBER") {
    redirect("/admin");
  }
  
  const { hasPaidMembership, isFreeTrial } = await getMemberLifecycleState(session.userId);
  if (!hasPaidMembership && !isFreeTrial) {
    redirect("/plans");
  }

  return session;
}

