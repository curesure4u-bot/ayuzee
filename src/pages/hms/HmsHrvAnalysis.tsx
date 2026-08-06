import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Heart, Upload, Brain, Activity, Smartphone } from "lucide-react";

const mockReadings = [
  { id: "HRV-01", patient: "Mr. Nagaraj (AL-8472)", date: "2026-07-28", device: "Apple Watch", sdnn: 42, rmssd: 28, lf: 68, hf: 32, lfHfRatio: 2.1, dominance: "Sympathetic (Vata↑)", doshaBalance: "Vata aggravated — low parasympathetic tone", recommendation: "Yoga Nidra, Abhyanga, Ashwagandha, regulate sleep" },
  { id: "HRV-02", patient: "Mrs. Kalpana (AL-9201)", date: "2026-07-27", device: "Fitbit Sense", sdnn: 58, rmssd: 45, lf: 45, hf: 55, lfHfRatio: 0.82, dominance: "Parasympathetic (Kapha)", doshaBalance: "Kapha dominant — good recovery but sluggish metabolism", recommendation: "Vigorous Pranayama, Trikatu, early morning exercise" },
  { id: "HRV-03", patient: "Mr. Kubbusamy (AL-8990)", date: "2026-07-26", device: "Garmin Venu", sdnn: 35, rmssd: 22, lf: 72, hf: 28, lfHfRatio: 2.57, dominance: "High Sympathetic (Pitta-Vata)", doshaBalance: "Pitta-Vata stress pattern — burnout risk", recommendation: "Shirodhara, Brahmi, Jatamansi, cooling Pranayama" },
];

const HmsHrvAnalysis = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">HRV Analysis (Heart Rate Variability)</h1><p className="text-muted-foreground text-sm">Autonomic nervous system balance → Dosha correlation → Stress/Recovery mapping</p></div>
      <Button onClick={() => toast.info("Sync from Apple Watch, Fitbit, Garmin, or chest strap")}><Smartphone className="mr-2 h-4 w-4" />Sync Device</Button>
    </div>
    <Card><CardContent className="p-0"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left">ID</th><th className="p-3 text-left">Patient</th><th className="p-3">Date</th><th className="p-3">SDNN</th><th className="p-3">RMSSD</th><th className="p-3">LF/HF</th><th className="p-3 text-left">Dominance</th><th className="p-3 text-left">Dosha Balance</th></tr></thead>
      <tbody>{mockReadings.map(r => (<tr key={r.id} className="border-t"><td className="p-3 font-mono text-xs">{r.id}</td><td className="p-3">{r.patient}</td><td className="p-3">{r.date}</td><td className="p-3 text-center">{r.sdnn}ms</td><td className="p-3 text-center">{r.rmssd}ms</td><td className="p-3 text-center">{r.lfHfRatio}</td><td className="p-3 text-xs"><Badge variant="outline">{r.dominance}</Badge></td><td className="p-3 text-xs text-blue-700">{r.doshaBalance}</td></tr>))}</tbody></table></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />AI HRV → Dosha Mapping</CardTitle></CardHeader><CardContent><div className="grid grid-cols-3 gap-3 text-sm"><div className="p-3 rounded bg-blue-50"><strong>High LF/HF (&gt;2.0)</strong><br/>= Vata/Sympathetic dominance<br/>→ Anxiety, insomnia, pain sensitivity</div><div className="p-3 rounded bg-red-50"><strong>Very High LF (&gt;70%)</strong><br/>= Pitta stress response<br/>→ Inflammation, acidity, irritability</div><div className="p-3 rounded bg-green-50"><strong>High HF (&gt;55%)</strong><br/>= Kapha/Parasympathetic<br/>→ Good recovery but sluggish if chronic</div></div></CardContent></Card>
  </div>
);
export default HmsHrvAnalysis;
