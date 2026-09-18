import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight, Ticket, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Events & Workshops | Dance Studio",
  description: "Upcoming events, performances, battles and masterclasses at our Dance Studio.",
};

const categoryColor: Record<string, string> = {
  Showcase: "bg-[#FF7700]/10 text-[#FF7700] border-[#FF7700]/30",
  Workshop: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  Competition: "bg-red-500/10 text-red-400 border-red-500/30",
  "Special Class": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  Event: "bg-green-500/10 text-green-400 border-green-500/30",
};

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { eventDate: "asc" },
  });

  const featuredEvent = events[0];
  const otherEvents = events.slice(1);

  return (
    <>
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF007A]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">What&apos;s On</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Upcoming Events &amp; Workshops</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Showcases, street battles, open socials and intensive masterclasses — explore what&apos;s happening next.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-12 space-y-8">
          {/* Featured Event */}
          {featuredEvent && (
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FF7700]/20 via-[#FF007A]/10 to-[#7C3AED]/10 border border-[#FF7700]/30 p-8 md:p-10">
              <div className="absolute top-6 right-6">
                <span className="text-xs font-extrabold px-3 py-1.5 rounded-full bg-[#FF7700] text-white shadow-md">
                  ⭐ Next Featured Event
                </span>
              </div>
              <div className="max-w-2xl space-y-4">
                <span className={`inline-block text-xs font-black uppercase px-3 py-1 rounded-full border ${categoryColor[featuredEvent.category] || "bg-white/10 text-white"}`}>
                  {featuredEvent.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-white">{featuredEvent.title}</h2>
                <p className="text-gray-300 leading-relaxed font-medium text-sm">{featuredEvent.description}</p>
                <div className="flex flex-wrap gap-5 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <Calendar className="w-4 h-4 text-[#FF7700]" />
                    {new Date(featuredEvent.eventDate).toLocaleDateString("en-IN", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </div>
                  {featuredEvent.startTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                      <Clock className="w-4 h-4 text-[#FF7700]" /> {featuredEvent.startTime}
                      {featuredEvent.endTime && ` – ${featuredEvent.endTime}`}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <MapPin className="w-4 h-4 text-[#FF7700]" /> {featuredEvent.location || "Main Studio Hall"}
                  </div>
                </div>
                {featuredEvent.registrationLink ? (
                  <a href={featuredEvent.registrationLink} target="_blank" rel="noreferrer">
                    <Button className="rounded-full h-12 px-8 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-lg shadow-[#FF7700]/25 gap-2">
                      <Ticket className="w-4 h-4" /> Register for Event <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                ) : (
                  <Link href="/contact">
                    <Button className="rounded-full h-12 px-8 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-lg shadow-[#FF7700]/25">
                      <Ticket className="w-4 h-4 mr-2" /> Inquire / Join
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Other Events Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {otherEvents.map((event) => (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${categoryColor[event.category] || "bg-white/10 text-white"}`}>
                    {event.category}
                  </span>
                  <h3 className="text-xl font-black text-white">{event.title}</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3">{event.description}</p>
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-2 text-[#FF7700] font-bold">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {new Date(event.eventDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    {event.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {event.startTime}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {event.location || "Main Studio"}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {event.registrationLink ? (
                    <a href={event.registrationLink} target="_blank" rel="noreferrer" className="w-full block">
                      <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-white/15 text-white hover:bg-white/10 gap-1.5">
                        Register Online <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  ) : (
                    <Link href="/contact" className="w-full block">
                      <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-white/15 text-white hover:bg-white/10">
                        Learn More
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl p-12">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold text-base">No upcoming events scheduled right now.</p>
              <p className="text-gray-500 text-xs mt-1">Check back soon for workshops and showcases!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
