import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Target, Users, TrendingUp, TrendingDown, PlusCircle, BarChart3, Phone } from "lucide-react";

const kpis = [
  { label: "Total Leads", value: 245, icon: Target, color: "text-blue-600" },
  { label: "Converted", value: "156 (64%)", icon: TrendingUp, color: "text-green-600" },
  { label: "In Pipeline", value: 52, icon: BarChart3, color: "text-amber-600" },
  { label: "Lost", value: 37, icon: TrendingDown, color: "text-red-600" },
];

const leadSources = [
  { source: "Google Ads", pct: 32 },
  { source: "WhatsApp", pct: 25 },
  { source: "Doctor Referral", pct: 20 },
  { source: "Walk-in", pct: 12 },
  { source: "Facebook", pct: 6 },
  { source: "Website", pct: 5 },
];

const stages = ["New", "Contacted", "Interested", "Appointment Booked", "Visited", "Converted"];

const leads = [
  { name: "Rahul Sharma", phone: "9876543210", source: "Google Ads", date: "2026-07-01", interest: "Panchakarma", status: "New", assignedTo: "Dr. Priya" },
  { name: "Anita Verma", phone: "9812345678", source: "WhatsApp", date: "2026-07-01", interest: "OPD", status: "Contacted", assignedTo: "Meena" },
  { name: "Suresh Patel", phone: "9898765432", source: "Doctor Referral", date: "2026-06-30", interest: "Lab Package", status: "Interested", assignedTo: "Dr. Priya" },
  { name: "Kavita Nair", phone: "9845612378", source: "Walk-in", date: "2026-06-30", interest: "OPD", status: "Converted", assignedTo: "Reception" },
  { name: "Manoj Kumar", phone: "9765432100", source: "Facebook", date: "2026-06-29", interest: "Panchakarma", status: "Lost", assignedTo: "Meena" },
  { name: "Deepa Singh", phone: "9654321098", source: "Google Ads", date: "2026-06-29", interest: "Package", status: "Interested", assignedTo: "Dr. Priya" },
  { name: "Arjun Reddy", phone: "9543210987", source: "Website", date: "2026-06-28", interest: "Lab", status: "Contacted", assignedTo: "Reception" },
  { name: "Meera Das", phone: "9432109876", source: "WhatsApp", date: "2026-06-28", interest: "OPD", status: "New", assignedTo: "Meena" },
];

const statusColor: Record<string, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-purple-100 text-purple-700",
  Interested: "bg-amber-100 text-amber-700",
  Converted: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
  "Appointment Booked": "bg-indigo-100 text-indigo-700",
  Visited: "bg-teal-100 text-teal-700",
};

const LeadCapture = () => {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6" /> Lead Capture & Marketing Funnel</h1>
        <Button size="sm" onClick={() => toast.success("Add Lead form coming soon")}><PlusCircle className="h-4 w-4 mr-1" /> Add Lead</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-3 text-center"><k.icon className={`h-4 w-4 mx-auto ${k.color}`} /><p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p><p className="text-[10px] text-muted-foreground">{k.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Lead Sources Bar Chart */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Lead Sources Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {leadSources.map((s) => (
            <div key={s.source} className="flex items-center gap-2">
              <span className="text-xs w-28 shrink-0">{s.source}</span>
              <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/70 rounded-full flex items-center justify-end pr-2" style={{ width: `${s.pct}%` }}><span className="text-[9px] text-white font-medium">{s.pct}%</span></div></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Funnel Stages */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Lead Funnel Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {stages.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <Badge className={`text-[9px] whitespace-nowrap ${statusColor[s] || "bg-gray-100 text-gray-700"}`}>{s}</Badge>
                {i < stages.length - 1 && <span className="text-muted-foreground text-xs">&rarr;</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Recent Leads</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b"><tr><th className="text-left py-2">Name</th><th className="text-left py-2">Phone</th><th className="text-left py-2">Source</th><th className="text-left py-2">Date</th><th className="text-left py-2">Interested In</th><th className="text-center py-2">Status</th><th className="text-left py-2">Assigned To</th></tr></thead>
            <tbody>{leads.map((l, i) => (
              <tr key={i} className="border-b hover:bg-muted/50"><td className="py-2 font-medium">{l.name}</td><td className="py-2 text-muted-foreground">{l.phone}</td><td className="py-2">{l.source}</td><td className="py-2 text-muted-foreground">{l.date}</td><td className="py-2">{l.interest}</td><td className="py-2 text-center"><Badge className={`text-[9px] ${statusColor[l.status]}`}>{l.status}</Badge></td><td className="py-2 text-muted-foreground">{l.assignedTo}</td></tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* Monthly Conversion Trend */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Conversion Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-24">
            {[42, 55, 48, 63, 58, 64].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/70 rounded-t" style={{ height: `${v * 1.2}px` }} />
                <span className="text-[9px] text-muted-foreground">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Conversion Rate % by Month</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadCapture;
