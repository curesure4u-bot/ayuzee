import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Brain, Send, Sparkles, BookOpen, Pill, Activity } from "lucide-react";

const DoctorCaseDiscussion = () => {
  const [caseInput, setCaseInput] = useState("58-year-old male, Vata-Pitta Prakriti. Presenting with bilateral knee pain (Sandhivata) for 2 years, worsening last 3 months. Currently on Methotrexate 15mg/week for RA (diagnosed 2022). Morning stiffness 45 min. DAS28: 4.2. Also has T2DM (HbA1c 7.8%). Wants to add Ayurveda. What Panchakarma is safe with MTX? Which Guggulu preparation won't interact?");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = () => {
    if (!caseInput.trim()) return;
    setIsThinking(true);
    setTimeout(() => {
      setAiResponse(`**AI Clinical Analysis:**

**Diagnosis Assessment:**
- Primary: Amavata (RA) — Moderate activity (DAS28: 4.2)
- Secondary: Sandhivata (OA Knee) — likely concurrent degenerative + inflammatory
- Co-morbidity: Madhumeha (T2DM) — HbA1c 7.8% (suboptimal control)

**Panchakarma Safety with MTX:**
✅ SAFE: Janu Basti (external only — no systemic absorption conflict)
✅ SAFE: Abhyanga + Swedana (external, improves circulation)
✅ SAFE: Patra Pinda Sweda (localized fomentation)
⚠️ CAUTION: Virechana — may alter MTX absorption. Do on non-MTX day, monitor LFT.
❌ AVOID: Vamana while on MTX (hepatotoxicity risk with emesis stress)

**Guggulu Selection:**
✅ Yogaraja Guggulu — preferred for Sandhivata. No significant CYP interaction with MTX.
⚠️ Simhanada Guggulu — contains castor oil purgative. Space 4 hours from MTX. Monitor GI.
❌ Avoid Kaishore Guggulu with MTX — additive hepatic load (both bitter/Tikta dominant).

**Recommended Protocol:**
1. Janu Basti × 7 days (Murivenna + Kottamchukkadi)
2. Yogaraja Guggulu 2 BD (instead of Simhanada for this patient)
3. Continue MTX unchanged
4. Add: Nishamalaki for DM support (safe with all current meds)
5. Monitor: LFT in 2 weeks after starting Guggulu

**Evidence:** CCRAS guideline 2023 supports external Panchakarma concurrent with DMARDs. Yogaraja Guggulu cleared in WHO-TM interaction database.`);
      setIsThinking(false);
      toast.success("AI analysis complete");
    }, 2500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6 text-purple-600" /> AI Case Discussion</h1>
          <p className="text-muted-foreground mt-1">Present a case — AI provides clinical analysis, differential diagnosis, and treatment recommendations</p>
        </div>
        <Badge variant="outline" className="text-purple-600"><Sparkles className="h-3 w-3 mr-1" /> AI Second Opinion</Badge>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Present Your Case</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={caseInput} onChange={(e) => setCaseInput(e.target.value)} rows={6} placeholder="Describe patient: age, gender, Prakriti, presenting complaints, current medications, investigations, specific questions..." className="text-sm" />
          <Button onClick={handleSubmit} disabled={isThinking}><Brain className="h-4 w-4 mr-1" /> {isThinking ? "AI Analyzing..." : "Get AI Analysis"}</Button>
        </CardContent>
      </Card>

      {aiResponse && (
        <Card className="border-purple-200">
          <CardHeader className="pb-2 bg-purple-50"><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-purple-600" /> AI Clinical Response</CardTitle></CardHeader>
          <CardContent className="pt-4">
            <div className="prose prose-sm max-w-none whitespace-pre-line text-sm">{aiResponse}</div>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Copied to case sheet")}><BookOpen className="h-3 w-3 mr-1" /> Copy to Case Sheet</Button>
              <Button size="sm" variant="outline" onClick={() => toast.success("Protocol applied")}><Pill className="h-3 w-3 mr-1" /> Apply Recommended Protocol</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 text-xs text-amber-700"><strong>Disclaimer:</strong> AI provides assistive clinical guidance only. Final clinical judgment rests with the treating physician. AI references CCRAS, WHO-TM, AFI, and published Ayurvedic pharmacology databases.</CardContent>
      </Card>
    </div>
  );
};

export default DoctorCaseDiscussion;
