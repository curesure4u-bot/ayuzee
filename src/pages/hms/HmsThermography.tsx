import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, Upload, Brain, Camera } from "lucide-react";

const mockScans = [
  { id: "TH-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-28", region: "Lumbar Spine", findings: "Hot spot L4-L5 (38.2°C vs 36.8°C normal)", interpretation: "Active inflammation at L4-L5 — Pitta accumulation in Kati Pradesha (Vata-Pitta Sannipataja)", recommendation: "Kati Basti + Pitta-shamana Lepa", severity: "Moderate" },
  { id: "TH-02", patient: "Mrs. Hameedhal (AL-15598)", date: "2026-07-27", region: "Both Knees", findings: "Bilateral heat (37.8°C), Left > Right by 0.6°C", interpretation: "Sandhi Shula with Pitta — Amavata (Rheumatoid). Left knee more active.", recommendation: "Janu Basti + Simhanada Guggulu + Eranda Taila", severity: "High" },
  { id: "TH-03", patient: "Mr. Kubbusamy (AL-8990)", date: "2026-07-26", region: "Cervical", findings: "Cold zone C5-C7 (35.4°C)", interpretation: "Reduced blood flow — Vata Sthana with Kapha obstruction (Greeva Stambha)", recommendation: "Greeva Basti + Nasya + Agnikarma trigger points", severity: "Mild" },
];

const HmsThermography = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Medical Thermography</h1><p className="text-muted-foreground text-sm">Infrared body heat mapping → Inflammation detection → Dosha site identification</p></div>
      <Button onClick={() => toast.info("Capture thermal image using IR camera")}><Camera className="mr-2 h-4 w-4" />Capture Thermal</Button>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Date</th><th className="p-3">Region</th><th className="p-3 text-left">Findings</th><th className="p-3 text-left">AYUSH Interpretation</th><th className="p-3">Severity</th></tr></thead>
      <tbody>{mockScans.map(s => (<tr key={s.id} className="border-t"><td className="p-3 font-mono text-xs">{s.id}</td><td className="p-3">{s.patient}</td><td className="p-3">{s.date}</td><td className="p-3">{s.region}</td><td className="p-3 text-xs">{s.findings}</td><td className="p-3 text-xs text-blue-700">{s.interpretation}</td><td className="p-3"><Badge className={s.severity === "High" ? "bg-red-100 text-red-800" : s.severity === "Moderate" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}>{s.severity}</Badge></td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Thermal → Dosha Mapping</CardTitle></CardHeader><CardContent><p className="text-sm">Hot zones = Pitta accumulation (Daha, Shotha). Cold zones = Vata obstruction (Stambha, Shosha). Asymmetry = Srotas blockage. AI correlates thermal patterns with Ayurvedic site-specific pathology for targeted treatment.</p></CardContent></Card>
  </div>
);
export default HmsThermography;
