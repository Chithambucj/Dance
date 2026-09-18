"use client";

import { useState } from "react";
import { Layers, Users, Calendar, Clock, DollarSign, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Enrollment {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
}

interface BatchDetailModalProps {
  batch: {
    id: string;
    name: string;
    schedule: string;
    capacity: number;
    feeMonthly: number | null;
    feeQuarterly: number | null;
    feeYearly: number | null;
    classStyle: { name: string };
    instructor: { firstName: string; lastName: string; email: string; phone: string | null } | null;
    enrollments: Enrollment[];
    _count: { enrollments: number; attendances: number };
  };
}

export default function BatchDetailModal({ batch }: BatchDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const enrolledCount = batch.enrollments.length;
  const fillPct = Math.min((enrolledCount / batch.capacity) * 100, 100);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-gray-700 hover:text-primary hover:bg-primary/10 rounded-lg px-2.5 h-8"
      >
        View Roster
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black">{batch.name}</h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
                    {batch.classStyle.name}
                  </span>
                </div>
                <p className="text-purple-200 text-xs mt-1 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> {batch.schedule}
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
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600">Capacity</p>
                  <p className="text-xl font-black text-purple-900 mt-0.5">{enrolledCount} / {batch.capacity}</p>
                  <div className="w-full bg-purple-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${fillPct}%` }} />
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-green-50 border border-green-100">
                  <p className="text-xs font-semibold text-green-600">Monthly Fee</p>
                  <p className="text-xl font-black text-green-900 mt-0.5">₹{batch.feeMonthly?.toLocaleString() || "1,500"}</p>
                  <p className="text-[10px] text-green-700 mt-1 font-medium">₹{batch.feeQuarterly?.toLocaleString() || "4,000"} / qtr</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600">Assigned Instructor</p>
                  <p className="text-sm font-extrabold text-blue-900 mt-1">
                    {batch.instructor ? `${batch.instructor.firstName} ${batch.instructor.lastName}` : "Unassigned"}
                  </p>
                  {batch.instructor?.phone && (
                    <p className="text-[10px] text-blue-700 font-medium">{batch.instructor.phone}</p>
                  )}
                </div>
              </div>

              {/* Enrolled Students Roster */}
              <div>
                <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider mb-2 flex items-center justify-between">
                  <span>Enrolled Members ({enrolledCount})</span>
                  <span className="text-[10px] text-gray-500 font-semibold">{batch.capacity - enrolledCount} seats remaining</span>
                </h4>

                {batch.enrollments.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 font-medium">No members enrolled in this batch yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                    {batch.enrollments.map((enr, idx) => (
                      <div key={enr.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                            {enr.user.firstName.charAt(0)}{enr.user.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{enr.user.firstName} {enr.user.lastName}</p>
                            <p className="text-[10px] text-gray-400">{enr.user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-medium text-gray-500">{enr.user.phone || "—"}</span>
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
