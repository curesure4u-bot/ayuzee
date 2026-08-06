import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QrCode, CheckCircle2, Users, Clock, Smartphone, Zap } from "lucide-react";

const todayCheckins = [
  { id: 1, patient: "Mr. Nagaraj (AL-8472)", time: "09:02 AM", method: "QR Scan", token: "T-03", doctor: "Dr. Mohamad Saleem", wait: "8 min" },
  { id: 2, patient: "Mrs. Kalpana (AL-9201)", time: "09:15 AM", method: "WhatsApp Link", token: "T-05", doctor: "Dr. Mohamad Saleem", wait: "22 min" },
  { id: 3, patient: "Rabiyathubasaria (AL-15568)", time: "09:28 AM", method: "QR Scan", token: "T-07", doctor: "Dr. Sahana Fathima", wait: "5 min" },
  { id: 4, patient: "Mr. Kubbusamy (AL-8990)", time: "09:45 AM", method: "Kiosk", token: "T-09", doctor: "Dr. Mohamad Saleem", wait: "15 min" },
  { id: 5, patient: "Mrs. Hameedhal (AL-15598)", time: "10:01 AM", method: "Reception (Manual)", token: "T-11", doctor: "Dr. Mohamad Saleem", wait: "30 min" },
];

const HmsDigitalCheckin = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Digital Check-in (QR)</h1><p className="text-sm text-muted-foreground">Patient scans QR at reception → auto check-in → token assigned → no queue</p></div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => toast.info("QR code displayed for scanning")}><QrCode className="mr-2 h-4 w-4" />Show QR</Button>
        <Button onClick={() => toast.success("Check-in link sent via WhatsApp")}><Smartphone className="mr-2 h-4 w-4" />Send Link</Button>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-3">
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">32</p><p className="text-xs text-muted-foreground">Checked-in Today</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">68%</p><p className="text-xs text-muted-foreground">QR/Digital (vs Manual)</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-700">12 min</p><p className="text-xs text-muted-foreground">Avg Wait Time</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">3</p><p className="text-xs text-muted-foreground">Waiting Now</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Patient</th><th className="p-3">Time</th><th className="p-3">Method</th><th className="p-3">Token</th><th className="p-3">Doctor</th><th className="p-3">Wait</th></tr></thead>
      <tbody>{todayCheckins.map(c => (<tr key={c.id} className="border-t"><td className="p-3 font-medium">{c.patient}</td><td className="p-3 text-center">{c.time}</td><td className="p-3 text-center"><Badge variant="outline" className="text-xs">{c.method}</Badge></td><td className="p-3 text-center font-mono">{c.token}</td><td className="p-3 text-center text-xs">{c.doctor}</td><td className="p-3 text-center">{c.wait}</td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle>Check-in Methods Available</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 bg-blue-50 rounded"><strong>📱 QR Scan</strong><br/>Patient scans poster QR at entrance → auto-identifies via phone → token assigned</div>
      <div className="p-3 bg-green-50 rounded"><strong>💬 WhatsApp Link</strong><br/>Pre-sent link (24hr before) → patient clicks "I'm here" → auto check-in</div>
      <div className="p-3 bg-purple-50 rounded"><strong>🖥️ Kiosk</strong><br/>Touchscreen at reception → patient enters phone/ID → token printed</div>
      <div className="p-3 bg-amber-50 rounded"><strong>👤 Reception (Manual)</strong><br/>Staff manually checks in for elderly/walk-in patients</div>
    </CardContent></Card>
  </div>
);
export default HmsDigitalCheckin;
