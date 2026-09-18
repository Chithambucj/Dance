"use client";

import { useTransition } from "react";
import { deletePayment } from "@/actions/payments";
import { Trash2, Loader2 } from "lucide-react";

export default function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) return;

    startTransition(async () => {
      const result = await deletePayment(paymentId);
      if (!result.success) {
        alert(result.error || "Failed to delete payment.");
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Payment"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
