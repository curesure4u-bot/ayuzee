import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Activity, CheckCircle, Clock, TrendingUp, ArrowRight,
  Target, Sparkles, Heart, Leaf, Shield,
} from "lucide-react";

type Phase = {
  id: number;
  name: string;
  sanskritName: string;
  description: string;
  duration: string;
  status: "completed" | "active" | "upcoming" | "skipped";
  startDate: string;
  endDate: string;
  outcomes: { metric: string; baseline: number; current: number; unit: string; improved: boolean }[];
  notes: string;
};

type PatientTimeline = {
  patient: string;
  uhid: string;
  condition: string;
  system: string;
  doctor: string;
  startDate: string;
  currentPhase: number;
  overallProgress: number;
  phases: Phase[];
};

const mockTimeline: PatientTimeline = {
  patient: "Ramesh Kumar",
  uhid: "AYZ-2026-001",
  condition: "Sandhivata (Bilateral Knee OA Grade 2)",
  system: "Ayurveda + Panchakarma",
  doctor: "Dr. Arun Sharma",
  startDate: "2026-06-01",
  currentPhase: 5,
  overallProgress: 62,
  phases: [
    { id: 1, name: "Assessment & Diagnosis", sanskritName: "Pariksha", description: "Complete AYUSH assessment including Ashtavidha, Dashavidha, Prakruti analysis, investigations, and baseline outcome measurements", duration: "Day 1-2", status: "completed", startDate: "2026-06-01", endDate: "2026-06-02", outcomes: [{ metric: "VAS Pain Score", baseline: 8, current: 8, unit: "/10", improved: false }, { metric: "Knee ROM", baseline: 90, current: 90, unit: "°", improved: false }, { metric: "WOMAC Score", baseline: 62, current: 62, unit: "/96", improved: false }], notes: "Vata-Kapha Prakruti. Manda Agni. Ama present. ESR 28, CRP 12.5." },
    { id: 2, name: "Deepana-Pachana", sanskritName: "दीपन-पाचन", description: "Ama digestion and Agni correction before main therapy. Preparatory cleansing of channels.", duration: "Day 3-9 (7 days)", status: "completed", startDate: "2026-06-03", endDate: "2026-06-09", outcomes: [{ metric: "Agni Status", baseline: 2, current: 4, unit: "/5", improved: true }, { metric: "Ama Level", baseline: 4, current: 1, unit: "/5", improved: true }], notes: "Chitrakadi Vati + Hingvashtak Churnam. Agni improved. Ama cleared by Day 7." },
    { id: 3, name: "Snehana (Oleation)", sanskritName: "स्नेहन", description: "Internal oleation with medicated ghee + external Abhyanga to prepare body for Shodhana", duration: "Day 10-16 (7 days)", status: "completed", startDate: "2026-06-10", endDate: "2026-06-16", outcomes: [{ metric: "Snehana Lakshana", baseline: 0, current: 5, unit: "/5", improved: true }, { metric: "VAS Pain Score", baseline: 8, current: 6, unit: "/10", improved: true }], notes: "Indukantham Ghritam 30ml→50ml→70ml over 5 days. Samyak Snigdha on Day 5. External Abhyanga with Dhanwantharam Tailam daily." },
    { id: 4, name: "Shodhana (Purification)", sanskritName: "शोधन", description: "Main Panchakarma procedures - Virechana/Vasti as indicated for the condition", duration: "Day 17-30 (14 days)", status: "completed", startDate: "2026-06-17", endDate: "2026-06-30", outcomes: [{ metric: "VAS Pain Score", baseline: 8, current: 4, unit: "/10", improved: true }, { metric: "Knee ROM", baseline: 90, current: 110, unit: "°", improved: true }, { metric: "ESR", baseline: 28, current: 18, unit: "mm/hr", improved: true }], notes: "Virechana Day 17. Kashaya Vasti x7 + Sneha Vasti x7 (Yoga Basti). Janu Basti x14 days with Kottamchukkadi Tailam." },
    { id: 5, name: "Samsarjana (Recovery Diet)", sanskritName: "संसर्जन", description: "Graded diet protocol to restore Agni after Shodhana. Peya→Vilepi→Yusha→Normal food", duration: "Day 31-37 (7 days)", status: "active", startDate: "2026-07-01", endDate: "2026-07-07", outcomes: [{ metric: "Agni Recovery", baseline: 0, current: 3, unit: "/5", improved: true }, { metric: "VAS Pain Score", baseline: 8, current: 3, unit: "/10", improved: true }], notes: "Day 4 of Samsarjana. Currently on Akrita Yusha stage. Agni recovering well. Pain significantly reduced." },
    { id: 6, name: "Shamana (Palliative)", sanskritName: "शमन", description: "Internal medicines for sustained dosha balance and tissue repair. Long-term formulations.", duration: "Day 38-67 (30 days)", status: "upcoming", startDate: "2026-07-08", endDate: "2026-08-06", outcomes: [], notes: "Planned: Yogaraja Guggulu + Rasnasaptakam + Ashwagandha for 30 days" },
    { id: 7, name: "Rasayana (Rejuvenation)", sanskritName: "रसायन", description: "Tissue rejuvenation and immunity building. Dhatu Pushti for sustained recovery.", duration: "Day 68-97 (30 days)", status: "upcoming", startDate: "2026-08-07", endDate: "2026-09-05", outcomes: [], notes: "Planned: Chyawanprash + Ashwagandha Rasayana + Bala Tailam external" },
    { id: 8, name: "Maintenance & Follow-up", sanskritName: "अनुवर्तन", description: "Lifestyle consolidation, seasonal protocols, periodic review, and long-term outcome tracking", duration: "Ongoing", status: "upcoming", startDate: "2026-09-06", endDate: "", outcomes: [], notes: "Planned: Quarterly review. Seasonal Panchakarma. Daily Yoga. Pathya lifelong." },
  ],
};

const getPhaseIcon = (status: Phase["status"]) => {
  switch (status) {
    case "completed": return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "active": return <Activity className="h-5 w-5 text-blue-600 animate-pulse" />;
    case "upcoming": return <Clock className="h-5 w-5 text-muted-foreground" />;
    case "skipped": return <ArrowRight className="h-5 w-5 text-amber-500" />;
  }
};

const getPhaseColor = (status: Phase["status"]) => {
  switch (status) {
    case "completed": return "border-green-300 bg-green-50/50";
    case "active": return "border-blue-300 bg-blue-50/50 ring-2 ring-blue-200";
    case "upcoming": return "border-border bg-card";
    case "skipped": return "border-amber-200 bg-amber-50/30";
  }
};

const HmsTreatmentTimeline = () => {
  const [timeline] = useState<PatientTimeline>(mockTimeline);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(timeline.phases[4]); // active phase

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" /> 8-Phase Treatment Timeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Structured AYUSH treatment journey with scientific outcome metrics at every phase
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">Evidence-Based Tracking</Badge>
      </div>

      {/* Patient Context */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div><p className="text-xs text-muted-foreground">Patient</p><p className="font-bold">{timeline.patient}</p><p className="text-xs text-muted-foreground">{timeline.uhid}</p></div>
            <div><p className="text-xs text-muted-foreground">Condition</p><p className="font-medium text-sm">{timeline.condition}</p></div>
            <div><p className="text-xs text-muted-foreground">System</p><p className="font-medium text-sm">{timeline.system}</p></div>
            <div><p className="text-xs text-muted-foreground">Doctor</p><p className="font-medium text-sm">{timeline.doctor}</p></div>
            <div><p className="text-xs text-muted-foreground">Overall Progress</p>
              <div className="flex items-center gap-2 mt-1"><Progress value={timeline.overallProgress} className="h-3 flex-1" /><span className="text-sm font-bold">{timeline.overallProgress}%</span></div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Phase {timeline.currentPhase}/8 active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Timeline Visual */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Treatment Phases</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-muted rounded-full">
              <div className="h-1 bg-green-500 rounded-full transition-all" style={{ width: `${(timeline.phases.filter(p => p.status === "completed").length / 8) * 100}%` }} />
            </div>
            {/* Phase nodes */}
            <div className="relative grid grid-cols-4 sm:grid-cols-8 gap-1">
              {timeline.phases.map((phase) => (
                <button
                  key={phase.id}
                  className={`flex flex-col items-center p-2 rounded-lg transition cursor-pointer ${selectedPhase?.id === phase.id ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/50"}`}
                  onClick={() => setSelectedPhase(phase)}
                >
                  <div className={`h-10 w-10 rounded-full grid place-items-center border-2 bg-card z-10 ${phase.status === "completed" ? "border-green-500" : phase.status === "active" ? "border-blue-500" : "border-muted"}`}>
                    {getPhaseIcon(phase.status)}
                  </div>
                  <p className="text-[9px] font-medium text-center mt-1 leading-tight">{phase.id}. {phase.name.split(" ")[0]}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Phase Detail */}
      {selectedPhase && (
        <Card className={getPhaseColor(selectedPhase.status)}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPhaseIcon(selectedPhase.status)}
                <div>
                  <CardTitle className="text-lg">Phase {selectedPhase.id}: {selectedPhase.name}</CardTitle>
                  <p className="text-sm text-primary font-medium">{selectedPhase.sanskritName}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={selectedPhase.status === "active" ? "default" : selectedPhase.status === "completed" ? "outline" : "secondary"} className={`capitalize ${selectedPhase.status === "completed" ? "text-green-600" : ""}`}>{selectedPhase.status}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{selectedPhase.duration}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedPhase.description}</p>

            {selectedPhase.startDate && (
              <div className="flex gap-4 text-xs">
                <span><strong>Start:</strong> {selectedPhase.startDate}</span>
                {selectedPhase.endDate && <span><strong>End:</strong> {selectedPhase.endDate}</span>}
              </div>
            )}

            {/* Outcome Metrics */}
            {selectedPhase.outcomes.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1"><TrendingUp className="h-4 w-4 text-green-600" /> Outcome Metrics (Baseline → Current)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedPhase.outcomes.map((o) => (
                    <div key={o.metric} className={`p-3 rounded-lg border ${o.improved ? "bg-green-50 border-green-200" : "bg-muted/50"}`}>
                      <p className="text-xs text-muted-foreground">{o.metric}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{o.baseline}{o.unit}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-lg font-bold ${o.improved ? "text-green-700" : ""}`}>{o.current}{o.unit}</span>
                      </div>
                      {o.improved && o.baseline !== o.current && (
                        <p className="text-[10px] text-green-600 mt-0.5">
                          {o.metric.includes("Pain") || o.metric.includes("ESR") || o.metric.includes("WOMAC") || o.metric.includes("Ama")
                            ? `↓ ${Math.round(((o.baseline - o.current) / o.baseline) * 100)}% improved`
                            : `↑ ${Math.round(((o.current - o.baseline) / o.baseline) * 100)}% improved`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {selectedPhase.notes && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Clinical Notes</p>
                <p className="text-sm">{selectedPhase.notes}</p>
              </div>
            )}

            {/* Actions for active phase */}
            {selectedPhase.status === "active" && (
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" onClick={() => toast.success("Outcome recorded")}>Record Outcome</Button>
                <Button size="sm" variant="outline" onClick={() => toast.success("Phase completed")}>Mark Phase Complete</Button>
                <Button size="sm" variant="outline">Add Clinical Note</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Outcome Card */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /> Overall Outcome Summary (Baseline vs Current)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">VAS Pain Score</p>
              <p className="text-sm text-muted-foreground mt-1">8/10 → <span className="text-xl font-bold text-green-700">3/10</span></p>
              <p className="text-[10px] text-green-600">↓ 63% improvement</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Knee ROM</p>
              <p className="text-sm text-muted-foreground mt-1">90° → <span className="text-xl font-bold text-green-700">110°</span></p>
              <p className="text-[10px] text-green-600">↑ 22% improvement</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">ESR</p>
              <p className="text-sm text-muted-foreground mt-1">28 → <span className="text-xl font-bold text-green-700">18</span> mm/hr</p>
              <p className="text-[10px] text-green-600">↓ 36% reduction</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-card border">
              <p className="text-xs text-muted-foreground">Treatment Day</p>
              <p className="text-xl font-bold mt-1">Day 35</p>
              <p className="text-[10px] text-muted-foreground">Phase 5 of 8</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Info */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardContent className="p-3 flex items-start gap-2">
          <Shield className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-700">
            <p className="font-medium">Scientific Outcome Tracking</p>
            <p className="text-indigo-600 mt-0.5">Every phase captures validated metrics (VAS, WOMAC, Barthel, mRS). First-vs-latest scoring generates clinical evidence for research papers, insurance claims, and accreditation. Data feeds into the Governance Dashboard for facility-level outcome reporting.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HmsTreatmentTimeline;
