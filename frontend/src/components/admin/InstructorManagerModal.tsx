"use client";

import { useState, useTransition } from "react";
import { createMember, editMember } from "@/actions/members";
import { Plus, Edit2, Loader2, X, GraduationCap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  experience: string | null;
  specialities: string | null;
  profileImage: string | null;
}

interface InstructorManagerModalProps {
  instructor?: Instructor;
  mode?: "create" | "edit";
}

export default function InstructorManagerModal({ instructor, mode = "create" }: InstructorManagerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError("");
    formData.set("isInstructor", "on"); // Always mark as instructor

    startTransition(async () => {
      let result;
      if (mode === "edit" && instructor) {
        result = await editMember(instructor.id, formData);
      } else {
        result = await createMember(formData);
      }

      if (result.success) {
        setIsOpen(false);
      } else {
        setError(result.error || "Failed to save instructor.");
      }
    });
  }

  return (
    <>
      {mode === "create" ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 px-5"
        >
          <Plus className="w-5 h-5" /> Add Instructor
        </Button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Edit Instructor"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                {mode === "edit" ? "Edit Instructor Profile" : "Add New Instructor"}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-gray-700 font-semibold text-sm">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={instructor?.firstName || ""}
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-gray-700 font-semibold text-sm">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={instructor?.lastName || ""}
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={instructor?.email || ""}
                    required
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={instructor?.phone || ""}
                    placeholder="+91-98765-43210"
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="experience" className="text-gray-700 font-semibold text-sm">Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    defaultValue={instructor?.experience || "5+ Years"}
                    placeholder="e.g. 8+ Years"
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="specialities" className="text-gray-700 font-semibold text-sm">Dance Styles / Specialties</Label>
                  <Input
                    id="specialities"
                    name="specialities"
                    defaultValue={instructor?.specialities || ""}
                    placeholder="e.g. Hip Hop, Popping, Bollywood"
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profileImage" className="text-gray-700 font-semibold text-sm">Photo URL / File Path</Label>
                <Input
                  id="profileImage"
                  name="profileImage"
                  defaultValue={instructor?.profileImage || ""}
                  placeholder="e.g. /images/hip-hop.jpg"
                  className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-gray-700 font-semibold text-sm">Biography & Achievements</Label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={instructor?.bio || ""}
                  placeholder="Describe teaching experience, performance background, and certifications..."
                  rows={3}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-medium"
                />
              </div>

              {mode === "create" && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">Initial Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    defaultValue="password"
                    className="rounded-xl bg-gray-50 border-gray-200 h-11 font-medium"
                  />
                </div>
              )}

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-bold h-11"
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving Instructor...
                    </span>
                  ) : mode === "edit" ? "Save Changes" : "Create Instructor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
