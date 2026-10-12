"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";

export interface DanceClass {
  id: string;
  name: string;
  category: string;
  desc: string;
  price: string;
  period: string;
  img: string;
  tag?: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
}

export const danceClassesData: DanceClass[] = [
  {
    id: "hip-hop",
    name: "Hip Hop",
    category: "Street & Urban",
    desc: "High energy street style choreography, groove foundation, and freestyle routines.",
    price: "1,500",
    period: "/ month",
    img: "/images/hip-hop.jpg",
    tag: "High Energy",
    accentColor: "#FF6600",
    accentBg: "#FFF2E8",
    badgeBg: "#FFD200",
  },
  {
    id: "bollywood",
    name: "Bollywood",
    category: "Filmi & Folk",
    desc: "Vibrant routine sets to trending Bollywood hits, cinematic expression, and energetic beats.",
    price: "1,500",
    period: "/ month",
    img: "/images/bollywood.jpg",
    tag: "Most Popular",
    accentColor: "#FF1E82",
    accentBg: "#FFE4F0",
    badgeBg: "#FF1E82",
  },
  {
    id: "contemporary",
    name: "Contemporary",
    category: "Modern & Lyrical",
    desc: "Express yourself through fluid movement, emotional musicality, and modern floorwork.",
    price: "1,100",
    period: "/ month",
    img: "/images/contemporary.jpg",
    accentColor: "#7928CA",
    accentBg: "#F3E8FF",
    badgeBg: "#7928CA",
  },
  {
    id: "salsa",
    name: "Latin Salsa",
    category: "Partner & Social",
    desc: "Catch the Latin rhythm with dynamic footwork, partner spins, and social dance flow.",
    price: "1,500",
    period: "/ month",
    img: "/images/salsa.jpg",
    tag: "Social Favorite",
    accentColor: "#FF3366",
    accentBg: "#FFEAEA",
    badgeBg: "#FFD200",
  },
  {
    id: "studio-showcase",
    name: "Studio Showcase",
    category: "Workshops & Stage",
    desc: "Special choreography masterclasses, performance recitals, and studio video shoots.",
    price: "2,000",
    period: "/ workshop",
    img: "/images/about-studio.jpg",
    tag: "Masterclass",
    accentColor: "#00B4D8",
    accentBg: "#E0F7FA",
    badgeBg: "#7928CA",
  },
];

export default function CombinedClassesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const singleSetWidthRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const accumulatedScrollRef = useRef(0);

  // Mouse & touch drag tracking
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const dragDistanceRef = useRef(0);

  // Quadruple items to ensure wide, seamless runway for infinite continuous looping
  const loopItems = [
    ...danceClassesData,
    ...danceClassesData,
    ...danceClassesData,
    ...danceClassesData,
  ];

  // Measure exact pixel distance of 1 full base set (5 cards + gaps)
  const measureSetWidth = useCallback(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>("[data-loop-card]");
    const baseCount = danceClassesData.length;
    if (cards.length >= baseCount * 2 && cards[0] && cards[baseCount]) {
      const firstRect = cards[0].getBoundingClientRect();
      const secondSetRect = cards[baseCount].getBoundingClientRect();
      const width = secondSetRect.left - firstRect.left;
      if (width > 0) {
        singleSetWidthRef.current = width;
        // Start centered in set 1 for equal runway forward and backward
        if (containerRef.current.scrollLeft === 0) {
          containerRef.current.scrollLeft = width;
          accumulatedScrollRef.current = width;
        }
      }
    }
  }, []);

  useEffect(() => {
    measureSetWidth();
    const timer = setTimeout(measureSetWidth, 200);
    window.addEventListener("resize", measureSetWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureSetWidth);
    };
  }, [measureSetWidth]);

  // Smooth constant-speed marquee movement via requestAnimationFrame
  useEffect(() => {
    const speedPixelsPerSecond = 32; // Constant smooth glide from right to left

    const tick = (now: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = now;
      const delta = Math.min(now - lastTimeRef.current, 100);
      lastTimeRef.current = now;

      const container = containerRef.current;
      const setWidth = singleSetWidthRef.current;

      if (container && setWidth > 0) {
        if (!isInteractingRef.current) {
          if (Math.abs(container.scrollLeft - accumulatedScrollRef.current) > 3) {
            accumulatedScrollRef.current = container.scrollLeft;
          }

          const step = (speedPixelsPerSecond * delta) / 1000;
          accumulatedScrollRef.current += step;
          container.scrollLeft = accumulatedScrollRef.current;
        }

        if (container.scrollLeft >= setWidth * 2.5) {
          accumulatedScrollRef.current -= setWidth;
          container.scrollLeft = accumulatedScrollRef.current;
        } else if (container.scrollLeft <= setWidth * 0.5) {
          accumulatedScrollRef.current += setWidth;
          container.scrollLeft = accumulatedScrollRef.current;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const pauseAutoScroll = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const resumeAutoScroll = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        accumulatedScrollRef.current = containerRef.current.scrollLeft;
      }
      isInteractingRef.current = false;
      lastTimeRef.current = performance.now();
    }, 1500);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX;
    scrollStartRef.current = containerRef.current.scrollLeft;
    pauseAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const delta = e.pageX - startXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    containerRef.current.scrollLeft = scrollStartRef.current - delta;
    accumulatedScrollRef.current = containerRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      resumeAutoScroll();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    dragDistanceRef.current = 0;
    startXRef.current = e.touches[0].pageX;
    scrollStartRef.current = containerRef.current.scrollLeft;
    pauseAutoScroll();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const delta = e.touches[0].pageX - startXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    pauseAutoScroll();
  };

  const handleTouchEnd = () => {
    resumeAutoScroll();
  };

  const handleCardClickCapture = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 8) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="w-full relative group">
      {/* Subtle edge fades for modern aesthetic polish */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-r from-[#FFFDF9] via-[#FFFDF9]/90 to-transparent z-10 hidden sm:block" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 lg:w-24 bg-gradient-to-l from-[#FFFDF9] via-[#FFFDF9]/90 to-transparent z-10 hidden sm:block" />

      {/* Infinite Continuous Scrolling Track */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClickCapture={handleCardClickCapture}
        className="flex gap-5 sm:gap-6 overflow-x-auto py-6 px-4 sm:px-8 no-scrollbar select-none cursor-grab active:cursor-grabbing will-change-scroll"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "auto",
        }}
      >
        {loopItems.map((cls, idx) => (
          <Card
            key={`${cls.id}-${idx}`}
            data-loop-card
            className="w-[82vw] max-w-[320px] sm:w-[320px] lg:w-[340px] shrink-0 rounded-[28px] overflow-hidden border-2 border-[#121020] shadow-[5px_5px_0px_#121020] hover:shadow-[7px_7px_0px_#FF1E82] hover:-translate-y-1.5 transition-all duration-300 bg-white flex flex-col justify-between group/card"
          >
            <div>
              {/* Vibrant Image Framing with Category Chip & Playful Tag */}
              <div
                className="w-full h-44 sm:h-52 bg-cover bg-center relative overflow-hidden"
                style={{ backgroundImage: `url('${cls.img}')` }}
              >
                {/* Gradient tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121020]/80 via-[#121020]/20 to-transparent" />
                
                {/* Category Sticker */}
                <div className="absolute bottom-3 left-3.5 z-10">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#121020] bg-[#FFD200] border-2 border-[#121020] px-3 py-1 rounded-full shadow-[2px_2px_0px_#121020]">
                    {cls.category}
                  </span>
                </div>

                {/* Playful Tag Stamp */}
                {cls.tag && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white bg-[#FF1E82] border-2 border-[#121020] px-3 py-1 rounded-full shadow-[2px_2px_0px_#121020] inline-flex items-center gap-1 -rotate-2">
                      <Sparkles className="w-3 h-3" />
                      {cls.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Desc */}
              <CardHeader className="pb-1 pt-5 px-5">
                <CardTitle className="text-xl sm:text-2xl font-black text-[#121020] tracking-tight group-hover/card:text-[#FF1E82] transition-colors">
                  {cls.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 pb-3">
                <p className="text-xs sm:text-sm text-[#555263] min-h-[38px] sm:min-h-[42px] leading-relaxed line-clamp-2 mb-3 font-medium">
                  {cls.desc}
                </p>
                
                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#121020] tracking-tight">₹{cls.price}</span>
                  <span className="text-xs text-[#7B7788] font-bold uppercase">{cls.period}</span>
                </div>
              </CardContent>
            </div>

            {/* CTA Button */}
            <CardFooter className="px-5 pb-5 pt-1">
              <Link href="#contact" className="w-full">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-2 border-[#121020] bg-[#FFF9D6] text-[#121020] hover:bg-[#FFD200] font-black text-xs sm:text-sm h-11 sm:h-12 flex items-center justify-center gap-2 shadow-[2px_2px_0px_#121020] active:translate-x-0.5 active:translate-y-0.5 transition-all group-hover/card:bg-[#FFD200]"
                >
                  View Details <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Interactive Helper Indicator */}
      <div className="flex justify-center items-center gap-2 mt-4 text-xs font-bold text-[#868294]">
        <span className="inline-block w-2 h-2 rounded-full bg-[#FF1E82] animate-ping" />
        <span>Continuous marquee — drag or swipe freely to explore</span>
      </div>
    </div>
  );
}
