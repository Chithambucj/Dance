"use client";

import { useState, useTransition } from "react";
import { createPaymentRecord } from "@/actions/payments";
import { X, Plus, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemberOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddPaymentModalProps {
  members: MemberOption[];
}

const PAYMENT_METHODS = ["Cash", "UPI", "Razorpay", "Net Banking", "Card", "Cheque"];

export default function AddPaymentModal({ members }: AddPaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createPaymentRecord(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => { setSuccess(false); setOpen(false); }, 1200);
      } else {
        setError(result.error || "Something went wrong.");
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        id="add-payment-btn"
      >
        <Plus className="w-5 h-5" /> Record Payment
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Record Payment</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium">
                  ✅ Payment recorded successfully!
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="pay-member" className="text-gray-700 font-semibold text-sm">
                  Member *
                </Label>
                <select
                  id="pay-member"
                  name="userId"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} — {m.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-gray-700 font-semibold text-sm">
                  Amount (₹) *
                </Label>
                <Input
                  id="pay-amount"
                  name="amount"
                  type="number"
                  min={1}
                  step={0.01}
                  placeholder="1500"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-method" className="text-gray-700 font-semibold text-sm">
                  Payment Method
                </Label>
                <select
                  id="pay-method"
                  name="method"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select method...</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-status" className="text-gray-700 font-semibold text-sm">
                  Status
                </Label>
                <select
                  id="pay-status"
                  name="status"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pay-description" className="text-gray-700 font-semibold text-sm">
                  Description
                </Label>
                <Input
                  id="pay-description"
                  name="description"
                  placeholder="Monthly Fee, Quarterly Plan..."
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-gray-200 font-bold h-11"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </span>
                  ) : "Save Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
