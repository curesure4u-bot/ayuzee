import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Calendar, CheckCircle, Clock, AlertTriangle, Smartphone } from "lucide-react";

const leaves = [
  { id: "LV-045", date: "25-26 Jul 2026", type: "Planned Leave", reason: "Conference (AYUSH National Seminar)", status: "approved", coverage: "Dr. Priya", patients: 12 },
  { id: "LV-044", date: "30 Jul 2026", type: "Half Day (PM)", reason: "Personal", status: "approved", coverage: "Dr. Priya", patients: 5 },
  { id: "LV-043", date: "05 Aug 2026", type: "Full Day", reason: "CME Training", status: "pending", coverage: "Unassigned", patients: 8 },
  { id: "LV-042", date: "15 Jul 2026", type: "Emergency", reason: "Family emergency", status: "taken", coverage: "Dr. Priya + Rescheduled", patients: 10 },
];

const availability = [
  { day: "Mon", morning: "9AM-1PM", evening: "4PM-8PM", teleconsult: "8PM-9PM", status: "available" },
  { day: "Tue", morning: "9AM-1PM", evening: "4PM-8PM", teleconsult: "8PM-9PM", status: "available" },
  { day: "Wed", morning: "9AM-1PM", evening: "—", teleconsult: "7PM-9PM", status: "half_day" },
  { day: "Thu", morning: "9AM-1PM", evening: "4PM-8PM", teleconsult: "—", status: "available" },
  { day: "Fri", morning: "9AM-1PM", evening: "4PM-8PM", teleconsult: "8PM-9PM", status: "available" },
  { day: "Sat", morning: "9AM-1PM", evening: "—", teleconsult: "—", status: "half_day" },
  { day: "Sun", morning: "—", evening: "—", teleconsult: "Emergency only", status: "off" },
];

export default function DoctorLeave() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-indigo-600" /> Leave & Availability</h1>
          <p className="text-muted-foreground mt-1">Mark leave, block slots, set teleconsult hours. Patients auto-redirected to covering doctor.</p>
        </div>
        <Button size="sm" onClick={() => toast.success("Leave request submitted")}>+ Apply Leave</Button>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Weekly Availability</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-center">Day</th><th className="px-3 py-2 text-center">Morning</th><th className="px-3 py-2 text-center">Evening</th><th className="px-3 py-2 text-center">Teleconsult</th><th className="px-3 py-2 text-center">Status</th></tr></thead><tbody>
            {availability.map((a, i) => (
              <tr key={i} className={`border-b ${a.status === "off" ? "bg-red-50/30" : a.status === "half_day" ? "bg-amber-50/30" : ""}`}>
                <td className="px-3 py-2 text-center text-xs font-bold">{a.day}</td>
                <td className="px-3 py-2 text-center text-xs">{a.morning}</td>
                <td className="px-3 py-2 text-center text-xs">{a.evening}</td>
                <td className="px-3 py-2 text-center text-xs flex items-center justify-center gap-1">{a.teleconsult !== "—" && <Smartphone className="h-3 w-3 text-blue-500" />}{a.teleconsult}</td>
                <td className="px-3 py-2 text-center"><Badge variant={a.status === "available" ? "outline" : a.status === "half_day" ? "secondary" : "destructive"} className={`text-[10px] ${a.status === "available" ? "text-green-600" : ""}`}>{a.status.replace("_", " ")}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Leave History & Upcoming</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-muted/50"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">Date(s)</th><th className="px-3 py-2 text-center">Type</th><th className="px-3 py-2 text-left">Reason</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-left">Coverage</th><th className="px-3 py-2 text-center">Patients Affected</th></tr></thead><tbody>
            {leaves.map((l, i) => (
              <tr key={i} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2 text-xs font-mono">{l.id}</td>
                <td className="px-3 py-2 text-xs font-bold">{l.date}</td>
                <td className="px-3 py-2 text-center"><Badge variant="outline" className="text-[10px]">{l.type}</Badge></td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{l.reason}</td>
                <td className="px-3 py-2 text-center"><Badge variant={l.status === "approved" ? "outline" : l.status === "pending" ? "default" : "secondary"} className={`text-[10px] ${l.status === "approved" ? "text-green-600" : l.status === "taken" ? "text-blue-600" : ""}`}>{l.status}</Badge></td>
                <td className="px-3 py-2 text-xs">{l.coverage}</td>
                <td className="px-3 py-2 text-center text-xs">{l.patients}</td>
              </tr>
            ))}
          </tbody></table></div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4 flex items-start gap-3"><Brain className="h-5 w-5 text-purple-600 mt-0.5" /><div><p className="font-semibold text-purple-800">AI Leave Intelligence</p><p className="text-sm text-purple-700">25-26 Jul leave: 12 patients auto-notified via WhatsApp. 8 rescheduled to 28 Jul, 4 redirected to Dr. Priya. LV-043 (05 Aug) still unassigned — AI suggests Dr. Priya (least loaded that day). This month: 2 leave days taken (balance: 18 days). Teleconsult slots generating ₹8,500/month additional revenue (1 hour/day × 5 days = ₹340/slot avg).</p></div></CardContent></Card>
    </div>
  );
}
