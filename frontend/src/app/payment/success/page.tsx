import Link from "next/link";
import { CheckCircle2, Calendar, ArrowRight, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Successful | Dance Studio",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ membership?: string; plan?: string; expiry?: string }>;
}) {
  const params     = await searchParams;
  const membership = params.membership || "MEM-2026-XXXXX";
  const plan       = params.plan       || "Membership Plan";
  const expiry     = params.expiry
    ? new Date(params.expiry).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-green-200/50 overflow-hidden">
          {/* Green header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-10 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black mb-1">Payment Successful!</h1>
            <p className="text-white/80 font-medium text-sm">
              Your membership is now active. Welcome to the family!
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Plan</span>
                <span className="font-bold text-gray-900">{decodeURIComponent(plan)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Membership ID</span>
                <span className="font-mono font-bold text-primary">{membership}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Valid Until
                </span>
                <span className="font-bold text-gray-900">{expiry}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status</span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-green-50 text-green-700">
                  ✓ ACTIVE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-700">
                A confirmation email has been sent. Keep your Membership ID safe for reference.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link href="/member">
                <Button className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-primary to-purple-600 text-white text-base shadow-lg shadow-primary/20">
                  Go to Member Portal <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/member?tab=payments">
                <Button variant="outline" className="w-full h-11 rounded-2xl font-bold border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" /> View Receipt
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
