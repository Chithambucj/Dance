"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markPaymentCompleted } from "@/actions/payments";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkPaidButtonProps {
  paymentId: string;
  onSuccess?: () => void;
}

export default function MarkPaidButton({ paymentId, onSuccess }: MarkPaidButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await markPaymentCompleted(paymentId);
          router.refresh();
          if (onSuccess) onSuccess();
        })
      }
      className="rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 font-bold gap-1 shadow-none h-8"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Check className="w-3.5 h-3.5" />
      )}
      Mark Paid
    </Button>
  );
}
