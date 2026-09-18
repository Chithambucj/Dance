"use client";

import { useState } from "react";
import { CheckSquare, X, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardAttendanceData } from "@/actions/dashboardData";
import { Input } from "@/components/ui/input";

export default function DashboardAttendanceSection({ 
  initialAttendancePct, 
  initialPresentCount, 
  initialTotalCount 
}: { 
  initialAttendancePct: number, 
  initialPresentCount: number, 
  initialTotalCount: number 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const handleOpen = async () => {
    setIsOpen(true);
    if (!data) {
      setIsLoading(true);
      try {
        const fetched = await getDashboardAttendanceData();
        setData(fetched);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const filteredRecords = data?.records.filter((r: any) => {
    const matchesSearch = 
      r.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.batch.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "ALL" || r.status.toUpperCase() === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl group h-full">
        <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white h-full group-hover:border-primary/20 border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-2">
                Attendance Overview
              </CardTitle>
              <CardDescription className="text-gray-400 font-medium">Overall studio attendance rate: <span className="text-primary font-bold">{initialAttendancePct}%</span></CardDescription>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-green-50 text-green-700 rounded-full">
              {initialPresentCount} / {initialTotalCount} Check-ins
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-56 w-full relative flex items-center justify-center bg-gray-50/50 rounded-2xl border border-gray-100/60 p-6 group-hover:bg-primary/5 transition-colors">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-black text-2xl group-hover:scale-110 transition-transform">
                  {initialAttendancePct}%
                </div>
                <h4 className="font-extrabold text-gray-800 text-sm">Consistent Dance Engagement</h4>
                <p className="text-xs text-gray-400 font-medium max-w-sm">
                  {initialPresentCount} present records recorded across all batches and active students.
                </p>
                <p className="text-[10px] text-primary font-bold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">Click for details →</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Detailed Attendance Records
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
                      <p className="text-2xl font-black text-gray-900">{data.stats.percentage}%</p>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Rate</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                      <p className="text-2xl font-black text-blue-700">{data.stats.totalRecords}</p>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Records</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-center">
                      <p className="text-2xl font-black text-green-700">{data.stats.presentToday}</p>
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Present Today</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-center">
                      <p className="text-2xl font-black text-red-700">{data.stats.absentToday}</p>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Absent Today</p>
                    </div>
                  </div>

                  {/* Data Table Area */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-gray-900">Recent Check-ins</h3>
                      <div className="flex items-center gap-2">
                        <select 
                          className="h-9 text-xs rounded-xl border-gray-200 bg-white px-3 focus:ring-primary focus:border-primary"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="ALL">All Status</option>
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Search student or batch..." 
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
                            <th className="px-4 py-3 font-bold">Student</th>
                            <th className="px-4 py-3 font-bold">Batch</th>
                            <th className="px-4 py-3 font-bold">Instructor</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredRecords.map((r: any) => (
                            <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                              <td className="px-4 py-3 text-gray-500 text-xs font-medium">
                                {new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-900">{r.student}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{r.batch}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{r.instructor}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  r.status === "Present" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                                }`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredRecords.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">No attendance records found matching your filters.</td>
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
