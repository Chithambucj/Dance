import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ArrowRight, Star, Shield, Users, Award,
  Music, Clock, ChevronRight, Check, Heart, Trophy, Calendar, MapPin
} from "lucide-react";

export const metadata = {
  title: "Dance Studio | Move • Groove • Inspire",
  description: "Join our Dance Studio for Hip Hop, Bollywood, Salsa & Contemporary classes. Expert instructors, flexible schedules, all age groups. Book a trial class today!",
};

export default async function HomePage() {
  const [
    heroSection,
    aboutSection,
    whySection,
    statsSection,
    classStyles,
    instructors,
    featuredEvents,
    featuredGallery,
    pricingPlans,
    memberCount,
    batchCount,
    studioSettings,
  ] = await Promise.all([
    prisma.websiteSection.findUnique({ where: { sectionKey: "hero" } }),
    prisma.websiteSection.findUnique({ where: { sectionKey: "about" } }),
    prisma.websiteSection.findUnique({ where: { sectionKey: "why_choose_us" } }),
    prisma.websiteSection.findUnique({ where: { sectionKey: "stats" } }),
    prisma.classStyle.findMany({ where: { isPublished: true }, orderBy: { displayOrder: "asc" }, take: 4 }),
    prisma.user.findMany({ where: { isInstructor: true, status: "ACTIVE" }, take: 4 }),
    prisma.event.findMany({ where: { isPublished: true }, orderBy: { eventDate: "asc" }, take: 3 }),
    prisma.media.findMany({ where: { isPublished: true, isFeatured: true }, orderBy: { displayOrder: "asc" }, take: 6 }),
    prisma.pricingPlan.findMany({ where: { isPublished: true }, orderBy: { displayOrder: "asc" }, take: 4 }),
    prisma.user.count({ where: { role: "MEMBER" } }),
    prisma.batch.count({ where: { isActive: true } }),
    prisma.studioSettings.findUnique({ where: { id: "default" } }),
  ]);

  // Parse why choose us points
  let whyPoints = [
    { title: "World-Class Choreographers", desc: "Learn from certified, award-winning dancers with national stage experience." },
    { title: "Premium Acoustic Studio", desc: "Sprung wooden flooring designed to prevent joint injuries and enhance movement." },
    { title: "Flexible Batch Schedules", desc: "Morning, evening, and weekend batches tailored for busy lifestyles." },
    { title: "Stage & Showcase Opportunities", desc: "Perform in annual showcases, music video shoots, and competitions." },
  ];
  if (whySection?.data) {
    try {
      whyPoints = JSON.parse(whySection.data);
    } catch {}
  }

  // Parse stats
  let statCounters = [
    { value: `${memberCount || 500}+`, label: "Happy Students" },
    { value: `${batchCount || 20}+`, label: "Active Batches" },
    { value: `${classStyles.length || 10}+`, label: "Dance Styles" },
    { value: "15+", label: "Years Experience" },
  ];
  if (statsSection?.data) {
    try {
      statCounters = JSON.parse(statsSection.data);
    } catch {}
  }

  const danceStyleIcons: Record<string, string> = {
    "Hip Hop": "🔥",
    "Bollywood": "✨",
    "Salsa": "💃",
    "Contemporary": "🎭",
  };

  return (
    <>
      {/* ── 1. Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF7700]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FF007A]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#FF7700]/10 border border-[#FF7700]/30 px-5 py-2 text-sm font-bold text-[#FF7700]">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {heroSection?.badgeText || studioSettings?.tagline || "Move • Groove • Inspire"}
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
              {heroSection?.heading || "Dance Your Way"}{" "}
              <span className="bg-gradient-to-r from-[#FF7700] via-[#FF007A] to-[#00D2FF] bg-clip-text text-transparent">
                {heroSection?.highlightedText || "to Pure Joy"}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {heroSection?.description || studioSettings?.description || "Join our Dance Studio — professional instruction, energetic classes, and a community that celebrates every step of your dance journey."}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href={heroSection?.primaryBtnLink || "/classes"}>
                <Button className="rounded-full h-14 px-8 text-lg font-extrabold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-xl shadow-[#FF7700]/30 transition-all">
                  {heroSection?.primaryBtnText || "Explore Classes"} <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href={heroSection?.secondaryBtnLink || "/schedule"}>
                <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-white/20 text-white hover:bg-white/5 transition-all">
                  {heroSection?.secondaryBtnText || "View Schedule"}
                </Button>
              </Link>
            </div>

            {/* Hero Counters */}
            <div className="flex flex-wrap justify-center gap-8 pt-6">
              {statCounters.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Classes Preview ──────────────────────────────── */}
      <section className="py-20 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-2">Programs &amp; Styles</p>
              <h2 className="text-4xl md:text-5xl font-black text-white">Popular Dance Styles</h2>
            </div>
            <Link href="/classes" className="text-sm font-bold text-[#FF7700] hover:text-white flex items-center gap-1 transition-colors">
              View All Styles <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classStyles.map((cs) => (
              <div key={cs.id} className="group relative bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#FF7700]/50 transition-all duration-300 flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF7700]/20 to-[#FF007A]/20 flex items-center justify-center text-2xl">
                    {danceStyleIcons[cs.name] || "💃"}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white group-hover:text-[#FF7700] transition-colors">{cs.name}</h3>
                    <span className="text-xs font-bold text-[#FF7700]">{cs.level || "All Levels"}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{cs.description}</p>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-4">
                  <span className="text-sm font-bold text-white">₹{cs.price?.toLocaleString() || "1,500"}/mo</span>
                  <Link href="/classes" className="text-xs font-bold text-[#FF7700] hover:underline flex items-center gap-1">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Why Choose Us ────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest">Why Choose Us</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">{whySection?.title || "Built For Dancers, Run With Heart"}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyPoints.map(({ title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-3xl p-7 hover:border-white/20 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FF7700]/10 flex items-center justify-center text-[#FF7700]">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-white text-lg">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Upcoming Events Preview ───────────────────────── */}
      {featuredEvents.length > 0 && (
        <section className="py-20 bg-[#0D0E14]">
          <div className="container mx-auto px-4 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-2">Workshops &amp; Battles</p>
                <h2 className="text-4xl md:text-5xl font-black text-white">Upcoming Events</h2>
              </div>
              <Link href="/events" className="text-sm font-bold text-[#FF7700] hover:text-white flex items-center gap-1">
                View All Events <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map((evt) => (
                <div key={evt.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between hover:border-white/25 transition-all">
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-[#FF7700]/20 text-[#FF7700] border border-[#FF7700]/30">
                      {evt.category}
                    </span>
                    <h3 className="text-xl font-black text-white leading-snug">{evt.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{evt.description}</p>
                    <p className="text-xs font-bold text-[#FF7700] flex items-center gap-2 pt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(evt.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      {evt.startTime && ` • ${evt.startTime}`}
                    </p>
                  </div>
                  <Link href="/events" className="pt-4 border-t border-white/10 text-xs font-bold text-white hover:text-[#FF7700] flex items-center justify-between">
                    <span>Event Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Instructors Preview ──────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest">Our Faculty</p>
            <h2 className="text-4xl md:text-5xl font-black text-white">Learn From The Best</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((ins) => (
              <div key={ins.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group hover:border-white/20 transition-all p-6 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF7700] to-[#FF007A] flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl">
                  {ins.firstName.charAt(0)}{ins.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-white text-xl">{ins.firstName} {ins.lastName}</h3>
                  <p className="text-xs text-[#FF7700] font-bold mt-1">{ins.specialities || "Dance Choreographer"}</p>
                  <p className="text-xs text-gray-400 font-medium mt-2 line-clamp-2">{ins.bio || `${ins.experience || "5+ Years"} teaching experience.`}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-10">
            <Link href="/instructors">
              <Button variant="outline" className="rounded-full px-8 h-12 font-bold border-white/20 text-white hover:bg-white/5">
                Meet All Faculty
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. Pricing Preview ────────────────────── */}
      <section className="py-20 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Free Trial Hero Card */}
          <div className="text-center mb-16">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">Start Free</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Your First{" "}
              <span className="bg-gradient-to-r from-[#FF7700] to-[#FF007A] bg-clip-text text-transparent">
                7 Days Are Free
              </span>
            </h2>
            <p className="text-gray-400 font-medium max-w-md mx-auto mb-8">
              No credit card. No commitment. Register and start dancing today.
            </p>
            <Link href="/free-trial">
              <Button className="rounded-full h-14 px-10 text-base font-black bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 text-white shadow-xl shadow-[#FF7700]/20">
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-white/10" />
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest whitespace-nowrap">
              After Trial — Choose a Plan
            </p>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.filter(p => p.billingPeriod !== "TRIAL").map((p) => {
              let features: string[] = [];
              try {
                features = JSON.parse(p.features);
              } catch {
                features = [p.features];
              }

              return (
                <div
                  key={p.id}
                  className={`bg-white/5 border rounded-3xl p-6 flex flex-col justify-between transition-all ${
                    p.isFeatured ? "border-[#FF7700] bg-[#FF7700]/5 shadow-xl shadow-[#FF7700]/10 relative" : "border-white/10"
                  }`}
                >
                  {p.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-black text-white text-xl">{p.name}</h3>
                      <p className="text-xs text-gray-400 font-medium">{p.description}</p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">₹{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">{p.period}</span>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      {features.map((f, idx) => (
                        <p key={idx} className="text-xs text-gray-300 font-medium flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#FF7700] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <Link href="/free-trial" className="pt-6">
                    <Button className={`w-full rounded-2xl font-bold h-11 ${
                      p.isFeatured ? "bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white" : "bg-white/10 text-white hover:bg-white/20"
                    }`}>
                      Start Free Trial First
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. CTA Banner ─────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <div className="bg-gradient-to-r from-[#FF7700] via-[#FF007A] to-[#7B2CBF] rounded-3xl p-12 lg:p-16 text-center text-white space-y-6 shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-black">Ready to Take Your First Step?</h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto font-medium">
              Start with a FREE 7-day trial. No credit card. No commitment. Just dance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/free-trial">
                <Button className="rounded-full h-14 px-8 text-lg font-black bg-white text-black hover:bg-gray-100 shadow-xl">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="rounded-full h-14 px-8 text-lg font-bold border-white/40 text-white hover:bg-white/10">
                  Visit Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
