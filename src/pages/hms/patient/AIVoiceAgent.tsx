import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Phone, PhoneCall, Clock, Users, Smartphone, Mic, Play, Pause, Settings } from "lucide-react";

const kpis = [
  { label: "Calls Today", value: 28, icon: Phone, color: "text-blue-600" },
  { label: "Connected", value: "22 (79%)", icon: PhoneCall, color: "text-green-600" },
  { label: "Avg Duration", value: "1.8 min", icon: Clock, color: "text-purple-600" },
  { label: "Conversions", value: "8 booked", icon: Users, color: "text-amber-600" },
];

const campaigns = [
  { name: "Appointment Reminder", status: "active", calls: 45, desc: "24hr before appointment" },
  { name: "Follow-up Day 7", status: "active", calls: 12, desc: "Post-treatment check" },
  { name: "Recall 3-month", status: "paused", calls: 89, desc: "Re-engagement campaign" },
  { name: "Review Request", status: "active", calls: 18, desc: "Post-visit Google review" },
];

const callLog = [
  { time: "09:05", patient: "Rahul Sharma", phone: "9876543210", purpose: "Reminder", duration: "1:42", outcome: "Connected", transcript: "Hi Rahul, this is a reminder for your appointment tomorrow at 10 AM with Dr. Meena..." },
  { time: "09:12", patient: "Anita Verma", phone: "9812345678", purpose: "Follow-up", duration: "2:15", outcome: "Connected", transcript: "Hello Anita, how are you feeling after your Panchakarma session? Did you follow Pathya..." },
  { time: "09:25", patient: "Kavita Nair", phone: "9845612378", purpose: "Recall", duration: "0:00", outcome: "No Answer", transcript: "-" },
  { time: "09:38", patient: "Manoj Kumar", phone: "9765432100", purpose: "Reminder", duration: "1:05", outcome: "Voicemail", transcript: "Message left: Your appointment with Dr. Arjun is scheduled for tomorrow 3 PM..." },
  { time: "10:02", patient: "Deepa Singh", phone: "9654321098", purpose: "Follow-up", duration: "2:30", outcome: "Connected", transcript: "Hi Deepa, checking in on Day 7. How is your pain level? Any side effects from..." },
  { time: "10:18", patient: "Suresh Patel", phone: "9432109876", purpose: "Review", duration: "1:55", outcome: "Connected", transcript: "Hello Suresh, we hope your visit was helpful. Would you mind sharing your experience..." },
  { time: "10:35", patient: "Meera Das", phone: "9321098765", purpose: "Recall", duration: "0:00", outcome: "Callback", transcript: "Patient requested callback at 2 PM" },
  { time: "10:50", patient: "Arjun Reddy", phone: "9543210987", purpose: "Reminder", duration: "1:20", outcome: "Connected", transcript: "Hi Arjun, reminder for your Agnikarma session tomorrow at 11 AM. Please avoid food 2hr before..." },
];

const outcomeColor: Record<string, string> = {
  Connected: "bg-green-100 text-green-700",
  "No Answer": "bg-red-100 text-red-700",
  Voicemail: "bg-blue-100 text-blue-700",
  Callback: "bg-amber-100 text-amber-700",
};

const settings = {
  language: "English",
  voice: "Female",
  callWindow: "9:00 AM – 7:00 PM",
  maxRetries: 3,
  retryInterval: "4 hours",
};

const AIVoiceAgent = () => {
  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6" /> AI Voice Agent</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => toast.success("Campaign started")}><Play className="h-4 w-4 mr-1" /> Start Campaign</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Campaign paused")}><Pause className="h-4 w-4 mr-1" /> Pause</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label}><CardContent className="p-3 text-center"><k.icon className={`h-4 w-4 mx-auto ${k.color}`} /><p className={`text-xl font-bold mt-1 ${k.color}`}>{k.value}</p><p className="text-[10px] text-muted-foreground">{k.label}</p></CardContent></Card>
        ))}
      </div>

      {/* Campaigns */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Call Campaigns</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {campaigns.map((c, i) => (
            <div key={i} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center gap-3">
                <Badge className={c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{c.status}</Badge>
                <div><p className="text-xs font-medium">{c.name}</p><p className="text-[10px] text-muted-foreground">{c.desc}</p></div>
              </div>
              <span className="text-xs text-muted-foreground">{c.calls} calls {c.status === "paused" ? "pending" : "scheduled"}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Call Log Table */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Today's AI Call Log</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b"><tr><th className="text-left py-2">Time</th><th className="text-left py-2">Patient</th><th className="text-left py-2">Phone</th><th className="text-left py-2">Purpose</th><th className="text-left py-2">Duration</th><th className="text-center py-2">Outcome</th><th className="text-left py-2">Transcript</th></tr></thead>
            <tbody>{callLog.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/50">
                <td className="py-2 text-muted-foreground">{c.time}</td>
                <td className="py-2 font-medium">{c.patient}</td>
                <td className="py-2 text-muted-foreground">{c.phone}</td>
                <td className="py-2">{c.purpose}</td>
                <td className="py-2">{c.duration}</td>
                <td className="py-2 text-center"><Badge className={`text-[9px] ${outcomeColor[c.outcome] || "bg-gray-100 text-gray-700"}`}>{c.outcome}</Badge></td>
                <td className="py-2 max-w-[200px] truncate text-muted-foreground">{c.transcript}</td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>

      {/* AYUSH Context */}
      <Card className="border-green-200 bg-green-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm text-green-700 flex items-center gap-2"><Mic className="h-4 w-4" /> AYUSH Voice Script Context</CardTitle></CardHeader>
        <CardContent><p className="text-xs text-green-800">Follow-up calls include: "Did you follow Pathya? How is your pain level today? Any medicine side effects? Are you doing the prescribed Yoga?"</p></CardContent>
      </Card>

      {/* Voice Agent Settings */}
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Settings className="h-4 w-4" /> Voice Agent Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="border rounded-md p-2 text-center"><p className="text-muted-foreground">Language</p><p className="font-medium">{settings.language}</p><p className="text-[10px] text-muted-foreground">Tamil, Hindi also available</p></div>
            <div className="border rounded-md p-2 text-center"><p className="text-muted-foreground">Voice Type</p><p className="font-medium">{settings.voice}</p></div>
            <div className="border rounded-md p-2 text-center"><p className="text-muted-foreground">Call Window</p><p className="font-medium">{settings.callWindow}</p></div>
            <div className="border rounded-md p-2 text-center"><p className="text-muted-foreground">Max Retries</p><p className="font-medium">{settings.maxRetries}</p></div>
            <div className="border rounded-md p-2 text-center"><p className="text-muted-foreground">Retry Interval</p><p className="font-medium">{settings.retryInterval}</p></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVoiceAgent;
