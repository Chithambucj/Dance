"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/classes", label: "Classes" },
  { href: "/schedule", label: "Schedule" },
  { href: "/instructors", label: "Instructors" },
  { href: "/gallery", label: "Gallery" },
  { href: "/events", label: "Events" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/40">
      <div className="container mx-auto px-4 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="font-extrabold text-xl tracking-tight text-white">
            Dance<span className="text-[#FF7700]">Studio</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 mx-8 flex-1 overflow-x-auto">
          {navLinks.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${isActive
                    ? "text-[#FF7700] bg-[#FF7700]/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-5 h-9 text-sm font-semibold">
              Login
            </Button>
          </Link>
          <Link href="/free-trial">
            <Button className="rounded-full px-5 h-9 text-sm font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:opacity-90 shadow-lg shadow-[#FF7700]/25">
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0F1015] border-t border-white/10 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 border-t border-white/10 mt-3">
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-white/20 text-white rounded-xl text-sm font-semibold">Login</Button>
            </Link>
            <Link href="/free-trial" className="flex-1">
              <Button className="w-full rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A]">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
