import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { FileText, Brain, Save, Copy, Mic } from "lucide-react";

const DoctorSoapNotes = () => {
  const [ayurvedaMode, setAyurvedaMode] = useState(false);
  const [subjective, setSubjective] = useState("Patient reports 50% reduction in joint stiffness. Morning stiffness now 30 min (was 1.5 hrs last visit). Pain 4/10 (was 7/10). Sleep improved with Ashwagandha. Appetite better — eating on time. Bowel: regular after Eranda taila weekly.");
  const [objective, setObjective] = useState("Tender joints: 4 (was 8). Swollen: 2 (was 5). DAS28-ESR: 3.2 (improved from 4.8). BP: 130/84. Weight: 72 kg. Pulse: Vata-Pitta type, moderate strength. Tongue: mild white coating (Ama reducing). Nadi: Vata slightly elevated in Sphij region.");
  const [assessment, setAssessment] = useState("Amavata (Rheumatoid Arthritis) — Improving. Moderate disease activity → Low activity. Responding well to combined Ayurveda + MTX protocol. DAS28 crossed into low-activity zone. Agni improving. Ama reducing (tongue coating less).");
  const [plan, setPlan] = useState("1. Continue current Rx 30 more days (Simhanada Guggulu + Rasnasaptakam + Ashwagandha)\n2. Reduce Prednisolone: 5mg → 2.5mg (taper over 2 weeks)\n3. Add Panchakarma: Virechana after 2 weeks (Agni now adequate)\n4. Next lab: ESR/CRP + LFT in 4 weeks (MTX monitoring)\n5. Follow-up: 30 days\n6. Diet: Continue Pathya. Avoid curd, cold items, fermented foods.");

  const labels = ayurvedaMode
    ? { s: "Vedana (Patient Complaints)", o: "Pareeksha (Examination)", a: "Nidana (Diagnosis/Assessment)", p: "Chikitsa (Treatment Plan)" }
    : { s: "Subjective", o: "Objective", a: "Assessment", p: "Plan" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" /> SOAP Notes (Structured Documentation)</h1>
          <p className="text-muted-foreground mt-1">Structured clinical documentation — Western SOAP or Ayurveda format</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ayurveda Format</span>
          <Switch checked={ayurvedaMode} onCheckedChange={setAyurvedaMode} />
        </div>
      </div>

      {ayurvedaMode && <Badge variant="outline" className="text-green-600 border-green-300">Ayurveda SOAP: Vedana → Pareeksha → Nidana → Chikitsa</Badge>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 bg-blue-50"><CardTitle className="text-sm flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs grid place-items-center font-bold">S</span> {labels.s}</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <Textarea value={subjective} onChange={(e) => setSubjective(e.target.value)} rows={5} className="text-sm" />
            <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => toast.info("AI auto-filling from patient's verbal complaints...")}><Brain className="h-3 w-3 mr-1" /> AI Assist</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 bg-green-50"><CardTitle className="text-sm flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-green-600 text-white text-xs grid place-items-center font-bold">O</span> {labels.o}</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={5} className="text-sm" />
            <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => toast.info("AI pulling from today's vitals + examination...")}><Brain className="h-3 w-3 mr-1" /> AI Assist</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 bg-amber-50"><CardTitle className="text-sm flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-amber-600 text-white text-xs grid place-items-center font-bold">A</span> {labels.a}</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <Textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} rows={5} className="text-sm" />
            <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => toast.info("AI generating assessment from S + O data...")}><Brain className="h-3 w-3 mr-1" /> AI Assist</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 bg-purple-50"><CardTitle className="text-sm flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-purple-600 text-white text-xs grid place-items-center font-bold">P</span> {labels.p}</CardTitle></CardHeader>
          <CardContent className="pt-3">
            <Textarea value={plan} onChange={(e) => setPlan(e.target.value)} rows={5} className="text-sm" />
            <Button size="sm" variant="ghost" className="mt-1 text-xs" onClick={() => toast.info("AI generating plan based on assessment + protocols...")}><Brain className="h-3 w-3 mr-1" /> AI Assist</Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => toast.success("SOAP notes saved")}><Save className="h-4 w-4 mr-1" /> Save Notes</Button>
        <Button variant="outline" onClick={() => toast.success("Copied to case sheet")}><Copy className="h-4 w-4 mr-1" /> Copy to Case Sheet</Button>
        <Button variant="outline" onClick={() => toast.info("Listening... speak your notes")}><Mic className="h-4 w-4 mr-1" /> AI Generate from Voice</Button>
      </div>
    </div>
  );
};

export default DoctorSoapNotes;
