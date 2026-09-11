import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { computeWellnessAge, WELLNESS_REFERENCES, type WellnessInputs } from "@/lib/spineWellnessAge";
import {
  Activity, HeartPulse, Save, Share2, TrendingDown, TrendingUp, Sparkles,
  ClipboardList, History, ExternalLink, Gauge,
} from "lucide-react";

interface Assessment {
  id: string;
  patient_name: string;
  chronological_age: number;
  vitality_score?: number | null;
  biological_age?: number | null;
  age_gap?: number | null;
  category?: string | null;
  created_at: string;
}

const num = (v: string) => (v === "" ? null : Number(v));

const blank = {
  patient_name: "", chronological_age: "", gender: "male", phone: "",
  gripStrengthKg: "", gaitSpeedMs: "", sitToStand: "", balanceSeconds: "", flexibilityCm: "",
  restingHr: "", bpSystolic: "", bpDiastolic: "", waistHipRatio: "",
  agniScore: "", sleepScore: "", stressScore: "", activityScore: "", dietScore: "", ojasScore: "",
};

export default function SpineWellnessAge() {
  const [form, setForm] = useState({ ...blank });
  const [result, setResult] = useState<ReturnType<typeof computeWellnessAge> | null>(null);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [saving, setSaving] = useState(false);

  const loadHistory = async () => {
    try {
      const { data } = await (supabase.from("spine_wellness_assessments") as any)
        .select("id, patient_name, chronological_age, vitality_score, biological_age, age_gap, category, created_at")
        .order("created_at", { ascending: false }).limit(20);
      setHistory((data as Assessment[]) || []);
    } catch { setHistory([]); }
  };
  useEffect(() => { loadHistory(); }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const calc = () => {
    if (!form.chronological_age) { toast.error("Enter chronological age"); return; }
    const inputs: WellnessInputs = {
      chronologicalAge: Number(form.chronological_age), gender: form.gender,
      gripStrengthKg: num(form.gripStrengthKg), gaitSpeedMs: num(form.gaitSpeedMs),
      sitToStand: num(form.sitToStand), balanceSeconds: num(form.balanceSeconds), flexibilityCm: num(form.flexibilityCm),
      restingHr: num(form.restingHr), bpSystolic: num(form.bpSystolic), bpDiastolic: num(form.bpDiastolic),
      waistHipRatio: num(form.waistHipRatio),
      agniScore: num(form.agniScore), sleepScore: num(form.sleepScore), stressScore: num(form.stressScore),
      activityScore: num(form.activityScore), dietScore: num(form.dietScore), ojasScore: num(form.ojasScore),
    };
    setResult(computeWellnessAge(inputs));
  };

  const save = async () => {
    if (!form.patient_name || !form.chronological_age) { toast.error("Enter patient name and age"); return; }
    const res = result || (() => { calc(); return null; })();
    const r = res || computeWellnessAge({ chronologicalAge: Number(form.chronological_age), gender: form.gender });
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await (supabase.from("spine_wellness_assessments") as any).insert({
        owner_id: user?.id || null, patient_name: form.patient_name, phone: form.phone || null,
        chronological_age: Number(form.chronological_age), gender: form.gender,
        grip_strength_kg: num(form.gripStrengthKg), gait_speed_ms: num(form.gaitSpeedMs),
        sit_to_stand: num(form.sitToStand), balance_seconds: num(form.balanceSeconds), flexibility_cm: num(form.flexibilityCm),
        resting_hr: num(form.restingHr), bp_systolic: num(form.bpSystolic), bp_diastolic: num(form.bpDiastolic),
        waist_hip_ratio: num(form.waistHipRatio),
        agni_score: num(form.agniScore), sleep_score: num(form.sleepScore), stress_score: num(form.stressScore),
        activity_score: num(form.activityScore), diet_score: num(form.dietScore), ojas_score: num(form.ojasScore),
        vitality_score: r.vitalityScore, biological_age: r.biologicalAge, age_gap: r.ageGap,
        category: r.category, recommendations: r.recommendations,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Wellness assessment saved"); setResult(r); loadHistory(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const share = () => {
    if (!result) return;
    const younger = result.ageGap <= 0;
    const text = `🌿 ${form.patient_name || "Your"} Wellness Age: ${result.biologicalAge} (chronological ${form.chronological_age}). ${younger ? `That's ${Math.abs(result.ageGap)} years YOUNGER than your age!` : `Let's bring it down with a rejuvenation program.`} Vitality Score ${result.vitalityScore}/100.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const patientHistory = history.filter((h) => form.patient_name && h.patient_name.toLowerCase() === form.patient_name.toLowerCase());

  const catColor = (c?: string | null) =>
    c === "excellent" ? "text-green-600" : c === "good" ? "text-emerald-600" : c === "average" ? "text-amber-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Gauge className="h-6 w-6 text-teal-600" /> Wellness Age Tracker</h1>
          <p className="text-muted-foreground mt-1">Biological vs chronological age — the measurable reason recovered patients keep investing in their health.</p>
        </div>
        <Badge className="bg-teal-100 text-teal-700"><Sparkles className="h-3 w-3 mr-1" /> Longevity</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><ClipboardList className="h-4 w-4" /> Assessment</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div><label className="text-xs font-medium">Patient</label><Input value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} placeholder="Name" /></div>
                <div><label className="text-xs font-medium">Age</label><Input type="number" value={form.chronological_age} onChange={(e) => set("chronological_age", e.target.value)} placeholder="45" /></div>
                <div><label className="text-xs font-medium">Gender</label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><label className="text-xs font-medium">Phone</label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91..." /></div>
              </div>

              <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-1">Functional Markers</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div><label className="text-xs font-medium">Grip Strength (kg)</label><Input type="number" value={form.gripStrengthKg} onChange={(e) => set("gripStrengthKg", e.target.value)} placeholder="35" /></div>
                <div><label className="text-xs font-medium">Gait Speed (m/s)</label><Input type="number" value={form.gaitSpeedMs} onChange={(e) => set("gaitSpeedMs", e.target.value)} placeholder="1.2" /></div>
                <div><label className="text-xs font-medium">Sit-to-Stand (30s)</label><Input type="number" value={form.sitToStand} onChange={(e) => set("sitToStand", e.target.value)} placeholder="15" /></div>
                <div><label className="text-xs font-medium">Balance (sec)</label><Input type="number" value={form.balanceSeconds} onChange={(e) => set("balanceSeconds", e.target.value)} placeholder="30" /></div>
                <div><label className="text-xs font-medium">Flexibility (cm)</label><Input type="number" value={form.flexibilityCm} onChange={(e) => set("flexibilityCm", e.target.value)} placeholder="5" /></div>
                <div><label className="text-xs font-medium">Resting HR</label><Input type="number" value={form.restingHr} onChange={(e) => set("restingHr", e.target.value)} placeholder="70" /></div>
              </div>

              <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-1">Vitals & Body</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div><label className="text-xs font-medium">BP Systolic</label><Input type="number" value={form.bpSystolic} onChange={(e) => set("bpSystolic", e.target.value)} placeholder="120" /></div>
                <div><label className="text-xs font-medium">BP Diastolic</label><Input type="number" value={form.bpDiastolic} onChange={(e) => set("bpDiastolic", e.target.value)} placeholder="80" /></div>
                <div><label className="text-xs font-medium">Waist-Hip Ratio</label><Input type="number" value={form.waistHipRatio} onChange={(e) => set("waistHipRatio", e.target.value)} placeholder="0.9" /></div>
              </div>

              <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-1">Ayurvedic & Lifestyle (0-10)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div><label className="text-xs font-medium">Agni (Digestion)</label><Input type="number" value={form.agniScore} onChange={(e) => set("agniScore", e.target.value)} placeholder="7" /></div>
                <div><label className="text-xs font-medium">Sleep</label><Input type="number" value={form.sleepScore} onChange={(e) => set("sleepScore", e.target.value)} placeholder="7" /></div>
                <div><label className="text-xs font-medium">Stress</label><Input type="number" value={form.stressScore} onChange={(e) => set("stressScore", e.target.value)} placeholder="4" /></div>
                <div><label className="text-xs font-medium">Activity</label><Input type="number" value={form.activityScore} onChange={(e) => set("activityScore", e.target.value)} placeholder="6" /></div>
                <div><label className="text-xs font-medium">Diet</label><Input type="number" value={form.dietScore} onChange={(e) => set("dietScore", e.target.value)} placeholder="7" /></div>
                <div><label className="text-xs font-medium">Ojas (Vitality)</label><Input type="number" value={form.ojasScore} onChange={(e) => set("ojasScore", e.target.value)} placeholder="6" /></div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button className="flex-1 gap-1" onClick={calc}><Gauge className="h-4 w-4" /> Calculate Wellness Age</Button>
                <Button variant="outline" className="gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save"}</Button>
              </div>
            </CardContent>
          </Card>

          {/* References */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Methodology & References</p>
              <p className="text-[11px] text-muted-foreground mb-2">This is a wellness-age estimate based on validated functional markers and Ayurvedic Rasayana principles — not a lab-grade epigenetic clock. Content is a synthesis for clinical use.</p>
              <div className="space-y-1">
                {WELLNESS_REFERENCES.map((r) => (
                  <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="text-[11px] text-teal-700 hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {r.label}</a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: result + history */}
        <div className="space-y-4">
          {result ? (
            <Card className={result.ageGap <= 0 ? "border-green-300" : "border-amber-300"}>
              <CardContent className="pt-5 text-center">
                <p className="text-xs text-muted-foreground">Estimated Wellness Age</p>
                <p className="text-5xl font-bold text-teal-600 mt-1">{result.biologicalAge}</p>
                <p className="text-xs text-muted-foreground mt-1">Chronological: {form.chronological_age}</p>
                <div className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${result.ageGap <= 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {result.ageGap <= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                  {result.ageGap <= 0 ? `${Math.abs(result.ageGap)} yrs younger` : `${result.ageGap} yrs older`}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1"><span>Vitality Score</span><span className={`font-bold ${catColor(result.category)}`}>{result.vitalityScore}/100</span></div>
                  <Progress value={result.vitalityScore} className="h-2" />
                  <p className={`text-xs font-medium mt-1 capitalize ${catColor(result.category)}`}>{result.category.replace("_", " ")}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 gap-1" onClick={share}><Share2 className="h-3.5 w-3.5" /> Share Result</Button>
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground"><HeartPulse className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />Fill the assessment and click Calculate to see the Wellness Age.</CardContent></Card>
          )}

          {result && result.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Sparkles className="h-4 w-4" /> Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-1.5">{result.recommendations.map((r, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-teal-500">•</span> {r}</li>)}</ul></CardContent>
            </Card>
          )}

          {/* Trend for this patient */}
          {patientHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><History className="h-4 w-4" /> {form.patient_name}'s Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {patientHistory.map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-xs border-b pb-1">
                      <span className="text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                      <span className="font-medium">Age {h.biological_age} <span className="text-muted-foreground">({(h.age_gap ?? 0) <= 0 ? "" : "+"}{h.age_gap})</span></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
