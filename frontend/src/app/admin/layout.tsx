import { Suspense } from "react";
import { requireAuth } from "@/actions/auth";
import AdminLayoutWrapper from "@/components/AdminLayoutWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — redirects to /login if not authenticated or wrong role
  const session = await requireAuth(["ADMIN"]);

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${session.firstName} ${session.lastName}`;
  const roleLabel = "Studio Owner";

  return (
    <AdminLayoutWrapper initials={initials} fullName={fullName} roleLabel={roleLabel}>
      {children}
    </AdminLayoutWrapper>
  );
}
