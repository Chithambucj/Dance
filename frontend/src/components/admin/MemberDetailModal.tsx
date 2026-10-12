"use client";

import { useState, useEffect } from "react";
import { User, Layers, CheckSquare, CreditCard, X, Calendar, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFullMemberData } from "@/actions/dashboardData";
import MarkPaidButton from "@/components/admin/MarkPaidButton";

interface Batch {
  id: string;
  name: string;
  schedule: string;
  classStyle: { name: string };
  instructor: { firstName: string; lastName: string } | null;
}

interface Enrollment {
  id: string;
  status: string;
  joinedAt: Date | string;
  batch: Batch;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  description: string | null;
  referenceNumber: string | null;
  createdAt: Date | string;
}

interface Attendance {
  id: string;
  date: Date | string;
  present: boolean;
  batch: { name: string; classStyle: { name: string } };
}

interface MemberDetailModalProps {
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    status: string;
    isInstructor: boolean;
    createdAt: Date | string;
    enrollments: Enrollment[];
    payments: Payment[];
    memberships?: any[];
    attendances: Attendance[];
  };
  memberId?: string;
  triggerContext?: "button" | "row" | "none";
  initialTab?: "overview" | "batches" | "attendance" | "payments";
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MemberDetailModal({ 
  member: initialMember, 
  memberId, 
  triggerContext = "button",
  initialTab = "overview",
  isOpen: controlledIsOpen,
  onClose
}: MemberDetailModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "batches" | "attendance" | "payments">(initialTab);
  const [member, setMember] = useState(initialMember);
  const [isLoading, setIsLoading] = useState(false);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (controlledIsOpen === undefined) setInternalIsOpen(val);
    if (!val && onClose) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen && memberId && !member) {
      setIsLoading(true);
      getFullMemberData(memberId).then((data) => {
        if (data) {
          setMember(data as any);
        }
        setIsLoading(false);
      });
    }
  }, [isOpen, memberId, member]);

  const totalClasses = member?.attendances?.length || 0;
  const presentClasses = member?.attendances?.filter((a: any) => a.present).length || 0;
  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  const totalPaid = member?.payments
    ?.filter((p: any) => p.status === "COMPLETED")
    .reduce((s: any, p: any) => s + p.amount, 0) || 0;

  const pendingAmount = member?.payments
    ?.filter((p: any) => p.status === "PENDING")
    .reduce((s: any, p: any) => s + p.amount, 0) || 0;

  return (
    <>
      {triggerContext === "button" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2.5 py-1 text-xs font-bold h-8"
        >
          View Profile
        </Button>
      )}
      
      {triggerContext === "row" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="text-primary hover:underline font-semibold text-xs"
        >
          View Member
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            {isLoading || !member ? (
              <div className="p-12 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
            ) : (
              <>
            <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-xl shadow-inner">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black">{member.firstName} {member.lastName}</h2>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      member.status === "ACTIVE" ? "bg-green-500/20 text-green-300 border border-green-400/30" : "bg-red-500/20 text-red-300"
                    }`}>
                      {member.status}
                    </span>
                    {member.isInstructor && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/30 text-purple-200 border border-primary/40">
                        Instructor
                      </span>
                    )}
                  </div>
                  <p className="text-purple-200 text-xs mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {member.email}</span>
                    {member.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subnav */}
            <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "batches", label: `Batches (${member.enrollments.length})`, icon: Layers },
                { id: "attendance", label: `Attendance (${attendancePct}%)`, icon: CheckSquare },
                { id: "payments", label: `Invoices (₹${totalPaid.toLocaleString()})`, icon: CreditCard },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as typeof activeTab)}
                    className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all ${
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Quick Stat Highlights */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-600">Active Batches</p>
                      <p className="text-2xl font-black text-purple-900 mt-1">{member.enrollments.length}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                      <p className="text-xs font-semibold text-green-600">Attendance Rate</p>
                      <p className="text-2xl font-black text-green-900 mt-1">{attendancePct}%</p>
                      <p className="text-[10px] text-green-700 font-medium">{presentClasses} of {totalClasses} classes</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                      <p className="text-xs font-semibold text-orange-600">Pending Dues</p>
                      <p className="text-2xl font-black text-orange-900 mt-1">₹{pendingAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">Contact & Address</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs">Email</span>
                        <p className="font-semibold text-gray-900">{member.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Phone</span>
                        <p className="font-semibold text-gray-900">{member.phone || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Address</span>
                        <p className="font-semibold text-gray-900">{member.address || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Member Since</span>
                        <p className="font-semibold text-gray-900">
                          {new Date(member.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "batches" && (
                <div className="space-y-3">
                  {member.enrollments.length === 0 ? (
                    <p className="text-center py-8 text-sm text-gray-400 font-medium">No active enrollments.</p>
                  ) : (
                    member.enrollments.map((enr) => (
                      <div key={enr.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{enr.batch.name}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {enr.batch.classStyle.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> {enr.batch.schedule}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-semibold">Instructor</p>
                          <p className="text-sm font-bold text-gray-800">
                            {enr.batch.instructor ? `${enr.batch.instructor.firstName} ${enr.batch.instructor.lastName}` : "Unassigned"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "attendance" && (
                <div className="space-y-2">
                  {member.attendances.length === 0 ? (
                    <p className="text-center py-8 text-sm text-gray-400 font-medium">No attendance records yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                      {member.attendances.map((att) => (
                        <div key={att.id} className="p-3.5 bg-white flex items-center justify-between text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">{att.batch.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{att.batch.classStyle.name}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(att.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              att.present ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                            }`}>
                              {att.present ? "Present" : "Absent"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-3">
                  {/* CASE 1: Modern members — show Membership fee periods */}
                  {member.memberships && member.memberships.length > 0 ? (
                    member.memberships.map((m: any) => {
                      const isPending = m.pendingAmount > 0;
                      const pendingPayment = isPending
                        ? member.payments.find(
                            (p: any) => (p as any).membershipId === m.id && p.status === "PENDING"
                          )
                        : null;
                      return (
                        <div key={m.id} className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{m.plan?.name || "Dance Membership Fee"}</h4>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                !isPending ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                              }`}>
                                {!isPending ? "PAID" : "PENDING"}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 font-medium mt-1">
                              {new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              {" • "}
                              Expires: {m.expiryDate
                                ? new Date(m.expiryDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                                : "—"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                            <p className="text-base font-black text-gray-900">
                              ₹{(isPending ? m.pendingAmount : (m.amountPaid || m.totalFee || 0)).toLocaleString()}
                            </p>
                            {isPending && pendingPayment && (
                              <MarkPaidButton
                                paymentId={pendingPayment.id}
                                onSuccess={() => {
                                  if (memberId) {
                                    getFullMemberData(memberId).then((data) => {
                                      if (data) setMember(data as any);
                                    });
                                  }
                                }}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : member.payments && member.payments.length > 0 ? (
                    /* CASE 2: Legacy members — show raw Payment records */
                    member.payments.map((p: any) => (
                      <div key={p.id} className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900">{p.description || "Dance Membership Fee"}</h4>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              p.status === "COMPLETED"
                                ? "bg-green-50 text-green-600"
                                : p.status === "PENDING"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-red-50 text-red-600"
                            }`}>
                              {p.status === "COMPLETED" ? "PAID" : p.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-medium mt-1">
                            {new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            {p.paymentMethod && ` • ${p.paymentMethod}`}
                            {p.referenceNumber && ` • Ref: ${p.referenceNumber}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <p className="text-base font-black text-gray-900">₹{p.amount.toLocaleString()}</p>
                          {(p.status === "PENDING" || p.status === "OVERDUE") && (
                            <MarkPaidButton
                              paymentId={p.id}
                              onSuccess={() => {
                                if (memberId) {
                                  getFullMemberData(memberId).then((data) => {
                                    if (data) setMember(data as any);
                                  });
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-8 text-sm text-gray-400 font-medium">No invoice records found.</p>
                  )}
                </div>
              )}

            </div>
            </>
            )}

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
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
