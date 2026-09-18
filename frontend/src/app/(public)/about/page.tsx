import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Heart, Trophy, Users, Zap, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | Dance Studio",
  description: "Learn about our Dance Studio — our story, mission, values and the passionate team behind Mumbai's most vibrant dance community.",
};

export default async function AboutPage() {
  const [aboutSection, studioSettings] = await Promise.all([
    prisma.websiteSection.findUnique({ where: { sectionKey: "about" } }),
    prisma.studioSettings.findUnique({ where: { id: "default" } }),
  ]);

  let mission = "To make professional dance education accessible, joyful, and transformative for every individual — from the first-time dancer to the seasoned performer.";
  let vision = "To be India's most loved dance studio brand — known not just for the quality of our instruction, but for the warmth of our community.";
  let milestones = [
    { year: "2015", event: "Founded in a small studio with just 15 students and 1 instructor." },
    { year: "2018", event: "Expanded to a 3,000 sq ft studio, added Bollywood and Salsa programs." },
    { year: "2021", event: "Won Regional Dance Academy of the Year award." },
    { year: "2026", event: "Now 500+ active members and 25+ regular dance batches." },
  ];

  if (aboutSection?.data) {
    try {
      const parsed = JSON.parse(aboutSection.data);
      if (parsed.mission) mission = parsed.mission;
      if (parsed.vision) vision = parsed.vision;
      if (parsed.milestones && Array.isArray(parsed.milestones)) milestones = parsed.milestones;
    } catch {}
  }

  const values = [
    { icon: Heart, title: "Passion", desc: "We live and breathe dance. Every class is delivered with full heart and energy." },
    { icon: Users, title: "Community", desc: "Dance is better together. We're a family that celebrates every milestone." },
    { icon: Trophy, title: "Excellence", desc: "We hold ourselves to the highest teaching standards without being intimidating." },
    { icon: Zap, title: "Innovation", desc: "We constantly evolve our curriculum and techniques to stay fresh and relevant." },
  ];

  return (
    <>
      {/* Header */}
      <section className="py-20 lg:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF7700]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">
            {aboutSection?.title || "Our Story"}
          </p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
            About <span className="bg-gradient-to-r from-[#FF7700] to-[#FF007A] bg-clip-text text-transparent">Our Studio</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            {aboutSection?.subtitle || "Born from a love of movement, our studio has grown from a small dance class into Mumbai's most vibrant dance community."}
          </p>

          {/* Banner Image */}
          <div className="relative w-full max-w-4xl mx-auto h-[320px] md:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={aboutSection?.image || "/images/about-studio.jpg"}
              alt="Studio Dancers"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <p className="text-white font-extrabold text-xl md:text-2xl drop-shadow">
                {studioSettings?.studioName || "Mumbai's Premier Dance Studio & Training Center"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FF7700]/15 flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-[#FF7700]" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-4">Our Mission</h2>
              <p className="text-gray-400 leading-relaxed font-medium">{mission}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#FF007A]/15 flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-[#FF007A]" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-4">Our Vision</h2>
              <p className="text-gray-400 leading-relaxed font-medium">{vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="text-4xl font-black text-white">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-3xl p-7 text-center hover:border-white/20 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[#FF7700]/10 flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-6 h-6 text-[#FF7700]" />
                </div>
                <h3 className="font-extrabold text-white text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12 max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-3">How We Got Here</p>
            <h2 className="text-4xl font-black text-white">Our Journey</h2>
          </div>
          <div className="relative space-y-0">
            <div className="absolute left-[calc(80px+0.5rem)] top-0 bottom-0 w-px bg-white/10 hidden sm:block" />
            {milestones.map(({ year, event }) => (
              <div key={year} className="flex gap-6 pb-10 last:pb-0">
                <div className="w-20 shrink-0 text-right">
                  <span className="inline-block bg-[#FF7700]/10 border border-[#FF7700]/30 text-[#FF7700] font-extrabold text-sm px-3 py-1.5 rounded-full">{year}</span>
                </div>
                <div className="relative flex-1 pb-0">
                  <div className="absolute -left-[1.125rem] top-2 w-3 h-3 rounded-full bg-[#FF7700] border-2 border-[#0D0E14] hidden sm:block" />
                  <p className="text-gray-300 font-medium leading-relaxed pl-2 sm:pl-4">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-white mb-4">Be Part of Our Story</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto font-medium">
            Every great dance journey begins with a single step. Come take yours with us.
          </p>
          <Link href="/login">
            <Button className="rounded-full h-14 px-10 text-lg font-extrabold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-xl shadow-[#FF7700]/30">
              Join Our Studio <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
