import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Class Schedule | Dance Studio",
  description: "Browse all active batches at our studio by dance style, timing and instructor.",
};

export default async function SchedulePage() {
  const batches = await prisma.batch.findMany({
    include: {
      classStyle:  true,
      instructor:  true,
      enrollments: { where: { status: "ACTIVE" } },
    },
    orderBy: { name: "asc" },
  });

  const grouped = batches.reduce<Record<string, typeof batches>>((acc, b) => {
    const key = b.classStyle.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});

  const styleColor: Record<string, string> = {
    "Hip Hop":      "bg-orange-500/10 text-orange-400 border-orange-500/30",
    "Bollywood":    "bg-pink-500/10   text-pink-400   border-pink-500/30",
    "Salsa":        "bg-red-500/10    text-red-400    border-red-500/30",
    "Contemporary": "bg-blue-500/10   text-blue-400   border-blue-500/30",
  };

  return (
    <>
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF7700]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">Timetable</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Class Schedule</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Browse all active batches and find a time that works for you.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-12 space-y-12">
          {Object.entries(grouped).map(([styleName, styleBatches]) => (
            <div key={styleName}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-extrabold text-white">{styleName}</h2>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${styleColor[styleName] ?? "bg-white/10 text-gray-400 border-white/20"}`}>
                  {styleBatches.length} batch{styleBatches.length !== 1 ? "es" : ""}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {styleBatches.map((batch) => {
                  const spots = batch.capacity - batch.enrollments.length;
                  return (
                    <div key={batch.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-extrabold text-white text-lg">{batch.name}</h3>
                        <span className={`text-[10px] font-extrabold px-2 py-1 rounded-full ${spots > 5 ? "bg-green-500/10 text-green-400" : spots > 0 ? "bg-orange-500/10 text-orange-400" : "bg-red-500/10 text-red-400"}`}>
                          {spots > 0 ? `${spots} spots left` : "Full"}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm mb-5">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4 text-[#FF7700] shrink-0" />
                          <span className="font-medium">{batch.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4 text-[#FF7700] shrink-0" />
                          <span className="font-medium">
                            {batch.enrollments.length}/{batch.capacity} enrolled
                            {batch.instructor && ` · ${batch.instructor.firstName} ${batch.instructor.lastName}`}
                          </span>
                        </div>
                      </div>
                      {spots > 0 && (
                        <Link href="/login">
                          <Button className="w-full rounded-xl h-10 text-sm font-bold bg-[#FF7700]/10 hover:bg-[#FF7700]/20 text-[#FF7700] border border-[#FF7700]/30 transition-all">
                            Enroll Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <p className="text-center py-20 text-gray-500 font-medium">No batches scheduled yet. Check back soon!</p>
          )}
        </div>
      </section>

      <section className="py-16 bg-[#0D0E14] text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-3">Can't Find a Suitable Time?</h2>
          <p className="text-gray-400 mb-6 font-medium">Contact us and we'll work something out.</p>
          <Link href="/contact">
            <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/5 px-8 h-12 font-bold">
              Contact Us <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
