"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Music2, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("StepUp App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="relative w-20 h-20 flex items-center justify-center mb-5">
        <div className="absolute inset-0 rounded-full bg-pink-100/70 blur-md animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF1E82] via-[#FF6600] to-[#7928CA] flex items-center justify-center shadow-lg shadow-pink-500/20">
          <Music2 className="w-8 h-8 text-white rotate-12" />
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Missed a Step in the Rhythm!
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          An unexpected glitch happened while processing your request. Don&apos;t worry, let&apos;s get right back into the choreography.
        </p>

        {error.message && (
          <div className="mt-3 p-3 bg-red-50/80 rounded-xl border border-red-100 text-xs text-red-600 font-medium break-words text-left">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
