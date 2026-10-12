"use client";

import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";

// Track in-memory across the SPA session to prevent repeated loaders during route transitions
let hasInitiallyLoadedSession = false;

const MIN_INITIAL_DISPLAY_TIME_MS = 3000; // Exactly 3 seconds (3000ms) minimum display duration
const EXIT_TRANSITION_DURATION_MS = 700; // Smooth 700ms exit transition (within 600-800ms)
const MAX_FALLBACK_WAIT_MS = 10000; // Safety cap if an external asset/script fails to trigger window load

export default function InitialAppLoader() {
  const [isFading, setIsFading] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  useEffect(() => {
    // 1. Check if app was already loaded in this session or runtime to prevent repeated delay on navigation
    if (hasInitiallyLoadedSession) {
      setIsRemoved(true);
      return;
    }

    try {
      const alreadyLoaded = sessionStorage.getItem("stepup_initial_loaded");
      if (alreadyLoaded) {
        hasInitiallyLoadedSession = true;
        setIsRemoved(true);
        return;
      }
    } catch {
      // sessionStorage may fail in private mode; fallback gracefully
    }

    let minTimeElapsed = false;
    let dismissed = false;

    const checkIsReady = () => {
      // In browsers, document.readyState === "complete" confirms DOM and all stylesheets/scripts/images are fully loaded
      return typeof document !== "undefined" && document.readyState === "complete";
    };

    const tryDismiss = (force = false) => {
      if (dismissed) return;
      if (!force && (!minTimeElapsed || !checkIsReady())) return;

      dismissed = true;
      hasInitiallyLoadedSession = true;
      setIsFading(true);

      try {
        sessionStorage.setItem("stepup_initial_loaded", "true");
      } catch {}

      // Cleanly remove from DOM only after the 700ms exit transition completes
      setTimeout(() => {
        setIsRemoved(true);
      }, EXIT_TRANSITION_DURATION_MS);
    };

    // Exactly 3 seconds (3000ms) minimum initial branded loading duration
    const minTimer = setTimeout(() => {
      minTimeElapsed = true;
      tryDismiss();
    }, MIN_INITIAL_DISPLAY_TIME_MS);

    // If application is still loading after 3 seconds, keep loader visible until it is ready
    const onReadyEvent = () => {
      if (minTimeElapsed && checkIsReady()) {
        tryDismiss();
      }
    };

    // Safety fallback so application never hangs indefinitely if an external asset fails to finish
    const fallbackTimer = setTimeout(() => {
      tryDismiss(true);
    }, MAX_FALLBACK_WAIT_MS);

    if (typeof window !== "undefined") {
      window.addEventListener("load", onReadyEvent);
      document.addEventListener("readystatechange", onReadyEvent);
    }

    return () => {
      clearTimeout(minTimer);
      clearTimeout(fallbackTimer);
      if (typeof window !== "undefined") {
        window.removeEventListener("load", onReadyEvent);
        document.removeEventListener("readystatechange", onReadyEvent);
      }
    };
  }, []);

  if (isRemoved) return null;

  return (
    <div
      aria-hidden={isFading}
      style={{
        transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: isFading ? "scale(0.97)" : "scale(1)",
        opacity: isFading ? 0 : 1,
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white select-none will-change-[opacity,transform] ${
        isFading ? "pointer-events-none" : ""
      }`}
    >
      {/* Background ambient dance lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-pink-100/50 blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-100/50 blur-3xl animate-pulse-glow delay-300" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-yellow-100/40 blur-3xl" />
      </div>

      <div
        style={{
          transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isFading ? "scale(0.95)" : "scale(1)",
          opacity: isFading ? 0 : 1,
        }}
        className="relative z-10 flex flex-col items-center will-change-[opacity,transform]"
      >
        {/* Animated Dance Rhythm Rings */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Ring 1 - Outer Pulsing Gold/Yellow (Gentle 18s rotation) */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFD200]/70 animate-spin [animation-duration:18s]" />
          
          {/* Ring 2 - Dance Wave Purple */}
          <div className="absolute inset-2 rounded-full border-2 border-[#7928CA]/30 animate-dance-ring" />
          
          {/* Ring 3 - Hot Pink Pulsing Aura */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#FF1E82] via-[#FF6600] to-[#7928CA] opacity-20 blur-md animate-pulse [animation-duration:3s]" />

          {/* Logo Badge Center */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF1E82] via-[#E11D48] to-[#7928CA] flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Music2 className="w-8 h-8 text-white animate-pulse [animation-duration:2.4s]" />
          </div>
        </div>

        {/* Studio Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-black text-gray-900 tracking-tight">Step</span>
            <span className="text-3xl font-black text-[#FF1E82] tracking-tight">Up</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Dance Studio</p>
          <p className="text-xs text-[#7928CA] font-handwriting text-sm pt-1">
            Express • Learn • Grow
          </p>
        </div>

        {/* Dancing Rhythm Soundwave Equalizer */}
        <div className="flex items-center gap-1.5 mt-8 h-8">
          <span className="w-1.5 h-6 bg-[#FF1E82] rounded-full animate-bar-1 origin-bottom" />
          <span className="w-1.5 h-8 bg-[#7928CA] rounded-full animate-bar-2 origin-bottom" />
          <span className="w-1.5 h-7 bg-[#FFD200] rounded-full animate-bar-3 origin-bottom" />
          <span className="w-1.5 h-8 bg-[#FF6600] rounded-full animate-bar-4 origin-bottom" />
          <span className="w-1.5 h-5 bg-[#00B4D8] rounded-full animate-bar-5 origin-bottom" />
        </div>

        <p className="text-[11px] font-semibold text-gray-400 mt-3 animate-pulse">
          Setting the stage…
        </p>
      </div>
    </div>
  );
}
