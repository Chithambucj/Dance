"use client";

import { useEffect, useState } from "react";

export default function AnimatedCursor() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Only run on desktop/devices with fine pointers
    if (!window.matchMedia("(pointer: fine)").matches) return;

    setHidden(false);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const onMouseDown = () => setClicked(true);
    const onMouseUp = () => setClicked(false);
    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    const handleLinkHoverEvents = () => {
      document.querySelectorAll("a, button, input, textarea, select, [role='button']").forEach((el) => {
        // use named functions or we stack event listeners, but for simplicity we can just clear and re-add or check if attached.
        // A better way is event delegation on document.
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, textarea, select, [role='button']")) {
        setLinkHovered(true);
      } else {
        setLinkHovered(false);
      }
    };
    
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-3 h-3 bg-[#6c5ce7] rounded-full pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out ${
          hidden ? "opacity-0" : "opacity-100"
        } ${clicked ? "scale-75" : "scale-100"} ${
          linkHovered ? "scale-[3] bg-[#FF7700]/80" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`fixed top-0 left-0 w-8 h-8 border border-[#6c5ce7]/50 rounded-full pointer-events-none z-[9998] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
          hidden ? "opacity-0" : "opacity-100"
        } ${clicked ? "scale-90" : "scale-100"} ${
          linkHovered ? "scale-150 opacity-0" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}} />
    </>
  );
}
