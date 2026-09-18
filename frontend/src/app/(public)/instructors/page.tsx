import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Award } from "lucide-react";

export const metadata = {
  title: "Our Instructors | Dance Studio",
  description: "Meet the passionate dance instructors at our studio — professional, experienced, and dedicated to your growth.",
};

export default async function InstructorsPage() {
  const instructors = await prisma.user.findMany({
    where: { isInstructor: true, status: "ACTIVE" },
    include: {
      instructingBatches: { include: { classStyle: true } },
    },
    orderBy: { firstName: "asc" },
  });

  const gradients = [
    "from-[#FF7700] to-[#FF007A]",
    "from-[#FF007A] to-[#7C3AED]",
    "from-[#7C3AED] to-[#00D2FF]",
    "from-[#00D2FF] to-[#FF7700]",
  ];

  return (
    <>
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF007A]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">The Faculty</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Meet Our Instructors</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Learn from the best — certified, passionate choreographers who love what they teach.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-12">
          {instructors.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {instructors.map((ins, i) => {
                const styles = ins.specialities
                  ? ins.specialities.split(",").map((s) => s.trim())
                  : [...new Set(ins.instructingBatches.map((b) => b.classStyle.name))];
                const grad = gradients[i % gradients.length];

                return (
                  <div key={ins.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all group flex flex-col justify-between">
                    <div>
                      {/* Avatar Header */}
                      <div className={`h-44 bg-gradient-to-br ${grad} flex items-center justify-center relative`}>
                        <div className="w-24 h-24 rounded-full bg-black/40 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white font-black text-3xl shadow-2xl">
                          {ins.firstName.charAt(0)}{ins.lastName.charAt(0)}
                        </div>
                        <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md">
                          {ins.experience || "5+ Years Exp"}
                        </span>
                      </div>

                      <div className="p-6 space-y-3">
                        <div>
                          <h3 className="text-2xl font-black text-white">
                            {ins.firstName} {ins.lastName}
                          </h3>
                          <p className="text-xs text-[#FF7700] font-bold mt-0.5">Faculty Member</p>
                        </div>

                        {ins.bio && (
                          <p className="text-xs text-gray-300 leading-relaxed font-medium line-clamp-3">
                            {ins.bio}
                          </p>
                        )}

                        {styles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {styles.map((s) => (
                              <span key={s} className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#FF7700]/10 text-[#FF7700] border border-[#FF7700]/20">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-white/5 mt-4">
                      <p className="text-xs text-gray-400 font-semibold flex items-center justify-between">
                        <span>Active Batches</span>
                        <span className="text-white font-bold">{ins.instructingBatches.length} Classes</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 font-medium">Instructor profiles coming soon!</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-[#0D0E14] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-3">Learn From the Best</h2>
          <p className="text-gray-400 mb-6 font-medium">Start your journey with a ₹499 trial class today.</p>
          <Link href="/pricing">
            <Button className="rounded-full px-8 h-12 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-lg shadow-[#FF7700]/25">
              Book a Class <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
