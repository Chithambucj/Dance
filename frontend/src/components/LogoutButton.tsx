"use client";

import { logoutAction } from "@/actions/auth";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

interface LogoutButtonProps {
  variant?: "icon" | "full";
  className?: string;
}

export default function LogoutButton({ variant = "icon", className = "" }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  if (variant === "full") {
    return (
      <button
        onClick={handleLogout}
        disabled={isPending}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-gray-500 hover:text-red-600 hover:bg-red-50 w-full ${className}`}
      >
        <LogOut className="w-5 h-5" />
        {isPending ? "Logging out..." : "Logout"}
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Logout"
      title="Logout"
      className={`p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
