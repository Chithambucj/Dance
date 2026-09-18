"use client";

import { useState } from "react";
import { Users, X, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardMembersData } from "@/actions/dashboardData";
import MemberDetailModal from "@/components/admin/MemberDetailModal";
import { Input } from "@/components/ui/input";

export default function DashboardMembersCard({ initialValue, initialChange }: { initialValue: string, initialChange: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = async () => {
    setIsOpen(true);
    if (!data) {
      setIsLoading(true);
      try {
        const fetched = await getDashboardMembersData();
        setData(fetched);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const filteredMembers = data?.members.filter((m: any) => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone?.includes(searchTerm) || m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl group">
        <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white h-full group-hover:border-primary/20 border transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Members</p>
              <div className="p-3 rounded-2xl text-primary bg-primary/10">
                <Users className="w-5 h-5" />
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
                <Users className="w-5 h-5 text-primary" />
                Total Members
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                      <p className="text-2xl font-black text-gray-900">{data.stats.total}</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Members</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center">
                      <p className="text-2xl font-black text-green-700">{data.stats.active}</p>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Active</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                      <p className="text-2xl font-black text-red-700">{data.stats.inactive}</p>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Inactive</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-2xl font-black text-blue-700">{data.stats.newThisMonth}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">New This Month</p>
                    </div>
                  </div>

                  {/* Data Table Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Search members..." 
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
                            <th className="px-4 py-3 font-bold">Member</th>
                            <th className="px-4 py-3 font-bold">Phone</th>
                            <th className="px-4 py-3 font-bold">Class / Batch</th>
                            <th className="px-4 py-3 font-bold">Joining Date</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredMembers.map((m: any) => (
                            <tr key={m.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-bold text-gray-900">{m.firstName} {m.lastName}</p>
                                <p className="text-xs text-gray-500">{m.email}</p>
                              </td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{m.phone || "—"}</td>
                              <td className="px-4 py-3">
                                {m.enrollments.map((e: any, i: number) => (
                                  <div key={i} className="text-xs">
                                    <span className="font-bold text-gray-800">{e.className}</span>
                                    <span className="text-gray-500"> ({e.batchName})</span>
                                  </div>
                                ))}
                                {m.enrollments.length === 0 && <span className="text-xs text-gray-400">None</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${m.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <MemberDetailModal memberId={m.id} triggerContext="row" />
                              </td>
                            </tr>
                          ))}
                          {filteredMembers.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No members found matching your search.</td>
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
