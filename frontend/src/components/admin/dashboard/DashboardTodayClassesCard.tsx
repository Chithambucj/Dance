"use client";

import { useState } from "react";
import { Calendar, X, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardTodayClassesData } from "@/actions/dashboardData";
import { Input } from "@/components/ui/input";

export default function DashboardTodayClassesCard({ initialValue, initialChange }: { initialValue: string, initialChange: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpen = async () => {
    setIsOpen(true);
    if (!data) {
      setIsLoading(true);
      try {
        const fetched = await getDashboardTodayClassesData();
        setData(fetched);
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const filteredClasses = data?.classes.filter((c: any) => 
    c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-lg rounded-3xl group">
        <Card className="rounded-3xl border-0 shadow-sm shadow-gray-100 bg-white h-full group-hover:border-orange-600/20 border transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Classes</p>
              <div className="p-3 rounded-2xl text-orange-600 bg-orange-50">
                <Calendar className="w-5 h-5" />
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
                <Calendar className="w-5 h-5 text-orange-600" />
                Today's Classes
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
                  {/* Data Table Area */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Today's Schedule</h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <Input 
                            placeholder="Search schedule..." 
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
                            <th className="px-4 py-3 font-bold">Schedule</th>
                            <th className="px-4 py-3 font-bold">Class</th>
                            <th className="px-4 py-3 font-bold">Batch</th>
                            <th className="px-4 py-3 font-bold">Instructor</th>
                            <th className="px-4 py-3 font-bold">Students</th>
                            <th className="px-4 py-3 font-bold">Attendance</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredClasses.map((c: any) => (
                            <tr key={c.id} className="hover:bg-gray-50/30 transition-colors cursor-pointer" onClick={() => {}}>
                              <td className="px-4 py-3 font-bold text-gray-900">{c.schedule}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{c.className}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">{c.batchName}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{c.instructor}</td>
                              <td className="px-4 py-3 font-bold">{c.students}</td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                <span className="font-bold text-gray-900">{c.attendancePct}%</span> ({c.present} P, {c.absent} A)
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredClasses.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No classes scheduled for today matching search.</td>
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
