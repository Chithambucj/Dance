"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Clock, CreditCard, ChevronRight, MoreHorizontal, UserSquare2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const attendanceData = [
  { name: "Mon", value: 60 },
  { name: "Tue", value: 85 },
  { name: "Wed", value: 75 },
  { name: "Thu", value: 65 },
  { name: "Fri", value: 90 },
  { name: "Sat", value: 110 },
  { name: "Sun", value: 105 },
];

const upcomingBatches = [
  { name: "Hip Hop Beginners", style: "Hip Hop", instructor: "Alex Johnson", start: "20 May, 2025", students: "12/20" },
  { name: "Bollywood Fusion", style: "Bollywood", instructor: "Priya Sharma", start: "22 May, 2025", students: "15/25" },
  { name: "Salsa Intermediate", style: "Salsa", instructor: "John D'Cruz", start: "25 May, 2025", students: "10/20" },
];

const popularClasses = [
  { name: "Hip Hop", students: "45 Students", color: "bg-primary/20 text-primary", icon: UserSquare2 },
  { name: "Bollywood", students: "38 Students", color: "bg-orange-100 text-orange-600", icon: Users },
  { name: "Contemporary", students: "25 Students", color: "bg-blue-100 text-blue-600", icon: Clock },
  { name: "Salsa", students: "20 Students", color: "bg-green-100 text-green-600", icon: CalendarDays },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Members" 
          value="256" 
          subtext="+12 this month" 
          icon={Users} 
          iconColor="text-primary bg-primary/10" 
          subtextColor="text-primary"
        />
        <MetricCard 
          title="Active Batches" 
          value="18" 
          subtext="+2 this month" 
          icon={CalendarDays} 
          iconColor="text-green-600 bg-green-100" 
          subtextColor="text-green-600"
        />
        <MetricCard 
          title="Today's Classes" 
          value="6" 
          subtext="View Schedule" 
          icon={Clock} 
          iconColor="text-orange-600 bg-orange-100" 
          subtextColor="text-blue-600 cursor-pointer"
        />
        <MetricCard 
          title="Pending Payments" 
          value="₹12,450" 
          subtext="View Details" 
          icon={CreditCard} 
          iconColor="text-red-600 bg-red-100" 
          subtextColor="text-blue-600 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-sm border-gray-100 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Attendance Overview</CardTitle>
            <button className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6c5ce7" 
                    strokeWidth={3}
                    dot={{ fill: '#6c5ce7', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#6c5ce7', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Classes */}
        <Card className="shadow-sm border-gray-100 rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Popular Classes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {popularClasses.map((cls) => (
                <div key={cls.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls.color}`}>
                      <cls.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cls.name}</p>
                      <p className="text-xs font-medium text-gray-500">{cls.students}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Batches Table */}
      <Card className="shadow-sm border-gray-100 rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-bold text-gray-900">Upcoming Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Batch Name</th>
                  <th className="pb-3 font-semibold">Dance Style</th>
                  <th className="pb-3 font-semibold">Instructor</th>
                  <th className="pb-3 font-semibold">Start Date</th>
                  <th className="pb-3 font-semibold">Students</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {upcomingBatches.map((batch) => (
                  <tr key={batch.name} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 font-bold text-gray-900">{batch.name}</td>
                    <td className="py-4 font-medium text-gray-600">{batch.style}</td>
                    <td className="py-4 font-medium text-gray-600">{batch.instructor}</td>
                    <td className="py-4 font-medium text-gray-600">{batch.start}</td>
                    <td className="py-4 font-medium text-gray-600">{batch.students}</td>
                    <td className="py-4 text-right">
                      <button className="text-primary font-semibold hover:underline text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon: Icon, iconColor, subtextColor }: any) {
  return (
    <Card className="shadow-sm border-gray-100 rounded-2xl">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
          <p className={`text-xs font-semibold ${subtextColor}`}>{subtext}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
