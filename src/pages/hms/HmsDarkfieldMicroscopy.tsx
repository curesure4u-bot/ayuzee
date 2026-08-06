import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FlaskConical, Upload, Brain, Eye, Camera } from "lucide-react";

const mockSlides = [
  { id: "DFM-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-28", findings: "Rouleaux formation (stacking), Fibrin threads, Yeast forms present", interpretation: "Blood stagnation → correlates with Ama (toxin) accumulation, Mandagni (low digestive fire)", recommendation: "Deepana-Pachana therapy, Triphala, Guduchi", status: "Reviewed" },
  { id: "DFM-02", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-27", findings: "Crystal formations, Plaque cholesterol, WBC activity low", interpretation: "Medas Dhatu Dushti (fat tissue toxicity), Kapha-Pitta imbalance in Rasa-Rakta", recommendation: "Lekhana therapy, Guggulu, Medohar protocol", status: "Pending" },
];

const HmsDarkfieldMicroscopy = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Darkfield Microscopy</h1><p className="text-muted-foreground text-sm">Live blood analysis → Ama/Dhatu correlation → Treatment planning</p></div>
      <Button onClick={() => toast.info("Upload darkfield microscopy slide image")}><Upload className="mr-2 h-4 w-4" />Upload Slide</Button>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Date</th><th className="p-3 text-left">Findings</th><th className="p-3 text-left">AYUSH Interpretation</th><th className="p-3 text-left">Recommendation</th><th className="p-3">Status</th></tr></thead>
      <tbody>{mockSlides.map(s => (<tr key={s.id} className="border-t"><td className="p-3 font-mono text-xs">{s.id}</td><td className="p-3">{s.patient}</td><td className="p-3">{s.date}</td><td className="p-3 text-xs">{s.findings}</td><td className="p-3 text-xs text-purple-700">{s.interpretation}</td><td className="p-3 text-xs text-green-700">{s.recommendation}</td><td className="p-3"><Badge className={s.status === "Reviewed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>{s.status}</Badge></td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Blood → Dosha-Dhatu Mapping</CardTitle></CardHeader><CardContent><p className="text-sm">Rouleaux = Ama/Mandagni | Crystal = Medas Dushti | Fibrin = Rakta Dushti | Yeast = Krumi | Low WBC = Ojas Kshaya. AI auto-maps microscopy findings to Ayurvedic pathology.</p></CardContent></Card>
  </div>
);
export default HmsDarkfieldMicroscopy;
