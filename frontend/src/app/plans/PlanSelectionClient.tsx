"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check, Star, Sparkles, Music2, ArrowRight, Loader2,
  Calendar, Clock, Shield, X, CreditCard, ChevronRight
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
}

export default function PlanSelectionClient({ 
  plans, 
  currentMembership, 
  userName,
  membershipStatus,
  freeTrial 
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
    return new Promise((resolve) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-6 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Music2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-white text-lg">DanceStudio</span>
        </Link>
        <Link href="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
          Already a member? Log in
        </Link>
      </header>

      {/* Plan Selection */}
      {step === "select" && (
        <main className="relative z-10 max-w-6xl mx-auto px-6 pb-16 pt-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-white/80 text-xs font-bold uppercase tracking-widest mb-5">
              <Sparkles className="w-3 h-3" /> Welcome, {userName}!
            </div>

            {/* Trial Expired Alert */}
            {membershipStatus === "TRIAL_EXPIRED" && (
              <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Your Free Trial Has Ended</h4>
                  <p className="text-xs text-red-200 mt-0.5">
                    Select a membership plan below to continue attending your favourite dance classes and batches!
                  </p>
                </div>
              </div>
            )}

            {/* Free Trial Active Notice */}
            {membershipStatus === "FREE_TRIAL" && freeTrial && (
              <div className="max-w-xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FF7700]/20 to-[#FF007A]/20 border border-[#FF7700]/40 text-left flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF7700]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#FF7700]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Free Trial Active ({freeTrial.program})</h4>
                  <p className="text-xs text-amber-200 mt-0.5">
                    Your trial is active until {new Date(freeTrial.trialEndDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}. You can upgrade to a full membership anytime below!
                  </p>
                </div>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Choose Your Membership Plan
            </h1>
            <p className="text-white/60 text-lg font-medium max-w-xl mx-auto">
              Select the plan that fits your dance goals. You can always upgrade later.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const features = getFeatures(plan);
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 flex flex-col cursor-pointer border-2 transition-all duration-200 group ${
                    plan.isFeatured
                      ? "bg-gradient-to-br from-primary/30 to-purple-600/20 border-primary/60 shadow-2xl shadow-primary/20"
                      : "bg-white/8 border-white/15 hover:border-white/30 hover:bg-white/12"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-pink-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                      <Star className="w-3 h-3 fill-white" /> {plan.badge}
                    </div>
                  )}

                  <div className="mb-5 flex-1">
                    <h3 className="font-extrabold text-white text-xl mb-1">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-white/50 text-xs font-medium mb-4">{plan.description}</p>
                    )}
                    <div className="flex items-end gap-1.5 mb-1">
                      <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString()}</span>
                      <span className="text-white/50 text-sm font-medium mb-1">{plan.period}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold mb-5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Valid for {plan.durationDays} days</span>
                    </div>

                    <ul className="space-y-2.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-white/80 font-medium">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => { setSelectedPlan(plan); setStep("confirm"); }}
                    className={`w-full rounded-2xl h-11 font-bold mt-6 transition-all ${
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
