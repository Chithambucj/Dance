"use client";

import { useState, useTransition } from "react";
import { editClassStyle } from "@/actions/classes";
import { Loader2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassStyle {
  id: string;
  name: string;
  description: string | null;
}

export default function EditClassStyleModal({ classStyle }: { classStyle: ClassStyle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await editClassStyle(classStyle.id, formData);
      if (result.success) {
        setIsOpen(false);
      } else {
        setError(result.error || "Failed to edit class style.");
      }
    });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
        title="Edit Style"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Class Style</h2>
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
                <Label htmlFor="name" className="text-gray-700 font-semibold text-sm">Style Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={classStyle.name}
                  required
                  className="rounded-xl bg-gray-50 border-gray-200 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-gray-700 font-semibold text-sm">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={classStyle.description || ""}
                  rows={3}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
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
