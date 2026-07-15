import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  TrendingUp, TrendingDown, BarChart3, Target, Calendar,
  Save, ArrowRight, CheckCircle, Activity,
} from "lucide-react";

type ScoreEntry = { date: string; score: number; assessedBy: string; phase: string };

type OutcomeScale = {
  id: string; name: string; abbreviation: string; description: string;
  maxScore: number; lowerIsBetter: boolean; applicableFor: string[];
  scoring: { range: string; interpretation: string; color: string }[];
  history: ScoreEntry[];
};

const mockScales: OutcomeScale[] = [
  {
    id: "vas", name: "Visual Analog Scale", abbreviation: "VAS", description: "Self-reported pain intensity from 0 (no pain) to 10 (worst imaginable pain)",
    maxScore: 10, lowerIsBetter: true, applicableFor: ["Sandhivata", "Gridhrasi", "Amavata", "All pain conditions"],
    scoring: [
      { range: "0", interpretation: "No Pain", color: "bg-green-500" },
      { range: "1-3", interpretation: "Mild Pain", color: "bg-green-400" },
      { range: "4-6", interpretation: "Moderate Pain", color: "bg-amber-500" },
      { range: "7-9", interpretation: "Severe Pain", color: "bg-red-400" },
      { range: "10", interpretation: "Worst Pain", color: "bg-red-600" },
    ],
    history: [
      { date: "2026-06-01", score: 8, assessedBy: "Dr. Sharma", phase: "Baseline" },
      { date: "2026-06-16", score: 6, assessedBy: "Dr. Sharma", phase: "Post-Snehana" },
      { date: "2026-06-30", score: 4, assessedBy: "Dr. Sharma", phase: "Post-Shodhana" },
      { date: "2026-07-07", score: 3, assessedBy: "Dr. Sharma", phase: "Samsarjana" },
      { date: "2026-07-15", score: 3, assessedBy: "Dr. Sharma", phase: "Current" },
    ],
  },
  {
    id: "womac", name: "Western Ontario & McMaster Universities Index", abbreviation: "WOMAC", description: "Evaluates knee/hip OA through pain (5 items), stiffness (2 items), and physical function (17 items). Total score 0-96.",
    maxScore: 96, lowerIsBetter: true, applicableFor: ["Sandhivata (OA Knee)", "Sandhivata (OA Hip)", "Joint replacement rehab"],
    scoring: [
      { range: "0-24", interpretation: "Mild dysfunction", color: "bg-green-500" },
      { range: "25-48", interpretation: "Moderate dysfunction", color: "bg-amber-500" },
      { range: "49-72", interpretation: "Severe dysfunction", color: "bg-orange-500" },
      { range: "73-96", interpretation: "Extreme dysfunction", color: "bg-red-600" },
    ],
    history: [
      { date: "2026-06-01", score: 62, assessedBy: "Dr. Sharma", phase: "Baseline" },
      { date: "2026-06-30", score: 45, assessedBy: "Dr. Sharma", phase: "Post-Shodhana" },
      { date: "2026-07-15", score: 32, assessedBy: "Dr. Sharma", phase: "Current" },
    ],
  },
  {
    id: "barthel", name: "Barthel Index", abbreviation: "BI", description: "Measures independence in activities of daily living (ADL). Score 0-100. Used for stroke rehab (Pakshaghata).",
    maxScore: 100, lowerIsBetter: false, applicableFor: ["Pakshaghata (Stroke)", "Spinal cord injury", "Geriatric rehab"],
    scoring: [
      { range: "0-20", interpretation: "Total dependence", color: "bg-red-600" },
      { range: "21-60", interpretation: "Severe dependence", color: "bg-orange-500" },
      { range: "61-90", interpretation: "Moderate dependence", color: "bg-amber-500" },
      { range: "91-99", interpretation: "Slight dependence", color: "bg-green-400" },
      { range: "100", interpretation: "Independent", color: "bg-green-600" },
    ],
    history: [
      { date: "2026-03-15", score: 30, assessedBy: "Dr. Nair", phase: "Admission" },
      { date: "2026-04-15", score: 55, assessedBy: "Dr. Nair", phase: "1 month" },
      { date: "2026-05-15", score: 70, assessedBy: "Dr. Nair", phase: "2 months" },
      { date: "2026-07-15", score: 85, assessedBy: "Dr. Nair", phase: "Current" },
    ],
  },
  {
    id: "mrs", name: "Modified Rankin Scale", abbreviation: "mRS", description: "Measures degree of disability/dependence in daily activities after stroke. Score 0-6.",
    maxScore: 6, lowerIsBetter: true, applicableFor: ["Pakshaghata (Stroke)", "Cerebrovascular disease", "Neuro rehab"],
    scoring: [
      { range: "0", interpretation: "No symptoms", color: "bg-green-600" },
      { range: "1", interpretation: "No significant disability", color: "bg-green-400" },
      { range: "2", interpretation: "Slight disability", color: "bg-amber-400" },
      { range: "3", interpretation: "Moderate disability", color: "bg-amber-600" },
      { range: "4", interpretation: "Moderately severe disability", color: "bg-orange-500" },
      { range: "5", interpretation: "Severe disability", color: "bg-red-500" },
      { range: "6", interpretation: "Dead", color: "bg-slate-800" },
    ],
    history: [
      { date: "2026-03-15", score: 4, assessedBy: "Dr. Nair", phase: "Admission" },
      { date: "2026-05-15", score: 3, assessedBy: "Dr. Nair", phase: "2 months" },
      { date: "2026-07-15", score: 2, assessedBy: "Dr. Nair", phase: "Current" },
    ],
  },
  {
    id: "nyha", name: "New York Heart Association Functional Classification", abbreviation: "NYHA", description: "Classifies heart failure severity based on physical activity limitations. Class I-IV.",
    maxScore: 4, lowerIsBetter: true, applicableFor: ["Hridroga (Heart disease)", "Cardiac rehabilitation", "Shwasa with cardiac component"],
    scoring: [
      { range: "I", interpretation: "No limitation of physical activity", color: "bg-green-500" },
      { range: "II", interpretation: "Slight limitation - comfortable at rest", color: "bg-amber-500" },
      { range: "III", interpretation: "Marked limitation - comfortable only at rest", color: "bg-orange-500" },
      { range: "IV", interpretation: "Unable to carry on any physical activity", color: "bg-red-600" },
    ],
    history: [],
  },
];

const HmsOutcomeScales = () => {
  const [scales] = useState<OutcomeScale[]>(mockScales);
  const [selectedScale, setSelectedScale] = useState<OutcomeScale>(scales[0]);
  const [newScore, setNewScore] = useState([5]);

  const getImprovement = (scale: OutcomeScale) => {
    if (scale.history.length < 2) return null;
    const first = scale.history[0].score;
    const last = scale.history[scale.history.length - 1].score;
    const pct = Math.round(Math.abs(((last - first) / first) * 100));
    const improved = scale.lowerIsBetter ? last < first : last > first;
    return { pct, improved, first, last };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" /> Validated Outcome Instruments
          </h1>
          <p className="text-sm text-muted-foreground">
            VAS, WOMAC, Barthel, mRS, NYHA — standardized scales for evidence-based AYUSH outcomes
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Research-Grade Metrics</Badge>
      </div>

      {/* Scale Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {scales.map((scale) => {
          const imp = getImprovement(scale);
          return (
            <Card
              key={scale.id}
              className={`cursor-pointer transition hover:shadow-md ${selectedScale.id === scale.id ? "border-primary ring-2 ring-primary/20" : ""}`}
              onClick={() => setSelectedScale(scale)}
            >
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{scale.abbreviation}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{scale.name}</p>
                {imp && (
                  <div className="mt-2 flex items-center justify-center gap-1">
                    {imp.improved ? <TrendingDown className="h-3 w-3 text-green-600" /> : <TrendingUp className="h-3 w-3 text-red-600" />}
                    <span className={`text-xs font-bold ${imp.improved ? "text-green-600" : "text-red-600"}`}>{imp.pct}%</span>
                  </div>
                )}
                {!imp && <p className="text-[10px] text-muted-foreground mt-2">No data</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Scale Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Info & Scoring */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{selectedScale.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">{selectedScale.description}</p>
            <div>
              <p className="text-xs font-medium mb-1">Scoring Guide:</p>
              <div className="space-y-1">
                {selectedScale.scoring.map((s) => (
                  <div key={s.range} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${s.color}`} />
                    <span className="text-xs font-mono w-10">{s.range}</span>
                    <span className="text-xs text-muted-foreground">{s.interpretation}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-1">Applicable For:</p>
              <div className="flex flex-wrap gap-1">
                {selectedScale.applicableFor.map((a) => (
                  <Badge key={a} variant="secondary" className="text-[9px]">{a}</Badge>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {selectedScale.lowerIsBetter ? "Lower score = Better outcome" : "Higher score = Better outcome"} · Max: {selectedScale.maxScore}
            </p>
          </CardContent>
        </Card>

        {/* Trend / History */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Score Trend</CardTitle></CardHeader>
          <CardContent>
            {selectedScale.history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No assessments recorded yet</p>
            ) : (
              <div className="space-y-3">
                {/* Visual bar chart */}
                <div className="space-y-2">
                  {selectedScale.history.map((entry) => (
                    <div key={entry.date} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-16 shrink-0">{entry.phase}</span>
                      <div className="flex-1 bg-muted rounded-full h-4 relative">
                        <div
                          className={`h-4 rounded-full ${entry.score === selectedScale.history[selectedScale.history.length - 1].score ? "bg-primary" : "bg-primary/40"}`}
                          style={{ width: `${(entry.score / selectedScale.maxScore) * 100}%` }}
                        />
                        <span className="absolute right-2 top-0.5 text-[9px] font-bold">{entry.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* First vs Latest */}
                {selectedScale.history.length >= 2 && (
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs font-medium text-green-700">First vs Latest (Evidence)</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-muted-foreground">{selectedScale.history[0].score}</span>
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <span className="text-2xl font-bold text-green-700">{selectedScale.history[selectedScale.history.length - 1].score}</span>
                      <span className="text-xs text-muted-foreground">/ {selectedScale.maxScore}</span>
                    </div>
                    <p className="text-[10px] text-green-600 mt-0.5">
                      {getImprovement(selectedScale)?.improved ? "Clinically significant improvement" : "Needs attention"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Record New Score */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Record New Assessment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Patient</Label>
              <Input defaultValue="Ramesh Kumar (AYZ-2026-001)" disabled />
            </div>
            <div>
              <Label>{selectedScale.abbreviation} Score (0-{selectedScale.maxScore})</Label>
              <div className="mt-2">
                <Slider value={newScore} onValueChange={setNewScore} max={selectedScale.maxScore} step={1} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">0</span>
                  <span className="text-lg font-bold text-primary">{newScore[0]}</span>
                  <span className="text-xs text-muted-foreground">{selectedScale.maxScore}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Interpretation: <strong>{selectedScale.scoring.find((s, i) => {
                  const next = selectedScale.scoring[i + 1];
                  const low = parseInt(s.range) || 0;
                  const high = next ? (parseInt(next.range) || selectedScale.maxScore) - 1 : selectedScale.maxScore;
                  return newScore[0] >= low && newScore[0] <= high;
                })?.interpretation || selectedScale.scoring[selectedScale.scoring.length - 1].interpretation}</strong>
              </p>
            </div>
            <div>
              <Label>Treatment Phase</Label>
              <Select defaultValue="current">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baseline">Baseline</SelectItem>
                  <SelectItem value="post_snehana">Post-Snehana</SelectItem>
                  <SelectItem value="post_shodhana">Post-Shodhana</SelectItem>
                  <SelectItem value="shamana">During Shamana</SelectItem>
                  <SelectItem value="current">Current Assessment</SelectItem>
                  <SelectItem value="discharge">At Discharge</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Input placeholder="Clinical observation..." />
            </div>
            <Button className="w-full" onClick={() => toast.success(`${selectedScale.abbreviation} score ${newScore[0]} recorded`)}>
              <Save className="mr-1 h-4 w-4" /> Save Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HmsOutcomeScales;
