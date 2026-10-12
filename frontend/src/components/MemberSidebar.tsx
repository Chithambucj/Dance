"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { 
  User, 
  Layers, 
  CheckSquare, 
  CreditCard,
  Receipt,
  Megaphone, 
  Calendar,
  Image as ImageIcon,
  Bell,
  Shield,
} from "lucide-react";

interface Props {
  onNavigate?: () => void;
}

export default function MemberSidebar({ onNavigate }: Props = {}) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const menuItems = [
    { name: "Member Dashboard",     id: "dashboard",    icon: User,      href: "/member?tab=dashboard" },
    { name: "Pricing Plans",        id: "plans",        icon: CreditCard,href: "/plans" },
    { name: "Payment History",      id: "payments",     icon: Receipt,   href: "/member?tab=payments" },
    { name: "Announcements",        id: "announcements",icon: Megaphone, href: "/member?tab=announcements" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-gray-50">
        <span className="font-extrabold text-xl text-gray-900 tracking-tight">
          Dance<span className="text-primary">Studio</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <Link 
              key={item.id} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={onNavigate}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-50">
        <LogoutButton variant="full" />
      </div>
    </aside>
  );
}
