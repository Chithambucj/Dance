import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Failed | Dance Studio",
};

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params.reason || "unknown";

  const reasonMessages: Record<string, string> = {
    verification_failed: "Payment was received but verification failed. Please contact us with your payment reference.",
    cancelled:           "Payment was cancelled. Your membership has not been activated.",
    unknown:             "Something went wrong during payment. Please try again.",
  };

  const message = reasonMessages[reason] || reasonMessages.unknown;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl shadow-red-200/50 overflow-hidden">
          {/* Red header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-10 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-black mb-1">Payment Failed</h1>
            <p className="text-white/80 font-medium text-sm">
              Your membership has not been activated.
            </p>
          </div>

          <div className="px-8 py-6 space-y-4">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-sm font-semibold text-red-700">{message}</p>
            </div>

            <p className="text-xs text-gray-500 text-center font-medium">
              No amount has been charged to your account. You can try again safely.
            </p>

            <div className="space-y-2.5 pt-2">
              <Link href="/plans">
                <Button className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-primary to-purple-600 text-white text-base">
                  <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Button>
              </Link>
              <Link href="/plans">
                <Button variant="outline" className="w-full h-11 rounded-2xl font-bold border-gray-200 text-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Change Plan
                </Button>
              </Link>
              <Link href="/#contact">
                <Button variant="ghost" className="w-full h-11 rounded-2xl font-medium text-gray-500 hover:text-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2" /> Contact Studio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
