"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  MessageCircle,
  Megaphone,
  Music2,
} from "lucide-react";

interface Props {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: Props = {}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const menuItems = [
    { name: "Dashboard",          id: "dashboard",     icon: LayoutDashboard },
    { name: "Members & Fees",     id: "members",       icon: Users },
    { name: "Income",             id: "income",        icon: TrendingUp },
    { name: "WhatsApp Reminders", id: "whatsapp",      icon: MessageCircle },
    { name: "Announcements",      id: "announcements", icon: Megaphone },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 gap-2.5 border-b border-gray-100 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-black text-lg text-gray-900 tracking-tight">
          Step<span className="text-indigo-600">Up</span>
        </span>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 ml-auto">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link
              key={item.id}
              href={`/admin?tab=${item.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={onNavigate}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100 shrink-0">
        <LogoutButton variant="full" />
      </div>
    </aside>
  );
}
