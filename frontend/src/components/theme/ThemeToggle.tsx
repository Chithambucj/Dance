"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, isMounted } = useTheme();

  // If not mounted yet, render placeholder with same dimensions to avoid layout shift
  if (!isMounted) {
    return (
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#121020]/20 bg-white/50 animate-pulse shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`
        relative inline-flex items-center justify-center
        w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0
        border-2 transition-all duration-300 select-none
        cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E82] focus-visible:ring-offset-2
        active:translate-x-0.5 active:translate-y-0.5
        ${
          isDark
            ? "bg-[#211F35] border-[#39364F] text-[#FFD84D] hover:border-[#FFD84D] hover:bg-[#181729] shadow-[2px_2px_0px_#000000]"
            : "bg-white border-[#121020] text-[#121020] hover:bg-[#FFE4F0] hover:text-[#FF1E82] shadow-[2px_2px_0px_#121020]"
        }
        ${className}
      `}
    >
      <div className="relative w-4.5 h-4.5 sm:w-5 sm:h-5 flex items-center justify-center">
        {/* Sun Icon (shown in dark mode to switch to light mode) */}
        <Sun
          className={`w-4.5 h-4.5 sm:w-5 sm:h-5 absolute transition-all duration-300 stroke-[2.2] ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-[#FFD84D]"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />

        {/* Moon Icon (shown in light mode to switch to dark mode) */}
        <Moon
          className={`w-4.5 h-4.5 sm:w-5 sm:h-5 absolute transition-all duration-300 stroke-[2.2] ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-[#121020]"
          }`}
        />
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-black uppercase tracking-wider">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}
