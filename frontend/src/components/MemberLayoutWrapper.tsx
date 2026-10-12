"use client";

import { useState } from "react";
import MemberSidebar from "@/components/MemberSidebar";
import { Menu, Bell, Search } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

interface Props {
  children: React.ReactNode;
  initials: string;
  fullName: string;
  membershipStatus: string;
}

export default function MemberLayoutWrapper({ children, initials, fullName, membershipStatus }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const statusBadge = () => {
    if (membershipStatus === "FREE_TRIAL") return <span className="text-amber-600 font-semibold text-xs">Free Trial</span>;
    if (membershipStatus === "TRIAL_EXPIRED") return <span className="text-red-500 font-semibold text-xs">Trial Expired</span>;
    if (membershipStatus === "EXPIRED") return <span className="text-red-500 font-bold text-xs uppercase tracking-wide">Subscription Expired</span>;
    return <span className="text-green-600 font-semibold text-xs">Active Member</span>;
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full lg:z-30 shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <MemberSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="shrink-0 h-16 lg:h-20 bg-white border-b border-gray-50 flex items-center justify-between px-4 lg:px-8 z-20 gap-3">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 shrink-0"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search classes..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm placeholder-gray-400"
            />
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-3 lg:gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-gray-100 pl-3 lg:pl-6">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs lg:text-sm shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px] lg:max-w-none">{fullName}</p>
                {statusBadge()}
              </div>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
