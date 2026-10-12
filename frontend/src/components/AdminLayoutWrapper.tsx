"use client";

import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Menu } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import NotificationBell from "@/components/admin/NotificationBell";

interface Props {
  children: React.ReactNode;
  initials: string;
  fullName: string;
  roleLabel: string;
}

export default function AdminLayoutWrapper({ children, initials, fullName, roleLabel }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        fixed inset-y-0 left-0 z-50 w-60 transform bg-white border-r border-gray-100 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full lg:z-30 shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* We can pass setSidebarOpen to AdminSidebar if we want to close it on navigation */}
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="shrink-0 h-16 lg:h-20 bg-white border-b border-gray-50 flex items-center justify-between px-4 lg:px-8 z-20">
          {/* Header left: Hamburger (mobile) + title */}
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <p className="text-sm font-bold text-gray-500 hidden sm:block">StepUp Dance Studio</p>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4 lg:gap-6">
            <NotificationBell />

            <div className="flex items-center gap-3 border-l border-gray-100 pl-4 lg:pl-6">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs lg:text-sm shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px] lg:max-w-none">{fullName}</p>
                <p className="text-xs text-gray-400 font-medium">{roleLabel}</p>
              </div>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="admin-main-scroll" className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
