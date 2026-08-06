import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FlaskConical, Upload, Brain, Activity } from "lucide-react";

const mockReports = [
  { id: "GM-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-20", lab: "MapMyGenome", diversity: "Low (Shannon: 2.1)", dominantPhyla: "Firmicutes 72%, Bacteroidetes 18%", dysbiosis: "Yes — F/B ratio 4:1 (normal <2:1)", agniCorrelation: "Mandagni (low fire) — reduced Bacteroidetes = poor fiber fermentation", amaIndex: "High — LPS markers elevated", recommendation: "Prebiotic fiber (Triphala), Probiotics (Takra/buttermilk), Deepana protocol" },
  { id: "GM-02", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-18", lab: "Bione", diversity: "Moderate (Shannon: 3.4)", dominantPhyla: "Firmicutes 55%, Bacteroidetes 30%, Proteobacteria 10%", dysbiosis: "Mild — elevated Proteobacteria", agniCorrelation: "Tikshna Agni (sharp) — Proteobacteria overgrowth = inflammation tendency", amaIndex: "Moderate — Calprotectin borderline", recommendation: "Pitta-shamana diet, Amalaki, avoid fermented foods temporarily" },
];

const HmsGutMicrobiome = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">Gut Microbiome Analysis</h1><p className="text-muted-foreground text-sm">Microbiome test → Agni/Ama correlation → Personalized Ayurvedic gut protocol</p></div>
      <Button onClick={() => toast.info("Upload gut microbiome report (MapMyGenome, Bione, etc.)")}><Upload className="mr-2 h-4 w-4" />Import Report</Button>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Lab</th><th className="p-3">Diversity</th><th className="p-3 text-left">Dominant Phyla</th><th className="p-3">Dysbiosis</th><th className="p-3 text-left">Agni Correlation</th><th className="p-3">Ama</th></tr></thead>
      <tbody>{mockReports.map(r => (<tr key={r.id} className="border-t"><td className="p-3 font-mono text-xs">{r.id}</td><td className="p-3">{r.patient}</td><td className="p-3">{r.lab}</td><td className="p-3 text-xs">{r.diversity}</td><td className="p-3 text-xs">{r.dominantPhyla}</td><td className="p-3"><Badge className={r.dysbiosis.startsWith("Yes") ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}>{r.dysbiosis.split(" —")[0]}</Badge></td><td className="p-3 text-xs text-purple-700">{r.agniCorrelation}</td><td className="p-3"><Badge variant="outline">{r.amaIndex}</Badge></td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI Microbiome → Ayurveda Mapping</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-3 text-sm"><div className="p-3 rounded bg-blue-50"><strong>Low Diversity</strong><br/>= Mandagni (weak digestive fire)<br/>→ Triphala + Takra + Deepana herbs</div><div className="p-3 rounded bg-red-50"><strong>High Proteobacteria</strong><br/>= Tikshna Agni / Pitta inflammation<br/>→ Amalaki + cooling diet + avoid spice</div><div className="p-3 rounded bg-green-50"><strong>Balanced F/B Ratio</strong><br/>= Sama Agni (healthy fire)<br/>→ Maintain with Ritucharya diet</div></div></CardContent></Card>
  </div>
);
export default HmsGutMicrobiome;
