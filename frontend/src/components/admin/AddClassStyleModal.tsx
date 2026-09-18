"use client";

import { useState, useTransition } from "react";
import { createClassStyle } from "@/actions/classes";
import { X, Plus, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddClassStyleModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createClassStyle(formData);
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
        id="add-class-style-btn"
      >
        <Plus className="w-5 h-5" /> Add Class Style
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Add Class Style</h2>
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
                  ✅ Class style created successfully!
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="cs-name" className="text-gray-700 font-semibold text-sm">
                  Style Name *
                </Label>
                <Input
                  id="cs-name"
                  name="name"
                  placeholder="e.g. Zumba, Ballet, Kathak"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cs-description" className="text-gray-700 font-semibold text-sm">
                  Description
                </Label>
                <textarea
                  id="cs-description"
                  name="description"
                  placeholder="Brief description of this dance style..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </span>
                  ) : "Create Style"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
