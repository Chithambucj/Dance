"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Share2, Sparkles } from "lucide-react";

export interface Instructor {
  name: string;
  role: string;
  img: string;
  color: string;
  bg: string;
}

const instructors: Instructor[] = [
  {
    name: "Alex Johnson",
    role: "Hip Hop Specialist",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
    color: "#FFD200",
    bg: "#FFF9D6",
  },
  {
    name: "Priya Sharma",
    role: "Bollywood Expert",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
    color: "#FF1E82",
    bg: "#FFE4F0",
  },
  {
    name: "John D'Cruz",
    role: "Salsa Instructor",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    color: "#FF6600",
    bg: "#FFEDE0",
  },
  {
    name: "Sneha Iyer",
    role: "Contemporary Coach",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    color: "#7928CA",
    bg: "#F3E8FF",
  },
];

export default function MobileInstructorsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const advanceSlide = useCallback(() => {
    if (!containerRef.current || isInteractingRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-instructor-card]");
    if (!cards.length) return;

    const nextIndex = (activeIndex + 1) % cards.length;
    const targetCard = cards[nextIndex];
    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft - 16,
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    }
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      advanceSlide();
    }, 3500);

    return () => clearInterval(interval);
  }, [advanceSlide]);

  const handleInteractionStart = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleInteractionEnd = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 3000);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-instructor-card]");
    if (!cards.length) return;

    const scrollLeft = container.scrollLeft;
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, idx) => {
      const distance = Math.abs(card.offsetLeft - 16 - scrollLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-instructor-card]");
    if (cards[index]) {
      handleInteractionStart();
      container.scrollTo({
        left: cards[index].offsetLeft - 16,
        behavior: "smooth",
      });
      setActiveIndex(index);
      handleInteractionEnd();
    }
  };

  return (
    <div className="w-full">
      {/* ── Mobile Auto-Scrolling Carousel (< md) ── */}
      <div className="block md:hidden w-full relative overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 py-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {instructors.map((instructor, idx) => (
            <div
              key={idx}
              data-instructor-card
              className="w-[74vw] max-w-[280px] shrink-0 snap-start bg-white rounded-[28px] p-5 border-2 border-[#121020] shadow-[5px_5px_0px_#121020] flex flex-col items-center text-center transition-all relative"
            >
              <div
                className="w-36 h-36 rounded-full overflow-hidden mb-4 border-3 border-[#121020] shadow-[3px_3px_0px_#121020] relative shrink-0"
                style={{ backgroundColor: instructor.color }}
              >
                <div
                  className="w-full h-full bg-cover bg-center hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url('${instructor.img}')` }}
                />
              </div>
              <h3 className="text-lg font-black text-[#121020] mb-1">{instructor.name}</h3>
              <span
                className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border-2 border-[#121020] text-[#121020] mb-3 shadow-[1.5px_1.5px_0px_#121020]"
                style={{ backgroundColor: instructor.bg }}
              >
                {instructor.role}
              </span>
              <a
                href="#"
                aria-label={`Share ${instructor.name}'s profile`}
                className="w-11 h-11 rounded-full bg-white border-2 border-[#121020] flex items-center justify-center text-[#121020] hover:bg-[#FFD200] shadow-[2px_2px_0px_#121020] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {instructors.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to instructor ${idx + 1}`}
              className="min-w-[32px] min-h-[44px] flex items-center justify-center"
            >
              <span
                className={`h-2.5 rounded-full transition-all duration-300 border border-[#121020] ${
                  activeIndex === idx ? "w-8 bg-[#FF1E82]" : "w-2.5 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop Grid (>= md) ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-7 max-w-6xl mx-auto">
        {instructors.map((instructor, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center text-center bg-white rounded-[32px] p-6 border-2 border-[#121020] shadow-[5px_5px_0px_#121020] hover:shadow-[7px_7px_0px_#FF1E82] hover:-translate-y-2 transition-all duration-300 group"
          >
            <div
              className="w-44 h-44 rounded-full overflow-hidden mb-4 border-3 border-[#121020] shadow-[3px_3px_0px_#121020] group-hover:scale-105 transition-transform duration-300 relative"
              style={{ backgroundColor: instructor.color }}
            >
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url('${instructor.img}')` }}
              />
            </div>
            <h3 className="text-xl font-black text-[#121020] tracking-tight mb-1">{instructor.name}</h3>
            <span
              className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-[#121020] text-[#121020] mb-4 shadow-[2px_2px_0px_#121020]"
              style={{ backgroundColor: instructor.bg }}
            >
              {instructor.role}
            </span>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label={`Share ${instructor.name}'s profile`}
                className="w-9 h-9 rounded-full bg-white border-2 border-[#121020] flex items-center justify-center text-[#121020] hover:bg-[#FFD200] shadow-[2px_2px_0px_#121020] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
