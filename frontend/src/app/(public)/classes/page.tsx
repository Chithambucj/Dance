import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, DollarSign, Calendar, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Dance Classes | Dance Studio",
  description: "Explore all dance classes — Hip Hop, Bollywood, Salsa, Contemporary and more. Find the perfect class for your age and skill level.",
};

const styleColors: Record<string, string> = {
  "Hip Hop": "from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400",
  "Bollywood": "from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400",
  "Salsa": "from-red-500/20 to-red-600/10 border-red-500/30 text-red-400",
  "Contemporary": "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
};

const styleEmoji: Record<string, string> = {
  "Hip Hop": "🔥", "Bollywood": "✨", "Salsa": "💃", "Contemporary": "🎭",
};

const levels = ["Beginners", "Intermediate", "Advanced", "All Levels"];
const ageGroups = ["Kids (5–12)", "Teens (13–17)", "Adults (18+)", "All Ages"];

export default async function ClassesPage() {
  const classStyles = await prisma.classStyle.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  });

  const batches = await prisma.batch.findMany({
    where: { isActive: true },
    include: { classStyle: true, instructor: true },
  });

  return (
    <>
      {/* Header */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF7700]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">What We Offer</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Our Dance Classes</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Choose from a variety of dance styles and find the perfect class for you — all age groups and skill levels welcome.
          </p>
        </div>
      </section>

      {/* Class Style Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
            {classStyles.map((cls) => {
              const color = styleColors[cls.name] || "from-white/10 to-white/5 border-white/20 text-gray-300";
              const emoji = styleEmoji[cls.name] || "🎵";
              const classBatches = batches.filter((b) => b.classStyleId === cls.id);

              return (
                <div key={cls.id} className={`relative rounded-3xl bg-gradient-to-br ${color} border p-8 overflow-hidden hover:scale-[1.01] transition-transform duration-300 flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-5xl block mb-3">{emoji}</span>
                        <h2 className="text-3xl font-black text-white">{cls.name}</h2>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 text-white uppercase tracking-wide">
                          {cls.level || "All Levels"}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          {classBatches.length} Batch{classBatches.length !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 leading-relaxed mb-6 font-medium text-sm">{cls.description}</p>

                    <div className="flex items-center gap-4 mb-6 text-xs text-white font-bold">
                      <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-[#FF7700]" /> {cls.duration || "60 mins"}
                      </span>
                      <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10">
                        <DollarSign className="w-3.5 h-3.5 text-green-400" /> ₹{cls.price?.toLocaleString() || "1,500"} / month
                      </span>
                    </div>

                    {/* Batch timetable preview */}
                    {classBatches.length > 0 && (
                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Running Batches</p>
                        {classBatches.map((b) => (
                          <div key={b.id} className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5 text-xs">
                            <span className="font-bold text-white">{b.name}</span>
                            <span className="text-gray-400 font-medium">{b.schedule}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link href="/schedule" className="pt-2">
                    <Button className="rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 h-11 px-6 text-sm transition-all w-full sm:w-auto">
                      View Timetable <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Levels / Age Groups */}
      <section className="py-16 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xl font-extrabold text-white mb-6">Skill Levels</h3>
              <div className="space-y-3">
                {levels.map((l) => (
                  <div key={l} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF7700]" />
                    <span className="font-semibold text-gray-300 text-sm">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white mb-6">Age Groups</h3>
              <div className="space-y-3">
                {ageGroups.map((a) => (
                  <div key={a} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF007A]" />
                    <span className="font-semibold text-gray-300 text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Pick a Class?</h2>
          <p className="text-gray-400 text-lg mb-8 font-medium">Book a ₹499 trial class and find your rhythm.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule">
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/5 px-8 h-12 font-bold">
                View Full Schedule
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="rounded-full px-8 h-12 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110">
                Book Trial Class <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
