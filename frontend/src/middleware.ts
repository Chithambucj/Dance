import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";

const SESSION_SECRET = process.env.SESSION_SECRET || "happyfeetz-super-secret-session-key-2026-must-be-at-least-32chars";
const COOKIE_NAME = "happyfeetz-session";

interface SessionPayload {
  isLoggedIn: boolean;
  role: "ADMIN" | "MEMBER";
  membershipStatus?: string;
}

async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    const session = await unsealData<SessionPayload>(cookie.value, {
      password: SESSION_SECRET,
    });
    return session;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isLoggedIn = session?.isLoggedIn === true;
  const role = session?.role;
  const membershipStatus = session?.membershipStatus;

  // ── Protect /admin routes ──────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/member", request.url));
    }
  }

  // ── Protect /member routes ─────────────────────────────────────────────────
  // Allow ACTIVE, PARTIALLY_PAID, EXPIRED, FREE_TRIAL, and TRIAL_EXPIRED members
  if (pathname.startsWith("/member")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "MEMBER") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Gate: Members with expired trials or expired memberships are forced to upgrade
    const allowedStatuses = ["ACTIVE", "PARTIALLY_PAID", "FREE_TRIAL"];
    if (!allowedStatuses.includes(membershipStatus ?? "")) {
      const redirectUrl = new URL("/plans", request.url);
      if (membershipStatus === "TRIAL_EXPIRED") redirectUrl.searchParams.set("reason", "trial_expired");
      if (membershipStatus === "EXPIRED") redirectUrl.searchParams.set("reason", "expired");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ── Protect /plans routes ──────────────────────────────────────────────────
  // Only logged-in MEMBERs can access /plans
  if (pathname.startsWith("/plans")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ── Protect /payment routes ────────────────────────────────────────────────
  if (pathname.startsWith("/payment")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ── Redirect away from /register if already logged in ─────────────────────
  if (pathname === "/register" && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    const memberPortalStatuses = ["ACTIVE", "PARTIALLY_PAID", "FREE_TRIAL"];
    if (memberPortalStatuses.includes(membershipStatus ?? "")) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    const plansUrl = new URL("/plans", request.url);
    if (membershipStatus === "TRIAL_EXPIRED") plansUrl.searchParams.set("reason", "trial_expired");
    return NextResponse.redirect(plansUrl);
  }

  // ── Redirect away from /free-trial if already logged in ───────────────────
  if (pathname === "/free-trial" && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    const trialStatuses = ["FREE_TRIAL", "ACTIVE", "PARTIALLY_PAID"];
    if (trialStatuses.includes(membershipStatus ?? "")) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    const plansUrl = new URL("/plans", request.url);
    if (membershipStatus === "TRIAL_EXPIRED") plansUrl.searchParams.set("reason", "trial_expired");
    return NextResponse.redirect(plansUrl);
  }

  // ── Redirect logged-in users away from /login ──────────────────────────────
  if (pathname === "/login" && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    const memberPortalStatuses = ["ACTIVE", "PARTIALLY_PAID", "FREE_TRIAL"];
    if (memberPortalStatuses.includes(membershipStatus ?? "")) {
      return NextResponse.redirect(new URL("/member", request.url));
    }
    const plansUrl = new URL("/plans", request.url);
    if (membershipStatus === "TRIAL_EXPIRED") plansUrl.searchParams.set("reason", "trial_expired");
    return NextResponse.redirect(plansUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/plans/:path*", "/payment/:path*", "/login", "/register", "/free-trial"],
};
