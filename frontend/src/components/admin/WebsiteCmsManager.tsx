"use client";

import { useState, useTransition } from "react";
import { updateWebsiteSection } from "@/actions/cms";
import { Globe, Sparkles, Loader2, Save, Layers, Heart, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Section {
  id: string;
  sectionKey: string;
  title: string | null;
  subtitle: string | null;
  heading: string | null;
  highlightedText: string | null;
  description: string | null;
  badgeText: string | null;
  primaryBtnText: string | null;
  primaryBtnLink: string | null;
  secondaryBtnText: string | null;
  secondaryBtnLink: string | null;
  image: string | null;
  data: string | null;
  isPublished: boolean;
}

interface WebsiteCmsManagerProps {
  sections: Section[];
}

export default function WebsiteCmsManager({ sections }: WebsiteCmsManagerProps) {
  const [activeSection, setActiveSection] = useState<"hero" | "about" | "why_choose_us" | "stats">("hero");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentSection = sections.find((s) => s.sectionKey === activeSection);

  function handleSave(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await updateWebsiteSection(activeSection, formData);
      if (res.success) {
        setSuccess(`✅ ${activeSection.toUpperCase()} section updated and published to website!`);
        setTimeout(() => setSuccess(""), 3500);
      } else {
        setError(res.error || "Failed to update website section.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Website Content CMS</h1>
          <p className="text-gray-500 mt-1 font-medium">Control the text, banners, badges, and stories across the public website.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm">
          {success}
        </div>
      )}

      {/* Section Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {[
          { id: "hero", label: "Hero Banner", icon: Sparkles },
          { id: "about", label: "About & Story", icon: Heart },
          { id: "why_choose_us", label: "Why Choose Us", icon: Layers },
          { id: "stats", label: "Milestone Stats", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all ${
                active
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Editor Form */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
        <form key={activeSection} action={handleSave} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">{error}</div>
          )}

          {activeSection === "hero" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Hero Heading (First Line)</Label>
                  <Input
                    name="heading"
                    defaultValue={currentSection?.heading || "Dance Your Way"}
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Highlighted Text (Gradient)</Label>
                  <Input
                    name="highlightedText"
                    defaultValue={currentSection?.highlightedText || "to a Better You"}
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-bold text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Badge Tagline (Top Pill)</Label>
                <Input
                  name="badgeText"
                  defaultValue={currentSection?.badgeText || "🔥 Summer Admissions Open • 2026 Batch"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Hero Description</Label>
                <textarea
                  name="description"
                  defaultValue={currentSection?.description || "Experience the joy of movement with Mumbai's premier dance community."}
                  rows={3}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Primary Button Text &amp; Link</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="primaryBtnText" defaultValue={currentSection?.primaryBtnText || "Explore Classes"} className="rounded-xl bg-gray-50 h-11" />
                    <Input name="primaryBtnLink" defaultValue={currentSection?.primaryBtnLink || "/classes"} className="rounded-xl bg-gray-50 h-11" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Secondary Button Text &amp; Link</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="secondaryBtnText" defaultValue={currentSection?.secondaryBtnText || "View Schedule"} className="rounded-xl bg-gray-50 h-11" />
                    <Input name="secondaryBtnLink" defaultValue={currentSection?.secondaryBtnLink || "/schedule"} className="rounded-xl bg-gray-50 h-11" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Hero Background / Right Image URL</Label>
                <Input
                  name="image"
                  defaultValue={currentSection?.image || "/images/about-studio.jpg"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>
          )}

          {activeSection === "about" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Section Title</Label>
                  <Input name="title" defaultValue={currentSection?.title || "Our Story"} className="rounded-xl bg-gray-50 h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-gray-700 font-semibold text-sm">Banner Image URL</Label>
                  <Input name="image" defaultValue={currentSection?.image || "/images/about-studio.jpg"} className="rounded-xl bg-gray-50 h-11" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Subtitle / Intro</Label>
                <Input
                  name="subtitle"
                  defaultValue={currentSection?.subtitle || "Born from a love of movement, our studio has grown into Mumbai's most vibrant dance family."}
                  className="rounded-xl bg-gray-50 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Mission &amp; Vision Statement (JSON or Text)</Label>
                <textarea
                  name="data"
                  defaultValue={currentSection?.data || ""}
                  rows={6}
                  placeholder='{"mission": "...", "vision": "...", "milestones": [...]}'
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {activeSection === "why_choose_us" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Section Title</Label>
                <Input name="title" defaultValue={currentSection?.title || "Why Dance With Us?"} className="rounded-xl bg-gray-50 h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Feature Points (JSON Array)</Label>
                <textarea
                  name="data"
                  defaultValue={currentSection?.data || ""}
                  rows={8}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {activeSection === "stats" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Section Title</Label>
                <Input name="title" defaultValue={currentSection?.title || "Studio Milestones"} className="rounded-xl bg-gray-50 h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Milestone Counters (JSON Array)</Label>
                <textarea
                  name="data"
                  defaultValue={currentSection?.data || ""}
                  rows={6}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={currentSection?.isPublished ?? true}
                className="w-4 h-4 rounded text-primary"
              />
              Publish this section to public website
            </label>

            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11 gap-2 shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Section...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save &amp; Publish Section
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
