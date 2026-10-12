"use client";

import { useEffect } from "react";

export default function HomeAnimations() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        el.classList.add("is-revealed");
      });
      return;
    }

    // Enable reveal system on document body
    document.body.classList.add("reveal-ready");

    // Observe all [data-reveal] elements with IntersectionObserver
    const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealEls.forEach((el) => observer.observe(el));

    console.log("[HomeAnimations] Controller active, observing elements:", revealEls.length);

    // Parallax scrolling handler
    const parallaxItems = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
      el,
      speed: parseFloat(el.getAttribute("data-parallax") || "0.1"),
    }));

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const vh = window.innerHeight;
          parallaxItems.forEach(({ el, speed }) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < vh + 150 && rect.bottom > -150) {
              const centerY = rect.top + rect.height / 2;
              const distanceFromCenter = centerY - vh / 2;
              const yShift = -distanceFromCenter * speed;
              el.style.transform = `translate3d(0, ${yShift.toFixed(1)}px, 0)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    if (parallaxItems.length > 0) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    // Safety fallback: Ensure all content is revealed after 2s
    const timer = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => {
        el.classList.add("is-revealed");
      });
    }, 2000);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return <div id="home-animations-mounted" className="hidden" aria-hidden="true" />;
}
