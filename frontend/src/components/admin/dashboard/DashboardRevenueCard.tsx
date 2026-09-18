"use client";

import { useState } from "react";
import { CreditCard, X, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardRevenueData } from "@/actions/dashboardData";
import { Input } from "@/components/ui/input";

export default function DashboardRevenueCard({ initialValue, initialChange }: { initialValue: string, initialChange: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = async () => {
    setIsOpen(true);
    if (!data) {
      setIsLoading(true);
      try {
        const fetched = await getDashboardRevenueData();
        setData(fetched);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const filteredTransactions = data?.transactions.filter((t: any) => 
    t.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl group">
        <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white h-full group-hover:border-purple-600/20 border transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <div className="p-3 rounded-2xl text-purple-600 bg-purple-50">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-gray-900">{initialValue}</h3>
              <p className="text-xs font-semibold text-gray-400 mt-1">{initialChange}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Revenue Overview
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoading || !data ? (
                <div className="flex justify-center p-12"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-2xl font-black text-gray-900">₹{data.stats.total.toLocaleString()}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-center">
                      <p className="text-2xl font-black text-orange-700">₹{data.stats.pending.toLocaleString()}</p>
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Pending</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-2xl font-black text-blue-700">₹{data.stats.thisMonth.toLocaleString()}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">This Month</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center">
                      <p className="text-2xl font-black text-green-700">₹{data.stats.today.toLocaleString()}</p>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Today</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-2xl font-black text-gray-700">₹{data.stats.lastMonth.toLocaleString()}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Month</p>
                    </div>
                  </div>

                  {/* Data Table Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Payment Transactions</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Search transactions..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9 text-xs w-64 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500">
                          <tr>
                            <th className="px-4 py-3 font-bold">Date</th>
                            <th className="px-4 py-3 font-bold">Member</th>
                            <th className="px-4 py-3 font-bold">Payment Type</th>
                            <th className="px-4 py-3 font-bold">Method</th>
                            <th className="px-4 py-3 font-bold">Amount</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredTransactions.map((t: any) => (
                            <tr key={t.id} className="hover:bg-gray-50/30 transition-colors cursor-pointer" onClick={() => {}}>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {new Date(t.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900">{t.member}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{t.type}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{t.method}</td>
                              <td className="px-4 py-3 font-black text-gray-900">₹{t.amount.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  t.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                                  t.status === "PENDING" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredTransactions.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No transactions found matching your search.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
