import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unsealData } from "iron-session";

const SESSION_SECRET = process.env.SESSION_SECRET || "happyfeetz-super-secret-session-key-2026-must-be-at-least-32chars";
const COOKIE_NAME = "happyfeetz-session";

interface SessionPayload {
  isLoggedIn: boolean;
  role: "ADMIN" | "MEMBER";
  membershipStatus?: string;
  hasPaidMembership?: boolean;
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
  const hasPaidMembership = session?.hasPaidMembership;

  // Helper: determine if the member has portal access (paid active, paid expired, or active free trial)
  // An existing paid member must NEVER be gated out of the member portal simply because their subscription expired.
  const isPaidMember = hasPaidMembership === true || (hasPaidMembership === undefined && (membershipStatus === "ACTIVE" || membershipStatus === "PARTIALLY_PAID" || membershipStatus === "EXPIRED"));
  const isActiveTrial = membershipStatus === "FREE_TRIAL";
  const hasPortalAccess = isPaidMember || isActiveTrial;

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
  // Allowed:
  // - Previous paid membership + active -> /member
  // - Previous paid membership + expired -> /member
  // - Free trial active -> /member
  //
  // Redirected to /plans:
  // - New member (no previous paid membership, no active trial) -> /plans
  // - Expired free trial member who never paid -> /plans?reason=trial_expired
  if (pathname.startsWith("/member")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "MEMBER") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Only gate to /plans if explicitly confirmed to have NO paid membership and NO active trial.
    // If hasPaidMembership is undefined/unknown, allow request to reach MemberLayout for live DB verification.
    if (hasPaidMembership === false && !isActiveTrial) {
      return NextResponse.redirect(new URL("/plans", request.url));
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
    if (hasPortalAccess) {
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/plans", request.url));
  }

  // ── Redirect away from /free-trial if already logged in ───────────────────
  if (pathname === "/free-trial" && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    if (hasPortalAccess) {
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/plans", request.url));
  }

  // NOTE: /login is intentionally NOT redirected here.
  // The Login button and visiting /login must always display the login form.
  // Routing to /member/dashboard or /plans happens only after submitting credentials.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*", "/plans/:path*", "/payment/:path*", "/register", "/free-trial"],
};
