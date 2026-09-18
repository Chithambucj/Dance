"use client";

import { useState } from "react";
import { Plus, X, Loader2, Search, CheckCircle2, UserPlus, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createOfflineMembership, findExistingClient } from "@/actions/memberships";

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  billingPeriod: string;
}

interface Batch {
  id: string;
  name: string;
  classStyle: { name: string };
  schedule: string;
}

interface ExistingClient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  membershipStatus: string;
}

interface Props {
  plans: Plan[];
  batches: Batch[];
}

type Step = "search" | "form" | "payment" | "success";

export default function AddOfflineMemberModal({ plans, batches }: Props) {
  const [open, setOpen]               = useState(false);
  const [step, setStep]               = useState<Step>("search");
  const [loading, setLoading]         = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError]             = useState("");
  const [foundClient, setFoundClient] = useState<ExistingClient | null>(null);
  const [useExisting, setUseExisting] = useState(false);
  const [successNumber, setSuccessNumber] = useState("");

  const [searchEmail, setSearchEmail] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  function handleClose() {
    setOpen(false);
    setStep("search");
    setFoundClient(null);
    setUseExisting(false);
    setError("");
    setSearchEmail("");
    setSearchPhone("");
    setSelectedPlanId("");
    setSuccessNumber("");
  }

  async function handleSearch() {
    if (!searchEmail && !searchPhone) {
      setError("Enter email or phone to search.");
      return;
    }
    setSearchLoading(true);
    setError("");
    setFoundClient(null);
    try {
      const result = await findExistingClient(searchEmail, searchPhone);
      setFoundClient(result);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    if (useExisting && foundClient) {
      formData.set("existingUserId", foundClient.id);
      formData.set("email", foundClient.email);
    }

    try {
      const result = await createOfflineMembership(formData);
      if (result.success) {
        setSuccessNumber(result.membershipNumber || "");
        setStep("success");
      } else {
        setError(result.error || "Failed to create membership.");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "h-10 rounded-xl border-gray-200 focus:border-primary focus:ring-primary/20 text-sm";
  const labelClass = "text-gray-700 text-xs font-bold";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex items-center gap-2 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
      >
        <UserPlus className="w-4 h-4" />
        Add Offline Member
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-purple-600 px-7 py-5 flex items-center justify-between text-white rounded-t-3xl shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-lg">Add Offline Member</h2>
                  <p className="text-white/70 text-xs font-medium">
                    {step === "search" ? "Step 1: Check existing client" :
                     step === "form"   ? "Step 2: Member details" :
                     step === "payment"? "Step 3: Payment" : "Done"}
                  </p>
                </div>
              </div>
              <button onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-7">
              {/* ── Step 1: Check existing ──────────────────────────────────── */}
              {step === "search" && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-600 font-medium">
                    First, check if this client already has an account to avoid duplicate records.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Search by Email</Label>
                      <Input
                        placeholder="client@email.com"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Search by Phone</Label>
                      <Input
                        placeholder="+91 98765 43210"
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    variant="outline"
                    className="w-full h-10 rounded-xl font-bold border-gray-200"
                  >
                    {searchLoading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Searching…</span>
                    ) : (
                      <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Check for Existing Client</span>
                    )}
                  </Button>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{error}</div>
                  )}

                  {foundClient && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Existing Client Found
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 font-black text-sm">
                          {foundClient.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{foundClient.firstName} {foundClient.lastName}</p>
                          <p className="text-xs text-gray-500">{foundClient.email} · {foundClient.phone || "No phone"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Status: {foundClient.membershipStatus}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => { setUseExisting(true); setStep("form"); setError(""); }}
                        className="w-full h-9 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white text-sm"
                      >
                        Use Existing Client
                      </Button>
                    </div>
                  )}

                  {foundClient === null && searchEmail !== "" && !searchLoading && (
                    <p className="text-sm text-gray-500 font-medium text-center py-2">
                      No existing client found. A new account will be created.
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={handleClose} className="flex-1 h-10 rounded-xl font-bold border-gray-200">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => { setUseExisting(false); setFoundClient(null); setStep("form"); setError(""); }}
                      className="flex-1 h-10 rounded-xl font-bold bg-primary text-white"
                    >
                      Continue as New Member
                    </Button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Member Form ─────────────────────────────────────── */}
              {step === "form" && (
                <form
                  action={async (fd) => {
                    // Move to payment step first to capture payment info
                    setStep("payment");
                    // Store form data in state somehow... use hidden inputs approach
                    // Actually we'll submit the whole form at the payment step
                    const allData = new FormData();
                    fd.forEach((v, k) => allData.set(k, v as string));
                    // Store temporarily via HTML form carry-over
                    const paymentForm = document.getElementById("offline-payment-form") as HTMLFormElement;
                    if (paymentForm) {
                      fd.forEach((v, k) => {
                        const hidden = document.createElement("input");
                        hidden.type  = "hidden";
                        hidden.name  = k;
                        hidden.value = v as string;
                        paymentForm.appendChild(hidden);
                      });
                    }
                  }}
                  className="space-y-5"
                >
                  {useExisting && foundClient ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                        {foundClient.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{foundClient.firstName} {foundClient.lastName}</p>
                        <p className="text-xs text-gray-500">{foundClient.email}</p>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">Using existing account</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Personal Information
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className={labelClass}>First Name *</Label>
                          <Input name="firstName" placeholder="First name" required className={fieldClass} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Last Name *</Label>
                          <Input name="lastName" placeholder="Last name" required className={fieldClass} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Email *</Label>
                          <Input name="email" type="email" defaultValue={searchEmail} placeholder="Email" required className={fieldClass} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Phone</Label>
                          <Input name="phone" defaultValue={searchPhone} placeholder="+91 98765 43210" className={fieldClass} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Gender</Label>
                          <select name="gender" className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                            <option value="">Select</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className={labelClass}>Date of Birth</Label>
                          <Input name="dob" type="date" className={fieldClass} />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <Label className={labelClass}>Address</Label>
                          <Input name="address" placeholder="City, State" className={fieldClass} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Membership Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5 col-span-2">
                        <Label className={labelClass}>Membership Plan *</Label>
                        <select
                          name="planId"
                          required
                          value={selectedPlanId}
                          onChange={(e) => setSelectedPlanId(e.target.value)}
                          className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                        >
                          <option value="">Select plan…</option>
                          {plans.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ₹{p.price.toLocaleString()} ({p.durationDays} days)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={labelClass}>Batch (optional)</Label>
                        <select name="batchId" className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                          <option value="">Select batch…</option>
                          {batches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.classStyle.name} — {b.name} ({b.schedule})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className={labelClass}>Start Date</Label>
                        <Input
                          name="startDate"
                          type="date"
                          defaultValue={new Date().toISOString().split("T")[0]}
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{error}</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep("search")}
                      className="flex-1 h-10 rounded-xl font-bold border-gray-200">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1 h-10 rounded-xl font-bold bg-primary text-white">
                      Next: Payment →
                    </Button>
                  </div>
                </form>
              )}

              {/* ── Step 3: Payment ─────────────────────────────────────────── */}
              {step === "payment" && (
                <form id="offline-payment-form" action={handleSubmit} className="space-y-5">
                  {selectedPlan && (
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{selectedPlan.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{selectedPlan.durationDays} days membership</p>
                      </div>
                      <p className="font-black text-2xl text-primary">₹{selectedPlan.price.toLocaleString()}</p>
                    </div>
                  )}

                  <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Details
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Payment Method *</Label>
                      <select name="paymentMethod" required className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="CASH">💵 Cash</option>
                        <option value="UPI">📱 UPI</option>
                        <option value="CARD">💳 Card</option>
                        <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Payment Status</Label>
                      <select name="paymentStatus" className="w-full h-10 rounded-xl border border-gray-200 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option value="PAID">✅ Fully Paid</option>
                        <option value="PARTIAL">⚡ Partial Payment</option>
                        <option value="PENDING">⏳ Pending</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Amount Paid (₹)</Label>
                      <Input
                        name="amountPaid"
                        type="number"
                        min="0"
                        defaultValue={selectedPlan?.price}
                        placeholder={selectedPlan ? String(selectedPlan.price) : "0"}
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={labelClass}>Reference / Transaction No.</Label>
                      <Input name="referenceNumber" placeholder="UPI Ref / Receipt No." className={fieldClass} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className={labelClass}>Notes (optional)</Label>
                      <Input name="notes" placeholder="Any additional notes…" className={fieldClass} />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl font-medium">{error}</div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep("form")}
                      className="flex-1 h-10 rounded-xl font-bold border-gray-200">
                      Back
                    </Button>
                    <Button type="submit" disabled={loading}
                      className="flex-1 h-10 rounded-xl font-bold bg-gradient-to-r from-primary to-purple-600 text-white">
                      {loading ? (
                        <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Creating…</span>
                      ) : "Create Member"}
                    </Button>
                  </div>
                </form>
              )}

              {/* ── Step 4: Success ─────────────────────────────────────────── */}
              {step === "success" && (
                <div className="text-center py-6 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-xl">Member Created!</h3>
                    {successNumber && (
                      <p className="text-primary font-mono font-bold text-lg mt-1">{successNumber}</p>
                    )}
                    <p className="text-gray-500 text-sm font-medium mt-2">
                      The member account and membership have been created successfully.
                    </p>
                  </div>
                  <Button onClick={handleClose}
                    className="w-full h-11 rounded-2xl font-bold bg-primary text-white">
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
