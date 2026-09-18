"use client";

import { useState } from "react";
import Link from "next/link";
import { registerFreeTrialAction } from "@/actions/freeTrial";
import {
  Eye, EyeOff, Loader2, User, Mail, Phone, MapPin,
  Calendar, Music2, ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";

const DANCE_PROGRAMS = [
  "Hip Hop",
  "Bollywood",
  "Salsa",
  "Contemporary",
  "Classical / Bharatanatyam",
  "Western Freestyle",
  "Zumba / Fitness Dance",
  "Kids Dance",
];

const BATCH_OPTIONS = [
  "Morning (7 AM – 9 AM)",
  "Late Morning (10 AM – 12 PM)",
  "Afternoon (1 PM – 3 PM)",
  "Evening (5 PM – 7 PM)",
  "Night (7 PM – 9 PM)",
  "Weekend Only",
];

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER",     label: "Beginner",     desc: "New to dancing" },
  { value: "INTERMEDIATE", label: "Intermediate", desc: "1–3 years exp." },
  { value: "ADVANCED",     label: "Advanced",     desc: "3+ years exp." },
];

const BENEFITS = [
  "7 days of free studio access",
  "No credit card required",
  "Expert instructor guidance",
  "All dance styles included",
  "Cancel anytime, no commitment",
];

export default function FreeTrialPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [experience,   setExperience]   = useState("BEGINNER");

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await registerFreeTrialAction(formData);
      if (result && !result.success) {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch {
      // Next.js redirect() throws — swallow it
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-gray-900 placeholder:text-gray-400 px-4 text-sm outline-none transition-all";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";
  const sectionHeadClass = "text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2 mb-4 pb-2 border-b border-gray-100";

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-12 bg-white border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-gray-900">
            Step<span className="text-indigo-600">Up</span>
          </span>
        </Link>
        <p className="text-sm text-gray-500 font-medium hidden sm:block">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline font-semibold">
            Log in
          </Link>
        </p>
      </header>

      <div className="flex min-h-screen pt-16">

        {/* ── Left Info Panel ─────────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[38%] bg-white border-r border-gray-100 flex-col">
          <div className="flex-1 flex flex-col justify-center px-12 py-16">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest bg-indigo-50 rounded-full px-4 py-2 w-fit mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Free 7-Day Trial
            </div>

            <h2 className="text-4xl font-black leading-tight text-gray-900 mb-4">
              Start Your<br />
              Dance Journey<br />
              <span className="text-indigo-600">For Free.</span>
            </h2>

            <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-xs">
              No credit card. No commitment. Just 7 days to experience the studio and discover your dance style.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              {BENEFITS.map((text) => (
                <div key={text} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{text}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mt-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Your Journey</p>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-200" />
                <div className="space-y-5">
                  {[
                    { step: "Today",   label: "Register — Instant Access", active: true },
                    { step: "Day 1–7", label: "Attend Free Trial Classes",  active: false },
                    { step: "Day 7",   label: "Trial Ends",                 active: false },
                    { step: "Day 8+",  label: "Choose a Membership Plan",   active: false },
                  ].map(({ step, label, active }) => (
                    <div key={step} className="flex items-start gap-4 relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border-2 ${active ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                        {active ? "✓" : ""}
                      </div>
                      <div>
                        <span className={`text-xs font-bold ${active ? "text-indigo-600" : "text-gray-400"}`}>{step}</span>
                        <p className="text-xs text-gray-600 mt-0.5">{label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 md:px-10 lg:px-14 py-10 w-full">

            {/* Mobile badge */}
            <div className="lg:hidden mb-6">
              <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-widest bg-indigo-50 rounded-full px-4 py-2">
                <Sparkles className="w-3.5 h-3.5" />
                Free 7-Day Trial
              </div>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Register for Free Trial</h1>
              <p className="text-gray-400 mt-1.5 text-sm font-medium">
                No payment required — your 7-day trial begins immediately.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form action={handleSubmit} className="space-y-8">

              {/* ── Dance Preferences ─────────────────────────────────────── */}
              <div className="space-y-4">
                <p className={sectionHeadClass}>
                  <Music2 className="w-3.5 h-3.5" /> Dance Preferences
                </p>

                <div>
                  <label htmlFor="program" className={labelClass}>
                    Dance Program <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="program" name="program" required
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a dance program</option>
                    {DANCE_PROGRAMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredBatch" className={labelClass}>
                    Preferred Batch Time
                  </label>
                  <select
                    id="preferredBatch" name="preferredBatch"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Select preferred time (optional)</option>
                    {BATCH_OPTIONS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Experience Level <span className="text-red-400">*</span>
                  </label>
                  <input type="hidden" name="experienceLevel" value={experience} />
                  <div className="grid grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExperience(value)}
                        className={`text-left p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                          experience === value
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                            : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/40"
                        }`}
                      >
                        <span className="block font-bold">{label}</span>
                        <span className="block text-xs font-medium mt-0.5 opacity-70">{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Personal Information ───────────────────────────────────── */}
              <div className="space-y-4">
                <p className={sectionHeadClass}>
                  <User className="w-3.5 h-3.5" /> Personal Information
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={labelClass}>
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="firstName" name="firstName"
                      placeholder="First name" required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClass}>
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="lastName" name="lastName"
                      placeholder="Last name" required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className={labelClass}>Gender</label>
                    <select id="gender" name="gender" className={inputClass} defaultValue="">
                      <option value="">Select gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="dob" className={`${labelClass} flex items-center gap-1`}>
                      <Calendar className="w-3 h-3" /> Date of Birth
                    </label>
                    <input
                      id="dob" name="dob" type="date"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── Contact Details ────────────────────────────────────────── */}
              <div className="space-y-4">
                <p className={sectionHeadClass}>
                  <Phone className="w-3.5 h-3.5" /> Contact Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className={labelClass}>
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="email" name="email" type="email"
                        placeholder="you@example.com" required
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      Mobile Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="phone" name="phone" type="tel"
                        placeholder="+91 98765 43210" required
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className={`${labelClass} flex items-center gap-1`}>
                      <MapPin className="w-3 h-3" /> City / Area
                    </label>
                    <input
                      id="address" name="address"
                      placeholder="e.g. Bandra, Mumbai"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* ── Account Security ───────────────────────────────────────── */}
              <div className="space-y-4">
                <p className={sectionHeadClass}>Account Security</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className={labelClass}>
                      Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        required minLength={6}
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>
                      Confirm Password <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword" name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Repeat password"
                        required
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Submit ─────────────────────────────────────────────────── */}
              <div className="pt-2 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating your trial…
                    </>
                  ) : (
                    <>
                      Start My Free Trial
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 font-medium">
                  By registering, you agree to our Terms of Service. Your trial starts immediately after registration.
                </p>

                <p className="text-center text-sm text-gray-500 font-medium">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
