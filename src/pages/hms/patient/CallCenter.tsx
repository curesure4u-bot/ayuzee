import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, PhoneCall, PhoneMissed, Clock, Users, ArrowDownLeft, ArrowUpRight, MessageSquare } from "lucide-react";

const kpis = [
  { label: "Calls Today", value: 45, icon: Phone, color: "text-blue-600" },
  { label: "Answered", value: "38 (84%)", icon: PhoneCall, color: "text-green-600" },
  { label: "Missed", value: 7, icon: PhoneMissed, color: "text-red-600" },
  { label: "Avg Duration", value: "3.2 min", icon: Clock, color: "text-purple-600" },
  { label: "Callbacks Pending", value: 5, icon: ArrowUpRight, color: "text-amber-600" },
];

const callLog = [
  { time: "09:05", caller: "Rahul Sharma", phone: "9876543210", direction: "Inbound", duration: "4:12", agent: "Meena", purpose: "Appointment", status: "Completed" },
  { time: "09:18", caller: "Anita Verma", phone: "9812345678", direction: "Outbound", duration: "2:45", agent: "Priya", purpose: "Follow-up", status: "Completed" },
  { time: "09:32", caller: "Unknown", phone: "9898765432", direction: "Inbound", duration: "0:00", agent: "-", purpose: "-", status: "Missed" },
  { time: "09:45", caller: "Kavita Nair", phone: "9845612378", direction: "Inbound", duration: "5:30", agent: "Meena", purpose: "Inquiry", status: "Completed" },
  { time: "10:02", caller: "Manoj Kumar", phone: "9765432100", direction: "Outbound", duration: "3:15", agent: "Priya", purpose: "Follow-up", status: "Completed" },
  { time: "10:20", caller: "Deepa Singh", phone: "9654321098", direction: "Inbound", duration: "0:00", agent: "-", purpose: "-", status: "Missed" },
  { time: "10:35", caller: "Arjun Reddy", phone: "9543210987", direction: "Inbound", duration: "2:50", agent: "Meena", purpose: "Complaint", status: "Completed" },
  { time: "10:50", caller: "Suresh Patel", phone: "9432109876", direction: "Outbound", duration: "4:00", agent: "Priya", purpose: "Appointment", status: "Callback Scheduled" },
  { time: "11:05", caller: "Meera Das", phone: "9321098765", direction: "Inbound", duration: "1:45", agent: "Meena", purpose: "Inquiry", status: "Completed" },
  { time: "11:22", caller: "Unknown", phone: "9210987654", direction: "Inbound", duration: "0:00", agent: "-", purpose: "-", status: "Missed" },
];

const followUpDue = [
  { name: "Kavita Nair", phone: "9845612378", reason: "Post-PK Day 7 check", time: "11:30 AM" },
  { name: "Manoj Kumar", phone: "9765432100", reason: "Lab result discussion", time: "12:00 PM" },
  { name: "Deepa Singh", phone: "9654321098", reason: "Appointment confirmation", time: "02:00 PM" },
];

const agentPerformance = [
  { agent: "Meena", calls: 22, avgDuration: "3.5 min", conversion: "68%" },
  { agent: "Priya", calls: 16, avgDuration: "2.8 min", conversion: "72%" },
  { agent: "Ravi", calls: 7, avgDuration: "3.0 min", conversion: "57%" },
];

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Missed: "bg-red-100 text-red-700",
  "Callback Scheduled": "bg-amber-100 text-amber-700",
};

const CallCenter = () => {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Phone className="h-6 w-6" /> Call Center Management</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.success("WhatsApp sent")}><MessageSquare className="h-4 w-4 mr-1" /> Send WhatsApp</Button>
          <Button size="sm" onClick={() => toast.success("Callback scheduled")}><PhoneCall className="h-4 w-4 mr-1" /> Schedule Callback</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-3 text-center"><k.icon className={`h-4 w-4 mx-auto ${k.color}`} /><p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p><p className="text-[10px] text-muted-foreground">{k.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Missed Calls Alert */}
      <Card className="border-red-200 bg-red-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm text-red-700 flex items-center gap-2"><PhoneMissed className="h-4 w-4" /> Missed Calls ({callLog.filter(c => c.status === "Missed").length})</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {callLog.filter(c => c.status === "Missed").map((c, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-md border border-red-200 px-3 py-2">
              <span className="text-xs font-medium">{c.phone}</span>
              <span className="text-[10px] text-muted-foreground">{c.time}</span>
              <Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={() => toast.success(`Calling ${c.phone}`)}>Call Back</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call Log Table */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Today's Call Log</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b"><tr><th className="text-left py-2">Time</th><th className="text-left py-2">Caller</th><th className="text-left py-2">Phone</th><th className="text-center py-2">Direction</th><th className="text-left py-2">Duration</th><th className="text-left py-2">Agent</th><th className="text-left py-2">Purpose</th><th className="text-center py-2">Status</th></tr></thead>
            <tbody>{callLog.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/50">
                <td className="py-2 text-muted-foreground">{c.time}</td>
                <td className="py-2 font-medium">{c.caller}</td>
                <td className="py-2 text-muted-foreground">{c.phone}</td>
                <td className="py-2 text-center">{c.direction === "Inbound" ? <ArrowDownLeft className="h-3 w-3 mx-auto text-green-600" /> : <ArrowUpRight className="h-3 w-3 mx-auto text-blue-600" />}</td>
                <td className="py-2">{c.duration}</td>
                <td className="py-2">{c.agent}</td>
                <td className="py-2">{c.purpose}</td>
                <td className="py-2 text-center"><Badge className={`text-[9px] ${statusColor[c.status] || "bg-gray-100 text-gray-700"}`}>{c.status}</Badge></td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* Follow-up Calls Due */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Outbound Follow-up Calls Today</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {followUpDue.map((f, i) => (
            <div key={i} className="flex items-center justify-between border rounded-md p-2">
              <div><p className="text-xs font-medium">{f.name}</p><p className="text-[10px] text-muted-foreground">{f.reason}</p></div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{f.time}</span>
                <Button size="sm" className="h-6 text-[10px]" onClick={() => toast.success(`Calling ${f.name}`)}>Call</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Agent Performance</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead className="border-b"><tr><th className="text-left py-2">Agent</th><th className="text-center py-2">Calls Handled</th><th className="text-center py-2">Avg Duration</th><th className="text-center py-2">Conversion</th></tr></thead>
            <tbody>{agentPerformance.map((a, i) => (
              <tr key={i} className="border-b"><td className="py-2 font-medium">{a.agent}</td><td className="py-2 text-center">{a.calls}</td><td className="py-2 text-center">{a.avgDuration}</td><td className="py-2 text-center"><Badge className="bg-green-100 text-green-700 text-[9px]">{a.conversion}</Badge></td></tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("Transfer to doctor initiated")}><Users className="h-4 w-4 mr-1" /> Transfer to Doctor</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("Callback scheduled")}><Clock className="h-4 w-4 mr-1" /> Schedule Callback</Button>
        <Button size="sm" variant="outline" onClick={() => toast.success("WhatsApp message sent")}><MessageSquare className="h-4 w-4 mr-1" /> Send WhatsApp</Button>
      </div>
    </div>
  );
};

export default CallCenter;
