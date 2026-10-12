"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, Star, Sparkles, Music2, ArrowRight, Loader2,
  Calendar, Clock, Shield, X, CreditCard, ChevronRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  billingPeriod: string;
  durationDays: number;
  classesIncluded: string | null;
  features: string;
  isFeatured: boolean;
  badge: string | null;
}

interface Membership {
  id: string;
  membershipNumber: string;
  status: string;
  plan: Plan;
  expiryDate: Date;
}

interface FreeTrialData {
  id: string;
  program: string;
  preferredBatch?: string | null;
  experienceLevel: string;
  trialStartDate: Date;
  trialEndDate: Date;
  status: string;
}

interface Props {
  plans: Plan[];
  currentMembership: Membership | null;
  userName: string;
  membershipStatus?: string;
  freeTrial?: FreeTrialData | null;
  isExpired?: boolean;
  hasPaidMembership?: boolean;
}

export default function PlanSelectionClient({ 
  plans, 
  currentMembership, 
  userName,
  membershipStatus,
  freeTrial,
  isExpired,
  hasPaidMembership
}: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep]                 = useState<"select" | "confirm" | "paying">("select");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  function getFeatures(plan: Plan): string[] {
    try { return JSON.parse(plan.features); }
    catch { return [plan.features].filter(Boolean); }
  }

  function calcExpiry(durationDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + durationDays);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  async function handleProceedToPayment() {
    if (!selectedPlan) return;
    setLoading(true);
    setError("");

    try {
      // 1. Create Razorpay order on backend
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan.id }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // Check if Razorpay key is configured
      if (!orderData.keyId || orderData.keyId === "") {
        // Redirect to demo payment page (dev mode without Razorpay keys)
        router.push(`/payment?planId=${selectedPlan.id}&orderId=${orderData.orderId}&demo=true`);
        return;
      }

      // 2. Load Razorpay checkout script
      await loadRazorpayScript();

      // 3. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dance Studio",
        description: selectedPlan.name,
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStep("paying");
          // 4. Verify on backend
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              planId: selectedPlan.id,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            router.push(
              `/payment/success?membership=${verifyData.membershipNumber}&plan=${encodeURIComponent(verifyData.planName)}&expiry=${verifyData.expiryDate}`
            );
          } else {
            router.push("/payment/failed?reason=verification_failed");
          }
        },
        prefill: { name: userName },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setStep("confirm");
            setLoading(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Payment gateway failed to load. Please check your connection or disable adblockers.");
      }
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setStep("confirm");
      setLoading(false);
    }
  }

  function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector("script[src*='razorpay']")) { resolve(); return; }
      const script = document.createElement("script");
      script.src   = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error("Failed to load Razorpay checkout script. Please disable any adblockers and try again."));
      };
      document.body.appendChild(script);
    });
  }

  // ── Existing active membership banner ─────────────────────────────────────
  if (currentMembership && step === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">You already have an active membership!</h1>
          <p className="text-gray-500 mb-2 font-medium">
            {currentMembership.plan.name}
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Valid until{" "}
            <span className="font-bold text-gray-600">
              {new Date(currentMembership.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </p>
          <Link href="/member">
            <Button className="w-full h-12 rounded-xl font-bold bg-primary text-white">
              Go to Member Portal <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative flex flex-col justify-between overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-5 pb-2 lg:py-3 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Music2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="font-black text-white text-base lg:text-lg">DanceStudio</span>
        </Link>
        {userName ? (
          <Link href="/member/dashboard" className="text-white/80 hover:text-white text-xs lg:text-sm font-semibold transition-colors flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full backdrop-blur">
            ← Member Dashboard
          </Link>
        ) : (
          <Link href="/login" className="text-white/60 hover:text-white text-xs lg:text-sm font-medium transition-colors">
            Already a member? Log in
          </Link>
        )}
      </header>

      {/* Plan Selection */}
      {step === "select" && (
        <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-center items-center py-2 lg:py-0">
          <div className="text-center mb-4 lg:mb-5 shrink-0 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur rounded-full px-3.5 py-1 text-white/80 text-[11px] font-bold uppercase tracking-widest mb-2 lg:mb-2.5">
              <Sparkles className="w-3 h-3 text-primary" /> Welcome, {userName}!
            </div>

            {/* Membership Expired Alert */}
            {(membershipStatus === "EXPIRED" || isExpired) && (
              <div className="max-w-xl mx-auto mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 text-left flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Membership Expired</h4>
                  <p className="text-[11px] text-red-200 mt-0.5">
                    Choose a membership plan below to renew your subscription and continue attending classes!
                  </p>
                </div>
              </div>
            )}

            {/* Trial Expired Alert */}
            {membershipStatus === "TRIAL_EXPIRED" && !isExpired && (
              <div className="max-w-xl mx-auto mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 text-left flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Your Free Trial Has Ended</h4>
                  <p className="text-[11px] text-red-200 mt-0.5">
                    Select a membership plan below to continue attending your dance classes!
                  </p>
                </div>
              </div>
            )}

            {/* Free Trial Active Notice */}
            {membershipStatus === "FREE_TRIAL" && freeTrial && (
              <div className="max-w-xl mx-auto mb-2.5 p-3 rounded-2xl bg-gradient-to-r from-[#FF7700]/20 to-[#FF007A]/20 border border-[#FF7700]/40 text-left flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#FF7700]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF7700]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Free Trial Active ({freeTrial.program})</h4>
                  <p className="text-[11px] text-amber-200 mt-0.5">
                    Your trial is active until {new Date(freeTrial.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}. Upgrade to a full membership anytime!
                  </p>
                </div>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-1.5 tracking-tight">
              {(membershipStatus === "EXPIRED" || isExpired) ? "Renew Your Membership Plan" : "Choose Your Membership Plan"}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm lg:text-base font-medium max-w-lg mx-auto">
              Select the plan that fits your dance goals. You can always upgrade later.
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 w-full max-w-5xl mx-auto items-stretch overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 pt-3 snap-x snap-mandatory md:snap-none no-scrollbar">
            {plans.map((plan) => {
              const features = getFeatures(plan);
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-5 lg:p-6 flex flex-col justify-between cursor-pointer border-2 transition-all duration-200 group min-w-[280px] sm:min-w-[300px] md:min-w-0 flex-1 snap-center h-full ${
                    plan.isFeatured
                      ? "bg-gradient-to-br from-primary/30 to-purple-600/20 border-primary/60 shadow-2xl shadow-primary/20"
                      : "bg-white/8 border-white/15 hover:border-white/30 hover:bg-white/12"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-pink-500 text-white text-[10px] lg:text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                      <Star className="w-3 h-3 fill-white" /> {plan.badge}
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <h3 className="font-extrabold text-white text-lg lg:text-xl mb-0.5">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-white/50 text-xs font-medium mb-3 line-clamp-2">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="text-3xl lg:text-4xl font-black text-white">₹{plan.price.toLocaleString()}</span>
                      <span className="text-white/50 text-xs lg:text-sm font-medium">{plan.period}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold mb-3 lg:mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Valid for {plan.durationDays} days</span>
                    </div>

                    <ul className="space-y-1.5 lg:space-y-2 flex-1">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs lg:text-sm text-white/80 font-medium leading-snug">
                          <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => { setSelectedPlan(plan); setStep("confirm"); }}
                    className={`w-full rounded-2xl h-10 lg:h-11 font-bold mt-4 lg:mt-5 transition-all text-sm shrink-0 ${
                      plan.isFeatured
                        ? "bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white shadow-lg"
                        : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                    }`}
                  >
                    Choose Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/50 text-lg font-medium">No plans available yet. Please contact the studio.</p>
            </div>
          )}
        </main>
      )}

      {/* Bottom spacer for balanced vertical centering on desktop */}
      <div className="hidden lg:block shrink-0 h-4" />

      {/* Plan Confirmation Modal */}
      {(step === "confirm" || step === "paying") && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 px-8 py-6 text-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold uppercase tracking-widest opacity-80">
                  Plan Confirmation
                </span>
                {step === "confirm" && (
                  <button onClick={() => { setSelectedPlan(null); setStep("select"); }}
                    className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-black">{selectedPlan.name}</h2>
              <p className="text-white/80 text-sm font-medium mt-0.5">{selectedPlan.description}</p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Price */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Amount</p>
                  <p className="text-3xl font-black text-gray-900 mt-0.5">
                    ₹{selectedPlan.price.toLocaleString()}
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Duration</p>
                    <p className="text-gray-500">{selectedPlan.durationDays} days ({selectedPlan.period.trim()})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Membership Period</p>
                    <p className="text-gray-500">
                      Today — {calcExpiry(selectedPlan.durationDays)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-gray-500">256-bit SSL encrypted via Razorpay</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">What&apos;s Included</p>
                <ul className="space-y-2">
                  {getFeatures(selectedPlan).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

              {step === "paying" ? (
                <div className="flex items-center justify-center gap-2 py-4 text-primary font-bold">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying payment…
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  <Button
                    onClick={handleProceedToPayment}
                    disabled={loading}
                    className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white text-base shadow-lg shadow-primary/25"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Proceed to Payment
                      </span>
                    )}
                  </Button>
                  <button
                    onClick={() => { setSelectedPlan(null); setStep("select"); setError(""); }}
                    className="w-full text-gray-500 text-sm font-medium py-2 hover:text-gray-700 transition-colors"
                  >
                    ← Back to plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
