"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedCursor() {
  const [mounted, setMounted] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user explicitly prefers reduced motion or is on touch device
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchOnly = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (prefersReducedMotion || isTouchOnly) return;

    setMounted(true);

    // Coordinate & interaction tracking in refs (ZERO React re-renders on mousemove)
    const mouse = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let isVisible = false;
    let isHovered = false;
    let isClicked = false;
    let isTextTarget = false;
    let isTouchMode = false;
    let rafId: number | null = null;

    // Direct DOM access
    const updateDotTransform = () => {
      const dot = dotRef.current;
      if (!dot) return;
      if (!isVisible || isTouchMode) {
        dot.style.opacity = "0";
        return;
      }
      const scale = isClicked ? 0.75 : isHovered ? 1.3 : 1;
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      dot.style.opacity = isTextTarget ? "0.2" : "1";
    };

    const updateRingTransform = () => {
      const ringEl = ringRef.current;
      if (!ringEl) return;
      if (!isVisible || isTouchMode) {
        ringEl.style.opacity = "0";
        return;
      }
      const scale = isClicked ? 0.8 : isHovered ? 1.55 : 1;
      ringEl.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      ringEl.style.opacity = isTextTarget ? "0.15" : "1";

      if (isHovered) {
        ringEl.style.borderColor = "#FFD200";
        ringEl.style.backgroundColor = "rgba(255, 30, 130, 0.08)";
      } else {
        ringEl.style.borderColor = "rgba(255, 30, 130, 0.65)";
        ringEl.style.backgroundColor = "transparent";
      }
    };

    // 1. Move Handler: Update mouse coordinates and immediate dot transform (0ms latency)
    const handleMove = (e: MouseEvent) => {
      if (isTouchMode) return;

      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ring.x = e.clientX;
        ring.y = e.clientY;
        document.documentElement.classList.add("custom-cursor-enabled");
      }

      updateDotTransform();
    };

    // 2. Click Handler
    const handleDown = () => {
      if (isTouchMode) return;
      isClicked = true;
      updateDotTransform();
    };

    const handleUp = () => {
      if (isTouchMode) return;
      isClicked = false;
      updateDotTransform();
    };

    // 3. Viewport Boundary Handlers
    const handleMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (isTouchMode) return;
      isVisible = true;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      ring.x = e.clientX;
      ring.y = e.clientY;
      document.documentElement.classList.add("custom-cursor-enabled");
      updateDotTransform();
    };

    // 4. Interactive Element Hover Detection (Event Delegation)
    const handleMouseOver = (e: MouseEvent) => {
      if (isTouchMode) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'a, button, input, textarea, select, [role="button"], label, .cursor-pointer, [data-interactive="true"]'
      );
      isHovered = !!interactive;

      const textInput = target.closest('input[type="text"], input[type="email"], input[type="password"], textarea');
      isTextTarget = !!textInput;
    };

    // 5. Touch Protection: Hide custom cursor on touch devices
    const handleTouchStart = () => {
      isTouchMode = true;
      isVisible = false;
      document.documentElement.classList.remove("custom-cursor-enabled");
      if (dotRef.current) dotRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    // 6. Fluid Lerp Animation Loop via requestAnimationFrame for the outer ring
    const lerpSpeed = 0.22;
    const animate = () => {
      if (isVisible && !isTouchMode) {
        ring.x += (mouse.x - ring.x) * lerpSpeed;
        ring.y += (mouse.y - ring.y) * lerpSpeed;
        updateRingTransform();
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    // Event listeners
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown, { passive: true });
    window.addEventListener("mouseup", handleUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.documentElement.addEventListener("mouseenter", handleMouseEnter, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Center Precision Dot (0ms latency, always exactly on mouse tip) */}
      <div
        id="custom-cursor-dot"
        ref={dotRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[#FF1E82] rounded-full pointer-events-none z-[999999] shadow-sm will-change-transform select-none"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          opacity: 0,
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Fluid Outer Ring Follower (Smooth catch-up, hover expansion, tactile clicks) */}
      <div
        id="custom-cursor-ring"
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#FF1E82]/65 pointer-events-none z-[999998] will-change-transform select-none shadow-[0_0_12px_rgba(255,30,130,0.25)]"
        style={{
          transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
          opacity: 0,
          transition: "opacity 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
        }}
      />

      {/* Hide native cursor only when custom cursor is active; respect text cursor */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          html.custom-cursor-enabled,
          html.custom-cursor-enabled * {
            cursor: none !important;
          }
          html.custom-cursor-enabled input,
          html.custom-cursor-enabled textarea {
            cursor: text !important;
          }
        `,
        }}
      />
    </>
  );
}
