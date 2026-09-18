import Link from "next/link";
import { Globe, MapPin, Phone, Mail, Clock, Share2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

const quickLinks = [
  { href: "/classes",     label: "Our Classes"   },
  { href: "/schedule",    label: "Class Schedule" },
  { href: "/instructors", label: "Instructors"    },
  { href: "/events",      label: "Events"         },
  { href: "/gallery",     label: "Gallery"        },
  { href: "/pricing",     label: "Pricing"        },
  { href: "/contact",     label: "Contact"        },
];

export default async function PublicFooter() {
  const settings = await prisma.studioSettings.findUnique({ where: { id: "default" } });

  return (
    <footer className="bg-[#07080B] text-gray-400 border-t border-white/10">
      <div className="container mx-auto px-4 lg:px-12 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <span className="font-extrabold text-xl text-white tracking-tight">
                {settings?.studioName || <>Dance<span className="text-[#FF7700]">Studio</span></>}
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              {settings?.description || "Premier dance studio offering world-class instruction in Hip Hop, Bollywood, Salsa, and Contemporary styles."}
            </p>
            <div className="flex items-center gap-3">
              {settings?.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FF7700] hover:border-[#FF7700]/40 transition-all text-xs font-bold"
                >
                  IG
                </a>
              )}
              {settings?.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FF7700] hover:border-[#FF7700]/40 transition-all text-xs font-bold"
                >
                  FB
                </a>
              )}
              {settings?.youtube && (
                <a
                  href={settings.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#FF7700] hover:border-[#FF7700]/40 transition-all text-xs font-bold"
                >
                  YT
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-[#FF7700] transition-colors font-medium">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio Hours */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Operating Hours</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              {settings?.businessHours || "Mon-Sat: 7:00 AM - 9:00 PM, Sun: 8:00 AM - 2:00 PM"}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">Contact Studio</h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF7700] shrink-0 mt-0.5" />
                <span>{settings?.address || "123 Dance Ave, Bandra West, Mumbai"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF7700] shrink-0" />
                <a href={`tel:${settings?.phone}`} className="hover:text-[#FF7700] transition-colors">
                  {settings?.phone || "+91 98765 43210"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF7700] shrink-0" />
                <a href={`mailto:${settings?.email}`} className="hover:text-[#FF7700] transition-colors">
                  {settings?.email || "hello@dancestudio.com"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2026 {settings?.studioName || "Dance Studio"}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="/about" className="hover:text-gray-400 transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
