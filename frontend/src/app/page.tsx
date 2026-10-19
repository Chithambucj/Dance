import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Sparkles, MapPin, Phone, Mail, CheckCircle2, Send, ArrowUpRight } from "lucide-react";
import HomeNavbar from "@/components/home/HomeNavbar";
import CombinedClassesCarousel from "@/components/home/CombinedClassesCarousel";
import MobileInstructorsCarousel from "@/components/home/MobileInstructorsCarousel";
import AnimatedHeroImageCarousel from "@/components/home/AnimatedHeroImageCarousel";
import HomeAnimations from "@/components/home/HomeAnimations";

export default function Home() {
  return (
    <div id="home-motion-wrapper" className="flex flex-col min-h-screen font-sans scroll-smooth bg-[#FFFDF9] dark:bg-[#11101D] text-[#121020] dark:text-white overflow-x-hidden w-full selection:bg-[#FFD200] dark:selection:bg-[#FFD84D] selection:text-[#121020] dark:selection:text-[#11101D] transition-colors duration-200">
      {/* Dynamic page-load animations, scroll reveal, and parallax controller */}
      <HomeAnimations />

      {/* Navbar with mobile drawer toggle and theme toggle */}
      <HomeNavbar />

      <main className="flex-1 w-full overflow-x-hidden pt-[70px] sm:pt-[78px] lg:pt-[86px]">
        {/* ── Hero Section ────────────────────────────────────────── */}
        <section id="home" className="w-full relative overflow-hidden bg-[#FFFDF9] dark:bg-[#11101D] scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 min-h-[calc(100svh-70px)] sm:min-h-0 flex flex-col justify-start transition-colors duration-200">
          {/* Subtle playful background elements with subtle parallax depth */}
          <div data-parallax="0.18" className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FFD200]/20 dark:bg-[#FFD84D]/15 blur-3xl pointer-events-none animate-pulse-glow" />
          <div data-parallax="-0.12" className="absolute top-40 right-10 w-80 h-80 rounded-full bg-[#FF1E82]/15 dark:bg-[#FF4D8D]/15 blur-3xl pointer-events-none animate-pulse-glow" />
          <div data-parallax="0.22" className="absolute -bottom-10 left-1/3 w-96 h-96 rounded-full bg-[#7928CA]/10 dark:bg-[#9B7BFF]/10 blur-3xl pointer-events-none animate-pulse-glow" />

          <div className="container px-3.5 xs:px-4 sm:px-6 lg:px-12 mx-auto relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between sm:justify-start gap-2.5 xs:gap-3.5 sm:gap-10 lg:gap-14 pt-2 xs:pt-3 pb-4 xs:pb-6 sm:pt-14 sm:pb-8 lg:py-20">
            
            {/* Left Content Wrapper (contents on mobile for flex reordering, block on lg) */}
            <div className="contents lg:block lg:w-[48%] xl:w-5/12 lg:space-y-8 text-center lg:text-left z-20 w-full">
              
              {/* Block 1: Header Info (Badge, Title, Description) */}
              <div className="order-1 space-y-1.5 xs:space-y-2 sm:space-y-6 text-center lg:text-left z-20 w-full shrink-0">
                {/* Playful Sticker Badge (hidden on mobile, shown on desktop) */}
                <div 
                  id="hero-badge" 
                  data-reveal="fade-down"
                  className="hidden lg:inline-flex items-center gap-2 rounded-full bg-[#FFE4F0] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] -rotate-1 hover:rotate-1 transition-transform cursor-default animate-float-slow delay-75"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF1E82] dark:text-[#FF4D8D] fill-[#FF1E82] dark:fill-[#FF4D8D]" />
                  <span className="tracking-wide">Move • Groove • Inspire</span>
                </div>

                {/* Bold Oversized Display Typography with Playful Accents */}
                <div className="relative inline-block w-full max-w-xl mx-auto lg:mx-0">
                  {/* Decorative doodle rays on mobile (matching reference design) */}
                  <div className="lg:hidden absolute -top-4 xs:-top-5 -left-1 sm:left-2 text-[#FF1E82] dark:text-[#FF4D8D] pointer-events-none animate-float-slow">
                    <svg className="w-6 h-6 -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M4 14L1 15" />
                      <path d="M6 7L3 5" />
                      <path d="M12 4V1" />
                    </svg>
                  </div>
                  <div className="lg:hidden absolute -top-4 xs:-top-5 -right-1 sm:right-2 text-[#7928CA] dark:text-[#9B7BFF] pointer-events-none animate-float-reverse">
                    <svg className="w-6 h-6 rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M20 14L23 15" />
                      <path d="M18 7L21 5" />
                      <path d="M12 4V1" />
                    </svg>
                  </div>

                  <h1 
                    id="hero-title"
                    data-reveal="fade-up"
                    className="delay-150 text-[1.75rem] xs:text-[2.05rem] min-[390px]:text-[2.25rem] min-[430px]:text-[2.45rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black tracking-tight text-[#121020] dark:text-white leading-[1.08] sm:leading-[1.04]"
                  >
                    Dance Your Way <br className="hidden sm:inline" />
                    <span className="relative inline-block mt-0.5 sm:mt-2">
                      <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E82] via-[#E01370] to-[#7928CA] dark:from-[#FF4D8D] dark:via-[#FF1E82] dark:to-[#9B7BFF]">
                        to a Better You
                      </span>
                      {/* Playful sketched doodle underline loop */}
                      <svg
                        className="absolute -bottom-1 sm:-bottom-3 left-0 w-full h-2.5 sm:h-6 text-[#FFD200] dark:text-[#FFD84D] pointer-events-none overflow-visible"
                        viewBox="0 0 250 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 14C55 4 150 2 247 11C180 16 90 18 15 15"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </h1>
                </div>

                {/* Description */}
                <p 
                  id="hero-desc"
                  data-reveal="fade-up"
                  className="delay-250 text-[12.5px] xs:text-[13.5px] min-[390px]:text-[14.5px] min-[430px]:text-[15px] sm:text-base md:text-xl text-[#4A455A] dark:text-[#C4C1D6] max-w-[320px] xs:max-w-[360px] min-[390px]:max-w-[400px] sm:max-w-xl mx-auto lg:mx-0 font-semibold leading-snug sm:leading-relaxed px-1 sm:px-0"
                >
                  Join our expert-led dance classes and discover the joy of movement in a fun, vibrant, and energetic environment.
                </p>
              </div>

              {/* Block 3: Action Buttons (order-3 on mobile, placed directly below carousel) */}
              <div id="hero-actions" data-reveal="fade-up" className="delay-350 order-3 pt-1 xs:pt-1.5 lg:pt-0 space-y-1.5 sm:space-y-4 w-full z-20 shrink-0">
                <div className="flex flex-col sm:flex-row gap-2.5 xs:gap-3 sm:gap-4 justify-center lg:justify-start max-w-[330px] xs:max-w-[360px] min-[390px]:max-w-[390px] sm:max-w-none mx-auto lg:mx-0 w-full">
                  {/* 5. Explore Classes Button */}
                  <Link href="#classes" className="w-full sm:w-auto">
                    <Button className="rounded-full h-13 xs:h-13.5 min-[390px]:h-14 sm:h-15 lg:h-16 px-5 xs:px-6 sm:px-10 text-[13.5px] xs:text-[14.5px] min-[390px]:text-base sm:text-lg bg-[#FFD200] dark:bg-[#FFD84D] hover:bg-[#FFC700] dark:hover:bg-[#FFD200] text-[#121020] font-black border-2 border-[#121020] dark:border-[#39364F] shadow-[2.5px_3.5px_0px_#121020] sm:shadow-[3px_4px_0px_#121020] dark:shadow-[2.5px_3.5px_0px_#000000] sm:dark:shadow-[3px_4px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_#121020] dark:hover:shadow-[4px_5px_0px_#000000] active:translate-x-1 active:translate-y-1 transition-all w-full flex items-center justify-center gap-2">
                      <span>Explore Classes</span>
                      <ArrowUpRight className="w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2.5]" />
                    </Button>
                  </Link>

                  {/* 6. Book a Trial Class Button */}
                  <Link href="#contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="rounded-full h-13 xs:h-13.5 min-[390px]:h-14 sm:h-15 lg:h-16 px-5 xs:px-6 sm:px-9 text-[13.5px] xs:text-[14.5px] min-[390px]:text-base sm:text-lg bg-white dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-white hover:bg-[#FFE4F0] dark:hover:bg-[#181729] dark:hover:text-[#FF4D8D] flex items-center justify-center gap-2.5 w-full font-black shadow-[2.5px_3.5px_0px_#121020] sm:shadow-[3px_4px_0px_#121020] dark:shadow-[2.5px_3.5px_0px_#000000] sm:dark:shadow-[3px_4px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[4px_5px_0px_#121020] dark:hover:shadow-[4px_5px_0px_#000000] active:translate-x-1 active:translate-y-1 transition-all">
                      <span className="w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-full border-2 border-[#FF1E82] dark:border-[#FF4D8D] inline-block shrink-0" />
                      <span>Book a Trial Class</span>
                    </Button>
                  </Link>
                </div>

                {/* Handwritten cursive doodle element - hidden on mobile, shown on sm/lg */}
                <div id="hero-note" data-reveal="fade-up" className="delay-450 hidden sm:flex items-center gap-2 justify-center lg:justify-start pt-2 text-[#7928CA] dark:text-[#9B7BFF]">
                  <svg className="w-6 h-6 text-[#7928CA] dark:text-[#9B7BFF] -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17l9.2-9.2M17 17V8h-9"/>
                  </svg>
                  <span className="font-handwriting text-xl text-[#7928CA] dark:text-[#9B7BFF] font-bold">
                    love dancing with us, we invite you to the first class
                  </span>
                </div>
              </div>

            </div>

            {/* Block 2: Animated Hero Image Carousel (order-2 on mobile, right column on desktop) */}
            <div id="hero-visual" data-reveal="fade-scale" className="delay-200 order-2 lg:order-none lg:w-[52%] xl:w-7/12 relative flex justify-center z-10 w-full my-0 sm:my-3 lg:my-0">
              <AnimatedHeroImageCarousel />
            </div>
          </div>
        </section>

        {/* ── Stats Bar (Colorful Playful Sticker Cards) ─────────────── */}
        <section id="stats" className="w-full relative z-20 bg-[#FFFDF9] dark:bg-[#11101D] py-8 sm:py-0 sm:mt-12 sm:mb-16 lg:mt-16 lg:mb-22 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              
              {/* Stat 1: 10+ Dance Styles (Sunny Yellow) */}
              <div 
                id="stat-card-1"
                data-reveal="fade-up"
                className="delay-100 bg-[#FFF9D6] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[20px] sm:rounded-[24px] p-3 sm:p-6 shadow-[3px_3px_0px_#121020] sm:shadow-[4px_4px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] sm:dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all flex items-center gap-2.5 sm:gap-4 group cursor-default"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FFD200] dark:bg-[#FFD84D] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-[#121020] shrink-0 shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-[#121020] dark:text-white leading-tight">10+</h4>
                  <p className="text-[11px] sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] font-extrabold leading-tight">Dance Styles</p>
                </div>
              </div>

              {/* Stat 2: 25+ Expert Instructors (Hot Pink) */}
              <div 
                id="stat-card-2"
                data-reveal="fade-up"
                className="delay-200 bg-[#FFE4F0] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[20px] sm:rounded-[24px] p-3 sm:p-6 shadow-[3px_3px_0px_#121020] sm:shadow-[4px_4px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] sm:dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all flex items-center gap-2.5 sm:gap-4 group cursor-default"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#FF1E82] dark:bg-[#FF4D8D] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] group-hover:-rotate-6 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-[#121020] dark:text-white leading-tight">25+</h4>
                  <p className="text-[11px] sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] font-extrabold leading-tight">Expert Instructors</p>
                </div>
              </div>

              {/* Stat 3: 500+ Happy Students (Electric Purple) */}
              <div 
                id="stat-card-3"
                data-reveal="fade-up"
                className="delay-300 bg-[#F3E8FF] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[20px] sm:rounded-[24px] p-3 sm:p-6 shadow-[3px_3px_0px_#121020] sm:shadow-[4px_4px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] sm:dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all flex items-center gap-2.5 sm:gap-4 group cursor-default"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#7928CA] dark:bg-[#9B7BFF] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-[#121020] dark:text-white leading-tight">500+</h4>
                  <p className="text-[11px] sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] font-extrabold leading-tight">Happy Students</p>
                </div>
              </div>

              {/* Stat 4: 15+ Years of Trust (Cyan / Teal) */}
              <div 
                id="stat-card-4"
                data-reveal="fade-up"
                className="delay-400 bg-[#E0F7FA] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[20px] sm:rounded-[24px] p-3 sm:p-6 shadow-[3px_3px_0px_#121020] sm:shadow-[4px_4px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] sm:dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all flex items-center gap-2.5 sm:gap-4 group cursor-default"
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#00B4D8] dark:bg-[#26D0F0] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] group-hover:-rotate-6 transition-transform">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h4 className="text-xl sm:text-3xl font-black text-[#121020] dark:text-white leading-tight">15+</h4>
                  <p className="text-[11px] sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] font-extrabold leading-tight">Years of Trust</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── About Section ───────────────────────────────────────── */}
        <section id="about" className="w-full py-14 sm:py-20 lg:py-28 bg-[#FAF7F2] dark:bg-[#181729] border-t-2 border-b-2 border-[#121020] dark:border-[#39364F] relative scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              
              {/* Left Column */}
              <div data-reveal="fade-right" className="space-y-5 sm:space-y-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE4F0] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-4 py-1.5 text-xs font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF1E82] dark:text-[#FF4D8D] fill-[#FF1E82] dark:fill-[#FF4D8D]" />
                  <span>About StepUp Dance Studio</span>
                </div>
                
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#121020] dark:text-white leading-[1.08] tracking-tight">
                  Where Passion Meets <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF1E82] to-[#7928CA] dark:from-[#FF4D8D] dark:to-[#9B7BFF]">
                    Purpose & Rhythm
                  </span>
                </h2>
                
                <p className="text-[#4A455A] dark:text-[#C4C1D6] text-sm sm:text-base md:text-lg leading-relaxed font-semibold">
                  Founded in 2009, StepUp Dance Studio began as a small classroom with a big dream: to make high-energy, world-class dance education accessible to everyone. Today, we are proud to empower dancers of all ages and experience levels across multiple styles.
                </p>
                
                {/* Mission & Vision Cards */}
                <div className="grid sm:grid-cols-2 gap-4 pt-1 text-left">
                  <div data-reveal="fade-up" className="bg-white dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[24px] p-5 shadow-[4px_4px_0px_#FFD200] dark:shadow-[4px_4px_0px_#FFD84D] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#FFD200] dark:hover:shadow-[6px_6px_0px_#FFD84D] transition-all">
                    <div className="inline-block bg-[#FFD200] dark:bg-[#FFD84D] text-[#121020] border-2 border-[#121020] dark:border-[#39364F] font-black text-[11px] px-2.5 py-0.5 rounded-full mb-2 uppercase">
                      Core Goal
                    </div>
                    <h3 className="font-black text-[#121020] dark:text-white text-base mb-1.5">Our Mission</h3>
                    <p className="text-xs text-[#555263] dark:text-[#C4C1D6] leading-relaxed font-medium">
                      Inspire joy, foster self-confidence, and build healthy habits through creative movement.
                    </p>
                  </div>

                  <div data-reveal="fade-up" className="delay-150 bg-white dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] rounded-[24px] p-5 shadow-[4px_4px_0px_#FF1E82] dark:shadow-[4px_4px_0px_#FF4D8D] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#FF1E82] dark:hover:shadow-[6px_6px_0px_#FF4D8D] transition-all">
                    <div className="inline-block bg-[#FFE4F0] dark:bg-[#331A26] text-[#FF1E82] dark:text-[#FF4D8D] border-2 border-[#121020] dark:border-[#39364F] font-black text-[11px] px-2.5 py-0.5 rounded-full mb-2 uppercase">
                      Future
                    </div>
                    <h3 className="font-black text-[#121020] dark:text-white text-base mb-1.5">Our Vision</h3>
                    <p className="text-xs text-[#555263] dark:text-[#C4C1D6] leading-relaxed font-medium">
                      Nurture a vibrant dance community that celebrates every milestone, step by step.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/about">
                    <Button className="rounded-full h-13 sm:h-14 px-8 sm:px-9 font-black bg-[#FF1E82] dark:bg-[#FF4D8D] hover:bg-[#E01370] dark:hover:bg-[#E01370] text-white border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#121020] dark:hover:shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 text-sm sm:text-base transition-all">
                      Learn More About Us
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Why Dancers Choose Us (High Contrast Card Inspired by Dream Dance & Ritm) */}
              <div data-reveal="fade-left" className="delay-200 bg-[#121020] dark:bg-[#211F35] text-white rounded-[32px] p-6 sm:p-9 border-2 border-[#121020] dark:border-[#39364F] shadow-[8px_8px_0px_#7928CA] dark:shadow-[8px_8px_0px_#9B7BFF] space-y-6 relative overflow-hidden group">
                {/* Subtle decorative background circle with parallax depth */}
                <div data-parallax="0.12" className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#7928CA]/25 dark:bg-[#9B7BFF]/25 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/15 dark:border-white/10 pb-4 relative z-10">
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Why Dancers Choose Us</h3>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#FFD200] dark:text-[#FFD84D] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                    StepUp Edge
                  </span>
                </div>

                <ul className="space-y-5 relative z-10">
                  {[
                    { title: "World-Class Choreographers", desc: "Trained professionals from top international & national dance academies." },
                    { title: "Inclusive & Encouraging", desc: "No judgment or pressure — beginner friendly batches starting weekly." },
                    { title: "State-of-the-Art Studio", desc: "Sprung wooden floors, full-length mirrors, and immersive sound systems." },
                    { title: "Stage & Event Showcases", desc: "Annual recitals, flash mobs, and competition opportunities for students." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3.5 group">
                      <div className="w-8 h-8 rounded-full bg-[#FF1E82]/20 dark:bg-[#FF4D8D]/20 border border-[#FF1E82] dark:border-[#FF4D8D] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#FF1E82] dark:group-hover:bg-[#FF4D8D] group-hover:scale-110 transition-all">
                        <CheckCircle2 className="w-4 h-4 text-[#FF1E82] dark:text-[#FF4D8D] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base tracking-tight">{item.title}</h4>
                        <p className="text-xs sm:text-sm text-gray-300 dark:text-[#C4C1D6] mt-1 leading-relaxed font-normal">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Explore Our Dance Classes (Unified Classes & Gallery Showcase) ── */}
        <section id="classes" className="w-full py-14 sm:py-20 lg:py-28 bg-[#FFFDF9] dark:bg-[#11101D] overflow-hidden scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div data-reveal="fade-up" className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF9D6] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-4 py-1.5 text-xs font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6600] dark:text-[#FF7E36]" />
                <span>Styles & Moments</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#121020] dark:text-white tracking-tight">
                Our Dance Classes
              </h2>
              <p className="text-sm sm:text-base text-[#555263] dark:text-[#C4C1D6] font-semibold">
                Explore our dynamic dance styles, studio sessions, and vibrant class experiences.
              </p>
            </div>

            {/* Combined Infinite Carousel on Mobile, Multi-Card Layout on Desktop */}
            <div data-reveal="fade-up" className="delay-100">
              <CombinedClassesCarousel />
            </div>
          </div>
        </section>

        {/* ── Instructors Section with Mobile Auto-Carousel ─────── */}
        <section id="instructors" className="w-full py-14 sm:py-20 lg:py-28 bg-[#FAF7F2] dark:bg-[#181729] border-t-2 border-b-2 border-[#121020] dark:border-[#39364F] overflow-hidden scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div data-reveal="fade-up" className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE4F0] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-4 py-1.5 text-xs font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF1E82] dark:text-[#FF4D8D]" />
                <span>Faculty</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#121020] dark:text-white tracking-tight">Meet Our Instructors</h2>
              <p className="text-sm sm:text-base text-[#555263] dark:text-[#C4C1D6] font-semibold">Learn from the best and most passionate dance professionals in the industry.</p>
            </div>

            {/* Auto-carousel on mobile, 4-column grid on desktop */}
            <div data-reveal="fade-up" className="delay-150">
              <MobileInstructorsCarousel />
            </div>
          </div>
        </section>

        {/* ── Pricing Section ─────────────────────────────────────── */}
        <section id="pricing" className="w-full py-14 sm:py-20 lg:py-28 bg-[#FFFDF9] dark:bg-[#11101D] scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div data-reveal="fade-up" className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF9D6] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-4 py-1.5 text-xs font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000]">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD200] dark:text-[#FFD84D] fill-[#FFD200] dark:fill-[#FFD84D]" />
                <span>Transparent Rates</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#121020] dark:text-white tracking-tight">Simple & Affordable Pricing</h2>
              <p className="text-sm sm:text-base text-[#555263] dark:text-[#C4C1D6] font-semibold">Choose the plan that works best for your dance goals and schedule.</p>
            </div>

            <div className="flex overflow-x-auto pb-6 pt-3 snap-x snap-mandatory gap-5 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 max-w-6xl mx-auto items-stretch no-scrollbar">
              
              {/* 1. Trial Plan */}
              <Card data-reveal="fade-up" className="delay-100 w-[80vw] sm:w-[280px] snap-start shrink-0 md:w-auto md:shrink rounded-[28px] border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#211F35] text-center p-5 sm:p-6 flex flex-col justify-between shadow-[4px_4px_0px_#121020] dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all">
                <div>
                  <CardHeader className="p-0 mb-4">
                    <span className="inline-block bg-[#FFF9D6] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-[#FFD84D] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                      Intro Pass
                    </span>
                    <CardTitle className="text-lg sm:text-xl text-[#121020] dark:text-white font-black">Trial Class</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-[#121020] dark:text-white whitespace-nowrap">
                        ₹0 <span className="text-base sm:text-lg font-black text-[#121020] dark:text-[#C4C1D6] uppercase">(FREE)</span>
                      </span>
                    </div>
                    <ul className="text-xs sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] space-y-2.5 font-bold text-left max-w-[200px] mx-auto">
                      <li className="flex items-center gap-2">✓ 1 Trial Class</li>
                      <li className="flex items-center gap-2">✓ Valid for 7 Days</li>
                      <li className="flex items-center gap-2">✓ Access to Any Style</li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="p-0 pt-6">
                  <Link href="/free-trial" className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#181729] hover:bg-[#FFE4F0] dark:hover:bg-[#2A2742] text-[#121020] dark:text-white h-12 font-black text-sm shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                      Book Now
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* 2. Monthly Plan (Highlighted Hero Card) */}
              <Card data-reveal="fade-up" className="delay-200 w-[80vw] sm:w-[280px] snap-start shrink-0 md:w-auto md:shrink rounded-[30px] border-3 border-[#121020] dark:border-[#FFD84D] bg-gradient-to-br from-[#FF1E82] via-[#E01370] to-[#7928CA] dark:from-[#FF4D8D] dark:via-[#E01370] dark:to-[#9B7BFF] text-white text-center p-5 sm:p-6 flex flex-col justify-between relative shadow-[8px_8px_0px_#FFD200] dark:shadow-[8px_8px_0px_#FFD84D] transform md:scale-105 z-10 md:-mt-2 hover:-translate-y-1.5 transition-all">
                <div>
                  <div className="inline-block bg-[#FFD200] dark:bg-[#FFD84D] text-[#121020] border-2 border-[#121020] dark:border-[#39364F] text-[11px] font-black px-3.5 py-1 rounded-full mb-3 uppercase tracking-wider shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] -rotate-2">
                    Most Popular
                  </div>
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-xl sm:text-2xl text-white font-black">Monthly Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <span className="text-4xl sm:text-5xl font-black text-white">₹1500</span>
                      <span className="text-white/90 block mt-1 text-xs font-extrabold uppercase tracking-wide">per month</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-white space-y-2.5 font-bold text-left max-w-[200px] mx-auto">
                      <li className="flex items-center gap-2">✓ 8 Classes / Month</li>
                      <li className="flex items-center gap-2">✓ Valid for 30 Days</li>
                      <li className="flex items-center gap-2">✓ Batch Flexibility</li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="p-0 pt-6">
                  <Link href="/login" className="w-full">
                    <Button className="w-full rounded-2xl bg-[#FFD200] dark:bg-[#FFD84D] text-[#121020] hover:bg-[#FFC700] dark:hover:bg-[#FFD200] h-12 font-black text-sm border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                      Choose Plan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* 3. Quarterly Plan */}
              <Card data-reveal="fade-up" className="delay-300 w-[80vw] sm:w-[280px] snap-start shrink-0 md:w-auto md:shrink rounded-[28px] border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#211F35] text-center p-5 sm:p-6 flex flex-col justify-between shadow-[4px_4px_0px_#121020] dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all">
                <div>
                  <CardHeader className="p-0 mb-4">
                    <span className="inline-block bg-[#F3E8FF] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#7928CA] dark:text-[#9B7BFF] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                      Quarterly
                    </span>
                    <CardTitle className="text-lg sm:text-xl text-[#121020] dark:text-white font-black">Quarterly Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-[#121020] dark:text-white">₹4000</span>
                      <span className="text-[#7B7788] dark:text-[#C4C1D6] block mt-1 text-xs font-bold">/ 3 months</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] space-y-2.5 font-bold text-left max-w-[200px] mx-auto">
                      <li className="flex items-center gap-2">✓ 24 Classes / 3 Mo</li>
                      <li className="flex items-center gap-2">✓ Valid for 90 Days</li>
                      <li className="flex items-center gap-2">✓ Priority Enrollment</li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="p-0 pt-6">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#181729] hover:bg-[#FFE4F0] dark:hover:bg-[#2A2742] text-[#121020] dark:text-white h-12 font-black text-sm shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                      Choose Plan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* 4. Yearly Plan */}
              <Card data-reveal="fade-up" className="delay-400 w-[80vw] sm:w-[280px] snap-start shrink-0 md:w-auto md:shrink rounded-[28px] border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#211F35] text-center p-5 sm:p-6 flex flex-col justify-between shadow-[4px_4px_0px_#121020] dark:shadow-[4px_4px_0px_#000000] hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_#121020] dark:hover:shadow-[6px_6px_0px_#000000] transition-all">
                <div>
                  <CardHeader className="p-0 mb-4">
                    <span className="inline-block bg-[#E0F7FA] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#00B4D8] dark:text-[#26D0F0] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                      All Access
                    </span>
                    <CardTitle className="text-lg sm:text-xl text-[#121020] dark:text-white font-black">Annual Pass</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-[#121020] dark:text-white">₹12000</span>
                      <span className="text-[#7B7788] dark:text-[#C4C1D6] block mt-1 text-xs font-bold">/ year</span>
                    </div>
                    <ul className="text-xs sm:text-sm text-[#4A455A] dark:text-[#C4C1D6] space-y-2.5 font-bold text-left max-w-[200px] mx-auto">
                      <li className="flex items-center gap-2">✓ Unlimited Classes</li>
                      <li className="flex items-center gap-2">✓ Valid for 365 Days</li>
                      <li className="flex items-center gap-2">✓ Showcase Entry Free</li>
                    </ul>
                  </CardContent>
                </div>
                <CardFooter className="p-0 pt-6">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#181729] hover:bg-[#FFE4F0] dark:hover:bg-[#2A2742] text-[#121020] dark:text-white h-12 font-black text-sm shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all">
                      Choose Plan
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

            </div>
          </div>
        </section>

        {/* ── Contact Section ─────────────────────────────────────── */}
        <section id="contact" className="w-full py-14 sm:py-20 lg:py-28 bg-[#FAF7F2] dark:bg-[#181729] border-t-2 border-[#121020] dark:border-[#39364F] relative scroll-mt-20 sm:scroll-mt-24 lg:scroll-mt-28 transition-colors duration-200">
          <div className="container px-4 sm:px-6 lg:px-12 mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 max-w-5xl mx-auto items-center">
              
              {/* Contact Info */}
              <div data-reveal="fade-right" className="lg:w-1/2 space-y-6 text-center lg:text-left w-full">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE4F0] dark:bg-[#211F35] border-2 border-[#121020] dark:border-[#39364F] px-4 py-1.5 text-xs font-black text-[#121020] dark:text-white shadow-[2px_2px_0px_#121020] dark:shadow-[2px_2px_0px_#000000]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF1E82] dark:text-[#FF4D8D]" />
                  <span>Get in Touch</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-[#121020] dark:text-white leading-tight tracking-tight">Contact StepUp</h2>
                <p className="text-sm sm:text-base text-[#4A455A] dark:text-[#C4C1D6] leading-relaxed font-semibold">
                  Have questions about our studio, class timings, or custom workshop bookings? Get in touch with our team today!
                </p>
                
                <div className="space-y-3.5 sm:space-y-4 pt-2 text-left max-w-sm mx-auto lg:mx-0">
                  <div className="flex items-center gap-3.5 sm:gap-4 text-[#121020] dark:text-white bg-white dark:bg-[#211F35] p-3 sm:p-3.5 rounded-[20px] border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-1 transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF9D6] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-[#121020] dark:text-[#FFD84D] shrink-0">
                      <MapPin className="w-5 h-5 text-[#FF6600] dark:text-[#FF7E36]" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm">123 Rhythm Boulevard, Studio Block, Mumbai</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 sm:gap-4 text-[#121020] dark:text-white bg-white dark:bg-[#211F35] p-3 sm:p-3.5 rounded-[20px] border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-1 transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-[#FFE4F0] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-[#121020] dark:text-[#FF4D8D] shrink-0">
                      <Phone className="w-5 h-5 text-[#FF1E82] dark:text-[#FF4D8D]" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm">+91 98765 43210</span>
                  </div>
                  
                  <div className="flex items-center gap-3.5 sm:gap-4 text-[#121020] dark:text-white bg-white dark:bg-[#211F35] p-3 sm:p-3.5 rounded-[20px] border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-1 transition-transform">
                    <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] flex items-center justify-center text-[#121020] dark:text-[#9B7BFF] shrink-0">
                      <Mail className="w-5 h-5 text-[#7928CA] dark:text-[#9B7BFF]" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm">hello@stepup.com</span>
                  </div>
                </div>
              </div>

              {/* Form Card */}
              <div data-reveal="fade-left" className="delay-150 lg:w-1/2 w-full">
                <Card className="rounded-[28px] sm:rounded-[32px] border-2 border-[#121020] dark:border-[#39364F] bg-white dark:bg-[#211F35] p-5 sm:p-8 shadow-[6px_6px_0px_#121020] dark:shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#121020] dark:hover:shadow-[8px_8px_0px_#000000] transition-shadow">
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#121020] dark:text-white uppercase tracking-wide">First Name</label>
                        <input type="text" placeholder="John" className="w-full px-4 py-3 min-h-[46px] rounded-2xl bg-[#FAF7F2] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-white placeholder:text-[#9A96A8] dark:placeholder:text-[#6E6A82] focus:outline-none focus:bg-white dark:focus:bg-[#11101D] focus:border-[#FF1E82] dark:focus:border-[#FF4D8D] text-xs sm:text-sm font-semibold transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#121020] dark:text-white uppercase tracking-wide">Last Name</label>
                        <input type="text" placeholder="Doe" className="w-full px-4 py-3 min-h-[46px] rounded-2xl bg-[#FAF7F2] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-white placeholder:text-[#9A96A8] dark:placeholder:text-[#6E6A82] focus:outline-none focus:bg-white dark:focus:bg-[#11101D] focus:border-[#FF1E82] dark:focus:border-[#FF4D8D] text-xs sm:text-sm font-semibold transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#121020] dark:text-white uppercase tracking-wide">Email Address</label>
                      <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 min-h-[46px] rounded-2xl bg-[#FAF7F2] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-white placeholder:text-[#9A96A8] dark:placeholder:text-[#6E6A82] focus:outline-none focus:bg-white dark:focus:bg-[#11101D] focus:border-[#FF1E82] dark:focus:border-[#FF4D8D] text-xs sm:text-sm font-semibold transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-[#121020] dark:text-white uppercase tracking-wide">Message</label>
                      <textarea rows={3} placeholder="Tell us what dance styles interest you..." className="w-full px-4 py-3 rounded-2xl bg-[#FAF7F2] dark:bg-[#181729] border-2 border-[#121020] dark:border-[#39364F] text-[#121020] dark:text-white placeholder:text-[#9A96A8] dark:placeholder:text-[#6E6A82] focus:outline-none focus:bg-white dark:focus:bg-[#11101D] focus:border-[#FF1E82] dark:focus:border-[#FF4D8D] text-xs sm:text-sm font-semibold transition-all resize-none"></textarea>
                    </div>
                    <Button className="w-full h-13 sm:h-14 rounded-2xl bg-[#FF1E82] dark:bg-[#FF4D8D] hover:bg-[#E01370] dark:hover:bg-[#E01370] text-white font-black gap-2 border-2 border-[#121020] dark:border-[#39364F] shadow-[3px_3px_0px_#121020] dark:shadow-[3px_3px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#121020] dark:hover:shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 mt-2 text-sm sm:text-base transition-all">
                      <Send className="w-4 h-4" /> Send Message
                    </Button>
                  </form>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-[#121020] dark:bg-[#0E0D18] text-white py-14 border-t-3 border-[#121020] dark:border-[#39364F] text-center relative overflow-hidden transition-colors duration-200">
        {/* Colorful micro line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FFD200] via-[#FF1E82] to-[#7928CA] dark:from-[#FFD84D] dark:via-[#FF4D8D] dark:to-[#9B7BFF]" />

        <div data-reveal="fade-up" className="container mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFD200] dark:bg-[#FFD84D] border-2 border-white text-[#121020] flex items-center justify-center shadow-[2px_2px_0px_#FF1E82] dark:shadow-[2px_2px_0px_#FF4D8D]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <span className="font-black text-2xl text-white tracking-tight">
              Step<span className="text-[#FF1E82] dark:text-[#FF4D8D]">Up</span>
            </span>
          </div>
          <p className="text-sm font-bold text-gray-300 dark:text-[#C4C1D6]">Dance Your Way to a Better You.</p>
          <p className="text-xs text-gray-400 dark:text-[#8D8A9F] font-medium">© 2026 StepUp Dance Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
