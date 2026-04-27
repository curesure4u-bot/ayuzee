import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

const RED_FLAGS = [
  "Severe undiagnosed pain", "Recent surgery (<3 months)", "Pregnancy (1st trimester)",
  "Uncontrolled hypertension", "Cardiac event in last 6 months", "Severe osteoporosis",
  "Glaucoma / retinal issues", "Slipped disc / acute spinal injury",
  "Severe vertigo", "Hernia (active)",
];

const YogaAssessmentForm = () => {
  const { userId } = useDoctor();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [protocols, setProtocols] = useState<any[]>([]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "",
    height_cm: "",
    weight_kg: "",
    chief_complaint: "",
    pain_score: "0",
    stress_level: "0",
    sleep_quality: "5",
    energy_level: "5",
    mobility_limitation: "",
    bp_history: "",
    diabetes_history: "",
    surgery_history: "",
    pregnancy_status: "no",
    current_fitness_level: "beginner",
    preferred_session_time: "morning",
    doctor_notes: "",
    protocol_id: "",
  });
  const [redFlags, setRedFlags] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("yoga_condition_protocols")
      .select("id, condition_name, slug, category")
      .eq("is_published", true)
      .order("condition_name")
      .then(({ data }) => setProtocols(data ?? []));
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const toggleFlag = (f: string) =>
    setRedFlags((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));

  const bmi =
    form.height_cm && form.weight_kg
      ? +(Number(form.weight_kg) / Math.pow(Number(form.height_cm) / 100, 2)).toFixed(1)
      : null;

  const handleSave = async (autoPlan: boolean) => {
    if (!userId) { toast.error("Sign in required"); return; }
    if (!form.patient_name.trim()) { toast.error("Patient name required"); return; }
    setSaving(true);
    try {
      const { data: assessment, error } = await supabase
        .from("yoga_assessments")
        .insert({
          doctor_user_id: userId,
          patient_name: form.patient_name.trim(),
          patient_age: form.patient_age ? Number(form.patient_age) : null,
          patient_gender: form.patient_gender || null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          bmi,
          chief_complaint: form.chief_complaint || null,
          pain_score: Number(form.pain_score),
          stress_level: Number(form.stress_level),
          sleep_quality: Number(form.sleep_quality),
          energy_level: Number(form.energy_level),
          mobility_limitation: form.mobility_limitation || null,
          bp_history: form.bp_history || null,
          diabetes_history: form.diabetes_history || null,
          surgery_history: form.surgery_history || null,
          pregnancy_status: form.pregnancy_status,
          current_fitness_level: form.current_fitness_level as any,
          preferred_session_time: form.preferred_session_time,
          doctor_notes: form.doctor_notes || null,
          red_flags: redFlags.length ? redFlags : null,
        })
        .select()
        .single();
      if (error) throw error;

      if (autoPlan && form.protocol_id) {
        const { data: planId, error: planErr } = await buildPlanFromProtocol({
          userId,
          assessmentId: assessment.id,
          patientName: form.patient_name.trim(),
          protocolId: form.protocol_id,
        });
        if (planErr) throw planErr;
        toast.success("Assessment saved & plan generated");
        navigate(`/vaidya/yoga/plans/${planId}`);
      } else {
        toast.success("Assessment saved");
        navigate(`/vaidya/yoga/plans/new?assessment=${assessment.id}&name=${encodeURIComponent(form.patient_name)}`);
      }
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {redFlags.length > 0 && (
        <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">Safety alert</p>
              <p className="text-muted-foreground">
                Red flags selected. Do <strong>not</strong> prescribe inversions, deep
                back-bends, or strong pranayama without specialist clearance. Refer for
                medical review if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Patient</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Name *">
            <Input value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} />
          </Field>
          <Field label="Age">
            <Input type="number" value={form.patient_age} onChange={(e) => set("patient_age", e.target.value)} />
          </Field>
          <Field label="Gender">
            <Select value={form.patient_gender} onValueChange={(v) => set("patient_gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Pregnancy">
            <Select value={form.pregnancy_status} onValueChange={(v) => set("pregnancy_status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No / NA</SelectItem>
                <SelectItem value="trimester_1">Trimester 1</SelectItem>
                <SelectItem value="trimester_2">Trimester 2</SelectItem>
                <SelectItem value="trimester_3">Trimester 3</SelectItem>
                <SelectItem value="postpartum">Postpartum</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Height (cm)">
            <Input type="number" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} />
          </Field>
          <Field label={`Weight (kg)${bmi ? ` · BMI ${bmi}` : ""}`}>
            <Input type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Clinical</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Chief Complaint">
            <Textarea rows={2} value={form.chief_complaint} onChange={(e) => set("chief_complaint", e.target.value)} />
          </Field>
          <Field label="Mobility limitation">
            <Input value={form.mobility_limitation} onChange={(e) => set("mobility_limitation", e.target.value)} placeholder="e.g. cannot squat, knee pain on stairs" />
          </Field>
          <Field label="BP history"><Input value={form.bp_history} onChange={(e) => set("bp_history", e.target.value)} placeholder="e.g. 140/90 controlled" /></Field>
          <Field label="Diabetes history"><Input value={form.diabetes_history} onChange={(e) => set("diabetes_history", e.target.value)} placeholder="HbA1c, meds" /></Field>
          <Field label="Surgery history"><Input value={form.surgery_history} onChange={(e) => set("surgery_history", e.target.value)} /></Field>
          <Field label="Current fitness">
            <Select value={form.current_fitness_level} onValueChange={(v) => set("current_fitness_level", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Scores (0–10)</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <ScoreField label="Pain" v={form.pain_score} on={(v) => set("pain_score", v)} />
          <ScoreField label="Stress" v={form.stress_level} on={(v) => set("stress_level", v)} />
          <ScoreField label="Sleep" v={form.sleep_quality} on={(v) => set("sleep_quality", v)} />
          <ScoreField label="Energy" v={form.energy_level} on={(v) => set("energy_level", v)} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Red flags / Contraindications</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {RED_FLAGS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFlag(f)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                redFlags.includes(f)
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Plan setup</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Preferred session time">
            <Select value={form.preferred_session_time} onValueChange={(v) => set("preferred_session_time", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Auto-plan from condition protocol">
            <Select value={form.protocol_id} onValueChange={(v) => set("protocol_id", v)}>
              <SelectTrigger><SelectValue placeholder="(optional)" /></SelectTrigger>
              <SelectContent>
                {protocols.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.condition_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Doctor notes" className="md:col-span-2">
            <Textarea rows={3} value={form.doctor_notes} onChange={(e) => set("doctor_notes", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & build manually
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving || !form.protocol_id}>
          <Sparkles className="mr-2 h-4 w-4" />
          Save & auto-generate plan
        </Button>
      </div>
    </div>
  );
};

const Field = ({ label, children, className = "" }: any) => (
  <div className={`space-y-1.5 ${className}`}>
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

const ScoreField = ({ label, v, on }: { label: string; v: string; on: (v: string) => void }) => (
  <div className="space-y-1.5">
    <Label className="text-xs flex items-center justify-between">
      <span>{label}</span>
      <Badge variant="outline">{v}</Badge>
    </Label>
    <input
      type="range" min={0} max={10} value={v} onChange={(e) => on(e.target.value)}
      className="w-full accent-primary"
    />
  </div>
);

// Build a plan from a condition protocol and seed plan_items from referenced asana/pranayama/meditation slugs.
export async function buildPlanFromProtocol({
  userId, assessmentId, patientName, protocolId,
}: {
  userId: string; assessmentId?: string | null; patientName: string; protocolId: string;
}) {
  const { data: protocol, error: pErr } = await supabase
    .from("yoga_condition_protocols").select("*").eq("id", protocolId).maybeSingle();
  if (pErr || !protocol) return { data: null, error: pErr || new Error("Protocol not found") };

  const { data: plan, error: plErr } = await supabase.from("yoga_plans").insert({
    doctor_user_id: userId,
    patient_name: patientName,
    plan_name: `${protocol.condition_name} – Yoga Plan`,
    plan_type: "condition_specific",
    condition_name: protocol.condition_name,
    duration_weeks: protocol.duration_weeks ?? 6,
    frequency_per_week: protocol.frequency_per_week ?? 5,
    protocol_id: protocol.id,
    assessment_id: assessmentId ?? null,
    precautions: protocol.precautions ?? null,
    status: "active",
  }).select().single();
  if (plErr || !plan) return { data: null, error: plErr };

  const items: any[] = [];
  let order = 0;

  const lookup = async (table: "yoga_asanas" | "yoga_pranayamas" | "yoga_meditations", slugs: string[] | null) => {
    if (!slugs?.length) return [];
    const { data } = await supabase.from(table).select("id, slug").in("slug", slugs);
    return data ?? [];
  };

  const [warmups, asanas, pranayamas, meditations] = await Promise.all([
    lookup("yoga_asanas", protocol.recommended_warmup),
    lookup("yoga_asanas", protocol.recommended_asanas),
    lookup("yoga_pranayamas", protocol.recommended_pranayamas),
    lookup("yoga_meditations", protocol.recommended_meditations),
  ]);

  warmups.forEach((a: any) => items.push({
    plan_id: plan.id, section: "warmup", item_kind: "asana", asana_id: a.id,
    duration_seconds: 60, repetitions: 1, sort_order: order++,
  }));
  asanas.forEach((a: any) => items.push({
    plan_id: plan.id, section: "main", item_kind: "asana", asana_id: a.id,
    duration_seconds: 90, repetitions: 2, sort_order: order++,
  }));
  pranayamas.forEach((p: any) => items.push({
    plan_id: plan.id, section: "pranayama", item_kind: "pranayama", pranayama_id: p.id,
    duration_seconds: 300, repetitions: 1, sort_order: order++,
  }));
  meditations.forEach((m: any) => items.push({
    plan_id: plan.id, section: "meditation", item_kind: "meditation", meditation_id: m.id,
    duration_seconds: 600, repetitions: 1, sort_order: order++,
  }));

  if (items.length) {
    const { error: iErr } = await supabase.from("yoga_plan_items").insert(items);
    if (iErr) return { data: plan.id, error: iErr };
  }
  return { data: plan.id, error: null };
}

export default YogaAssessmentForm;
