import { Suspense } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Bell } from "lucide-react";
import { requireAuth } from "@/actions/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — redirects to /login if not authenticated or wrong role
  const session = await requireAuth(["ADMIN"]);

  const initials = `${session.firstName.charAt(0)}${session.lastName.charAt(0)}`.toUpperCase();
  const fullName = `${session.firstName} ${session.lastName}`;
  const roleLabel = "Studio Owner";

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <Suspense fallback={<aside className="w-64 bg-white border-r border-gray-100 fixed h-full z-30" />}>
        <AdminSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 pl-60 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-20">
          {/* Header title */}
          <div>
            <p className="text-sm font-bold text-gray-500">StepUp Dance Studio</p>
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
                <p className="text-xs text-gray-400 font-medium">{roleLabel}</p>
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
