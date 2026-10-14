"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#classes", label: "Classes" },
  { href: "#instructors", label: "Instructors" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function HomeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top Studio Brand Accent Gradient Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FFD200] via-[#FF1E82] to-[#7928CA]" />

      <header className="px-3.5 sm:px-6 lg:px-12 h-16 sm:h-[72px] lg:h-20 flex items-center bg-[#FFFDF9]/95 backdrop-blur-md border-b-2 border-[#121020]/10 shadow-[0_4px_20px_-10px_rgba(18,16,32,0.08)] w-full">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-2 sm:gap-2.5 group w-fit shrink-0" href="/">
            <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FFD200] border-2 border-[#121020] flex items-center justify-center text-[#121020] shadow-[2px_2px_0px_#121020] group-hover:-rotate-6 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-5 sm:h-5">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[23px] xs:text-2xl sm:text-2xl tracking-tight text-[#121020] leading-none flex items-center gap-0.5">
                Step<span className="text-[#FF1E82]">Up</span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#FFD200] ml-0.5 ring-2 ring-[#121020]/20 animate-pulse" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7928CA] hidden xs:block">
                Dance Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-1.5 xl:gap-2 items-center flex-1 justify-center mx-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="text-sm font-bold text-[#121020]/80 hover:text-[#121020] hover:bg-[#FFE4F0] px-4 py-2 rounded-full transition-all whitespace-nowrap"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/login">
              <Button
                variant="outline"
                className="rounded-full px-4.5 xs:px-5 sm:px-5 lg:px-6 h-10 sm:h-10 border-2 border-[#121020] text-[#121020] bg-transparent hover:bg-[#121020] hover:text-white font-black text-xs xs:text-sm sm:text-sm transition-all shadow-[2px_2px_0px_#121020] active:translate-x-0.5 active:translate-y-0.5"
              >
                Login
              </Button>
            </Link>
            
            <Link href="/free-trial" className="hidden sm:inline-flex">
              <Button className="rounded-full px-5 lg:px-7 h-9 sm:h-10 bg-[#FF1E82] hover:bg-[#E01370] text-white font-black text-xs sm:text-sm border-2 border-[#121020] shadow-[2px_2px_0px_#121020] transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Sign Up
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden w-11.5 h-11.5 xs:w-12 xs:h-12 rounded-xl border-2 border-[#121020] bg-white text-[#121020] shadow-[2px_2px_0px_#121020] flex items-center justify-center active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu & Backdrop */}
      {mobileOpen && (
        <>
          {/* Tap-outside backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-[70px] sm:top-[78px] bg-black/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          />

          {/* Slide-down Drawer Panel */}
          <div className="fixed left-0 right-0 top-[70px] sm:top-[78px] bg-[#FFFDF9] border-b-2 border-[#121020] z-50 px-5 py-6 shadow-2xl space-y-5 lg:hidden animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-80px)] overflow-y-auto">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[46px] px-4 py-2.5 rounded-2xl text-base font-extrabold text-[#121020] hover:text-[#FF1E82] hover:bg-[#FFE4F0] flex items-center justify-between transition-colors border border-transparent hover:border-[#121020]/20"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
            </nav>

            <div className="pt-3 border-t-2 border-[#121020]/10 flex flex-col sm:flex-row gap-3">
              <Link href="/login" className="w-full" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full rounded-2xl border-2 border-[#121020] text-[#121020] font-black text-sm h-12 shadow-[2px_2px_0px_#121020]">
                  Login
                </Button>
              </Link>
              <Link href="/free-trial" className="w-full" onClick={() => setMobileOpen(false)}>
                <Button className="w-full rounded-2xl bg-[#FF1E82] hover:bg-[#E01370] text-white font-black text-sm h-12 border-2 border-[#121020] shadow-[2px_2px_0px_#121020] flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Sign Up / Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
