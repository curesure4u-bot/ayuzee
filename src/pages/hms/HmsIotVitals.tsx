import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, Smartphone, CheckCircle2, Zap, Heart, Brain } from "lucide-react";

const connectedDevices = [
  { device: "Omron BP Monitor (BT)", location: "OPD Room 1", status: "Connected", lastSync: "2 min ago", readings: 45 },
  { device: "Mi Body Scale (WiFi)", location: "Reception", status: "Connected", lastSync: "5 min ago", readings: 38 },
  { device: "Accu-Chek Glucometer (BT)", location: "OPD Room 2", status: "Connected", lastSync: "8 min ago", readings: 22 },
  { device: "Nonin Pulse Oximeter (BT)", location: "Nursing Station", status: "Connected", lastSync: "1 min ago", readings: 52 },
  { device: "Thermometer (IR - Auto)", location: "Reception Kiosk", status: "Connected", lastSync: "30 sec ago", readings: 67 },
  { device: "PK Table Sensor (Timer)", location: "PK Room 1", status: "Offline", lastSync: "2 hrs ago", readings: 12 },
  { device: "Apple Watch (Patient Sync)", location: "Remote", status: "3 patients", lastSync: "Real-time", readings: 156 },
];

const recentAutoVitals = [
  { patient: "Mr. Nagaraj (AL-8472)", time: "09:15 AM", bp: "138/88", weight: "72.4 kg", spo2: "97%", temp: "36.8°C", sugar: "-", source: "Omron + Scale + Nonin" },
  { patient: "Mrs. Kalpana (AL-9201)", time: "09:28 AM", bp: "122/76", weight: "65.1 kg", spo2: "98%", temp: "37.1°C", sugar: "142 mg/dL", source: "Omron + Scale + Accu-Chek" },
  { patient: "Rabiyathubasaria (AL-15568)", time: "09:45 AM", bp: "130/82", weight: "58.2 kg", spo2: "99%", temp: "36.6°C", sugar: "-", source: "Auto (Kiosk)" },
];

const HmsIotVitals = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">IoT Auto-Vitals</h1><p className="text-sm text-muted-foreground">Connected devices auto-enter vitals into patient record — zero manual entry</p></div>
      <Button onClick={() => toast.info("Scanning for new devices...")}><Zap className="mr-2 h-4 w-4" />Pair Device</Button>
    </div>
    <div className="grid grid-cols-4 gap-3">
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">6</p><p className="text-xs text-muted-foreground">Devices Online</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">392</p><p className="text-xs text-muted-foreground">Auto-Readings Today</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-700">2 min</p><p className="text-xs text-muted-foreground">Avg Save Time/Patient</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">1</p><p className="text-xs text-muted-foreground">Device Offline</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Connected Devices</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Device</th><th className="p-3">Location</th><th className="p-3">Status</th><th className="p-3">Last Sync</th><th className="p-3">Readings Today</th></tr></thead>
      <tbody>{connectedDevices.map(d => (<tr key={d.device} className="border-t"><td className="p-3">{d.device}</td><td className="p-3 text-center text-xs">{d.location}</td><td className="p-3 text-center"><Badge className={d.status === "Connected" || d.status === "3 patients" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{d.status}</Badge></td><td className="p-3 text-center text-xs">{d.lastSync}</td><td className="p-3 text-center">{d.readings}</td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle>Recent Auto-Captured Vitals</CardTitle></CardHeader><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Patient</th><th className="p-3">Time</th><th className="p-3">BP</th><th className="p-3">Weight</th><th className="p-3">SpO2</th><th className="p-3">Temp</th><th className="p-3">Sugar</th><th className="p-3">Source</th></tr></thead>
      <tbody>{recentAutoVitals.map((v, i) => (<tr key={i} className="border-t"><td className="p-3">{v.patient}</td><td className="p-3 text-center">{v.time}</td><td className="p-3 text-center">{v.bp}</td><td className="p-3 text-center">{v.weight}</td><td className="p-3 text-center">{v.spo2}</td><td className="p-3 text-center">{v.temp}</td><td className="p-3 text-center">{v.sugar}</td><td className="p-3 text-xs">{v.source}</td></tr>))}</tbody></table></CardContent></Card>
  </div>
);
export default HmsIotVitals;
