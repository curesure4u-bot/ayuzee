import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, Users, TrendingDown, Phone, MessageSquare, Brain, Calendar, IndianRupee } from "lucide-react";

const kpis = [
  { label: "No-shows This Month", value: 23, icon: AlertTriangle, color: "text-red-600" },
  { label: "No-show Rate", value: "8.2%", icon: TrendingDown, color: "text-amber-600" },
  { label: "Recovered (Re-booked)", value: 7, icon: Users, color: "text-green-600" },
  { label: "Lost Revenue Est.", value: "₹34,500", icon: IndianRupee, color: "text-purple-600" },
];

const reasons = [
  { reason: "Forgot", pct: 35, color: "bg-blue-500" },
  { reason: "Feeling better", pct: 22, color: "bg-green-500" },
  { reason: "Transport issue", pct: 18, color: "bg-amber-500" },
  { reason: "Cost concern", pct: 12, color: "bg-red-500" },
  { reason: "Went elsewhere", pct: 8, color: "bg-purple-500" },
  { reason: "Unknown", pct: 5, color: "bg-gray-400" },
];

const topNoshowPatients = [
  { name: "Vikram Patel", missed: 4, lastScheduled: "2024-12-20", lastVisited: "2024-10-15", daysSince: 72, status: "Not Reached" },
  { name: "Sunita Rao", missed: 3, lastScheduled: "2024-12-18", lastVisited: "2024-11-02", daysSince: 55, status: "Contacted" },
  { name: "Rajesh Kumar", missed: 3, lastScheduled: "2024-12-22", lastVisited: "2024-09-28", daysSince: 89, status: "Lost" },
  { name: "Priya Menon", missed: 2, lastScheduled: "2024-12-19", lastVisited: "2024-11-20", daysSince: 37, status: "Re-booked" },
  { name: "Arun Nair", missed: 2, lastScheduled: "2024-12-21", lastVisited: "2024-10-05", daysSince: 82, status: "Not Reached" },
  { name: "Lakshmi Devi", missed: 2, lastScheduled: "2024-12-17", lastVisited: "2024-11-10", daysSince: 47, status: "Contacted" },
];

const funnel = [
  { stage: "Registered", count: 500, color: "bg-blue-500" },
  { stage: "First Visit", count: 420, color: "bg-cyan-500" },
  { stage: "Second Visit", count: 280, color: "bg-green-500" },
  { stage: "Regular", count: 180, color: "bg-amber-500" },
  { stage: "Loyal", count: 95, color: "bg-purple-500" },
];

const daySlotAnalysis = [
  { day: "Monday AM", rate: "14.5%", highlight: true },
  { day: "Monday PM", rate: "9.2%", highlight: false },
  { day: "Tuesday AM", rate: "7.8%", highlight: false },
  { day: "Wednesday AM", rate: "6.5%", highlight: false },
  { day: "Thursday PM", rate: "8.1%", highlight: false },
  { day: "Friday AM", rate: "5.2%", highlight: false },
  { day: "Saturday AM", rate: "10.3%", highlight: true },
];

const statusColor: Record<string, string> = {
  Contacted: "bg-blue-100 text-blue-700",
  "Not Reached": "bg-amber-100 text-amber-700",
  "Re-booked": "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

const NoshowAnalytics = () => {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="h-6 w-6" /> No-show & Drop-off Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-3 text-center"><k.icon className={`h-4 w-4 mx-auto ${k.color}`} /><p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p><p className="text-[10px] text-muted-foreground">{k.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Reasons + Day Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">No-show Reasons</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {reasons.map((r) => (
              <div key={r.reason} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${r.color}`} />
                <span className="text-xs flex-1">{r.reason}</span>
                <div className="w-24 bg-gray-100 rounded-full h-2"><div className={`h-2 rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} /></div>
                <span className="text-xs font-medium w-8 text-right">{r.pct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> High No-show Slots</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {daySlotAnalysis.map((d) => (
              <div key={d.day} className={`flex items-center justify-between text-xs border rounded-md p-2 ${d.highlight ? "border-red-200 bg-red-50/50" : ""}`}>
                <span className="font-medium">{d.day}</span>
                <span className={d.highlight ? "text-red-600 font-bold" : "text-muted-foreground"}>{d.rate}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Funnel */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Patient Drop-off Funnel</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {funnel.map((f) => (
              <div key={f.stage} className="flex-1 flex flex-col items-center">
                <span className="text-xs font-bold mb-1">{f.count}</span>
                <div className={`w-full rounded-t ${f.color}`} style={{ height: `${(f.count / 500) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground mt-1 text-center">{f.stage}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top No-show Patients */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Top No-show Patients</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b"><tr><th className="text-left py-2">Patient</th><th className="text-center py-2">Missed</th><th className="text-left py-2">Last Scheduled</th><th className="text-left py-2">Last Visited</th><th className="text-center py-2">Days Since</th><th className="text-center py-2">Status</th><th className="text-center py-2">Actions</th></tr></thead>
            <tbody>{topNoshowPatients.map((p, i) => (
              <tr key={i} className="border-b hover:bg-muted/50">
                <td className="py-2 font-medium">{p.name}</td>
                <td className="py-2 text-center text-red-600 font-bold">{p.missed}</td>
                <td className="py-2 text-muted-foreground">{p.lastScheduled}</td>
                <td className="py-2 text-muted-foreground">{p.lastVisited}</td>
                <td className="py-2 text-center">{p.daysSince}</td>
                <td className="py-2 text-center"><Badge className={`text-[9px] ${statusColor[p.status] || "bg-gray-100 text-gray-700"}`}>{p.status}</Badge></td>
                <td className="py-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => toast.success(`WhatsApp sent to ${p.name}`)}><MessageSquare className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => toast.success(`AI call to ${p.name}`)}><Phone className="h-3 w-3" /></Button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* AI Insight */}
      <Card className="border-blue-200 bg-blue-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm text-blue-700 flex items-center gap-2"><Brain className="h-4 w-4" /> AI Insight</CardTitle></CardHeader>
        <CardContent><p className="text-xs text-blue-800">Patients with no reminder sent have 3× higher no-show rate. Enable auto-reminder 24hr before appointment. Monday mornings have the highest no-show rate — consider overbooking by 10% or sending double reminders.</p></CardContent>
      </Card>

      {/* Re-engagement Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("WhatsApp campaign sent to no-show patients")}><MessageSquare className="h-4 w-4 mr-1" /> Send WhatsApp</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("AI voice call campaign started")}><Phone className="h-4 w-4 mr-1" /> AI Voice Call</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Discount offer sent")}><IndianRupee className="h-4 w-4 mr-1" /> Offer Discount</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Assigned to doctor for follow-up")}><Users className="h-4 w-4 mr-1" /> Assign to Doctor</Button>
      </div>
    </div>
  );
};

export default NoshowAnalytics;
