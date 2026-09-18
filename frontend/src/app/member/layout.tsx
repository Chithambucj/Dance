import { Suspense } from "react";
import MemberSidebar from "@/components/MemberSidebar";
import { Bell, Search } from "lucide-react";
import { requireAuth } from "@/actions/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — redirects to /login if not authenticated or wrong role
  const session = await requireAuth(["MEMBER"]);

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${session.firstName} ${session.lastName}`;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <Suspense fallback={<aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-30" />}>
        <MemberSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-20">
          {/* Search */}
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              className="w-full pl-12 pr-4 py-2.5 rounded-full bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder-gray-400"
            />
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                {initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900 leading-tight">{fullName}</p>
                <p className="text-xs font-semibold">
                  {session.membershipStatus === "FREE_TRIAL" ? (
                    <span className="text-amber-600">Free Trial</span>
                  ) : session.membershipStatus === "TRIAL_EXPIRED" ? (
                    <span className="text-red-500">Trial Expired</span>
                  ) : session.membershipStatus === "EXPIRED" ? (
                    <span className="text-red-500">Expired</span>
                  ) : (
                    <span className="text-green-600">Active Member</span>
                  )}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
