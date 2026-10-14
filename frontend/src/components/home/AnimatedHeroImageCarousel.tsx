"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export interface HeroDanceImage {
  id: string;
  title: string;
  style: string;
  category: string;
  src: string;
  alt: string;
  dancerType: string;
}

export const heroImages: HeroDanceImage[] = [
  {
    id: "contemporary-solo",
    title: "Ballet & Contemporary",
    style: "Graceful Movement",
    category: "Contemporary",
    src: "/images/hero-dancer.jpg",
    alt: "Contemporary ballerina in elegant dance pose",
    dancerType: "Adult Solo",
  },
  {
    id: "hip-hop-groove",
    title: "Street & Hip Hop",
    style: "High Energy Beats",
    category: "Hip Hop",
    src: "/images/hip-hop.jpg",
    alt: "Hip hop dancer performing energetic choreography",
    dancerType: "Adult Street",
  },
  {
    id: "kids-freestyle",
    title: "Kids Dance & Groove",
    style: "Joyful Movement",
    category: "Kids Dance",
    src: "/images/kid-dancer.jpg",
    alt: "Energetic young girl jumping and dancing in studio",
    dancerType: "Young Talent",
  },
  {
    id: "urban-breakdance",
    title: "Urban & Breakdance",
    style: "Dynamic Freestyle",
    category: "Breakdance",
    src: "/images/urban-dancer.jpg",
    alt: "Male street dancer in dynamic freeze breakdance pose",
    dancerType: "B-Boy City",
  },
  {
    id: "bollywood-beats",
    title: "Bollywood Expression",
    style: "Cinematic & Folk",
    category: "Bollywood",
    src: "/images/bollywood.jpg",
    alt: "Vibrant Bollywood dancer performing cinematic choreography",
    dancerType: "Expressive",
  },
  {
    id: "salsa-social",
    title: "Latin Salsa Flow",
    style: "Rhythm & Partner",
    category: "Latin Salsa",
    src: "/images/salsa.jpg",
    alt: "Latin salsa dancers in smooth partner turn",
    dancerType: "Partner",
  },
];

export default function AnimatedHeroImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const total = heroImages.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Pause autoplay on manual interaction and resume automatically after a brief pause
  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  }, []);

  // Continuous Autoplay loop (faster rhythmic rotation)
  useEffect(() => {
    // Respect reduced motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 2200);

    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    pauseTemporarily();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const threshold = 35; // minimum swipe distance

    if (diff > threshold) {
      // Swiped left -> Next
      handleNext();
    } else if (diff < -threshold) {
      // Swiped right -> Prev
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div
      className="relative w-full max-w-[580px] mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Playful Decorative Background Shapes & Blobs ───────────── */}
      {/* Sunny Yellow Blob (scaled responsibly on mobile) */}
      <div
        data-parallax="0.08"
        aria-hidden="true"
        className="absolute -top-6 right-0 sm:right-4 w-44 h-44 xs:w-56 xs:h-56 min-[390px]:w-64 min-[390px]:h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[42%_58%_70%_30%/45%_45%_55%_55%] bg-[#FFD200] opacity-90 -z-10 pointer-events-none transform rotate-12 transition-transform duration-700"
      />

      {/* Hot Pink Curving Blob */}
      <div
        data-parallax="-0.06"
        aria-hidden="true"
        className="absolute top-1/4 -left-2 sm:-left-8 w-34 h-34 xs:w-44 xs:h-44 min-[390px]:w-52 min-[390px]:h-52 sm:w-64 sm:h-64 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-[#FF1E82] opacity-85 -z-10 pointer-events-none transform -rotate-12 transition-transform duration-700"
      />

      {/* Electric Lilac Accenting Blob */}
      <div
        data-parallax="0.12"
        aria-hidden="true"
        className="absolute -bottom-8 right-12 w-32 h-32 xs:w-40 xs:h-40 sm:w-60 sm:h-60 rounded-full bg-[#7928CA]/20 blur-xl -z-10 pointer-events-none"
      />

      {/* Playful Radiating Burst Doodle (Top Right) */}
      <div
        aria-hidden="true"
        className="absolute -top-6 right-2 sm:right-6 text-[#FF1E82] hidden sm:block pointer-events-none z-30 animate-pulse"
      >
        <svg className="w-8 h-8 sm:w-10 sm:h-10 rotate-12" viewBox="0 0 40 40" fill="none">
          <path d="M20 4V12" stroke="#FF1E82" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 8L23 15" stroke="#FF1E82" strokeWidth="3" strokeLinecap="round" />
          <path d="M34 18L26 19" stroke="#FF1E82" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Main Layered Stack Stage Container ───────────────────────── */}
      <div className="relative w-full min-h-[250px] xs:min-h-[295px] min-[390px]:min-h-[325px] min-[430px]:min-h-[345px] sm:min-h-[430px] lg:min-h-[480px] flex items-center justify-center lg:justify-start">
        
        {/* Side Navigation Arrow: Left (matches reference guide) */}
        <button
          onClick={() => {
            pauseTemporarily();
            handlePrev();
          }}
          aria-label="Previous dance image"
          className="flex absolute left-0 sm:left-1 lg:-left-5 xl:-left-6 top-1/2 -translate-y-1/2 z-40 w-9 h-9 xs:w-10 xs:h-10 min-[390px]:w-10.5 min-[390px]:h-10.5 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white border-2 border-[#121020] text-[#121020] shadow-[2px_2px_0px_#121020] lg:shadow-[3px_3px_0px_#121020] items-center justify-center hover:bg-[#FFE4F0] hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF1E82]"
        >
          <ChevronLeft className="w-4.5 h-4.5 xs:w-5 xs:h-5 min-[390px]:w-5.5 min-[390px]:h-5.5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* Side Navigation Arrow: Right (matches reference guide) */}
        <button
          onClick={() => {
            pauseTemporarily();
            handleNext();
          }}
          aria-label="Next dance image"
          className="flex absolute right-0 sm:right-1 lg:-right-3 xl:-right-4 top-1/2 -translate-y-1/2 z-40 w-9 h-9 xs:w-10 xs:h-10 min-[390px]:w-10.5 min-[390px]:h-10.5 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full bg-white border-2 border-[#121020] text-[#121020] shadow-[2px_2px_0px_#121020] lg:shadow-[3px_3px_0px_#121020] items-center justify-center hover:bg-[#FFE4F0] hover:scale-105 active:translate-x-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF1E82]"
        >
          <ChevronRight className="w-4.5 h-4.5 xs:w-5 xs:h-5 min-[390px]:w-5.5 min-[390px]:h-5.5 sm:w-6 sm:h-6 stroke-[2.5]" />
        </button>

        {/* ── Layered Cards Stack ───────────────────────────────────── */}
        <div className="relative w-full h-[245px] xs:h-[290px] min-[390px]:h-[320px] min-[430px]:h-[340px] sm:h-[420px] lg:h-[460px] flex items-center justify-center lg:justify-start">
          {heroImages.map((img, index) => {
            const offset = (index - currentIndex + total) % total;

            // Determine visibility & position based on relative offset
            const isFront = offset === 0;
            const isSecond = offset === 1;
            const isThird = offset === 2;
            const isFourth = offset === 3;
            const isVisible = offset <= 3;

            // Z-index & Opacity layers
            let zIndex = 10;
            let opacity = 0;
            let pointerEvents: "none" | "auto" = "none";

            if (isFront) {
              zIndex = 35;
              opacity = 1;
              pointerEvents = "auto" as const;
            } else if (isSecond) {
              zIndex = 26;
              opacity = 0.96;
              pointerEvents = "auto" as const;
            } else if (isThird) {
              zIndex = 18;
              opacity = 0.9;
              pointerEvents = "auto" as const;
            } else if (isFourth) {
              zIndex = 12;
              opacity = 0.85;
              pointerEvents = "auto" as const;
            }

            const stackClass =
              offset === 0
                ? "hero-stack-card-0"
                : offset === 1
                ? "hero-stack-card-1"
                : offset === 2
                ? "hero-stack-card-2"
                : offset === 3
                ? "hero-stack-card-3"
                : "hero-stack-card-hidden";

            return (
              <div
                key={img.id}
                onClick={() => {
                  if (!isFront) {
                    pauseTemporarily();
                    setCurrentIndex(index);
                  }
                }}
                className={`
                  absolute top-1/2 rounded-[22px] xs:rounded-[28px] sm:rounded-[36px] overflow-hidden cursor-pointer
                  hero-carousel-card
                  w-[190px] xs:w-[230px] min-[390px]:w-[252px] min-[430px]:w-[270px] sm:w-[275px] lg:w-[290px]
                  h-[245px] xs:h-[290px] min-[390px]:h-[320px] min-[430px]:h-[340px] sm:h-[385px] lg:h-[420px]
                  ${stackClass}
                  ${
                    isFront
                      ? "border-4 border-[#FF1E82] shadow-[0_18px_38px_-10px_rgba(255,30,130,0.45),0_8px_16px_rgba(18,16,32,0.18)] ring-2 sm:ring-4 ring-[#7928CA]/30"
                      : "border-4 border-white shadow-[0_14px_28px_-6px_rgba(18,16,32,0.22)] hover:opacity-100 hover:scale-[1.02]"
                  }
                `}
                style={{
                  zIndex,
                  opacity: isVisible ? opacity : 0,
                  pointerEvents: isVisible ? pointerEvents : "none",
                }}
              >
                {/* Image Container with high quality dance visual */}
                <div className="relative w-full h-full bg-[#121020] group">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 270px, (max-width: 1024px) 290px, 320px"
                    priority={isFront || isSecond}
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Lighting overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121020]/75 via-transparent to-black/10 pointer-events-none" />

                  {/* Micro Category Pill at bottom of card */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="bg-white/95 text-[#121020] border border-[#121020]/20 text-[9px] xs:text-[10px] min-[390px]:text-[11px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-sm">
                      {img.category}
                    </span>
                    <span className="text-[9px] xs:text-[10px] min-[390px]:text-[10.5px] sm:text-[10px] font-extrabold text-white/90 uppercase tracking-widest hidden xs:inline drop-shadow-sm">
                      {img.dancerType}
                    </span>
                  </div>

                  {/* Top-Right Orange Stamp: Attached specifically to the Front Highlighted Card (matches reference) */}
                  {isFront && (
                    <div
                      className="absolute -top-1 -right-1 sm:top-2 sm:right-2 z-30 w-[54px] h-[54px] xs:w-[62px] xs:h-[62px] min-[390px]:w-[68px] min-[390px]:h-[68px] sm:w-20 sm:h-20 rounded-full bg-[#FF6600] border-2 border-white text-white flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(18,16,32,0.25)] animate-float-badge cursor-pointer hover:scale-105 transition-transform"
                      style={{ "--badge-rotate": "12deg" } as React.CSSProperties}
                    >
                      <span className="text-[8px] xs:text-[9px] min-[390px]:text-[10px] sm:text-[10px] font-black uppercase tracking-wider leading-tight">StepUp</span>
                      <span className="text-[7px] xs:text-[8px] min-[390px]:text-[8.5px] sm:text-[8px] font-extrabold uppercase opacity-90">Studio</span>
                      <ArrowUpRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 mt-0.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Free-Trial Pass Badge (desktop only to prevent clutter on mobile) */}
        <div 
          className="absolute -bottom-3 left-1 sm:-bottom-4 sm:left-4 z-40 bg-white border-2 border-[#121020] rounded-2xl p-2 sm:p-2.5 shadow-[3px_3px_0px_#121020] sm:shadow-[4px_4px_0px_#121020] items-center gap-2.5 sm:gap-3 animate-float-slow hover:scale-105 transition-all hidden lg:flex"
          style={{ "--badge-rotate": "1deg" } as React.CSSProperties}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#FF1E82] text-white flex items-center justify-center font-black text-xs border border-[#121020] shrink-0">
            20+
          </div>
          <div className="text-left pr-1 sm:pr-2">
            <p className="text-[11px] sm:text-xs font-black text-[#121020] leading-tight">Free Trial Classes</p>
            <p className="text-[9px] sm:text-[10px] font-bold text-[#FF1E82] uppercase tracking-wide">Available Weekly</p>
          </div>
          <div className="hidden sm:flex flex-col gap-0.5 border-l border-dashed border-[#121020]/30 pl-2">
            <div className="w-6 h-6 flex items-center justify-center text-[8px] font-mono font-bold tracking-tighter text-[#121020]/60">
              |||||||
            </div>
          </div>
        </div>

      </div>

      {/* ── Indicator Dots (centered beneath front card on all screens) ── */}
      <div className="flex items-center justify-center gap-1.5 xs:gap-2 mt-2 xs:mt-2.5 min-[390px]:mt-3 sm:mt-5 z-40 relative">
        {heroImages.map((img, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={img.id}
              onClick={() => {
                pauseTemporarily();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}: ${img.title}`}
              className="min-w-[14px] min-h-[18px] py-0.5 sm:min-w-[20px] sm:min-h-[36px] flex items-center justify-center group focus:outline-none"
            >
              <span
                className={`
                  rounded-full transition-all duration-300 ease-out
                  ${
                    isActive
                      ? "w-6 h-2 xs:w-7 xs:h-2.5 min-[390px]:w-8 min-[390px]:h-2.5 sm:w-8 sm:h-3 bg-[#FF1E82] shadow-[0_2px_8px_rgba(255,30,130,0.5)] border border-[#121020]"
                      : "w-2 h-2 xs:w-2.5 xs:h-2.5 min-[390px]:w-2.5 min-[390px]:h-2.5 sm:w-3 sm:h-3 bg-[#FCE7F3] border border-[#121020]/20 hover:bg-[#FFD1E6]"
                  }
                `}
              />
            </button>
          );
        })}
      </div>

    </div>
  );
}
