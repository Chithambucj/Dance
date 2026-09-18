"use client";

import { useState, useTransition, useEffect } from "react";
import { createMember } from "@/actions/members";
import { getActiveBatchesList } from "@/actions/membersData";
import { X, Plus, Loader2, UserPlus, Calendar, CreditCard, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddMemberModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (open && batches.length === 0) {
      getActiveBatchesList().then(setBatches).catch(console.error);
    }
  }, [open, batches.length]);

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createMember(formData);
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
        id="add-member-btn"
      >
        <Plus className="w-5 h-5" /> Add Member
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-gray-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Add New Member</h2>
                  <p className="text-xs text-gray-500 font-medium">Register a new student with enrollment and payment.</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Member Created!</h3>
                  <p className="text-gray-500">The student profile has been registered successfully.</p>
                </div>
              ) : (
                <form action={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold border border-red-100">
                      {error}
                    </div>
                  )}

                  {/* 1. Personal Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <UserPlus className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-gray-900">Personal Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name <span className="text-red-500">*</span></Label>
                        <Input name="firstName" required className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name <span className="text-red-500">*</span></Label>
                        <Input name="lastName" required className="rounded-xl bg-gray-50/50" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input type="email" name="email" required className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input name="phone" className="rounded-xl bg-gray-50/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" name="dob" className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <select name="gender" className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50/50 border border-input text-sm">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Emergency Contact</Label>
                        <Input name="emergencyContact" placeholder="Name & Phone" className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input name="address" className="rounded-xl bg-gray-50/50" />
                      </div>
                    </div>
                  </div>

                  {/* 2. Dance Enrollment */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <Layers className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-gray-900">Dance Enrollment (Optional)</h3>
                    </div>

                    <div className="space-y-2">
                      <Label>Assign to Batch</Label>
                      <select name="batchId" className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50/50 border border-input text-sm">
                        <option value="">-- No Batch Enrollment Yet --</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>{b.classStyle.name} - {b.name}</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-gray-500">Selecting a batch will create an active enrollment record.</p>
                    </div>
                  </div>

                  {/* 3. Payment Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <h3 className="font-bold text-gray-900">Payment (Optional)</h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Total Fee (₹)</Label>
                        <Input type="number" name="totalFee" min="0" placeholder="0" className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Initial Payment (₹)</Label>
                        <Input type="number" name="initialPayment" min="0" placeholder="0" className="rounded-xl bg-gray-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <select name="paymentMethod" className="w-full h-10 px-3 py-2 rounded-xl bg-gray-50/50 border border-input text-sm">
                          <option value="CASH">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="CARD">Card</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isPending} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending} className="rounded-xl px-8 font-bold shadow-md shadow-primary/20">
                      {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Member"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
