"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/actions/auth";
import {
  Eye, EyeOff, Loader2, User, Mail, Phone, MapPin,
  Calendar, ChevronRight, Sparkles, Music2
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [error,        setError]          = useState("");
  const [success,      setSuccess]        = useState(false);
  const [loading,      setLoading]        = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await registerAction(formData);
      if (result && !result.success) {
        setError(result.error || "Registration failed. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      // Next.js redirect() throws — swallow it
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "h-11 rounded-xl bg-white border-gray-200 focus:border-primary focus:ring-primary/20 text-gray-900 placeholder:text-gray-400";

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* ── Left Brand Panel ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-primary overflow-hidden flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-indigo-700 to-purple-900 opacity-95 z-0" />
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30 z-0"
        />

        {/* Decorative circles */}
        <div className="absolute top-20 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-20 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="relative z-10 h-full flex flex-col justify-between p-14 text-white">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Music2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight">Step<span className="text-[#6366F1]">Up</span></span>
          </Link>

          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 text-white/70 text-xs font-bold uppercase tracking-widest mb-5 bg-white/10 rounded-full px-4 py-1.5">
              <Sparkles className="w-3 h-3" /> Dance Membership
            </div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              Join Our<br />Dance Family
            </h2>
            <p className="text-white/75 text-base font-medium leading-relaxed max-w-xs">
              Join thousands of dancers who have found their rhythm. Expert instructors, flexible schedules, all styles.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Professional expert instructors",
                "Flexible batch schedules",
                "Multiple dance styles",
                "Online member portal",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/85 text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs font-medium">
            Already a member?{" "}
            <Link href="/login" className="text-white/70 hover:text-white underline transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-14 max-w-2xl mx-auto w-full">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Music2 className="w-6 h-6 text-primary" />
              <span className="font-black text-xl text-gray-900 tracking-tight">Step<span className="text-primary">Up</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Your Account</h1>
            <p className="text-gray-500 mt-1.5 font-medium text-sm">
              Create your member account and select a membership plan to start dancing.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-xl border border-green-100 font-medium flex items-center gap-2">
              🎉 Welcome to DanceStudio! Account created. Redirecting to choose your plan…
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            {/* Section: Personal Info */}
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Personal Information
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-gray-700 text-xs font-bold">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="firstName" name="firstName" placeholder="First name" required className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-gray-700 text-xs font-bold">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="lastName" name="lastName" placeholder="Last name" required className={fieldClass} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gender" className="text-gray-700 text-xs font-bold">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full h-11 rounded-xl bg-white border border-gray-200 text-gray-900 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob" className="text-gray-700 text-xs font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date of Birth
                  </Label>
                  <Input id="dob" name="dob" type="date" className={fieldClass} />
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Contact Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="email" className="text-gray-700 text-xs font-bold">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email" name="email" type="email"
                      placeholder="you@example.com" required
                      className={`${fieldClass} pl-9`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-gray-700 text-xs font-bold">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone" name="phone" type="tel"
                      placeholder="+91 98765 43210"
                      className={`${fieldClass} pl-9`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-gray-700 text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </Label>
                  <Input id="address" name="address" placeholder="City, State" className={fieldClass} />
                </div>
              </div>
            </div>

            {/* Section: Password */}
            <div>
              <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                Account Security
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-700 text-xs font-bold">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password" name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      required minLength={6}
                      className={`${fieldClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-gray-700 text-xs font-bold">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword" name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat password"
                      required
                      className={`${fieldClass} pr-10`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating your trial…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Start Free Trial
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
