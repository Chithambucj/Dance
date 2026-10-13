"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLoadingScreen from "./DashboardLoadingScreen";

const STORAGE_KEY = "stepup_dashboard_transition";
const START_TIME_KEY = "stepup_dashboard_transition_start";
const MIN_VISIBLE_MS = 600; // Elegant minimum visibility (avoids a 30ms flash without artificial 3s lag)
const EXIT_FADE_MS = 500;   // Smooth 500ms exit transition

export default function DashboardLoadingManager() {
  const [isActive, setIsActive] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const startTimeRef = useRef<number>(0);
  const hasLeftLoginRef = useRef(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const routeSettleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Helper: initiate the smooth fade-out and unmount
  const triggerExit = useCallback(() => {
    if (!isActive || isFading) return;

    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    const delayBeforeFade = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (routeSettleTimerRef.current) clearTimeout(routeSettleTimerRef.current);

    dismissTimerRef.current = setTimeout(() => {
      setIsFading(true);

      exitTimerRef.current = setTimeout(() => {
        setIsActive(false);
        setIsFading(false);
        hasLeftLoginRef.current = false;
        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(START_TIME_KEY);
        } catch {}
      }, EXIT_FADE_MS);
    }, delayBeforeFade);
  }, [isActive, isFading]);

  // Clean-up handler to force dismiss
  const handleForceDismiss = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (routeSettleTimerRef.current) clearTimeout(routeSettleTimerRef.current);
    setIsActive(false);
    setIsFading(false);
    hasLeftLoginRef.current = false;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(START_TIME_KEY);
    } catch {}
  }, []);

  const handleReturnLogin = useCallback(() => {
    handleForceDismiss();
    router.replace("/login");
  }, [handleForceDismiss, router]);

  // Check on mount if a transition was active across hard reloads/redirects
  useEffect(() => {
    try {
      const isTransitioning = sessionStorage.getItem(STORAGE_KEY) === "true";
      if (isTransitioning) {
        const storedStart = Number(sessionStorage.getItem(START_TIME_KEY) || Date.now());
        // Expire transitions older than 12 seconds to prevent stale loader
        if (Date.now() - storedStart < 12000) {
          startTimeRef.current = storedStart;
          setIsActive(true);
          setIsFading(false);
        } else {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(START_TIME_KEY);
        }
      }
    } catch {}
  }, []);

  // Listen to custom start, cancel, and ready events
  useEffect(() => {
    const handleStart = () => {
      const now = Date.now();
      startTimeRef.current = now;
      hasLeftLoginRef.current = false;
      setIsActive(true);
      setIsFading(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "true");
        sessionStorage.setItem(START_TIME_KEY, String(now));
      } catch {}
    };

    const handleCancel = () => {
      handleForceDismiss();
    };

    const handleReady = () => {
      triggerExit();
    };

    window.addEventListener("stepup_start_dashboard_loading", handleStart);
    window.addEventListener("stepup_cancel_dashboard_loading", handleCancel);
    window.addEventListener("stepup_dashboard_ready", handleReady);

    return () => {
      window.removeEventListener("stepup_start_dashboard_loading", handleStart);
      window.removeEventListener("stepup_cancel_dashboard_loading", handleCancel);
      window.removeEventListener("stepup_dashboard_ready", handleReady);
    };
  }, [triggerExit, handleForceDismiss]);

  // Handle route changes
  useEffect(() => {
    if (!isActive) return;

    if (pathname !== "/login") {
      hasLeftLoginRef.current = true;
    }

    // If pathname arrives at destination dashboards or plans onboarding
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/member") ||
      pathname.startsWith("/plans") ||
      pathname.startsWith("/dashboard")
    ) {
      // Graceful fallback: if dashboard_ready event isn't caught, exit after 600ms
      if (routeSettleTimerRef.current) clearTimeout(routeSettleTimerRef.current);
      routeSettleTimerRef.current = setTimeout(() => {
        triggerExit();
      }, 700);
      return;
    }

    // Only force-dismiss on /login if we previously navigated away from login
    // (i.e. session expired and server redirected back to /login)
    if (pathname === "/login" && hasLeftLoginRef.current) {
      handleForceDismiss();
    }
  }, [pathname, isActive, triggerExit, handleForceDismiss]);

  if (!isActive) return null;

  return (
    <DashboardLoadingScreen
      isFading={isFading}
      onDismiss={handleForceDismiss}
      onCancel={handleReturnLogin}
    />
  );
}
