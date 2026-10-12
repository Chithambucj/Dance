import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  role: "ADMIN" | "MEMBER";
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipStatus?: string; // REGISTERED, PAYMENT_PENDING, ACTIVE, EXPIRED, SUSPENDED
  hasPaidMembership?: boolean;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "happyfeetz-super-secret-session-key-2026-must-be-at-least-32chars",
  cookieName: "happyfeetz-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
