"use client";

import { useState } from "react";
import { BookOpen, Users, Calendar, Clock, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Batch {
  id: string;
  name: string;
  schedule: string;
  capacity: number;
  instructor: { firstName: string; lastName: string } | null;
  _count: { enrollments: number };
}

interface ClassDetailModalProps {
  classStyle: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    level: string | null;
    price: number | null;
    duration: string | null;
    isPublished: boolean;
    batches: Batch[];
  };
}

export default function ClassDetailModal({ classStyle }: ClassDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalEnrolled = classStyle.batches.reduce((sum, b) => sum + b._count.enrollments, 0);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-gray-700 hover:text-primary hover:bg-primary/10 rounded-lg px-2.5 h-8"
      >
        View Details
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{classStyle.name}</h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {classStyle.level || "All Levels"}
                  </span>
                </div>
                <p className="text-purple-200 text-xs mt-1">
                  {classStyle.duration || "60 mins"} • ₹{classStyle.price?.toLocaleString() || "1,500"} / month
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-1.5">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {classStyle.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600">Active Batches</p>
                  <p className="text-xl font-black text-purple-900 mt-0.5">{classStyle.batches.length}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-green-50 border border-green-100">
                  <p className="text-xs font-semibold text-green-600">Total Enrolled</p>
                  <p className="text-xl font-black text-green-900 mt-0.5">{totalEnrolled} students</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2">Running Batches</h4>
                {classStyle.batches.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No active batches for this dance style yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {classStyle.batches.map((b) => (
                      <div key={b.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-gray-900">{b.name}</p>
                          <p className="text-gray-500 font-medium">{b.schedule}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-primary">{b._count.enrollments} / {b.capacity}</span>
                          <p className="text-[10px] text-gray-400">
                            {b.instructor ? `${b.instructor.firstName} ${b.instructor.lastName}` : "Unassigned"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button onClick={() => setIsOpen(false)} className="rounded-xl font-bold px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
