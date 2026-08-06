import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, CalendarClock, Heart, CreditCard, Warehouse, Clock,
  FileSpreadsheet, Printer, Brain, Building2, Sparkles, Zap,
  Bell, ClipboardList, MessageSquare, Syringe, Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ---------- PATIENT REPORTS ---------- */
const patientReports = [
  { label: "Registration", items: ["All"], color: "bg-teal-600" },
  { label: "Registration By Area", items: ["All"], color: "bg-teal-700" },
  { label: "Registration By Type", items: ["All"], color: "bg-green-600" },
  { label: "Registration By Tag", items: ["All"], color: "bg-green-700" },
  { label: "Registration By Patient Source", items: ["All"], color: "bg-blue-600" },
  { label: "MRD", items: ["Patient MRD", "Cancel MRD"], color: "bg-blue-700" },
  { label: "TimeLine", items: ["All"], color: "bg-purple-600" },
  { label: "Merged Patient", items: ["All"], color: "bg-purple-700" },
];

/* ---------- VISIT REPORTS ---------- */
const visitReports = [
  { label: "Checked-In", items: ["By Date", "By Speciality", "Patient Flow Analysis"], color: "bg-teal-600" },
  { label: "O/P Casesheet Summary", items: ["All"], color: "bg-green-600" },
  { label: "O/P Prescription", items: ["All"], color: "bg-green-700" },
  { label: "I/P Admission Summary", items: ["By Date", "By Department"], color: "bg-blue-600" },
  { label: "I/P Discharge Summary", items: ["By Date"], color: "bg-blue-700" },
  { label: "Room Occupancy", items: ["By Room Type", "By Room", "By Floor"], color: "bg-purple-600" },
  { label: "Room Wise - Detailed", items: ["All"], color: "bg-purple-700" },
  { label: "I/P Cancelled Admission", items: ["All"], color: "bg-red-600" },
  { label: "Visits per Dr", items: ["All"], color: "bg-indigo-600" },
  { label: "Visits", items: ["By Type", "By Type - Manual Audit"], color: "bg-indigo-700" },
  { label: "Old Vs New Patient", items: ["All"], color: "bg-cyan-600" },
  { label: "Dr Vs New Patient", items: ["All"], color: "bg-cyan-700" },
  { label: "Dr Vs Treatment", items: ["All"], color: "bg-sky-600" },
  { label: "Appointment Vs Checkin", items: ["All"], color: "bg-sky-700" },
  { label: "Estimates", items: ["All Estimates", "Open Estimates"], color: "bg-amber-600" },
  { label: "Edited Checkin", items: ["All"], color: "bg-amber-700" },
  { label: "Gravida Report", items: ["All"], color: "bg-pink-600" },
  { label: "Video Consultation", items: ["By Date", "By Status", "By Speciality"], color: "bg-pink-700" },
  { label: "Emergency", items: ["By Date", "TAT By Test", "TAT By Dept"], color: "bg-red-700" },
  { label: "Location Vs Treatment", items: ["All"], color: "bg-emerald-600" },
  { label: "Dr Vs Treatment (Visit)", items: ["All"], color: "bg-emerald-700" },
  { label: "O/P Casesheet Summary (Visit)", items: ["All"], color: "bg-lime-600" },
];

/* ---------- APPOINTMENT REPORTS ---------- */
const appointmentReports = [
  { label: "Staff wise Total", color: "bg-teal-600" },
  { label: "By Date", color: "bg-teal-700" },
  { label: "By Speciality", color: "bg-green-600" },
  { label: "Booked Via", color: "bg-green-700" },
  { label: "Waiting Time Per Dr", color: "bg-blue-600" },
  { label: "Online", items: ["Appointments", "Waiting List", "Cancelled"], color: "bg-blue-700" },
  { label: "Cancelled", color: "bg-red-600" },
  { label: "Waiting List", color: "bg-amber-600" },
  { label: "Rescheduled List", color: "bg-amber-700" },
];

/* ---------- THERAPY REPORTS ---------- */
const therapyReports = [
  { label: "List all", items: ["All"], color: "bg-teal-600" },
  { label: "List By Therapist", items: ["All"], color: "bg-green-600" },
  { label: "Surgeries Wise", items: ["All"], color: "bg-blue-600" },
  { label: "Therapies Planned", items: ["All"], color: "bg-purple-600" },
  { label: "Therapies Unplanned", items: ["All"], color: "bg-indigo-600" },
  { label: "Cancelled", items: ["All"], color: "bg-red-600" },
];

/* ---------- PAYMENT GATEWAY ---------- */
const paymentGatewayReports = [
  { label: "Appointment", color: "bg-teal-600" },
  { label: "Video Consultation", color: "bg-green-600" },
  { label: "Franchise", color: "bg-blue-600" },
];

/* ---------- ASSET REPORTS ---------- */
const assetReports = [
  { label: "Purchase", items: ["All"], color: "bg-teal-600" },
  { label: "Asset Transfer", items: ["All"], color: "bg-green-600" },
  { label: "Maintenance", items: ["All"], color: "bg-blue-600" },
];

/* ---------- ATTENDANCE ---------- */
const attendanceReports = [
  { label: "Doctor Attendance", color: "bg-teal-600" },
  { label: "Staff Attendance", color: "bg-green-600" },
];

/* ---------- MISC REPORTS ---------- */
const miscReports = [
  { label: "Tasks", color: "bg-teal-600" },
  { label: "Patient Feedback", items: ["By OP", "By IP"], color: "bg-green-600" },
  { label: "Dental Orders", items: ["By Supplier", "By Date"], color: "bg-blue-600" },
  { label: "Vaccination", color: "bg-purple-600" },
  { label: "SMS", color: "bg-indigo-600" },
  { label: "Whatsapp", color: "bg-emerald-600" },
];

/* ---------- REMINDERS ---------- */
const reminderReports = [{ label: "Reminders", color: "bg-amber-600" }];

const visitsPerDrData = [
  { doctor: "Dr. Sivarama", visits: 85 },
  { doctor: "Dr. Priya", visits: 62 },
  { doctor: "Dr. Kumar", visits: 48 },
  { doctor: "Dr. Anitha", visits: 35 },
  { doctor: "Dr. Lakshmi", visits: 28 },
];

const MisOperational = () => {
  const [activeTab, setActiveTab] = useState("patients");

  const renderSection = (title: string, icon: React.ReactNode, reports: { label: string; items?: string[]; color: string }[]) => (
    <Card>
      <CardContent className="p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">{icon} {title}</p>
        <div className="flex flex-wrap gap-1.5">
          {reports.map((r) => (
            <Button key={r.label} size="sm" variant="outline" className="text-[10px] h-6 px-2">
              {r.label} {r.items && r.items.length > 1 && "▾"}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 mt-4">
      {/* AI Insight */}
      <Card className="border-primary/20">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Brain className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-primary">AI Operations Summary: </span>
              32 OPD visits today (12 new, 20 repeat). Avg waiting time: 18 min. Dr. Sivarama busiest (85 visits/month).
              2 IP discharges pending. Room occupancy: 65%. 5 appointments cancelled (follow-up needed).
              Staff attendance: 95%. 3 pending therapy sessions.
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="patients" className="text-xs"><Users className="mr-1 h-3 w-3" /> Patient</TabsTrigger>
          <TabsTrigger value="visits" className="text-xs"><Activity className="mr-1 h-3 w-3" /> Visits</TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs"><CalendarClock className="mr-1 h-3 w-3" /> Appointments</TabsTrigger>
          <TabsTrigger value="therapy" className="text-xs"><Heart className="mr-1 h-3 w-3" /> Therapy</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs"><CreditCard className="mr-1 h-3 w-3" /> Payment Gateway</TabsTrigger>
          <TabsTrigger value="reminders" className="text-xs"><Bell className="mr-1 h-3 w-3" /> Reminders</TabsTrigger>
          <TabsTrigger value="assets" className="text-xs"><Warehouse className="mr-1 h-3 w-3" /> Assets</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs"><Clock className="mr-1 h-3 w-3" /> Attendance</TabsTrigger>
          <TabsTrigger value="misc" className="text-xs"><ClipboardList className="mr-1 h-3 w-3" /> Misc</TabsTrigger>
        </TabsList>

        {/* PATIENTS */}
        <TabsContent value="patients" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Patient Reports</p>
              <div className="flex flex-wrap gap-1.5">
                {patientReports.map((r) => (
                  <Button key={r.label} size="sm" variant="outline" className={`text-[10px] h-6 px-2`}>
                    {r.label} {r.items && r.items.length > 1 && "▾"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-primary">S.No</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">ID</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">External ID</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Name</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Gender</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">DOB</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Age</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Reg Date</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Mobile</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Blood Group</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Area</th>
                      <th className="px-2 py-2 text-left font-medium text-primary">Referred By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="px-2 py-2">1</td>
                      <td className="px-2 py-2">P001</td>
                      <td className="px-2 py-2">EXT-2145</td>
                      <td className="px-2 py-2 font-medium">Rajesh Kumar</td>
                      <td className="px-2 py-2">Male</td>
                      <td className="px-2 py-2">15/03/1981</td>
                      <td className="px-2 py-2">45</td>
                      <td className="px-2 py-2">10/01/2026</td>
                      <td className="px-2 py-2">98xxx12345</td>
                      <td className="px-2 py-2">B+</td>
                      <td className="px-2 py-2">Kadayanallur</td>
                      <td className="px-2 py-2">Walk-in</td>
                    </tr>
                    <tr className="border-b hover:bg-muted/30">
                      <td className="px-2 py-2">2</td>
                      <td className="px-2 py-2">P002</td>
                      <td className="px-2 py-2">—</td>
                      <td className="px-2 py-2 font-medium">Sunita Devi</td>
                      <td className="px-2 py-2">Female</td>
                      <td className="px-2 py-2">22/08/1988</td>
                      <td className="px-2 py-2">38</td>
                      <td className="px-2 py-2">15/03/2026</td>
                      <td className="px-2 py-2">97xxx45678</td>
                      <td className="px-2 py-2">O+</td>
                      <td className="px-2 py-2">Rajapalayam</td>
                      <td className="px-2 py-2">Rajesh Kumar</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-2 border-t bg-amber-50 text-xs text-amber-700 font-medium">Total Registrations: 2</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISITS */}
        <TabsContent value="visits" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Visit Reports</p>
              <div className="flex flex-wrap gap-1.5">
                {visitReports.map((r) => (
                  <Button key={r.label} size="sm" variant="outline" className={`text-[10px] h-6 px-2`}>
                    {r.label} {r.items && r.items.length > 1 && "▾"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium">Visits per Doctor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={visitsPerDrData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="doctor" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPOINTMENTS */}
        <TabsContent value="appointments" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Appointment Reports</p>
              <div className="flex flex-wrap gap-1.5">
                {appointmentReports.map((r) => (
                  <Button key={r.label} size="sm" variant="outline" className={`text-[10px] h-6 px-2`}>
                    {r.label} {r.items && r.items.length > 1 && "▾"}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* THERAPY */}
        <TabsContent value="therapy" className="space-y-4 mt-4">
          {renderSection("Therapy Reports", <Heart className="h-3.5 w-3.5" />, therapyReports)}
        </TabsContent>

        {/* PAYMENT GATEWAY */}
        <TabsContent value="payment" className="space-y-4 mt-4">
          {renderSection("Payment Gateway Reports", <CreditCard className="h-3.5 w-3.5" />, paymentGatewayReports)}
        </TabsContent>

        {/* REMINDERS */}
        <TabsContent value="reminders" className="space-y-4 mt-4">
          {renderSection("Reminders", <Bell className="h-3.5 w-3.5" />, reminderReports)}
        </TabsContent>

        {/* ASSETS */}
        <TabsContent value="assets" className="space-y-4 mt-4">
          {renderSection("Asset Reports", <Warehouse className="h-3.5 w-3.5" />, assetReports)}
        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="space-y-4 mt-4">
          {renderSection("Attendance Reports", <Clock className="h-3.5 w-3.5" />, attendanceReports)}
        </TabsContent>

        {/* MISC */}
        <TabsContent value="misc" className="space-y-4 mt-4">
          {renderSection("Miscellaneous Reports", <ClipboardList className="h-3.5 w-3.5" />, miscReports)}
        </TabsContent>
      </Tabs>

      {/* Export */}
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
          <FileSpreadsheet className="mr-1 h-3 w-3" /> Export As CSV
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 bg-green-50 text-green-700 border-green-200">
          <FileSpreadsheet className="mr-1 h-3 w-3" /> Export As Excel
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7 bg-red-50 text-red-700 border-red-200">
          <Printer className="mr-1 h-3 w-3" /> Print
        </Button>
        <Button size="sm" variant="outline" className="text-xs h-7">
          <Printer className="mr-1 h-3 w-3" /> Dot Matrix Print
        </Button>
      </div>
    </div>
  );
};

export default MisOperational;
