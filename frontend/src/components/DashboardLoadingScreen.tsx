"use client";

import { useEffect, useState } from "react";
import { Music2, Sparkles, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface DashboardLoadingScreenProps {
  isFading?: boolean;
  onDismiss?: () => void;
  onCancel?: () => void;
}

export default function DashboardLoadingScreen({
  isFading = false,
  onDismiss,
  onCancel,
}: DashboardLoadingScreenProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showTimeoutHelp, setShowTimeoutHelp] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Safety fallback: if preparation takes > 8.5 seconds, display graceful retry/continue options
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeoutHelp(true);
    }, 8500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Preparing your dashboard"
      style={{
        transition: "opacity 450ms cubic-bezier(0.16, 1, 0.3, 1), transform 450ms cubic-bezier(0.16, 1, 0.3, 1)",
        transform: !isMounted ? "scale(1.02)" : isFading ? "scale(0.97)" : "scale(1)",
        opacity: !isMounted ? 0 : isFading ? 0 : 1,
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden ${
        isFading ? "pointer-events-none" : ""
      }`}
    >
      {/* ── Deep Purple Background with Pink/Magenta Gradient Accents ── */}
      <div 
        className="absolute inset-0 z-0 bg-[#120824]"
        style={{
          background: "radial-gradient(circle at 50% 36%, rgba(121, 40, 202, 0.42) 0%, rgba(255, 30, 130, 0.22) 38%, rgba(18, 8, 36, 0.98) 75%), #120824",
        }}
      />

      {/* Ambient background glowing orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-pink-600/20 blur-[110px] animate-pulse [animation-duration:5s]" />
        <div className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full bg-purple-600/25 blur-[120px] animate-pulse [animation-duration:6s] delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#FF1E82]/15 blur-[90px]" />
      </div>

      {/* ── Central Branded Content Container ── */}
      <div
        style={{
          transition: "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isFading ? "scale(0.95)" : "scale(1)",
          opacity: isFading ? 0 : 1,
        }}
        className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center"
      >
        {/* Animated Dancing Rhythm Rings & Logo Badge */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6">
          {/* Ring 1: Outer delicate rotating dashed gold ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FFD200]/60 animate-spin [animation-duration:18s]" />

          {/* Ring 2: Concentric pulsing dance wave ring */}
          <div className="absolute inset-2 rounded-full border-2 border-[#7928CA]/40 animate-dance-ring" />

          {/* Ring 3: Smooth circular gradient spinner ring */}
          <svg className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] animate-spin [animation-duration:2.8s]" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1E82" />
                <stop offset="50%" stopColor="#7928CA" />
                <stop offset="100%" stopColor="#FFD200" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#loader-gradient)"
              strokeWidth="2.5"
              strokeDasharray="90 180"
              strokeLinecap="round"
            />
          </svg>

          {/* Ring 4: Hot Pink / Magenta Pulsing Aura Glow */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#FF1E82] via-[#FF6600] to-[#7928CA] opacity-30 blur-md animate-pulse [animation-duration:2.5s]" />

          {/* Center Logo Badge: StepUp Music/Dance Icon */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#FF1E82] via-[#E11D48] to-[#7928CA] flex items-center justify-center shadow-[0_0_40px_rgba(255,30,130,0.55)] border border-white/20">
            <Music2 className="w-8 h-8 sm:w-9 sm:h-9 text-white animate-pulse [animation-duration:2.2s]" />
          </div>
        </div>

        {/* StepUp Brand Heading */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">Step</span>
          <span className="text-2xl sm:text-3xl font-black text-[#FF1E82] tracking-tight">Up</span>
          <span className="text-[11px] font-bold text-purple-300/80 uppercase tracking-widest ml-1 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
            Studio
          </span>
        </div>

        {/* Action Title: "Preparing your dashboard…" */}
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center drop-shadow-sm">
          Preparing your dashboard…
        </h2>

        {/* Tagline: "Move • Groove • Inspire" */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-pink-300/90 text-center mt-1.5">
          Move • Groove • Inspire
        </p>

        {/* Soundwave Rhythm Equalizer Bars */}
        <div className="flex items-center gap-1.5 mt-6 h-6 justify-center">
          <span className="w-1.5 h-4 bg-[#FF1E82] rounded-full animate-bar-1 origin-bottom shadow-xs shadow-pink-500/50" />
          <span className="w-1.5 h-6 bg-[#7928CA] rounded-full animate-bar-2 origin-bottom shadow-xs shadow-purple-500/50" />
          <span className="w-1.5 h-5 bg-[#FFD200] rounded-full animate-bar-3 origin-bottom shadow-xs shadow-yellow-500/50" />
          <span className="w-1.5 h-6 bg-[#FF6600] rounded-full animate-bar-4 origin-bottom shadow-xs shadow-orange-500/50" />
          <span className="w-1.5 h-3.5 bg-[#00B4D8] rounded-full animate-bar-5 origin-bottom shadow-xs shadow-cyan-500/50" />
        </div>

        {/* ── Graceful Timeout Notice & Actions (if network/server is slow) ── */}
        {showTimeoutHelp && (
          <div className="mt-8 pt-4 border-t border-white/10 flex flex-col items-center gap-2.5 animate-in fade-in duration-300 w-full">
            <div className="flex items-center gap-1.5 text-xs text-purple-200/80">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Initialization is taking slightly longer than usual</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Open Dashboard</span>
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl text-pink-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Login</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
