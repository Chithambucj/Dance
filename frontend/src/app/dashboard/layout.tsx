import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  CheckSquare, 
  CreditCard, 
  UserSquare2, 
  Image as ImageIcon, 
  Megaphone, 
  FileBarChart, 
  Settings, 
  LogOut,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link className="flex items-center gap-2 group w-fit" href="/">
            <div className="w-8 h-8 flex items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">
              StepUp
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={Users} label="Members" />
          <NavItem icon={Calendar} label="Classes" />
          <NavItem icon={Clock} label="Batch Schedule" />
          <NavItem icon={CheckSquare} label="Attendance" />
          <NavItem icon={CreditCard} label="Payments" />
          <NavItem icon={UserSquare2} label="Instructors" />
          <NavItem icon={ImageIcon} label="Gallery" />
          <NavItem icon={Megaphone} label="Announcements" />
          <NavItem icon={FileBarChart} label="Reports" />
          <NavItem icon={Settings} label="Settings" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Search anything..." 
              className="pl-9 h-10 bg-gray-50/50 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-500 hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="w-9 h-9 border border-gray-100">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-none">Admin</span>
                <span className="text-xs text-gray-500 font-medium">Super Admin</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
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

function NavItem({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <Link 
      href="#" 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? "bg-primary/10 text-primary" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-gray-400"}`} />
      {label}
    </Link>
  );
}
