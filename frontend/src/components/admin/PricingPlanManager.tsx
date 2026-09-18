"use client";

import { useState, useTransition } from "react";
import { createPricingPlan, editPricingPlan, deletePricingPlan } from "@/actions/pricing";
import { Plus, Trash2, Edit2, Loader2, CreditCard, Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  period: string;
  billingPeriod: string;
  classesIncluded: string | null;
  validity: string | null;
  features: string;
  badge: string | null;
  isFeatured: boolean;
  isPublished: boolean;
}

interface PricingPlanManagerProps {
  initialPlans: PricingPlan[];
}

export default function PricingPlanManager({ initialPlans }: PricingPlanManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleSave(formData: FormData) {
    setError("");
    startTransition(async () => {
      let res;
      if (editingPlan) {
        res = await editPricingPlan(editingPlan.id, formData);
      } else {
        res = await createPricingPlan(formData);
      }

      if (res.success) {
        setSuccess(editingPlan ? "Pricing plan updated!" : "Pricing plan created!");
        setShowForm(false);
        setEditingPlan(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Operation failed.");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    setDeletingId(id);
    await deletePricingPlan(id);
    setDeletingId(null);
  }

  // Parse JSON features for edit form
  const getFeaturesText = (plan?: PricingPlan | null) => {
    if (!plan) return "1 Group Class of your choice\nValid for 30 days\nNo registration fee";
    try {
      const parsed = JSON.parse(plan.features);
      if (Array.isArray(parsed)) return parsed.join("\n");
      return plan.features;
    } catch {
      return plan.features;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pricing Plans &amp; Memberships</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage studio pricing cards displayed on the public website.</p>
        </div>
        <Button
          onClick={() => {
            setEditingPlan(null);
            setShowForm(!showForm);
          }}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? "Cancel" : "Add Plan"}
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 font-semibold text-sm">
          ✅ {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border-0 shadow-sm shadow-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> {editingPlan ? "Edit Plan" : "New Pricing Plan"}
          </h2>
          <form action={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-gray-700 font-semibold text-sm">Plan Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingPlan?.name || ""}
                  placeholder="e.g. Monthly Unlimited"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-gray-700 font-semibold text-sm">Price (₹) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={editingPlan?.price ?? 1500}
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="period" className="text-gray-700 font-semibold text-sm">Period Label</Label>
                <Input
                  id="period"
                  name="period"
                  defaultValue={editingPlan?.period || "/ month"}
                  placeholder="e.g. / month, / year, one time"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="classesIncluded" className="text-gray-700 font-semibold text-sm">Classes Included</Label>
                <Input
                  id="classesIncluded"
                  name="classesIncluded"
                  defaultValue={editingPlan?.classesIncluded || "8 Classes / Month"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="validity" className="text-gray-700 font-semibold text-sm">Validity</Label>
                <Input
                  id="validity"
                  name="validity"
                  defaultValue={editingPlan?.validity || "30 Days"}
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="badge" className="text-gray-700 font-semibold text-sm">Highlight Badge</Label>
                <Input
                  id="badge"
                  name="badge"
                  defaultValue={editingPlan?.badge || ""}
                  placeholder="e.g. Most Popular"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-gray-700 font-semibold text-sm">Description</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingPlan?.description || ""}
                placeholder="Short tagline for the plan"
                className="rounded-xl bg-gray-50 border-gray-200 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="features" className="text-gray-700 font-semibold text-sm">Feature Bullets (1 per line)</Label>
              <textarea
                id="features"
                name="features"
                defaultValue={getFeaturesText(editingPlan)}
                rows={4}
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={editingPlan?.isFeatured ?? false}
                  className="w-4 h-4 rounded text-primary"
                />
                Feature / Highlight Card
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublished"
                  defaultChecked={editingPlan?.isPublished ?? true}
                  className="w-4 h-4 rounded text-primary"
                />
                Publish on Website
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                }}
                className="rounded-xl font-bold h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold px-8 h-11"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </span>
                ) : editingPlan ? "Save Changes" : "Create Plan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialPlans.map((plan) => {
          let bullets: string[] = [];
          try {
            bullets = JSON.parse(plan.features);
          } catch {
            bullets = [plan.features];
          }

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all ${
                plan.isFeatured
                  ? "border-primary shadow-xl shadow-primary/10 relative"
                  : "border-gray-100 shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-gray-900 text-xl">{plan.name}</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">₹{plan.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 font-semibold">{plan.period}</span>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100">
                  {bullets.map((b, idx) => (
                    <p key={idx} className="text-xs text-gray-600 font-medium flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  plan.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"
                }`}>
                  {plan.isPublished ? "Published" : "Draft"}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={deletingId === plan.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Plan"
                  >
                    {deletingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
