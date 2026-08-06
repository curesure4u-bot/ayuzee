import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, Upload, Brain, Camera, FileText } from "lucide-react";

const mockScans = [
  { id: "IR-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-25", eye: "Right", findings: "Liver zone congestion, Kidney ring present, Nerve ring (stress)", zone: "Hepatic/Renal", doshaCorrelation: "Pitta aggravation in Yakrit (liver)", status: "Reviewed" },
  { id: "IR-02", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-24", eye: "Both", findings: "Lymphatic rosary, Stomach ring, Scurf rim (skin toxins)", zone: "Lymph/GI/Skin", doshaCorrelation: "Kapha + Ama accumulation (Rasa-Rakta Dushti)", status: "Pending" },
  { id: "IR-03", patient: "Mr. Kubbusamy (AL-8990)", date: "2026-07-23", eye: "Left", findings: "Spinal arc weakness, Nerve wreath irregular", zone: "Spine/Nervous", doshaCorrelation: "Vata in Asthi-Majja (bone-nerve tissue)", status: "Reviewed" },
];

const HmsIridology = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Iridology (Iris Diagnosis)</h1><p className="text-muted-foreground text-sm">Iris zone analysis → Organ mapping → Ayurvedic Dosha correlation</p></div>
      <Button onClick={() => toast.info("Capture iris image using iridology camera")}><Camera className="mr-2 h-4 w-4" />Capture Iris</Button>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Date</th><th className="p-3">Eye</th><th className="p-3 text-left">Findings</th><th className="p-3 text-left">Dosha Correlation</th><th className="p-3">Status</th></tr></thead>
      <tbody>{mockScans.map(s => (<tr key={s.id} className="border-t"><td className="p-3 font-mono text-xs">{s.id}</td><td className="p-3">{s.patient}</td><td className="p-3 text-center">{s.date}</td><td className="p-3 text-center">{s.eye}</td><td className="p-3 text-xs">{s.findings}</td><td className="p-3 text-xs text-blue-700">{s.doshaCorrelation}</td><td className="p-3 text-center"><Badge className={s.status === "Reviewed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{s.status}</Badge></td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Iris → AYUSH Correlation</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">AI maps iris zones (Bernard Jensen chart) to Ayurvedic Dhatu/Srotas. Liver zone = Pitta/Yakrit, Kidney zone = Vata/Mutravaha, Spine arc = Asthi-Majja Vaha Srotas.</p></CardContent></Card>
  </div>
);
export default HmsIridology;
