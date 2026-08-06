import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Globe, CheckCircle2, Users, FileText, Activity, Shield } from "lucide-react";

const abdmModules = [
  { name: "ABHA ID Verification", status: "Active", transactions: 1250, desc: "Verify patient ABHA at registration" },
  { name: "Health Records Push (HIP)", status: "Active", transactions: 890, desc: "Push prescriptions/reports to patient's PHR" },
  { name: "Health Records Pull (HIU)", status: "Active", transactions: 340, desc: "Pull patient records from other hospitals" },
  { name: "UHI — Appointment Discovery", status: "Beta", transactions: 45, desc: "Patients find & book via any UHI-connected app" },
  { name: "UHI — Teleconsult Discovery", status: "Planned", transactions: 0, desc: "Video consult bookable from any UHI app" },
  { name: "Digital Health Locker", status: "Active", transactions: 560, desc: "Store documents in ABDM DigiLocker" },
  { name: "e-Prescription (ABDM format)", status: "Active", transactions: 780, desc: "Send Rx in NHA standard format" },
  { name: "Discharge Summary (ABDM)", status: "Active", transactions: 120, desc: "Push discharge to patient's ABHA account" },
  { name: "Lab Reports (ABDM)", status: "Active", transactions: 410, desc: "Push lab results to ABHA in FHIR format" },
  { name: "Insurance Claims (HCX)", status: "Planned", transactions: 0, desc: "Submit claims via Health Claims Exchange" },
];

const HmsAbdmUhi = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">ABDM 2.0 & UHI Integration</h1><p className="text-sm text-muted-foreground">Ayushman Bharat Digital Mission — Full compliance + Unified Health Interface for discovery</p></div>
      <Badge className="bg-green-100 text-green-800"><Shield className="mr-1 h-3 w-3" />ABDM Certified</Badge>
    </div>
    <div className="grid grid-cols-4 gap-3">
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-700">1,250</p><p className="text-xs text-muted-foreground">ABHA Verifications</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-700">890</p><p className="text-xs text-muted-foreground">Records Pushed</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-purple-700">340</p><p className="text-xs text-muted-foreground">Records Pulled</p></CardContent></Card>
      <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-700">45</p><p className="text-xs text-muted-foreground">UHI Bookings</p></CardContent></Card>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Module</th><th className="p-3 text-left">Description</th><th className="p-3">Transactions</th><th className="p-3">Status</th><th className="p-3">Enabled</th></tr></thead>
      <tbody>{abdmModules.map(m => (<tr key={m.name} className="border-t"><td className="p-3 font-medium">{m.name}</td><td className="p-3 text-xs text-muted-foreground">{m.desc}</td><td className="p-3 text-center">{m.transactions}</td><td className="p-3 text-center"><Badge className={m.status === "Active" ? "bg-green-100 text-green-800" : m.status === "Beta" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>{m.status}</Badge></td><td className="p-3 text-center"><Switch checked={m.status !== "Planned"} /></td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle>UHI — What Changes for You</CardTitle></CardHeader><CardContent className="text-sm space-y-2">
      <p className="p-2 bg-blue-50 rounded">📱 Patients can find your hospital on Paytm Health, PhonePe Health, or any UHI app — and book directly into your HMS</p>
      <p className="p-2 bg-green-50 rounded">🏥 Your doctors appear in the national doctor registry — AYUSH specialists discoverable across India</p>
      <p className="p-2 bg-purple-50 rounded">💳 HCX (Health Claims Exchange) — submit insurance claims digitally to any TPA via government network</p>
      <p className="p-2 bg-amber-50 rounded">⚠️ Mandate: All hospitals must be ABDM-compliant by 2027. You're already ahead.</p>
    </CardContent></Card>
  </div>
);
export default HmsAbdmUhi;
