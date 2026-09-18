import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Contact Us | Dance Studio",
  description: "Get in touch with our Dance Studio. Visit our studio, call us, or send a message — we'd love to welcome you.",
};

export default async function ContactPage() {
  const settings = await prisma.studioSettings.findUnique({ where: { id: "default" } });

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Studio",
      lines: [settings?.address || "123 Dance Avenue, Bandra West, Mumbai, Maharashtra 400050"],
    },
    {
      icon: Phone,
      title: "Call / WhatsApp",
      lines: [settings?.phone || "+91 98765 43210", settings?.whatsapp ? `WhatsApp: ${settings.whatsapp}` : "+91 98765 43211 (WhatsApp)"],
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: [settings?.email || "hello@dancestudio.com", "admissions@dancestudio.com"],
    },
    {
      icon: Clock,
      title: "Operating Hours",
      lines: [settings?.businessHours || "Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 2:00 PM"],
    },
  ];

  return (
    <>
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF7700]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-4">Get in Touch</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">Contact Us</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto font-medium">
            Have a question or ready to join? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-5">
              {contactInfo.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-11 h-11 rounded-xl bg-[#FF7700]/10 border border-[#FF7700]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#FF7700]" />
                  </div>
                  <div>
                    <p className="font-extrabold text-white text-sm mb-1">{title}</p>
                    {lines.map((l) => (
                      <p key={l} className="text-sm text-gray-400 font-medium">{l}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Google Maps link */}
              <div className="rounded-2xl p-6 border border-white/10 bg-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
                    <MapPin className="w-5 h-5 text-[#FF7700]" /> Studio Location
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{settings?.address}</p>
                </div>
                {settings?.googleMapsUrl && (
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold transition-all border border-white/15"
                  >
                    Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <h2 className="text-2xl font-extrabold text-white mb-2">Send us a Message</h2>
                <p className="text-gray-500 text-sm font-medium mb-8">We&apos;ll get back to you within 24 hours.</p>

                <form className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-400">First Name *</label>
                      <input
                        type="text"
                        placeholder="John"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7700]/30 focus:border-[#FF7700]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-400">Last Name *</label>
                      <input
                        type="text"
                        placeholder="Smith"
                        required
                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7700]/30 focus:border-[#FF7700]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7700]/30 focus:border-[#FF7700]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7700]/30 focus:border-[#FF7700]/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-400">Message *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about yourself, which dance style you're interested in, or any questions..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF7700]/30 focus:border-[#FF7700]/50 transition-all resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 shadow-lg shadow-[#FF7700]/25 transition-all"
                  >
                    <Send className="w-4 h-4 mr-2" /> Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
