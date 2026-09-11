import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VITALITY_CONDITIONS, buildVitalityPlan } from "@/lib/spineVitalityData";
import {
  Lock, ShieldCheck, ClipboardList, Save, Leaf, Dumbbell, Activity, Brain,
  AlertTriangle, CheckCircle2, History, Share2,
} from "lucide-react";

interface Assessment {
  id: string;
  patient_ref: string;
  age: number;
  primary_concern: string;
  severity?: string | null;
  created_at: string;
}

const num = (v: string) => (v === "" ? null : Number(v));
const blank = {
  patient_ref: "", age: "", gender: "male", primary_concern: "pe", severity: "mild", duration: "",
  stress_level: "", sleep_quality: "", spine_involvement: "", metabolic_factor: "", pc_muscle_strength: "", notes: "",
};

export default function SpineVitalityAssessment() {
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [plan, setPlan] = useState<ReturnType<typeof buildVitalityPlan> | null>(null);
  const [history, setHistory] = useState<Assessment[]>([]);
  const [saving, setSaving] = useState(false);

  const loadHistory = async () => {
    try {
      const { data } = await (supabase.from("spine_vitality_assessments") as any)
        .select("id, patient_ref, age, primary_concern, severity, created_at")
        .order("created_at", { ascending: false }).limit(15);
      setHistory((data as Assessment[]) || []);
    } catch { setHistory([]); }
  };
  useEffect(() => { loadHistory(); }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = () => {
    if (!form.age || Number(form.age) < 18) { toast.error("Patient must be 18 or older for this module"); return; }
    setPlan(buildVitalityPlan(form.primary_concern));
  };

  const save = async () => {
    if (!consent) { toast.error("Confirm patient consent first"); return; }
    if (!form.patient_ref) { toast.error("Enter a patient reference"); return; }
    if (!form.age || Number(form.age) < 18) { toast.error("Patient must be 18 or older"); return; }
    const p = plan || buildVitalityPlan(form.primary_concern);
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }
      const { error } = await (supabase.from("spine_vitality_assessments") as any).insert({
        owner_id: user.id, patient_ref: form.patient_ref, age: Number(form.age), gender: form.gender,
        primary_concern: form.primary_concern, severity: form.severity, duration: form.duration || null,
        stress_level: num(form.stress_level), sleep_quality: num(form.sleep_quality),
        spine_involvement: num(form.spine_involvement), metabolic_factor: num(form.metabolic_factor),
        pc_muscle_strength: num(form.pc_muscle_strength), consent_given: true, plan: p, notes: form.notes || null,
      });
      if (error) toast.error("Save failed: " + error.message);
      else { toast.success("Confidential assessment saved"); setPlan(p); loadHistory(); }
    } catch { toast.error("Something went wrong"); }
    setSaving(false);
  };

  const condLabel = (k: string) => VITALITY_CONDITIONS.find((c) => c.key === k)?.title || k;

  const PlanSection = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) => (
    <div>
      <p className={`text-xs font-semibold flex items-center gap-1 text-${color}-700`}><Icon className="h-3.5 w-3.5" /> {title}</p>
      <ul className="mt-1 space-y-1">{items.map((s, i) => <li key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className={`text-${color}-500`}>•</span> {s}</li>)}</ul>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="h-6 w-6 text-rose-600" /> Confidential Vitality Assessment</h1>
          <p className="text-muted-foreground mt-1">Private clinical intake → generates a combined pelvic + Vajikarana + spine + lifestyle plan.</p>
        </div>
        <Badge className="bg-rose-100 text-rose-700"><Lock className="h-3 w-3 mr-1" /> Private (owner-only)</Badge>
      </div>

      {/* Consent / 18+ gate */}
      <Card className={consent ? "border-green-200" : "border-amber-300 bg-amber-50/40"}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className={`h-5 w-5 shrink-0 ${consent ? "text-green-600" : "text-amber-600"}`} />
            <div className="flex-1">
              <p className="font-medium text-sm">Consent & Confidentiality (18+)</p>
              <p className="text-xs text-muted-foreground mt-1">This is a confidential clinical assessment for adult patients (18+). Records are private to your account. Confirm the patient is an adult and has consented to this assessment.</p>
              <button onClick={() => setConsent((v) => !v)} className={`mt-2 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition ${consent ? "border-green-400 bg-green-50 text-green-700" : "border-border hover:bg-muted"}`}>
                <CheckCircle2 className={`h-3.5 w-3.5 ${consent ? "text-green-600" : "text-muted-foreground"}`} /> {consent ? "Consent confirmed" : "Confirm patient is 18+ and consents"}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {consent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Clinical Intake</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div><label className="text-xs font-medium">Patient Ref</label><Input value={form.patient_ref} onChange={(e) => set("patient_ref", e.target.value)} placeholder="Name / ID" /></div>
                  <div><label className="text-xs font-medium">Age (18+)</label><Input type="number" value={form.age} onChange={(e) => set("age", e.target.value)} placeholder="30" /></div>
                  <div><label className="text-xs font-medium">Gender</label>
                    <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium">Duration</label><Input value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 6 months" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Primary Concern</label>
                    <Select value={form.primary_concern} onValueChange={(v) => { set("primary_concern", v); setPlan(null); }}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{VITALITY_CONDITIONS.map((c) => <SelectItem key={c.key} value={c.key}>{c.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><label className="text-xs font-medium">Severity</label>
                    <Select value={form.severity} onValueChange={(v) => set("severity", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="mild">Mild</SelectItem><SelectItem value="moderate">Moderate</SelectItem><SelectItem value="significant">Significant</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase pt-1">Contributing Factors (0-10)</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div><label className="text-xs font-medium">Stress</label><Input type="number" value={form.stress_level} onChange={(e) => set("stress_level", e.target.value)} placeholder="5" /></div>
                  <div><label className="text-xs font-medium">Sleep</label><Input type="number" value={form.sleep_quality} onChange={(e) => set("sleep_quality", e.target.value)} placeholder="6" /></div>
                  <div><label className="text-xs font-medium">Spine</label><Input type="number" value={form.spine_involvement} onChange={(e) => set("spine_involvement", e.target.value)} placeholder="3" /></div>
                  <div><label className="text-xs font-medium">Metabolic</label><Input type="number" value={form.metabolic_factor} onChange={(e) => set("metabolic_factor", e.target.value)} placeholder="4" /></div>
                  <div><label className="text-xs font-medium">PC Strength</label><Input type="number" value={form.pc_muscle_strength} onChange={(e) => set("pc_muscle_strength", e.target.value)} placeholder="4" /></div>
                </div>
                <div><label className="text-xs font-medium">Notes</label><Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="h-16" placeholder="Clinical notes..." /></div>
                <div className="flex items-center gap-2">
                  <Button className="flex-1 gap-1" onClick={generate}><ClipboardList className="h-4 w-4" /> Generate Plan</Button>
                  <Button variant="outline" className="gap-1" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save (Private)"}</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plan + history */}
          <div className="space-y-4">
            {plan ? (
              <Card className="border-rose-200">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Plan — {plan.condition}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {plan.redFlags.length > 0 && (
                    <div className="rounded-md border border-red-300 bg-red-50 p-2">
                      <p className="text-xs font-semibold text-red-800 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Red flags</p>
                      <ul className="mt-0.5">{plan.redFlags.map((r, i) => <li key={i} className="text-[11px] text-red-700">• {r}</li>)}</ul>
                    </div>
                  )}
                  <PlanSection icon={Dumbbell} title="Pelvic Floor" items={plan.pelvic} color="teal" />
                  <PlanSection icon={Leaf} title="Ayurvedic / Vajikarana" items={plan.ayurvedic} color="green" />
                  <PlanSection icon={Activity} title="Spine / Nerve" items={plan.spine} color="indigo" />
                  <PlanSection icon={Brain} title="Lifestyle" items={plan.lifestyle} color="amber" />
                </CardContent>
              </Card>
            ) : (
              <Card><CardContent className="py-10 text-center text-sm text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />Select a concern and generate the combined plan.</CardContent></Card>
            )}

            {history.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><History className="h-4 w-4" /> Recent (private)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between text-xs border-b pb-1">
                        <span className="truncate">{h.patient_ref} <span className="text-muted-foreground">· {condLabel(h.primary_concern)}</span></span>
                        <span className="text-muted-foreground shrink-0">{new Date(h.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
