"use client";

import { useState, useTransition } from "react";
import { editBatch } from "@/actions/batches";
import { Edit2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassStyle {
  id: string;
  name: string;
}

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
}

interface Batch {
  id: string;
  name: string;
  classStyleId: string;
  instructorId: string | null;
  schedule: string;
  capacity: number;
}

interface EditBatchModalProps {
  batch: Batch;
  classStyles: ClassStyle[];
  instructors: Instructor[];
}

export default function EditBatchModal({ batch, classStyles, instructors }: EditBatchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await editBatch(batch.id, formData);
      if (result.success) {
        setIsOpen(false);
      } else {
        setError(result.error || "Failed to edit batch.");
      }
    });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
        title="Edit Batch"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Batch</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-gray-700 font-semibold text-sm">Batch Name *</Label>
                <Input id="name" name="name" defaultValue={batch.name} required className="rounded-xl bg-gray-50 border-gray-200 h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="classStyleId" className="text-gray-700 font-semibold text-sm">Dance Style *</Label>
                <select
                  id="classStyleId"
                  name="classStyleId"
                  defaultValue={batch.classStyleId}
                  required
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                >
                  <option value="">Select a style...</option>
                  {classStyles.map((style) => (
                    <option key={style.id} value={style.id}>{style.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="instructorId" className="text-gray-700 font-semibold text-sm">Assign Instructor</Label>
                <select
                  id="instructorId"
                  name="instructorId"
                  defaultValue={batch.instructorId || ""}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 h-11 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                >
                  <option value="">Unassigned</option>
                  {instructors.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.firstName} {ins.lastName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="schedule" className="text-gray-700 font-semibold text-sm">Schedule *</Label>
                  <Input id="schedule" name="schedule" defaultValue={batch.schedule} placeholder="e.g. Mon/Wed 6pm" required className="rounded-xl bg-gray-50 border-gray-200 h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="capacity" className="text-gray-700 font-semibold text-sm">Capacity</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={batch.capacity} min="1" required className="rounded-xl bg-gray-50 border-gray-200 h-11" />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isPending} className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11">
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
