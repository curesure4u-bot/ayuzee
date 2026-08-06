import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Activity, AlertTriangle, Heart, Smartphone, MessageSquare, RefreshCw } from "lucide-react";

const devices = [
  { name: "BP Monitor", brand: "Omron HEM-7156", lastReading: "138/85 mmHg", lastTime: "Today 08:30 AM", status: "Normal", connected: true },
  { name: "Glucometer", brand: "Accu-Chek Active", lastReading: "165 mg/dL (PP)", lastTime: "Today 10:00 AM", status: "Alert", connected: true },
  { name: "Pulse Oximeter", brand: "BPL Smart Oxy", lastReading: "97% SpO2", lastTime: "Today 08:30 AM", status: "Normal", connected: true },
  { name: "Smart Scale", brand: "Mi Body Scale", lastReading: "71.5 kg", lastTime: "Today 06:45 AM", status: "Normal", connected: true },
  { name: "Fitness Watch", brand: "Noise ColorFit", lastReading: "4,200 steps", lastTime: "Today 11:00 AM", status: "Low Activity", connected: false },
];

const alerts = [
  { time: "2026-07-24 10:00 AM", type: "Sugar High", value: "PP Sugar: 165 mg/dL (Target <140)", severity: "Warning", action: "Diet review suggested" },
  { time: "2026-07-22 07:30 PM", type: "BP Elevated", value: "BP: 152/92 mmHg (Target <140/90)", severity: "Alert", action: "Doctor notified. Medicine adjusted." },
  { time: "2026-07-20 06:00 AM", type: "Weight Gain", value: "Weight: 72.1 kg (+0.6 kg in 2 days)", severity: "Info", action: "Fluid retention possible. Monitor." },
];

const RemoteMonitoring = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-orange-600 flex items-center gap-2"><Smartphone className="h-5 w-5" /> Remote Patient Monitoring</h2>
        <Button size="sm" variant="outline" onClick={() => toast.info("Syncing devices...")}><RefreshCw className="mr-1 h-3 w-3" /> Sync All</Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">{devices.map((d) => (
        <Card key={d.name} className={`${d.status === "Alert" ? "border-red-300 bg-red-50" : d.connected ? "border-green-200" : "border-gray-200 opacity-60"}`}>
          <CardContent className="p-3 text-center">
            <p className="text-xs font-medium">{d.name}</p>
            <p className="text-lg font-bold mt-1">{d.lastReading}</p>
            <p className="text-[9px] text-muted-foreground">{d.lastTime}</p>
            <Badge className={`text-[8px] mt-1 ${d.status === "Normal" ? "bg-green-100 text-green-700" : d.status === "Alert" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{d.status}</Badge>
          </CardContent>
        </Card>
      ))}</div>
      <Card className="border-red-200"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-600" /> Recent Alerts</CardTitle></CardHeader>
        <CardContent className="space-y-2">{alerts.map((a, i) => (
          <div key={i} className={`border rounded p-2 text-xs ${a.severity === "Alert" ? "bg-red-50 border-red-200" : a.severity === "Warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-center justify-between"><span className="font-medium">{a.type}</span><span className="text-[10px] text-muted-foreground">{a.time}</span></div>
            <p className="text-muted-foreground">{a.value}</p>
            <p className="text-[10px] mt-0.5 font-medium">{a.action}</p>
          </div>
        ))}</CardContent>
      </Card>
      <Card className="border-purple-100"><CardContent className="p-3"><p className="text-xs font-medium text-purple-700 mb-1"><Activity className="h-3 w-3 inline mr-1" />AYUSH Correlation:</p><p className="text-xs text-muted-foreground">High BP mapping → Pitta Vruddhi (Rakta Dhatu). Elevated sugar → Meda Dhatu excess (Kapha). Low activity → Kapha accumulation risk.</p></CardContent></Card>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => toast.success("Message sent")}><MessageSquare className="mr-1 h-3 w-3" /> Message Patient</Button>
        <Button size="sm" variant="outline" onClick={() => toast.info("Teleconsult scheduled")}>Schedule Teleconsult</Button>
      </div>
    </div>
  );
};
export default RemoteMonitoring;
