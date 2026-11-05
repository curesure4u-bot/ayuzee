import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarDays, Users, CheckCircle, XCircle } from "lucide-react";

type StaffMember = {
  sNo: number; name: string; attendance: Record<number, "A" | "P" | "">;
};

const daysInMonth = 31; // July 2026

const mockStaff: StaffMember[] = [
  { sNo: 4, name: "vignesh", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, "A" as const])) },
  { sNo: 7, name: "bhavani", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
  { sNo: 13, name: "sindhu", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
  { sNo: 15, name: "sankari", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
  { sNo: 16, name: "cashier", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
  { sNo: 20, name: "fathima", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
  { sNo: 21, name: "ashika", attendance: Object.fromEntries(Array.from({ length: 22 }, (_, i) => [i + 1, i < 2 ? "" : "A" as const])) },
];

const HmsStaffAttendance = () => {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [selectedMonth, setSelectedMonth] = useState("July");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedLocation, setSelectedLocation] = useState("loc1");
  const [activeTab, setActiveTab] = useState("new");

  const toggleAttendance = (sNo: number, day: number) => {
    setStaff(prev => prev.map(s => {
      if (s.sNo !== sNo) return s;
      const current = s.attendance[day];
      const next = current === "A" ? "P" : current === "P" ? "A" : "A";
      return { ...s, attendance: { ...s.attendance, [day]: next } };
    }));
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new" className="text-orange-600">New Attendance</TabsTrigger>
          <TabsTrigger value="list" className="text-red-600">List Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">New Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="2025">2025</SelectItem><SelectItem value="2026">2026</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-3 justify-end">
                <span className="text-xs flex items-center gap-1">Absent - <span className="inline-block w-5 h-5 rounded bg-red-200 text-center text-xs font-bold text-red-700 leading-5">A</span></span>
                <span className="text-xs flex items-center gap-1">Present - <span className="inline-block w-5 h-5 rounded bg-green-200 text-center text-xs font-bold text-green-700 leading-5">P</span></span>
              </div>

              {/* Entries selector */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs">Show</span>
                <Select defaultValue="100"><SelectTrigger className="w-[70px] h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="25">25</SelectItem><SelectItem value="50">50</SelectItem><SelectItem value="100">100</SelectItem></SelectContent></Select>
                <span className="text-xs">entries</span>
              </div>

              {/* Attendance Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left font-medium text-orange-700 sticky left-0 bg-white min-w-[40px]">S.No</th>
                      <th className="px-2 py-1 text-left font-medium text-orange-700 sticky left-[40px] bg-white min-w-[80px]">Name</th>
                      {days.map(d => (
                        <th key={d} className="px-1 py-1 text-center font-medium text-orange-700 min-w-[28px]">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.sNo} className="border-b hover:bg-muted/20">
                        <td className="px-2 py-1 font-medium sticky left-0 bg-white">{s.sNo}.</td>
                        <td className="px-2 py-1 font-medium sticky left-[40px] bg-white">{s.name}</td>
                        {days.map(d => {
                          const val = s.attendance[d] || "";
                          return (
                            <td key={d} className="px-0.5 py-1 text-center">
                              {d <= 22 ? (
                                <button
                                  onClick={() => toggleAttendance(s.sNo, d)}
                                  className={`w-6 h-6 rounded text-[10px] font-bold ${
                                    val === "A" ? "bg-red-200 text-red-700 hover:bg-red-300" :
                                    val === "P" ? "bg-green-200 text-green-700 hover:bg-green-300" :
                                    "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                  }`}
                                >
                                  {val || "—"}
                                </button>
                              ) : (
                                <span className="w-6 h-6 inline-block" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => toast.success("Attendance saved successfully")}>
                  Save Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-orange-600 text-center">List Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <Select defaultValue="loc1">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="loc1">#11, Main Road, Kadayanallur, .</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Month</Label>
                  <Select defaultValue="July">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Year</Label>
                  <Select defaultValue="2026">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="2025">2025</SelectItem><SelectItem value="2026">2026</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => toast.info("Fetching attendance report...")}>Go</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HmsStaffAttendance;
