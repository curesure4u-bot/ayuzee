import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { setSEO } from "@/lib/seo";

type Relation = "patient" | "family" | "doctor" | "social_worker" | "other";

const CATEGORIES = [
  { value: "neurological", label: "Neurological" },
  { value: "orthopaedic", label: "Orthopaedic" },
  { value: "chronic_disease", label: "Chronic Disease" },
  { value: "post_surgery", label: "Post Surgery" },
  { value: "palliative", label: "Palliative" },
  { value: "paediatric", label: "Paediatric" },
  { value: "women_health", label: "Women's Health" },
  { value: "other", label: "Other" },
];

const AtmriApply = () => {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDoctor, setIsDoctor] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [reportFiles, setReportFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    patient_gender: "" as "male" | "female" | "other" | "",
    patient_city: "",
    patient_state: "",
    patient_phone: "",
    submitted_by_relation: "" as Relation | "",
    condition_name: "",
    condition_category: "",
    is_urgent: false,
    urgency_reason: "",
    patient_story: "",
    treatment_plan: "",
    preferred_hospital: "",
    treatment_duration_days: "",
    will_personally_treat: false,
    referring_doctor_name: "",
    doctor_recommendation: "",
    estimated_cost: "",
    consent: false,
  });

  useEffect(() => {
    setSEO(
      "Apply for Free AYUSH Treatment · ATMRI Trust",
      "Submit your application for free Ayurvedic treatment sponsored by ATMRI Trust."
    );
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (!uid) {
        toast.error("Please sign in to apply for ATMRI Trust treatment assistance.");
        navigate("/auth");
        return;
      }
      const { data: roles } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      setIsDoctor(!!roles?.some((r: any) => r.role === "doctor"));
      setAuthChecked(true);
    })();
  }, [navigate]);

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const canNext = useMemo(() => {
    if (step === 1) {
      return (
        form.patient_name.trim() &&
        form.patient_age &&
        form.patient_gender &&
        form.patient_city.trim() &&
        form.patient_state.trim() &&
        form.submitted_by_relation
      );
    }
    if (step === 2) {
      return (
        form.condition_name.trim() &&
        form.condition_category &&
        form.patient_story.trim().length >= 100
      );
    }
    if (step === 3) {
      return form.treatment_plan.trim() && form.estimated_cost;
    }
    return form.consent;
  }, [step, form]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5 - reportFiles.length);
    setReportFiles((p) => [...p, ...arr].slice(0, 5));
  };

  const uploadReports = async (): Promise<string[]> => {
    if (!userId || reportFiles.length === 0) return [];
    const urls: string[] = [];
    for (const f of reportFiles) {
      const path = `${userId}/reports/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage
        .from("prescriptions")
        .upload(path, f, { upsert: false });
      if (!error) {
        const { data } = supabase.storage.from("prescriptions").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setSubmitting(true);
    try {
      const reportUrls = await uploadReports();
      const treatmentPlanFull = isDoctor && form.will_personally_treat
        ? `${form.treatment_plan}\n\n[Submitted by treating doctor — pledges personal consultation]`
        : form.referring_doctor_name
          ? `${form.treatment_plan}\n\nReferring doctor: ${form.referring_doctor_name}\n${form.doctor_recommendation}`
          : form.treatment_plan;

      const payload: any = {
        patient_name: form.patient_name.trim(),
        patient_age: parseInt(form.patient_age) || null,
        patient_gender: form.patient_gender,
        patient_city: form.patient_city.trim(),
        patient_state: form.patient_state.trim(),
        patient_phone: form.patient_phone.trim() || null,
        patient_story: form.patient_story.trim(),
        condition_name: form.condition_name.trim(),
        condition_category: form.condition_category,
        is_urgent: form.is_urgent,
        treatment_plan: treatmentPlanFull,
        treatment_location: form.preferred_hospital.trim() || null,
        treatment_duration_days: parseInt(form.treatment_duration_days) || null,
        estimated_cost: parseFloat(form.estimated_cost) || 0,
        submitted_by: userId,
        submitted_by_relation: form.submitted_by_relation,
        medical_report_urls: reportUrls,
        status: "submitted",
      };

      const { error } = await (supabase as any).from("atmri_sponsored_cases").insert(payload);
      if (error) throw error;

      toast.success("✅ Application submitted! Our team will contact you within 48 hours for verification.");
      navigate("/atmri-help?submitted=1");
    } catch (e: any) {
      toast.error(e.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const steps = ["About the Patient", "Medical Condition", "Treatment Details", "Review & Confirm"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-10">
      <div className="container max-w-3xl">
        <button onClick={() => navigate("/atmri-help")} className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-3xl border border-border bg-card shadow-elegant p-6 md:p-10">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step} of 4</div>
              <h1 className="font-display text-2xl md:text-3xl mt-1">{steps[step - 1]}</h1>
            </div>
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    i + 1 === step ? "bg-primary w-6" : i + 1 < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {step === 1 && (
              <>
                <div>
                  <Label>Patient full name *</Label>
                  <Input value={form.patient_name} onChange={(e) => update("patient_name", e.target.value)} className="mt-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient age *</Label>
                    <Input type="number" value={form.patient_age} onChange={(e) => update("patient_age", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Patient phone</Label>
                    <Input value={form.patient_phone} onChange={(e) => update("patient_phone", e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Gender *</Label>
                  <div className="flex gap-2 mt-2">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => update("patient_gender", g)}
                        className={`flex-1 rounded-full border px-4 py-2 text-sm capitalize transition-all ${
                          form.patient_gender === g
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card hover:bg-accent"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input value={form.patient_city} onChange={(e) => update("patient_city", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>State *</Label>
                    <Input value={form.patient_state} onChange={(e) => update("patient_state", e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Your relation to patient *</Label>
                  <Select value={form.submitted_by_relation} onValueChange={(v) => update("submitted_by_relation", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select relation" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">I am the patient</SelectItem>
                      <SelectItem value="family">Family member</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="social_worker">Social Worker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label>Condition name *</Label>
                  <Input
                    value={form.condition_name}
                    onChange={(e) => update("condition_name", e.target.value)}
                    placeholder="e.g. Hemiplegia post-stroke"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Condition category *</Label>
                  <Select value={form.condition_category} onValueChange={(v) => update("condition_category", v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-xl border border-border bg-accent/30 p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={form.is_urgent} onCheckedChange={(v) => update("is_urgent", !!v)} />
                    <span className="text-sm font-medium">This case is urgent (treatment needed within 14 days)</span>
                  </label>
                  {form.is_urgent && (
                    <Textarea
                      value={form.urgency_reason}
                      onChange={(e) => update("urgency_reason", e.target.value)}
                      placeholder="Why is this urgent?"
                      className="mt-3"
                      rows={2}
                    />
                  )}
                </div>
                <div>
                  <Label>Patient story * <span className="text-muted-foreground font-normal">(min 100 characters)</span></Label>
                  <Textarea
                    value={form.patient_story}
                    onChange={(e) => update("patient_story", e.target.value)}
                    placeholder="Tell us the patient's story — what happened, how it affects daily life, why they cannot afford treatment"
                    rows={6}
                    className="mt-1.5"
                  />
                  <div className={`text-xs mt-1 ${form.patient_story.length >= 100 ? "text-primary" : "text-muted-foreground"}`}>
                    {form.patient_story.length} / 100 characters
                  </div>
                </div>
                <div>
                  <Label>Upload medical reports <span className="text-muted-foreground font-normal">(optional, max 5)</span></Label>
                  <label className="mt-1.5 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-6 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload (PDF / JPG)</span>
                    <input
                      type="file"
                      multiple
                      accept="application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                      disabled={reportFiles.length >= 5}
                    />
                  </label>
                  {reportFiles.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {reportFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs">
                          <span className="truncate">{f.name}</span>
                          <button onClick={() => setReportFiles((p) => p.filter((_, idx) => idx !== i))}>
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label>Recommended treatment *</Label>
                  <Textarea
                    value={form.treatment_plan}
                    onChange={(e) => update("treatment_plan", e.target.value)}
                    placeholder="What Ayurvedic treatment has been recommended? By which doctor?"
                    rows={4}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Preferred hospital / clinic</Label>
                    <Input value={form.preferred_hospital} onChange={(e) => update("preferred_hospital", e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Treatment duration (days)</Label>
                    <Input type="number" value={form.treatment_duration_days} onChange={(e) => update("treatment_duration_days", e.target.value)} className="mt-1.5" />
                  </div>
                </div>

                {isDoctor ? (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                    <div className="text-sm font-medium mb-2">🩺 You are applying as the treating doctor — your details will be used.</div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={form.will_personally_treat}
                        onCheckedChange={(v) => update("will_personally_treat", !!v)}
                      />
                      <span className="text-sm">I will personally treat this patient (pledge my consultation)</span>
                    </label>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Name of referring AYUSH doctor</Label>
                      <Input value={form.referring_doctor_name} onChange={(e) => update("referring_doctor_name", e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Doctor's recommendation</Label>
                      <Textarea value={form.doctor_recommendation} onChange={(e) => update("doctor_recommendation", e.target.value)} rows={3} className="mt-1.5" />
                    </div>
                  </>
                )}

                <div>
                  <Label>Estimated treatment cost (₹) *</Label>
                  <Input type="number" value={form.estimated_cost} onChange={(e) => update("estimated_cost", e.target.value)} className="mt-1.5" />
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-accent/30 p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Patient</div>
                    <div className="font-semibold">{form.patient_name}, {form.patient_age} · {form.patient_gender}</div>
                    <div className="text-sm text-muted-foreground">📍 {form.patient_city}, {form.patient_state}</div>
                    {form.patient_phone && <div className="text-sm text-muted-foreground">📞 {form.patient_phone}</div>}
                    <div className="text-xs mt-2 text-muted-foreground">Submitted by: {form.submitted_by_relation.replace("_", " ")}</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-accent/30 p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Condition</div>
                    <div className="font-semibold">{form.condition_name}</div>
                    <div className="text-sm text-muted-foreground">{CATEGORIES.find(c => c.value === form.condition_category)?.label}</div>
                    {form.is_urgent && <div className="text-xs text-red-600 mt-1">🔴 Urgent</div>}
                    <p className="text-sm mt-3 line-clamp-4">{form.patient_story}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-accent/30 p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Treatment</div>
                    <p className="text-sm">{form.treatment_plan}</p>
                    <div className="text-sm text-muted-foreground mt-2">
                      {form.preferred_hospital && <>🏥 {form.preferred_hospital} · </>}
                      {form.treatment_duration_days && <>⏱ {form.treatment_duration_days} days · </>}
                      💰 ₹{form.estimated_cost}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
                  <div className="text-sm font-semibold mb-2">🏛️ By submitting this application, you confirm:</div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All information provided is accurate and truthful</li>
                    <li>• You consent to ATMRI Trust verifying the medical information</li>
                    <li>• You agree to a video verification call with our team</li>
                    <li>• False applications are subject to legal action under IPC</li>
                  </ul>
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <Checkbox checked={form.consent} onCheckedChange={(v) => update("consent", !!v)} className="mt-0.5" />
                  <span className="text-sm">I confirm all information is accurate and genuine</span>
                </label>
              </>
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 4 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={!canNext || submitting}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtmriApply;
