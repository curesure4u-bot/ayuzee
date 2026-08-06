import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Globe, CheckCircle2, Users } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English", status: "Complete", coverage: 100, default: true, patients: "All" },
  { code: "ta", name: "Tamil", native: "தமிழ்", status: "Complete", coverage: 95, default: false, patients: "65%" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", status: "Partial", coverage: 70, default: false, patients: "15%" },
  { code: "hi", name: "Hindi", native: "हिन्दी", status: "Partial", coverage: 60, default: false, patients: "10%" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", status: "Planned", coverage: 20, default: false, patients: "5%" },
  { code: "te", name: "Telugu", native: "తెలుగు", status: "Planned", coverage: 10, default: false, patients: "3%" },
  { code: "ar", name: "Arabic", native: "العربية", status: "Planned", coverage: 5, default: false, patients: "2% (UAE)" },
];

const translationAreas = [
  { area: "Patient WhatsApp Messages", languages: ["ta", "ml", "hi"], status: "Active" },
  { area: "Prescription Print (Rx)", languages: ["ta", "ml"], status: "Active" },
  { area: "Diet Chart / Pathya", languages: ["ta", "ml", "hi"], status: "Active" },
  { area: "Dosage Instructions on Bill", languages: ["ta"], status: "Active" },
  { area: "Patient Education Handouts", languages: ["ta", "ml"], status: "Partial" },
  { area: "Staff UI (HMS Interface)", languages: ["en"], status: "English only" },
  { area: "Discharge Summary", languages: ["ta", "en"], status: "Bilingual" },
  { area: "Consent Forms", languages: ["ta", "ml", "hi", "en"], status: "Active" },
];

const HmsLanguageConfig = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Multi-Language Configuration</h1><p className="text-sm text-muted-foreground">Configure patient-facing language for prescriptions, WhatsApp, handouts, and consent forms</p></div>
      <Button onClick={() => toast.info("AI translation service activated")}><Globe className="mr-2 h-4 w-4" />Add Language</Button>
    </div>
    <Card><CardHeader><CardTitle>Supported Languages</CardTitle></CardHeader><CardContent className="p-0">
      <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Language</th><th className="p-3">Native</th><th className="p-3">Coverage</th><th className="p-3">Status</th><th className="p-3">Patients</th><th className="p-3">Enabled</th></tr></thead>
        <tbody>{languages.map(l => (<tr key={l.code} className="border-t"><td className="p-3 font-medium">{l.name}</td><td className="p-3 text-center">{l.native}</td><td className="p-3 text-center"><div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: `${l.coverage}%`}} /></div><span className="text-xs">{l.coverage}%</span></td><td className="p-3 text-center"><Badge className={l.status === "Complete" ? "bg-green-100 text-green-800" : l.status === "Partial" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"}>{l.status}</Badge></td><td className="p-3 text-center text-xs">{l.patients}</td><td className="p-3 text-center"><Switch checked={l.status !== "Planned"} /></td></tr>))}</tbody></table>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Translation Coverage by Area</CardTitle></CardHeader><CardContent className="p-0">
      <table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">Content Area</th><th className="p-3 text-left">Languages</th><th className="p-3">Status</th></tr></thead>
        <tbody>{translationAreas.map((a, i) => (<tr key={i} className="border-t"><td className="p-3">{a.area}</td><td className="p-3">{a.languages.join(", ").toUpperCase()}</td><td className="p-3"><Badge variant="outline">{a.status}</Badge></td></tr>))}</tbody></table>
    </CardContent></Card>
  </div>
);
export default HmsLanguageConfig;
