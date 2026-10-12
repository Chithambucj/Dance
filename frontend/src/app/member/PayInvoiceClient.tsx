"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PayInvoiceClientProps {
  invoiceId: string;
  amount: number;
  description: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => { open: () => void };
  }
}

export default function PayInvoiceClient({
  invoiceId,
  amount,
  description,
  userName,
  userEmail,
  userPhone,
}: PayInvoiceClientProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "paying" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector("script[src*='razorpay']")) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => {
        document.body.removeChild(script);
        reject(new Error("Failed to load Razorpay checkout script. Please disable any adblockers and try again."));
      };
      document.body.appendChild(script);
    });
  }

  async function handlePayNow() {
    setState("loading");
    setErrorMsg("");

    try {
      // 1. Load Razorpay script
      await loadRazorpayScript();

      // 2. Create order on backend (amount authoritative from DB)
      const orderRes = await fetch("/api/payment/invoice/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create payment order.");
      }

      // 3. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "StepUp Dance Studio",
        description: orderData.description,
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setState("paying");

          // 4. Verify signature and settle invoice on backend
          const verifyRes = await fetch("/api/payment/invoice/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            setState("done");
            // Refresh the page to re-fetch server data (removes this invoice from pending list)
            setTimeout(() => router.refresh(), 1200);
          } else {
            throw new Error(verifyData.error || "Verification failed.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail || "",
          contact: userPhone || "",
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => {
            setState("idle");
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Payment gateway failed to load. Please check your connection or disable adblockers.");
      }

      new window.Razorpay(options).open();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Paid! Refreshing…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        id={`pay-invoice-${invoiceId}`}
        onClick={handlePayNow}
        disabled={state === "loading" || state === "paying"}
        className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 h-9 px-4 text-sm"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            Opening…
          </>
        ) : state === "paying" ? (
          <>
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-1.5" />
            Pay ₹{amount.toLocaleString()}
          </>
        )}
      </Button>
      {state === "error" && (
        <p className="text-xs text-red-500 font-semibold max-w-[200px] text-right">{errorMsg}</p>
      )}
    </div>
  );
}
