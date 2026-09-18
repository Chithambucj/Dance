import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";
import { Check, ArrowRight, Sparkles, Star, Zap } from "lucide-react";

export const metadata = {
  title: "Pricing & Memberships | Dance Studio",
  description: "Start with a FREE 7-day trial. No payment required. Then choose from our Monthly, Quarterly, or Annual dance membership plans.",
};

const faqs = [
  { q: "How does the Free Trial work?", a: "Register online, get instant access to our studio for 7 days. Attend any class, meet our instructors — completely free, no credit card required." },
  { q: "What happens after the trial?", a: "After 7 days, choose a paid membership plan to continue. Your progress and account are kept even during the transition." },
  { q: "Can I freeze my membership?", a: "Yes, you can pause your membership once per cycle for up to 15 days." },
  { q: "Are there family discounts?", a: "Yes — 10% off for siblings and 15% off for families of 3 or more." },
  { q: "Is there a registration fee?", a: "No registration fee. Start free, then pay only for the plan you choose." },
  { q: "Can I switch dance styles mid-month?", a: "Yes, you can change your enrolled style with 48-hour notice, subject to batch availability." },
];

export default async function PricingPage() {
  const session = await getSession();
  const isLoggedIn = session?.isLoggedIn === true;
  const membershipStatus = session?.membershipStatus;

  // Filter out TRIAL plans — only show paid plans
  const plans = await prisma.pricingPlan.findMany({
    where: {
      isPublished: true,
      billingPeriod: { not: "TRIAL" },
    },
    orderBy: { displayOrder: "asc" },
  });

  const isActiveMember   = membershipStatus === "ACTIVE" || membershipStatus === "PARTIALLY_PAID";
  const isTrialMember    = membershipStatus === "FREE_TRIAL";
  const isTrialExpired   = membershipStatus === "TRIAL_EXPIRED";

  return (
    <>
      {/* ── Hero: Free Trial CTA ──────────────────────────────────────────── */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF7700]/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF7700]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF7700]/10 border border-[#FF7700]/30 px-5 py-2 text-sm font-bold text-[#FF7700] mb-8">
            <Sparkles className="w-4 h-4" />
            No Credit Card Required
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Start Your{" "}
            <span className="bg-gradient-to-r from-[#FF7700] to-[#FF007A] bg-clip-text text-transparent">
              Dance Journey
            </span>
          </h1>

          <p className="text-gray-400 text-xl max-w-lg mx-auto font-medium mb-10 leading-relaxed">
            Try your first <span className="text-white font-bold">7 days FREE</span>.
            No payment. No commitment. Just pure dance.
          </p>

          {/* Contextual CTA */}
          {!isLoggedIn && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/free-trial">
                <Button className="h-14 px-10 text-base rounded-full font-black bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110 text-white shadow-2xl shadow-[#FF7700]/20 transition-all">
                  <Star className="w-5 h-5 mr-2" />
                  Start Free Trial — It&apos;s Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-14 px-8 text-base rounded-full border-white/20 text-white hover:bg-white/5 font-bold">
                  Log in to my account
                </Button>
              </Link>
            </div>
          )}

          {isTrialMember && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/member">
                <Button className="h-14 px-10 text-base rounded-full font-black bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white">
                  Go to My Portal
                </Button>
              </Link>
            </div>
          )}

          {isTrialExpired && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-5 py-2.5 text-sm font-bold text-red-400">
                Your free trial has ended — choose a membership to continue
              </div>
              <div className="flex justify-center">
                <a href="#plans">
                  <Button className="h-14 px-10 text-base rounded-full font-black bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white shadow-xl">
                    Choose Membership Plan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          )}

          {isActiveMember && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/30 px-5 py-2.5 text-sm font-bold text-green-400">
                ✓ You have an active membership
              </div>
              <div className="flex gap-4 justify-center">
                <Link href="/member">
                  <Button className="h-12 px-8 rounded-full font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white">
                    Go to My Portal
                  </Button>
                </Link>
                <a href="#plans">
                  <Button variant="outline" className="h-12 px-8 rounded-full border-white/20 text-white hover:bg-white/5 font-bold">
                    View Plans
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-500 font-medium">
            {["✓ 7 Days Free Access", "✓ No Credit Card", "✓ Instant Account", "✓ Expert Instructors"].map((item) => (
              <span key={item} className="text-gray-400">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest whitespace-nowrap">
            After Your Trial
          </p>
          <div className="flex-1 h-px bg-white/10" />
        </div>
      </div>

      {/* ── Paid Plans ────────────────────────────────────────────────────── */}
      <section id="plans" className="pb-20 pt-8">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-[#FF7700] font-bold text-sm uppercase tracking-widest mb-3">
              Membership Plans
            </p>
            <h2 className="text-4xl font-black text-white">Choose Your Plan</h2>
            <p className="text-gray-500 mt-2 font-medium">Simple pricing. No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              let features: string[] = [];
              try {
                features = JSON.parse(plan.features);
              } catch {
                features = [plan.features];
              }

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between border transition-all ${
                    plan.isFeatured
                      ? "bg-gradient-to-br from-[#FF7700]/20 to-[#FF007A]/10 border-[#FF7700]/40 shadow-xl shadow-[#FF7700]/10"
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF7700] to-[#FF007A] text-white text-xs font-extrabold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow-md">
                      <Zap className="w-3 h-3" /> {plan.badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-extrabold text-white text-xl">{plan.name}</h3>
                    <p className="text-gray-500 text-xs font-medium mt-1">{plan.description}</p>
                    <div className="flex items-end gap-1.5 mt-4">
                      <span className="text-4xl font-black text-white">₹{plan.price.toLocaleString()}</span>
                      <span className="text-gray-500 text-sm font-medium mb-1">{plan.period}</span>
                    </div>
                    {plan.validity && (
                      <p className="text-xs text-gray-600 font-medium mt-1">{plan.classesIncluded} · Valid {plan.validity}</p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-sm text-gray-300 font-medium">
                        <Check className="w-4 h-4 text-[#FF7700] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {!isLoggedIn && (
                    <Link href="/free-trial">
                      <Button
                        className={`w-full rounded-2xl h-11 font-bold transition-all ${
                          plan.isFeatured
                            ? "bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:opacity-90 text-white shadow-lg shadow-[#FF7700]/25"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                        }`}
                      >
                        Start Free Trial First <ArrowRight className="w-4 h-4 ml-1 inline-block" />
                      </Button>
                    </Link>
                  )}

                  {(isTrialMember || isTrialExpired || isActiveMember) && (
                    <Link href={`/plans?planId=${plan.id}`}>
                      <Button
                        className={`w-full rounded-2xl h-11 font-bold transition-all ${
                          plan.isFeatured
                            ? "bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:opacity-90 text-white shadow-lg shadow-[#FF7700]/25"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                        }`}
                      >
                        {isActiveMember ? "Switch to This Plan" : "Choose This Plan"}{" "}
                        <ArrowRight className="w-4 h-4 ml-1 inline-block" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0D0E14]">
        <div className="container mx-auto px-4 lg:px-12 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-extrabold text-white mb-2">{q}</h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black text-white mb-4">Ready to start dancing?</h2>
          <p className="text-gray-400 mb-8 font-medium">Join hundreds of dancers who started with a free trial.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/5 px-8 h-12 font-bold">
                Contact Us
              </Button>
            </Link>
            {!isLoggedIn && (
              <Link href="/free-trial">
                <Button className="rounded-full px-8 h-12 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
            {(isTrialMember || isTrialExpired) && (
              <a href="#plans">
                <Button className="rounded-full px-8 h-12 font-bold bg-gradient-to-r from-[#FF7700] to-[#FF007A] hover:brightness-110">
                  Choose Membership <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
