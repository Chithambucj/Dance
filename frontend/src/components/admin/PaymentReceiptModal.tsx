"use client";

import { useState } from "react";
import { Receipt, X, Printer, CheckCircle2, Building, Calendar, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentReceiptModalProps {
  payment: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string | null;
    description: string | null;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: Date | string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      address: string | null;
    };
  };
}

export default function PaymentReceiptModal({ payment }: PaymentReceiptModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
        title="View Receipt"
      >
        <Receipt className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Printable Receipt Content */}
            <div className="p-8 space-y-6 text-gray-900" id="printable-receipt">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xl text-gray-900">
                      Dance<span className="text-primary">Studio</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Official Fee Invoice &amp; Receipt</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100/60 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">Total Amount Paid</p>
                <p className="text-3xl font-black text-purple-950 mt-1">₹{payment.amount.toLocaleString()}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    payment.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    payment.status === "PENDING" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                  }`}>
                    Status: {payment.status}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Receipt Ref ID</span>
                  <span className="font-mono font-bold text-gray-800">{payment.referenceNumber || payment.id.slice(0, 12)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Student / Member</span>
                  <span className="font-bold text-gray-900">{payment.user.firstName} {payment.user.lastName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Email / Contact</span>
                  <span className="font-medium text-gray-700">{payment.user.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Description</span>
                  <span className="font-semibold text-gray-800">{payment.description || "Studio Tuition Fee"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Payment Mode</span>
                  <span className="font-semibold text-gray-800">{payment.paymentMethod || "Direct"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50">
                  <span className="text-gray-400 font-medium">Payment Date</span>
                  <span className="font-medium text-gray-800">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      weekday: "short", year: "numeric", month: "short", day: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="rounded-xl font-bold gap-2 text-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-primary text-white font-bold px-6 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
