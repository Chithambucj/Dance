"use client";

import { useState, useTransition } from "react";
import { createBatch } from "@/actions/batches";
import { X, Plus, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassStyleOption {
  id: string;
  name: string;
}

interface InstructorOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface AddBatchModalProps {
  classStyles: ClassStyleOption[];
  instructors: InstructorOption[];
}

export default function AddBatchModal({ classStyles, instructors }: AddBatchModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createBatch(formData);
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
        id="add-batch-btn"
      >
        <Plus className="w-5 h-5" /> Add Batch
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900">Add New Batch</h2>
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
                  ✅ Batch created successfully!
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="batch-name" className="text-gray-700 font-semibold text-sm">
                  Batch Name *
                </Label>
                <Input
                  id="batch-name"
                  name="name"
                  placeholder="e.g. Hip-Hop Beginners"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-style" className="text-gray-700 font-semibold text-sm">
                  Dance Style *
                </Label>
                <select
                  id="batch-style"
                  name="classStyleId"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a style...</option>
                  {classStyles.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-instructor" className="text-gray-700 font-semibold text-sm">
                  Instructor
                </Label>
                <select
                  id="batch-instructor"
                  name="instructorId"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Unassigned</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-schedule" className="text-gray-700 font-semibold text-sm">
                  Schedule *
                </Label>
                <Input
                  id="batch-schedule"
                  name="schedule"
                  placeholder="e.g. Mon, Wed • 6:00 PM – 7:00 PM"
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-capacity" className="text-gray-700 font-semibold text-sm">
                  Capacity
                </Label>
                <Input
                  id="batch-capacity"
                  name="capacity"
                  type="number"
                  min={1}
                  max={200}
                  defaultValue={20}
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
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </span>
                  ) : "Create Batch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
