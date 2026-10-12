"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface GalleryItem {
  id: string | number;
  title: string;
  category: string;
  image: string;
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: "State-of-the-art Studio", category: "Studio", image: "/images/about-studio.jpg" },
  { id: 2, title: "Contemporary Expression", category: "Performances", image: "/images/contemporary.jpg" },
  { id: 3, title: "Latin Salsa Beats", category: "Classes", image: "/images/salsa.jpg" },
  { id: 4, title: "Bollywood Energy", category: "Events", image: "/images/bollywood.jpg" },
  { id: 5, title: "Hip Hop Freestyle", category: "Classes", image: "/images/hip-hop.jpg" },
];

export default function MobileGalleryCarousel() {
  const [activeTab, setActiveTab] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = ["All", "Events", "Classes", "Performances"];

  const filteredItems = activeTab === "All"
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeTab || item.category === "Studio");

  // Scroll to next item automatically
  const advanceSlide = useCallback(() => {
    if (!containerRef.current || isInteractingRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-gallery-card]");
    if (!cards.length) return;

    const nextIndex = (activeIndex + 1) % cards.length;
    const targetCard = cards[nextIndex];
    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft - 16, // 16px padding offset
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    }
  }, [activeIndex]);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      advanceSlide();
    }, 3200);

    return () => clearInterval(interval);
  }, [advanceSlide]);

  // Pause on interaction and resume after timeout
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

  // Sync activeIndex with manual scroll
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-gallery-card]");
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
    const cards = container.querySelectorAll<HTMLElement>("[data-gallery-card]");
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
      {/* Category Filter Pills */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-6 sm:mb-8 justify-start sm:justify-center px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setActiveIndex(0);
              if (containerRef.current) containerRef.current.scrollLeft = 0;
            }}
            className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 shadow-sm ${
              activeTab === tab
                ? "bg-primary text-white shadow-primary/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Mobile Auto-Scrolling Carousel (Visible on Mobile / Tablet < md) ── */}
      <div className="block md:hidden w-full relative overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          onMouseDown={handleInteractionStart}
          onMouseUp={handleInteractionEnd}
          className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory px-4 py-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              data-gallery-card
              className="w-[82vw] max-w-[340px] shrink-0 snap-start rounded-2xl overflow-hidden shadow-md relative aspect-[16/10] bg-gray-100 group border border-gray-100/50"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500"
                style={{ backgroundImage: `url('${item.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                <div>
                  <span className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-0.5 rounded-full mb-1 inline-block">
                    {item.category}
                  </span>
                  <h4 className="text-white font-bold text-sm leading-tight drop-shadow">
                    {item.title}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-1.5 mt-4">
          {filteredItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop Bento Grid (Visible on Desktop >= md) ── */}
      <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-4 h-[550px] lg:h-[600px] max-w-6xl mx-auto">
        {/* Main large image */}
        <div
          className="md:col-span-2 md:row-span-2 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group relative overflow-hidden cursor-pointer"
          style={{ backgroundImage: "url('/images/about-studio.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-white font-bold text-lg">Main Dance Floor & Studio</span>
          </div>
        </div>

        {/* Top right images */}
        <div
          className="md:col-span-1 md:row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
          style={{ backgroundImage: "url('/images/contemporary.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white font-bold text-sm">Contemporary Movement</span>
          </div>
        </div>

        <div
          className="md:col-span-1 md:row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
          style={{ backgroundImage: "url('/images/salsa.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white font-bold text-sm">Latin Salsa Evening</span>
          </div>
        </div>

        {/* Bottom right wide image */}
        <div
          className="md:col-span-2 md:row-span-1 rounded-3xl bg-cover bg-center shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden cursor-pointer"
          style={{ backgroundImage: "url('/images/bollywood.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
            <span className="text-white font-bold text-base">Bollywood Showcase Batch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
