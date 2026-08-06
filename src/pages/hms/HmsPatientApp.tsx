import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Smartphone, Users, Globe, CheckCircle2, Settings } from "lucide-react";

const appFeatures = [
  { name: "View Appointments & Book Online", enabled: true, users: 450 },
  { name: "View Lab Reports & Download", enabled: true, users: 380 },
  { name: "View Prescriptions & Reorder Medicines", enabled: true, users: 320 },
  { name: "View Bills & Pay Online (UPI/Card)", enabled: true, users: 290 },
  { name: "WhatsApp Medicine Reminders", enabled: true, users: 410 },
  { name: "Diet Chart & Yoga Instructions", enabled: true, users: 260 },
  { name: "Video Consultation (Teleconsult)", enabled: true, users: 85 },
  { name: "Health Tracker (BP/Sugar/Weight)", enabled: false, users: 0 },
  { name: "Family Member Access", enabled: false, users: 0 },
  { name: "Loyalty Points & Referral Code", enabled: true, users: 340 },
  { name: "Prakriti Profile & Recommendations", enabled: true, users: 180 },
  { name: "Treatment Journey Progress", enabled: true, users: 95 },
];

const HmsPatientApp = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Patient App / PWA Configuration</h1><p className="text-sm text-muted-foreground">Configure what patients see in their self-service portal (ayuzee.com/dashboard)</p></div>
      <Badge className="bg-green-100 text-green-800"><Users className="mr-1 h-3 w-3" />1,250 active patients</Badge>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">1,250</p><p className="text-xs text-muted-foreground">Registered on App</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">68%</p><p className="text-xs text-muted-foreground">Monthly Active</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-700">4.6★</p><p className="text-xs text-muted-foreground">App Rating</p></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Feature Toggle (What patients can access)</CardTitle></CardHeader><CardContent className="space-y-3">
      {appFeatures.map((f, i) => (<div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded"><div><p className="text-sm font-medium">{f.name}</p>{f.users > 0 && <p className="text-xs text-muted-foreground">{f.users} patients using this</p>}</div><Switch checked={f.enabled} onCheckedChange={() => toast.success(`${f.name} ${f.enabled ? "disabled" : "enabled"}`)} /></div>))}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>App Access Methods</CardTitle></CardHeader><CardContent className="grid grid-cols-3 gap-3 text-sm">
      <div className="p-3 bg-blue-50 rounded text-center"><Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" /><strong>Web PWA</strong><br/>ayuzee.com/dashboard<br/><span className="text-xs text-muted-foreground">Works on any browser</span></div>
      <div className="p-3 bg-green-50 rounded text-center"><Smartphone className="h-8 w-8 mx-auto mb-2 text-green-600" /><strong>WhatsApp Bot</strong><br/>Send "Hi" to +91-XXXXXXXXXX<br/><span className="text-xs text-muted-foreground">No app download needed</span></div>
      <div className="p-3 bg-purple-50 rounded text-center"><Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-600" /><strong>Android/iOS App</strong><br/>Ayuzee Health (planned)<br/><span className="text-xs text-muted-foreground">Coming Q1 2027</span></div>
    </CardContent></Card>
  </div>
);
export default HmsPatientApp;
