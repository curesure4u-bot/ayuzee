import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, Loader2, Sparkles, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

const AGGRAVATING = [
  "Cold weather", "Hot weather", "Stress", "Spicy food", "Oily food",
  "Lack of sleep", "Physical activity", "Sitting long hours", "After meals", "Empty stomach",
  "Travel", "Alcohol", "Late nights",
];
const RELIEVING = [
  "Rest", "Warm food", "Cold compress", "Hot compress", "Massage",
  "Light meals", "Sleep", "Yoga / stretching", "Medication", "Meditation", "Walking",
];
const DIET_TYPES = ["Vegetarian", "Vegan", "Eggetarian", "Non-vegetarian", "Jain", "Mixed"];
const SLEEP_OPTIONS = ["< 4 hrs", "4–6 hrs", "6–8 hrs", "> 8 hrs", "Disturbed sleep"];
const STRESS_LEVELS = ["Low", "Moderate", "High", "Very high"];
const EXERCISE_FREQ = ["None", "1–2 / week", "3–4 / week", "Daily"];

type Form = {
  // Step 1
  chief_complaint: string;
  duration: string;
  severity: number;
  aggravating: string[];
  relieving: string[];
  // Step 2
  current_medications: string;
  allergies: string;
  chronic_conditions: string;
  // women's health
  is_female: boolean;
  menstrual_cycle: string;
  last_period_date: string;
  pregnancy_status: string;
  contraception: string;
  // Step 3
  diet_type: string;
  sleep: string;
  stress_level: string;
  exercise_frequency: string;
  lifestyle_notes: string;
  // Meta
  language_preference: string;
};

const blank: Form = {
  chief_complaint: "", duration: "", severity: 5, aggravating: [], relieving: [],
  current_medications: "", allergies: "", chronic_conditions: "",
  is_female: false, menstrual_cycle: "", last_period_date: "",
  pregnancy_status: "", contraception: "",
  diet_type: "", sleep: "", stress_level: "", exercise_frequency: "", lifestyle_notes: "",
  language_preference: "en",
};

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-smooth ${
      active
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
    }`}
  >
    {label}
  </button>
);

const PreConsultationForm = () => {
  const { id: appointmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appt, setAppt] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [form, setForm] = useState<Form>(blank);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>("");

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    document.title = "Pre-Consultation Form — Ayuzee";
    if (!appointmentId) return;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        navigate("/auth", { replace: true });
        return;
      }
      setUserId(uid);

      const { data: a, error } = await supabase
        .from("appointments")
        .select("id, appointment_date, time_slot, mode, status, doctor_id, user_id, pre_form_submitted, doctors(full_name, specialization, clinic_name)")
        .eq("id", appointmentId)
        .maybeSingle();

      if (error || !a) {
        toast.error("Appointment not found");
        navigate("/dashboard/appointments", { replace: true });
        return;
      }
      if (a.user_id !== uid) {
        toast.error("You don't have access to this appointment");
        navigate("/dashboard/appointments", { replace: true });
        return;
      }
      setAppt(a);
      setDoctor(a.doctors);

      // pre-fill gender from profile
      const { data: prof } = await supabase
        .from("profiles").select("gender").eq("user_id", uid).maybeSingle();
      if (prof?.gender && prof.gender.toLowerCase().startsWith("f")) {
        setForm((f) => ({ ...f, is_female: true }));
      }

      // existing form?
      const { data: existing } = await (supabase as any)
        .from("pre_consultation_forms").select("*").eq("appointment_id", appointmentId).maybeSingle();
      if (existing) {
        setForm({
          chief_complaint: existing.chief_complaint ?? "",
          duration: existing.duration ?? "",
          severity: Number(existing.lifestyle_notes ? 5 : 5), // fallback
          aggravating: existing.symptoms ?? [],
          relieving: [],
          current_medications: existing.current_medications ?? "",
          allergies: existing.allergies ?? "",
          chronic_conditions: existing.medical_history ?? "",
          is_female: false, menstrual_cycle: "", last_period_date: "",
          pregnancy_status: "", contraception: "",
          diet_type: "", sleep: "", stress_level: "", exercise_frequency: "",
          lifestyle_notes: existing.lifestyle_notes ?? "",
          language_preference: existing.language_preference ?? "en",
          ...((existing.attachments && typeof existing.attachments === "object" && existing.attachments.extra) || {}),
        } as Form);
      }
      setLoading(false);
    })();
  }, [appointmentId, navigate]);

  const toggle = (key: "aggravating" | "relieving", val: string) => {
    setForm((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  };

  const canNext = useMemo(() => {
    if (step === 1) return form.chief_complaint.trim().length >= 3 && form.duration.trim().length > 0;
    return true;
  }, [step, form]);

  const generateSummary = async () => {
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-pre-consult-summary", {
        body: { form },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setAiSummary((data as any)?.summary ?? "");
      toast.success("Doctor brief ready");
    } catch (e: any) {
      toast.error(e.message || "AI summary failed");
    } finally {
      setAiBusy(false);
    }
  };

  const submit = async () => {
    if (!appointmentId || !userId || !appt) return;
    setSaving(true);
    try {
      const payload = {
        appointment_id: appointmentId,
        patient_user_id: userId,
        doctor_id: appt.doctor_id,
        chief_complaint: form.chief_complaint,
        symptoms: form.aggravating, // legacy column reuse
        duration: form.duration,
        severity: String(form.severity),
        current_medications: form.current_medications,
        allergies: form.allergies,
        medical_history: form.chronic_conditions,
        lifestyle_notes: [
          form.lifestyle_notes,
          form.diet_type && `Diet: ${form.diet_type}`,
          form.sleep && `Sleep: ${form.sleep}`,
          form.stress_level && `Stress: ${form.stress_level}`,
          form.exercise_frequency && `Exercise: ${form.exercise_frequency}`,
        ].filter(Boolean).join(" · "),
        attachments: {
          extra: {
            relieving: form.relieving,
            severity: form.severity,
            diet_type: form.diet_type,
            sleep: form.sleep,
            stress_level: form.stress_level,
            exercise_frequency: form.exercise_frequency,
            is_female: form.is_female,
            menstrual_cycle: form.menstrual_cycle,
            last_period_date: form.last_period_date,
            pregnancy_status: form.pregnancy_status,
            contraception: form.contraception,
          },
          ai_summary: aiSummary || null,
        },
        language_preference: form.language_preference,
        submitted_at: new Date().toISOString(),
      };

      const { error: upErr } = await (supabase as any)
        .from("pre_consultation_forms")
        .upsert(payload, { onConflict: "appointment_id" });
      if (upErr) throw upErr;

      const { error: aErr } = await supabase
        .from("appointments")
        .update({ pre_form_submitted: true } as any)
        .eq("id", appointmentId);
      if (aErr) throw aErr;

      toast.success("Pre-consultation form submitted");
      navigate("/dashboard/appointments");
    } catch (e: any) {
      toast.error(e.message || "Failed to submit form");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/appointments"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
        </Button>
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3 w-3" /> Private to your doctor
        </Badge>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-gradient-to-br from-primary/10 to-secondary/10 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-xl">Pre-Consultation Form</h1>
              <p className="text-xs text-muted-foreground">
                For your consult with {doctor?.full_name ?? "your doctor"} ·{" "}
                {appt?.appointment_date && new Date(appt.appointment_date).toLocaleDateString("en-IN", {
                  weekday: "short", day: "numeric", month: "short",
                })} · {appt?.time_slot}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="space-y-5 p-5">
          {step === 1 && (
            <>
              <div>
                <Label>Main complaint *</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe what's bothering you the most…"
                  value={form.chief_complaint}
                  maxLength={500}
                  onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>How long has this been going on? *</Label>
                  <Input
                    placeholder="e.g. 5 days, 2 months, 1 year"
                    value={form.duration}
                    maxLength={80}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Severity (1 = mild, 10 = unbearable)</Label>
                  <div className="flex items-center gap-3 pt-3">
                    <Slider
                      value={[form.severity]}
                      min={1} max={10} step={1}
                      onValueChange={(v) => setForm({ ...form, severity: v[0] })}
                    />
                    <span className="w-8 text-center font-display text-lg text-primary">{form.severity}</span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">What makes it worse?</Label>
                <div className="flex flex-wrap gap-2">
                  {AGGRAVATING.map((x) => (
                    <Chip key={x} label={x} active={form.aggravating.includes(x)} onClick={() => toggle("aggravating", x)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">What gives relief?</Label>
                <div className="flex flex-wrap gap-2">
                  {RELIEVING.map((x) => (
                    <Chip key={x} label={x} active={form.relieving.includes(x)} onClick={() => toggle("relieving", x)} />
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label>Current medicines</Label>
                <Textarea
                  rows={2}
                  placeholder="List any allopathic, ayurvedic, homeopathic, or supplements you take regularly"
                  value={form.current_medications}
                  maxLength={1000}
                  onChange={(e) => setForm({ ...form, current_medications: e.target.value })}
                />
              </div>
              <div>
                <Label>Known allergies</Label>
                <Input
                  placeholder="e.g. penicillin, peanuts, dust — or 'None known'"
                  value={form.allergies}
                  maxLength={300}
                  onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                />
              </div>
              <div>
                <Label>Chronic conditions</Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. diabetes, hypertension, thyroid, asthma, PCOS, IBS…"
                  value={form.chronic_conditions}
                  maxLength={500}
                  onChange={(e) => setForm({ ...form, chronic_conditions: e.target.value })}
                />
              </div>

              <Card className="border-pink-200/50 bg-pink-50/40 p-4 dark:bg-pink-950/10">
                <div className="mb-3 flex items-center gap-2">
                  <input
                    id="is_female"
                    type="checkbox"
                    checked={form.is_female}
                    onChange={(e) => setForm({ ...form, is_female: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="is_female" className="cursor-pointer">Women's health (optional)</Label>
                </div>
                {form.is_female && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label className="text-xs">Menstrual cycle</Label>
                      <Select value={form.menstrual_cycle} onValueChange={(v) => setForm({ ...form, menstrual_cycle: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                          <SelectItem value="painful">Painful</SelectItem>
                          <SelectItem value="heavy">Heavy flow</SelectItem>
                          <SelectItem value="scanty">Scanty flow</SelectItem>
                          <SelectItem value="menopause">Menopause</SelectItem>
                          <SelectItem value="post_menopause">Post-menopausal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Last period date</Label>
                      <Input type="date" value={form.last_period_date} onChange={(e) => setForm({ ...form, last_period_date: e.target.value })} />
                    </div>
                    <div>
                      <Label className="text-xs">Pregnancy status</Label>
                      <Select value={form.pregnancy_status} onValueChange={(v) => setForm({ ...form, pregnancy_status: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_pregnant">Not pregnant</SelectItem>
                          <SelectItem value="possibly">Possibly</SelectItem>
                          <SelectItem value="pregnant">Pregnant</SelectItem>
                          <SelectItem value="breastfeeding">Breastfeeding</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Contraception</Label>
                      <Input placeholder="e.g. none / OCP / IUD" value={form.contraception} maxLength={120}
                        onChange={(e) => setForm({ ...form, contraception: e.target.value })} />
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Diet type</Label>
                  <Select value={form.diet_type} onValueChange={(v) => setForm({ ...form, diet_type: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{DIET_TYPES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Average sleep</Label>
                  <Select value={form.sleep} onValueChange={(v) => setForm({ ...form, sleep: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{SLEEP_OPTIONS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stress level</Label>
                  <Select value={form.stress_level} onValueChange={(v) => setForm({ ...form, stress_level: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{STRESS_LEVELS.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exercise frequency</Label>
                  <Select value={form.exercise_frequency} onValueChange={(v) => setForm({ ...form, exercise_frequency: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{EXERCISE_FREQ.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Anything else about lifestyle / habits (optional)</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. smokes occasionally, mostly desk job, drinks 2L water, late dinners…"
                  value={form.lifestyle_notes}
                  maxLength={500}
                  onChange={(e) => setForm({ ...form, lifestyle_notes: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h3 className="mb-3 font-display text-lg">Review your answers</h3>
                <dl className="grid gap-2 text-sm">
                  <Row k="Main complaint" v={form.chief_complaint || "—"} />
                  <Row k="Duration" v={form.duration || "—"} />
                  <Row k="Severity" v={`${form.severity}/10`} />
                  <Row k="Worse with" v={form.aggravating.join(", ") || "—"} />
                  <Row k="Better with" v={form.relieving.join(", ") || "—"} />
                  <Row k="Current medicines" v={form.current_medications || "—"} />
                  <Row k="Allergies" v={form.allergies || "—"} />
                  <Row k="Chronic conditions" v={form.chronic_conditions || "—"} />
                  {form.is_female && (
                    <Row k="Women's health" v={[form.menstrual_cycle, form.pregnancy_status, form.contraception].filter(Boolean).join(" · ") || "—"} />
                  )}
                  <Row k="Diet" v={form.diet_type || "—"} />
                  <Row k="Sleep" v={form.sleep || "—"} />
                  <Row k="Stress" v={form.stress_level || "—"} />
                  <Row k="Exercise" v={form.exercise_frequency || "—"} />
                </dl>
              </div>

              <Card className="border-primary/30 bg-primary/5 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" /> AI doctor brief
                  </p>
                  <Button size="sm" type="button" onClick={generateSummary} disabled={aiBusy || !form.chief_complaint.trim()}>
                    {aiBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
                    {aiSummary ? "Regenerate" : "Generate brief"}
                  </Button>
                </div>
                {!aiSummary && !aiBusy && (
                  <p className="text-xs text-muted-foreground">
                    Click "Generate brief" to let AI prepare a structured one-page summary your doctor can read in 30 seconds before the call.
                  </p>
                )}
                {aiSummary && (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-lg border border-border bg-card p-3 text-sm">
                    {aiSummary}
                  </div>
                )}
              </Card>

              <p className="text-xs text-muted-foreground">
                By submitting, you agree to share these details with your doctor for this consultation.
                Your answers are encrypted and visible only to you and your assigned doctor.
              </p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/20 p-4">
          <Button
            variant="outline"
            disabled={step === 1 || saving}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
              Submit form
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-border/60 py-1 last:border-0">
    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
    <dd className="text-sm">{v}</dd>
  </div>
);

export default PreConsultationForm;
