"use client";

import { useState, useTransition } from "react";
import { editPaymentRecord } from "@/actions/payments";
import { Edit2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  description: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EditPaymentModal({ payment }: { payment: Payment }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await editPaymentRecord(payment.id, formData);
      if (result.success) {
        setIsOpen(false);
      } else {
        setError(result.error || "Failed to update payment.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        title="Edit Payment"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Payment</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Member: {payment.user.firstName} {payment.user.lastName} ({payment.user.email})
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount" className="text-gray-700 font-semibold text-sm">Amount (₹) *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    defaultValue={payment.amount}
                    min="1"
                    step="0.01"
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-gray-700 font-semibold text-sm">Status *</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={payment.status}
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="method" className="text-gray-700 font-semibold text-sm">Payment Method</Label>
                <select
                  id="method"
                  name="method"
                  defaultValue={payment.paymentMethod || "UPI"}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-gray-700 font-semibold text-sm">Description / Notes</Label>
                <Input
                  id="description"
                  name="description"
                  defaultValue={payment.description || ""}
                  placeholder="e.g. Monthly tuition fee"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </span>
                  ) : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
