import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Zap, Stethoscope, Pill, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

const copilotSuggestions = [
  { id: 1, patient: "Mr. Nagaraj (AL-8472)", trigger: "Consultation started", suggestion: "Based on last visit (Gridhrasi, VAS 7/10) + today's vitals (BP 140/90) + current Rx (Rasnasaptakam 21 days): Consider adding Dashmoola Kwath for Vata-anulomana. VAS expected to drop to 4/10 by Day 14.", confidence: 89, type: "Treatment", action: "Add to Rx" },
  { id: 2, patient: "Mrs. Kalpana (AL-9201)", trigger: "Lab result received", suggestion: "ESR still elevated (42 mm/hr). Current Simhanada Guggulu × 30 days not showing expected response. Consider: Switch to Yogaraja Guggulu OR add Eranda Taila Virechana (mild). Research shows 73% better response with combination.", confidence: 82, type: "Modification", action: "Review Options" },
  { id: 3, patient: "Mrs. Hameedhal (AL-15598)", trigger: "Follow-up due tomorrow", suggestion: "Patient completed 16-day Tikta Ksheer Basti. Expected: 50% improvement. Pre-load outcome scales (ODI, VAS) for comparison. Prepare Rasayana phase protocol (Ashwagandha + Bala).", confidence: 95, type: "Preparation", action: "Prepare" },
  { id: 4, patient: "Rabiyathubasaria (AL-15568)", trigger: "Drug interaction detected", suggestion: "⚠️ Patient taking Metformin (allopathy) + you prescribed Guduchi Ghana Vati. No direct interaction, BUT both lower blood sugar. Monitor glucose closely. Recommend: Check FBS before next Guduchi dose.", confidence: 91, type: "Safety", action: "Acknowledge" },
];

const HmsAiCopilot = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold">AI Copilot for Doctors</h1><p className="text-sm text-muted-foreground">Real-time AI assistant that suggests during consultation — not just alerts, active clinical support</p></div>
      <Badge className="bg-purple-100 text-purple-800"><Brain className="mr-1 h-3 w-3" />Active — 4 suggestions today</Badge>
    </div>
    <Card className="border-purple-200 bg-purple-50/30"><CardContent className="p-4"><div className="flex items-center gap-3"><Brain className="h-8 w-8 text-purple-600" /><div><p className="font-semibold">AI Copilot is watching your consultations</p><p className="text-sm text-muted-foreground">It reads: patient history, current vitals, active Rx, lab results, Prakriti, treatment phase — then suggests in real-time.</p></div></div></CardContent></Card>

    <div className="space-y-3">
      {copilotSuggestions.map(s => (
        <Card key={s.id} className={s.type === "Safety" ? "border-red-200" : "border-blue-200"}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={s.type === "Safety" ? "bg-red-100 text-red-800" : s.type === "Treatment" ? "bg-green-100 text-green-800" : s.type === "Modification" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}>{s.type}</Badge>
                  <span className="text-sm font-medium">{s.patient}</span>
                  <span className="text-xs text-muted-foreground">• {s.trigger}</span>
                </div>
                <p className="text-sm">{s.suggestion}</p>
                <div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">Confidence: {s.confidence}%</Badge></div>
              </div>
              <div className="flex gap-2 ml-3">
                <Button size="sm" onClick={() => toast.success(`${s.action} — applied`)}>{s.action}</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.info("Dismissed")}>Dismiss</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card><CardHeader><CardTitle>Copilot Capabilities</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-3 text-sm">
      <div className="p-3 bg-green-50 rounded"><Pill className="h-4 w-4 mb-1 text-green-600" /><strong>Treatment Suggestions</strong><br/>Based on Prakriti + condition + phase → recommends next medicine/therapy</div>
      <div className="p-3 bg-red-50 rounded"><AlertTriangle className="h-4 w-4 mb-1 text-red-600" /><strong>Safety Alerts</strong><br/>AYUSH + Allopathy interaction, contraindications, allergy flags</div>
      <div className="p-3 bg-blue-50 rounded"><Activity className="h-4 w-4 mb-1 text-blue-600" /><strong>Outcome Prediction</strong><br/>"If you add X, patient's VAS will likely drop Y% by Day Z"</div>
      <div className="p-3 bg-purple-50 rounded"><Brain className="h-4 w-4 mb-1 text-purple-600" /><strong>Evidence Reference</strong><br/>Auto-cites relevant Charaka/Sushruta/research paper for each suggestion</div>
    </CardContent></Card>
  </div>
);
export default HmsAiCopilot;
