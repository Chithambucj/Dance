"use client";

import { useState } from "react";
import { Sparkles, X, Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardPopularClassesData } from "@/actions/dashboardData";
import { Input } from "@/components/ui/input";

export default function DashboardPopularClassesSection({ initialPopularClasses, styleColors }: { initialPopularClasses: any[], styleColors: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = async (classId?: string) => {
    setIsOpen(true);
    if (classId) setSelectedClassId(classId);

    if (!data) {
      setIsLoading(true);
      try {
        const fetched = await getDashboardPopularClassesData();
        setData(fetched);
        if (!classId && fetched.length > 0) {
          setSelectedClassId(fetched[0].id);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    } else if (classId) {
      setSelectedClassId(classId);
    } else if (!selectedClassId && data.length > 0) {
      setSelectedClassId(data[0].id);
    }
  };

  const selectedClass = data?.find((c: any) => c.id === selectedClassId);
  
  const filteredStudents = selectedClass?.students.filter((s: any) => 
    s.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">Popular Classes</CardTitle>
          <CardDescription className="text-gray-400 font-medium">Most enrolled dance styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          {initialPopularClasses.length > 0 ? initialPopularClasses.map((cls, idx) => (
            <div 
              key={cls.id} 
              onClick={() => handleOpen(cls.id)}
              className="space-y-1.5 cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-800 group-hover:text-primary transition-colors">{cls.name}</span>
                <span className="font-semibold text-gray-500">{cls.students} Enrolled</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${styleColors[idx % styleColors.length]}`}
                  style={{ width: `${Math.min((cls.students / cls.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-400 text-center py-6">No enrollments yet.</p>
          )}
        </CardContent>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Dance Style Details
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden h-[600px] max-h-[70vh]">
              {/* Sidebar for Classes */}
              <div className="w-1/3 border-r border-gray-100 bg-gray-50/30 overflow-y-auto p-4 space-y-2">
                {isLoading || !data ? (
                  <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" /></div>
                ) : (
                  data.map((cls: any) => (
                    <button
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        selectedClassId === cls.id 
                          ? "bg-white border-2 border-primary shadow-sm" 
                          : "border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <h4 className={`font-bold ${selectedClassId === cls.id ? "text-primary" : "text-gray-800"}`}>
                        {cls.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{cls.stats.enrolled} Students • {cls.stats.batches} Batches</p>
                    </button>
                  ))
                )}
              </div>

              {/* Main Content Area */}
              <div className="w-2/3 bg-white flex flex-col overflow-hidden">
                {selectedClass ? (
                  <>
                    <div className="p-6 border-b border-gray-100 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black text-gray-900">{selectedClass.name}</h3>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                          {selectedClass.stats.enrolled} / {selectedClass.stats.capacity} Filled
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-bold uppercase">Batches</p>
                          <p className="text-xl font-black text-gray-900 mt-1">{selectedClass.stats.batches}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-bold uppercase">Students</p>
                          <p className="text-xl font-black text-gray-900 mt-1">{selectedClass.stats.enrolled}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500 font-bold uppercase">Capacity</p>
                          <p className="text-xl font-black text-gray-900 mt-1">{selectedClass.stats.capacity}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-gray-900">Enrolled Students</h4>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Search student..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-8 text-xs w-56 rounded-lg border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                            <tr>
                              <th className="px-4 py-2 font-bold">Student</th>
                              <th className="px-4 py-2 font-bold">Batch</th>
                              <th className="px-4 py-2 font-bold">Instructor</th>
                              <th className="px-4 py-2 font-bold text-center">Attendance</th>
                              <th className="px-4 py-2 font-bold text-right">Fee Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {filteredStudents.map((s: any) => (
                              <tr key={`${s.id}-${s.batch}`} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-2 font-bold text-gray-900">{s.student}</td>
                                <td className="px-4 py-2 text-xs text-gray-600 font-medium">{s.batch}</td>
                                <td className="px-4 py-2 text-xs text-gray-600">{s.instructor}</td>
                                <td className="px-4 py-2 text-center">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.attendancePct >= 75 ? "bg-green-50 text-green-700" : s.attendancePct >= 50 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700"}`}>
                                    {s.attendancePct}%
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-right">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.feeStatus === "Clear" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                    {s.feeStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {filteredStudents.length === 0 && (
                              <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">No students found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                    Select a class style to view details.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
