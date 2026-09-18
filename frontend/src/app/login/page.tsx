"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setLoading(true);
    try {
      const result = await loginAction(formData);
      if (result && !result.success) {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch {
      // Redirect throws an error internally in Next.js
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white font-sans">
      {/* ── Left Form Panel ───────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 lg:p-16">
        <header>
          <Link className="flex items-center gap-2 group w-fit" href="/">
            <div className="w-8 h-8 flex items-center justify-center text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <span className="font-bold text-xl text-primary tracking-tight">
              StepUp
            </span>
          </Link>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Log In</h1>
            <p className="text-gray-500 text-sm">Welcome back! Please log in to your account.</p>
          </div>

          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-semibold">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="h-12 rounded-xl bg-white border-gray-200 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl bg-white border-gray-200 focus:border-primary focus:ring-primary/20 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary font-semibold hover:underline">Forgot Password?</a>
            </div>

            <Button
              className="w-full h-12 text-base rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </span>
              ) : "Log In"}
            </Button>
            
            <p className="text-center text-sm text-gray-600 mt-6 pt-4">
              Don&apos;t have an account?{" "}
              <Link href="/free-trial" className="text-primary font-semibold hover:underline">Start Free Trial →</Link>
            </p>
          </form>
          
          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">👑 Studio Owner</span>
                <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">admin@dance.com / admin</code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">🎓 Member</span>
                <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">member@dance.com / password</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Brand Panel ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden flex-col rounded-l-3xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-900 opacity-90 z-0" />
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50 z-0"
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center p-16 text-white max-w-lg mx-auto w-full">
          <h2 className="text-5xl font-bold mb-4 leading-tight tracking-tight">
            Express. Learn. Grow.
          </h2>
          <p className="text-lg text-white/90 mb-10 font-medium">
            Be a part of our dance family today!
          </p>

          <div className="space-y-5">
            {[
              "Professional Guidance",
              "Flexible Schedules",
              "All Age Groups"
            ].map((text) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border border-white/40 flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-base font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
