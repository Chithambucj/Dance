"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Route transition finished
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isNavigating]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;

      try {
        const url = new URL(target.href, window.location.origin);
        const isInternal = url.origin === window.location.origin;
        const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        const isSamePage = url.pathname === window.location.pathname && url.search === window.location.search;

        if (isInternal && !isModified && !isSamePage && target.target !== "_blank" && !target.href.startsWith("mailto:") && !target.href.startsWith("tel:")) {
          setIsNavigating(true);
          setProgress(25);
          setTimeout(() => setProgress((p) => (p === 25 ? 60 : p)), 240);
          setTimeout(() => setProgress((p) => (p === 60 ? 82 : p)), 520);
        }
      } catch {
        // invalid URL
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99998] h-[3px] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#FF1E82] via-[#7928CA] to-[#FFD200] transition-all duration-450 cubic-bezier(0.2,0.8,0.2,1) shadow-xs shadow-pink-500/50"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export default function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
