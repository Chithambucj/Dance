import { requireAuth } from "@/actions/auth";
import { getMemberLifecycleState } from "@/lib/memberStatus";
import MemberLayoutWrapper from "@/components/MemberLayoutWrapper";
import { redirect } from "next/navigation";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — redirects to /login if not authenticated or wrong role
  const session = await requireAuth(["MEMBER"]);

  // Verify member lifecycle state from actual database records
  const { state, hasPaidMembership, userStatus } = await getMemberLifecycleState(session.userId);

  // Sync session cookie if state has changed
  if (session.hasPaidMembership !== hasPaidMembership || session.membershipStatus !== userStatus) {
    session.hasPaidMembership = hasPaidMembership;
    session.membershipStatus = userStatus;
    await session.save();
  }

  // Gate brand-new members without any paid membership or active trial to /plans
  if (state === "NEW_MEMBER") {
    redirect("/plans");
  }

  // Gate expired free trial members who never purchased a paid plan to /plans
  if (state === "EXPIRED_FREE_TRIAL_MEMBER") {
    redirect("/plans");
  }

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${session.firstName} ${session.lastName}`;

  return (
    <MemberLayoutWrapper initials={initials} fullName={fullName} membershipStatus={userStatus}>
      {children}
    </MemberLayoutWrapper>
  );
}
