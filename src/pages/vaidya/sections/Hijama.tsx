import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, Plus, FileText, Printer, Sparkles, ShieldCheck, ClipboardList,
  CheckCircle2, Calendar, ArrowLeft, Trash2, Droplet,
} from "lucide-react";

type Mode = "dashboard" | "new" | "detail";

const HIJAMA_TYPES = ["Dry cupping", "Wet cupping (Hijama)", "Moving cupping", "Fire cupping", "Flash cupping"];
const PROTOCOLS = [
  "Back pain", "Neck pain", "Sciatica", "Shoulder pain", "Knee pain", "Headache", "Migraine",
  "Stress", "Fatigue", "Insomnia", "Digestive issues", "Obesity support", "Menstrual pain",
  "Sports recovery", "General wellness",
];
const POINT_ZONES = [
  "Al-Kahil (Upper back / C7)", "Al-Akhda'ain (Side neck)", "Al-Katifain (Shoulders)",
  "Lower back (Lumbar)", "Sacrum", "Hip", "Knee (peri-articular)", "Calf",
  "Abdomen (around umbilicus)", "Chest", "Forehead/Temples", "Behind ears",
];
const RED_FLAGS: { key: string; label: string }[] = [
  { key: "bleeding_disorder", label: "Bleeding disorder" },
  { key: "blood_thinner", label: "Blood thinner medication" },
  { key: "anemia", label: "Severe anemia" },
  { key: "diabetes_uncontrolled", label: "Uncontrolled diabetes" },
  { key: "bp_uncontrolled", label: "Uncontrolled hypertension" },
  { key: "pregnancy", label: "Pregnancy (without doctor approval)" },
  { key: "skin_infection", label: "Active skin infection" },
  { key: "fever_acute", label: "Fever / acute illness" },
  { key: "recent_surgery", label: "Recent surgery" },
  { key: "keloid_tendency", label: "Keloid tendency" },
  { key: "immunocompromised", label: "Immunocompromised" },
];

const Disclaimer = () => (
  <p className="text-[11px] text-muted-foreground italic mt-2">
    Hijama AI is clinical decision-support only. Final treatment decision must be made by a
    qualified healthcare professional after proper assessment.
  </p>
);

const RiskBadge = ({ level }: { level?: string | null }) => {
  if (!level) return null;
  const map: Record<string, string> = {
    low: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    moderate: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    high: "bg-orange-500/15 text-orange-700 border-orange-500/30",
    defer: "bg-red-500/15 text-red-700 border-red-500/30",
  };
  return <Badge variant="outline" className={map[level] || ""}>{level.toUpperCase()}</Badge>;
};

export default function Hijama() {
  const { doctor, userId } = useDoctor();
  const [mode, setMode] = useState<Mode>("dashboard");
  const [list, setList] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // form
  const empty = {
    patient_name: "", age: "", gender: "", phone: "",
    chief_complaint: "", pain_location: "", pain_duration: "", pain_score: "",
    medical_history: "", medication_history: "",
    blood_thinner: false, diabetes_status: "none", bp_status: "none",
    pregnancy: false, anemia: false, bleeding_disorder: false, skin_infection: false,
    fever_acute: false, recent_surgery: false, keloid_tendency: false, immunocompromised: false,
    fainting_tendency: false, previous_hijama: "",
    condition_protocol: "", hijama_type: "", selected_points: [] as string[],
    consent_given: false, doctor_approved: false, notes: "",
  };
  const [form, setForm] = useState(empty);
  const [aiPlan, setAiPlan] = useState<any | null>(null);

  const contraindications = useMemo(() => {
    const found: string[] = [];
    if (form.bleeding_disorder) found.push("Bleeding disorder");
    if (form.blood_thinner) found.push("Blood thinner medication");
    if (form.anemia) found.push("Severe anemia");
    if (form.diabetes_status === "uncontrolled") found.push("Uncontrolled diabetes");
    if (form.bp_status === "uncontrolled") found.push("Uncontrolled hypertension");
    if (form.pregnancy && !form.doctor_approved) found.push("Pregnancy without explicit doctor approval");
    if (form.skin_infection) found.push("Active skin infection");
    if (form.fever_acute) found.push("Fever / acute illness");
    if (form.recent_surgery) found.push("Recent surgery");
    if (form.keloid_tendency) found.push("Keloid tendency");
    if (form.immunocompromised) found.push("Immunocompromised");
    return found;
  }, [form]);

  const riskLevel = useMemo(() => {
    if (contraindications.some((c) => /bleeding|thinner|anemia|surgery|infection|fever/i.test(c))) return "defer";
    if (contraindications.length >= 2) return "high";
    if (contraindications.length === 1) return "moderate";
    return "low";
  }, [contraindications]);

  const loadList = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("vaidya_hijama_assessments")
      .select("*")
      .eq("doctor_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => { if (userId) loadList(); }, [userId]);

  const openDetail = async (a: any) => {
    setActive(a);
    setMode("detail");
    const [{ data: ss }, { data: fu }] = await Promise.all([
      supabase.from("vaidya_hijama_sessions").select("*").eq("assessment_id", a.id).order("session_date", { ascending: false }),
      supabase.from("vaidya_hijama_followups").select("*").eq("assessment_id", a.id).order("followup_date", { ascending: false }),
    ]);
    setSessions(ss || []);
    setFollowups(fu || []);
  };

  const togglePoint = (z: string) => {
    setForm((f) => ({
      ...f,
      selected_points: f.selected_points.includes(z)
        ? f.selected_points.filter((p) => p !== z)
        : [...f.selected_points, z],
    }));
  };

  const runAi = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-hijama-plan", {
        body: { ...form, contraindications, risk_level: riskLevel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAiPlan(data?.plan || null);
      if (data?.plan?.suggested_type && !form.hijama_type) {
        setForm((f) => ({ ...f, hijama_type: data.plan.suggested_type }));
      }
      toast.success("AI suggestion ready — please review and approve.");
    } catch (e: any) {
      toast.error(e.message || "AI suggestion failed");
    } finally {
      setAiLoading(false);
    }
  };

  const saveAssessment = async () => {
    if (!userId) return;
    if (!form.patient_name) return toast.error("Patient name required");
    if (!form.consent_given) return toast.error("Consent must be confirmed");
    const payload: any = {
      doctor_user_id: userId,
      patient_name: form.patient_name,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      phone: form.phone || null,
      chief_complaint: form.chief_complaint || null,
      pain_location: form.pain_location || null,
      pain_duration: form.pain_duration || null,
      pain_score: form.pain_score ? parseInt(form.pain_score) : null,
      medical_history: form.medical_history || null,
      medication_history: form.medication_history || null,
      blood_thinner: form.blood_thinner,
      diabetes_status: form.diabetes_status,
      bp_status: form.bp_status,
      pregnancy: form.pregnancy,
      anemia: form.anemia,
      bleeding_disorder: form.bleeding_disorder,
      skin_infection: form.skin_infection,
      fever_acute: form.fever_acute,
      recent_surgery: form.recent_surgery,
      keloid_tendency: form.keloid_tendency,
      immunocompromised: form.immunocompromised,
      fainting_tendency: form.fainting_tendency,
      previous_hijama: form.previous_hijama || null,
      condition_protocol: form.condition_protocol || null,
      hijama_type: form.hijama_type || null,
      selected_points: form.selected_points,
      ai_plan: aiPlan,
      contraindications,
      risk_level: riskLevel,
      consent_given: form.consent_given,
      consent_signed_at: form.consent_given ? new Date().toISOString() : null,
      doctor_approved: form.doctor_approved,
      notes: form.notes || null,
    };
    const { data, error } = await supabase.from("vaidya_hijama_assessments").insert(payload).select().single();
    if (error) return toast.error(error.message);
    toast.success("Hijama assessment saved");
    setForm(empty);
    setAiPlan(null);
    await loadList();
    if (data) openDetail(data);
  };

  const removeAssessment = async (id: string) => {
    if (!confirm("Delete this assessment and all sessions/follow-ups?")) return;
    const { error } = await supabase.from("vaidya_hijama_assessments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setMode("dashboard");
    setActive(null);
    loadList();
  };

  const printReport = () => window.print();

  const stats = useMemo(() => {
    const total = list.length;
    const high = list.filter((a) => a.risk_level === "high" || a.risk_level === "defer").length;
    const approved = list.filter((a) => a.doctor_approved).length;
    return { total, high, approved };
  }, [list]);

  // ---------------- DASHBOARD ----------------
  if (mode === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold flex items-center gap-2">
              <Droplet className="h-6 w-6 text-emerald-600" />
              Ayuzee Hijama AI
            </h1>
            <p className="text-sm text-muted-foreground">Doctor-guided cupping decision-support, safety screening & documentation.</p>
          </div>
          <Button onClick={() => { setForm(empty); setAiPlan(null); setMode("new"); }}>
            <Plus className="mr-2 h-4 w-4" /> New Hijama Assessment
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Total Assessments</p><p className="text-3xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">High Risk / Defer</p><p className="text-3xl font-bold text-orange-600">{stats.high}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">Doctor Approved</p><p className="text-3xl font-bold text-emerald-600">{stats.approved}</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Patient Hijama History</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> :
             list.length === 0 ? <p className="text-sm text-muted-foreground">No assessments yet.</p> :
              <div className="divide-y">
                {list.map((a) => (
                  <button key={a.id} onClick={() => openDetail(a)} className="w-full text-left py-3 flex items-center justify-between gap-3 hover:bg-muted/40 px-2 rounded">
                    <div>
                      <div className="font-medium flex items-center gap-2">{a.patient_name} <RiskBadge level={a.risk_level} /></div>
                      <div className="text-xs text-muted-foreground">{a.chief_complaint || "—"} · {a.condition_protocol || "—"} · {new Date(a.created_at).toLocaleDateString()}</div>
                    </div>
                    {a.doctor_approved ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Approved</Badge> : <Badge variant="outline">Pending</Badge>}
                  </button>
                ))}
              </div>
            }
          </CardContent>
        </Card>
        <Disclaimer />
      </div>
    );
  }

  // ---------------- NEW ASSESSMENT ----------------
  if (mode === "new") {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => setMode("dashboard")}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div>
          <h1 className="text-2xl font-display font-bold">New Hijama Assessment</h1>
          <p className="text-sm text-muted-foreground">Complete safety screening before any procedure.</p>
        </div>

        <Tabs defaultValue="patient">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="patient">Patient</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="protocol">Protocol</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="ai">AI & Consent</TabsTrigger>
          </TabsList>

          {/* PATIENT */}
          <TabsContent value="patient" className="space-y-4">
            <Card><CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                <div><Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><Label>Chief Complaint</Label><Input value={form.chief_complaint} onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} /></div>
              <div><Label>Pain Location</Label><Input value={form.pain_location} onChange={(e) => setForm({ ...form, pain_location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Duration</Label><Input value={form.pain_duration} onChange={(e) => setForm({ ...form, pain_duration: e.target.value })} placeholder="e.g. 3 weeks" /></div>
                <div><Label>Pain Score (0–10)</Label><Input type="number" min={0} max={10} value={form.pain_score} onChange={(e) => setForm({ ...form, pain_score: e.target.value })} /></div>
              </div>
              <div className="md:col-span-2"><Label>Medical History</Label><Textarea value={form.medical_history} onChange={(e) => setForm({ ...form, medical_history: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Medication History</Label><Textarea value={form.medication_history} onChange={(e) => setForm({ ...form, medication_history: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Previous Hijama History</Label><Textarea value={form.previous_hijama} onChange={(e) => setForm({ ...form, previous_hijama: e.target.value })} /></div>
            </CardContent></Card>
          </TabsContent>

          {/* SAFETY */}
          <TabsContent value="safety" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Contraindication Screening</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><Label>Diabetes</Label>
                  <Select value={form.diabetes_status} onValueChange={(v) => setForm({ ...form, diabetes_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="controlled">Controlled</SelectItem><SelectItem value="uncontrolled">Uncontrolled</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Blood Pressure</Label>
                  <Select value={form.bp_status} onValueChange={(v) => setForm({ ...form, bp_status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Normal</SelectItem><SelectItem value="controlled">Controlled</SelectItem><SelectItem value="uncontrolled">Uncontrolled</SelectItem></SelectContent>
                  </Select>
                </div>
                {[
                  ["blood_thinner", "Blood thinner medication"],
                  ["pregnancy", "Pregnancy"],
                  ["anemia", "Severe anemia"],
                  ["bleeding_disorder", "Bleeding disorder"],
                  ["skin_infection", "Active skin infection"],
                  ["fever_acute", "Fever / acute illness"],
                  ["recent_surgery", "Recent surgery"],
                  ["keloid_tendency", "Keloid tendency"],
                  ["immunocompromised", "Immunocompromised"],
                  ["fainting_tendency", "Fainting tendency"],
                ].map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-sm border rounded-md px-3 py-2">
                    <Checkbox checked={(form as any)[k]} onCheckedChange={(v) => setForm({ ...form, [k]: !!v } as any)} />
                    {label}
                  </label>
                ))}
              </CardContent>
            </Card>

            {contraindications.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Risk: <RiskBadge level={riskLevel} /></AlertTitle>
                <AlertDescription>
                  <ul className="list-disc ml-5 mt-1">{contraindications.map((c) => <li key={c}>{c}</li>)}</ul>
                  {riskLevel === "defer" && <p className="mt-2 font-medium">Recommendation: Defer procedure. Senior doctor evaluation required.</p>}
                </AlertDescription>
              </Alert>
            )}
            {contraindications.length === 0 && (
              <Alert><CheckCircle2 className="h-4 w-4" /><AlertTitle>No red flags detected</AlertTitle><AlertDescription>Patient appears suitable for screening. Continue clinical judgment.</AlertDescription></Alert>
            )}
          </TabsContent>

          {/* PROTOCOL */}
          <TabsContent value="protocol" className="space-y-4">
            <Card><CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Condition Protocol</Label>
                <Select value={form.condition_protocol} onValueChange={(v) => setForm({ ...form, condition_protocol: v })}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>{PROTOCOLS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Hijama Type</Label>
                <Select value={form.hijama_type} onValueChange={(v) => setForm({ ...form, hijama_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{HIJAMA_TYPES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Doctor Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </CardContent></Card>
          </TabsContent>

          {/* POINTS */}
          <TabsContent value="points" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Point Selection</CardTitle><CardDescription>Doctor selects manually. AI may suggest zones — doctor must approve.</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {POINT_ZONES.map((z) => {
                  const active = form.selected_points.includes(z);
                  return (
                    <button key={z} type="button" onClick={() => togglePoint(z)}
                      className={`text-left text-sm border rounded-md px-3 py-2 transition ${active ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 font-medium" : "hover:bg-muted/50"}`}>
                      {active && "✓ "}{z}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI & CONSENT */}
          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-emerald-600" /> AI Recommendation</CardTitle>
                <CardDescription>Decision-support only. Doctor must approve.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={runAi} disabled={aiLoading}>{aiLoading ? "Generating…" : "Generate AI Suggestion"}</Button>
                {aiPlan && (
                  <div className="border rounded-md p-4 space-y-2 bg-muted/30 text-sm">
                    <div className="flex flex-wrap gap-2 items-center"><RiskBadge level={aiPlan.risk_level} /><Badge variant="outline">{aiPlan.suggested_type}</Badge></div>
                    {aiPlan.contraindications_detected?.length > 0 && (
                      <div><b>Contraindications:</b> {aiPlan.contraindications_detected.join(", ")}</div>
                    )}
                    <div><b>Suggested zones:</b> {aiPlan.suggested_point_zones?.join(", ")}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><b>Cups:</b> {aiPlan.number_of_cups}</div>
                      <div><b>Duration:</b> {aiPlan.session_duration_minutes} min</div>
                    </div>
                    <div><b>Precautions:</b><ul className="list-disc ml-5">{aiPlan.precautions?.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>
                    <div><b>After-care:</b><ul className="list-disc ml-5">{aiPlan.aftercare_advice?.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul></div>
                    <div><b>Follow-up:</b> {aiPlan.followup_timing}</div>
                    <div className="text-xs text-muted-foreground italic">{aiPlan.doctor_notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Digital Consent</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="border rounded p-3 bg-muted/30 space-y-1">
                  <p>I understand that Hijama / cupping therapy may cause:</p>
                  <ul className="list-disc ml-5">
                    <li>Temporary discomfort, bruising, or marks lasting several days</li>
                    <li>Minor bleeding (in wet cupping)</li>
                    <li>Risk of infection if after-care is not followed</li>
                    <li>Possible dizziness or fatigue post-procedure</li>
                  </ul>
                  <p>I have declared all relevant medical conditions and medications honestly.</p>
                </div>
                <label className="flex items-center gap-2"><Checkbox checked={form.consent_given} onCheckedChange={(v) => setForm({ ...form, consent_given: !!v })} /> Patient gives informed consent</label>
                <label className="flex items-center gap-2"><Checkbox checked={form.doctor_approved} onCheckedChange={(v) => setForm({ ...form, doctor_approved: !!v })} /> Doctor approves procedure</label>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMode("dashboard")}>Cancel</Button>
              <Button onClick={saveAssessment} disabled={!form.consent_given}>Save Assessment</Button>
            </div>
          </TabsContent>
        </Tabs>
        <Disclaimer />
      </div>
    );
  }

  // ---------------- DETAIL ----------------
  if (mode === "detail" && active) {
    return <AssessmentDetail
      assessment={active}
      sessions={sessions}
      followups={followups}
      doctor={doctor}
      onBack={() => { setMode("dashboard"); loadList(); }}
      onDelete={() => removeAssessment(active.id)}
      onPrint={printReport}
      onReload={() => openDetail(active)}
      userId={userId!}
    />;
  }

  return null;
}

// ---------------- DETAIL VIEW ----------------
function AssessmentDetail({
  assessment, sessions, followups, doctor, onBack, onDelete, onPrint, onReload, userId,
}: any) {
  const [sessionForm, setSessionForm] = useState({
    session_date: new Date().toISOString().slice(0, 10),
    therapist_name: "", doctor_approval: false, cupping_type: assessment.hijama_type || "",
    points_used: assessment.selected_points || [], number_of_cups: "", duration_minutes: "",
    skin_response: "", blood_quantity_ml: "", patient_response: "", complications: "", aftercare_advice: "", notes: "",
  });
  const [fuForm, setFuForm] = useState({
    followup_date: new Date().toISOString().slice(0, 10),
    pain_before: "", pain_after: "", sleep_improvement: "", energy_improvement: "",
    skin_healing: "", adverse_reaction: "", next_session_date: "", notes: "",
  });

  const addSession = async () => {
    const { error } = await supabase.from("vaidya_hijama_sessions").insert({
      assessment_id: assessment.id,
      doctor_user_id: userId,
      session_date: sessionForm.session_date,
      therapist_name: sessionForm.therapist_name || null,
      doctor_approval: sessionForm.doctor_approval,
      cupping_type: sessionForm.cupping_type || null,
      points_used: sessionForm.points_used,
      number_of_cups: sessionForm.number_of_cups ? parseInt(sessionForm.number_of_cups) : null,
      duration_minutes: sessionForm.duration_minutes ? parseInt(sessionForm.duration_minutes) : null,
      skin_response: sessionForm.skin_response || null,
      blood_quantity_ml: sessionForm.blood_quantity_ml ? parseInt(sessionForm.blood_quantity_ml) : null,
      patient_response: sessionForm.patient_response || null,
      complications: sessionForm.complications || null,
      aftercare_advice: sessionForm.aftercare_advice || null,
      notes: sessionForm.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Session recorded");
    onReload();
  };

  const addFu = async () => {
    const { error } = await supabase.from("vaidya_hijama_followups").insert({
      assessment_id: assessment.id,
      doctor_user_id: userId,
      followup_date: fuForm.followup_date,
      pain_before: fuForm.pain_before ? parseInt(fuForm.pain_before) : null,
      pain_after: fuForm.pain_after ? parseInt(fuForm.pain_after) : null,
      sleep_improvement: fuForm.sleep_improvement || null,
      energy_improvement: fuForm.energy_improvement || null,
      skin_healing: fuForm.skin_healing || null,
      adverse_reaction: fuForm.adverse_reaction || null,
      next_session_date: fuForm.next_session_date || null,
      notes: fuForm.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Follow-up saved");
    onReload();
  };

  const aftercare = [
    "Rest for 24 hours", "Hydrate well", "Avoid heavy exercise for 24–48h",
    "Avoid cold exposure / cold showers", "Keep cupping area clean & dry",
    "Avoid scratching marks", "Follow advised diet (light, warm, easily digestible)",
    "Report dizziness, fever, severe pain, or signs of infection immediately",
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}><Printer className="mr-2 h-4 w-4" /> Print PDF</Button>
          <Button variant="outline" size="sm" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
      </div>

      {/* Screen view */}
      <div className="print:hidden space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">{assessment.patient_name} <RiskBadge level={assessment.risk_level} /></CardTitle>
            <CardDescription>{assessment.condition_protocol || "—"} · {assessment.hijama_type || "Type not set"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><div className="text-xs text-muted-foreground">Age/Gender</div>{assessment.age || "—"} / {assessment.gender || "—"}</div>
            <div><div className="text-xs text-muted-foreground">Pain</div>{assessment.pain_location || "—"} · {assessment.pain_score ?? "—"}/10</div>
            <div><div className="text-xs text-muted-foreground">Duration</div>{assessment.pain_duration || "—"}</div>
            <div><div className="text-xs text-muted-foreground">Consent</div>{assessment.consent_given ? "✓ Given" : "Pending"}</div>
          </CardContent>
        </Card>

        {assessment.contraindications?.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Contraindications</AlertTitle>
            <AlertDescription><ul className="list-disc ml-5">{assessment.contraindications.map((c: string) => <li key={c}>{c}</li>)}</ul></AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="sessions">
          <TabsList>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups ({followups.length})</TabsTrigger>
            <TabsTrigger value="aftercare">After-care</TabsTrigger>
            <TabsTrigger value="ai">AI Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-3">
            <Dialog>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Session</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Record Hijama Session</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>Date</Label><Input type="date" value={sessionForm.session_date} onChange={(e) => setSessionForm({ ...sessionForm, session_date: e.target.value })} /></div>
                  <div><Label>Therapist</Label><Input value={sessionForm.therapist_name} onChange={(e) => setSessionForm({ ...sessionForm, therapist_name: e.target.value })} /></div>
                  <div><Label>Cupping Type</Label>
                    <Select value={sessionForm.cupping_type} onValueChange={(v) => setSessionForm({ ...sessionForm, cupping_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{HIJAMA_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>No. of Cups</Label><Input type="number" value={sessionForm.number_of_cups} onChange={(e) => setSessionForm({ ...sessionForm, number_of_cups: e.target.value })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })} /></div>
                  <div><Label>Blood Qty (ml)</Label><Input type="number" value={sessionForm.blood_quantity_ml} onChange={(e) => setSessionForm({ ...sessionForm, blood_quantity_ml: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Skin Response</Label><Input value={sessionForm.skin_response} onChange={(e) => setSessionForm({ ...sessionForm, skin_response: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Patient Response</Label><Textarea value={sessionForm.patient_response} onChange={(e) => setSessionForm({ ...sessionForm, patient_response: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Complications</Label><Textarea value={sessionForm.complications} onChange={(e) => setSessionForm({ ...sessionForm, complications: e.target.value })} /></div>
                  <div className="col-span-2"><Label>After-care Advice</Label><Textarea value={sessionForm.aftercare_advice} onChange={(e) => setSessionForm({ ...sessionForm, aftercare_advice: e.target.value })} /></div>
                  <label className="col-span-2 flex items-center gap-2"><Checkbox checked={sessionForm.doctor_approval} onCheckedChange={(v) => setSessionForm({ ...sessionForm, doctor_approval: !!v })} /> Doctor approval recorded</label>
                </div>
                <Button onClick={addSession} className="mt-3">Save Session</Button>
              </DialogContent>
            </Dialog>

            {sessions.length === 0 ? <p className="text-sm text-muted-foreground">No sessions yet.</p> :
              sessions.map((s) => (
                <Card key={s.id}><CardContent className="p-4 text-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="font-medium flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{new Date(s.session_date).toLocaleDateString()} · {s.cupping_type || "—"}</div>
                    {s.doctor_approval && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">Doctor approved</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Therapist: {s.therapist_name || "—"} · {s.number_of_cups || 0} cups · {s.duration_minutes || 0} min · Blood: {s.blood_quantity_ml || 0} ml</div>
                  {s.patient_response && <div className="mt-2"><b>Response:</b> {s.patient_response}</div>}
                  {s.complications && <div className="text-orange-700"><b>Complications:</b> {s.complications}</div>}
                </CardContent></Card>
              ))
            }
          </TabsContent>

          <TabsContent value="followups" className="space-y-3">
            <Dialog>
              <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" /> New Follow-up</Button></DialogTrigger>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Record Follow-up</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><Label>Date</Label><Input type="date" value={fuForm.followup_date} onChange={(e) => setFuForm({ ...fuForm, followup_date: e.target.value })} /></div>
                  <div><Label>Next Session</Label><Input type="date" value={fuForm.next_session_date} onChange={(e) => setFuForm({ ...fuForm, next_session_date: e.target.value })} /></div>
                  <div><Label>Pain Before (0–10)</Label><Input type="number" value={fuForm.pain_before} onChange={(e) => setFuForm({ ...fuForm, pain_before: e.target.value })} /></div>
                  <div><Label>Pain After (0–10)</Label><Input type="number" value={fuForm.pain_after} onChange={(e) => setFuForm({ ...fuForm, pain_after: e.target.value })} /></div>
                  <div><Label>Sleep</Label><Input value={fuForm.sleep_improvement} onChange={(e) => setFuForm({ ...fuForm, sleep_improvement: e.target.value })} /></div>
                  <div><Label>Energy</Label><Input value={fuForm.energy_improvement} onChange={(e) => setFuForm({ ...fuForm, energy_improvement: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Skin Healing</Label><Input value={fuForm.skin_healing} onChange={(e) => setFuForm({ ...fuForm, skin_healing: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Adverse Reaction</Label><Textarea value={fuForm.adverse_reaction} onChange={(e) => setFuForm({ ...fuForm, adverse_reaction: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Notes</Label><Textarea value={fuForm.notes} onChange={(e) => setFuForm({ ...fuForm, notes: e.target.value })} /></div>
                </div>
                <Button onClick={addFu} className="mt-3">Save Follow-up</Button>
              </DialogContent>
            </Dialog>
            {followups.length === 0 ? <p className="text-sm text-muted-foreground">No follow-ups yet.</p> :
              followups.map((f) => (
                <Card key={f.id}><CardContent className="p-4 text-sm">
                  <div className="font-medium">{new Date(f.followup_date).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">Pain: {f.pain_before ?? "—"} → {f.pain_after ?? "—"} · Sleep: {f.sleep_improvement || "—"} · Energy: {f.energy_improvement || "—"}</div>
                  {f.adverse_reaction && <div className="text-orange-700 mt-1"><b>Adverse:</b> {f.adverse_reaction}</div>}
                  {f.next_session_date && <div className="mt-1"><b>Next:</b> {new Date(f.next_session_date).toLocaleDateString()}</div>}
                </CardContent></Card>
              ))
            }
          </TabsContent>

          <TabsContent value="aftercare">
            <Card><CardContent className="p-5 text-sm"><ul className="list-disc ml-5 space-y-1">{aftercare.map((a) => <li key={a}>{a}</li>)}</ul></CardContent></Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card><CardContent className="p-5 text-sm">
              {assessment.ai_plan ? (
                <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(assessment.ai_plan, null, 2)}</pre>
              ) : <p className="text-muted-foreground">No AI plan generated.</p>}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
        <Disclaimer />
      </div>

      {/* PRINT VIEW */}
      <div className="hidden print:block bg-white text-black" style={{ padding: "20mm 18mm", fontFamily: "serif" }}>
        <div style={{ borderBottom: "3px double #047857", paddingBottom: 10, marginBottom: 14 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#047857" }}>{doctor?.clinic_name || "Ayuzee Clinic"}</div>
          <div style={{ fontSize: 12 }}>Dr. {doctor?.full_name || ""} · {doctor?.qualification || ""}</div>
          <div style={{ fontSize: 16, marginTop: 6, fontWeight: 600 }}>Ayuzee Hijama Session Report</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <div><b>Patient:</b> {assessment.patient_name}</div>
          <div><b>Age/Gender:</b> {assessment.age || "—"} / {assessment.gender || "—"}</div>
          <div><b>Date:</b> {new Date(assessment.created_at).toLocaleDateString()}</div>
          <div><b>Risk:</b> {assessment.risk_level?.toUpperCase()}</div>
          <div style={{ gridColumn: "1 / span 2" }}><b>Indication:</b> {assessment.chief_complaint || "—"} ({assessment.condition_protocol || "—"})</div>
        </div>
        <h3 style={{ marginTop: 12, color: "#047857" }}>Safety Checklist</h3>
        <div style={{ fontSize: 12 }}>
          {assessment.contraindications?.length
            ? <ul>{assessment.contraindications.map((c: string) => <li key={c}>⚠ {c}</li>)}</ul>
            : "✓ No contraindications detected."}
        </div>
        <h3 style={{ marginTop: 12, color: "#047857" }}>Procedure</h3>
        <div style={{ fontSize: 12 }}>
          <div><b>Type:</b> {assessment.hijama_type || "—"}</div>
          <div><b>Points selected:</b> {(assessment.selected_points || []).join(", ") || "—"}</div>
        </div>
        {sessions[0] && (
          <>
            <h3 style={{ marginTop: 12, color: "#047857" }}>Latest Session</h3>
            <div style={{ fontSize: 12 }}>
              <div>Date: {new Date(sessions[0].session_date).toLocaleDateString()} · Cups: {sessions[0].number_of_cups || 0} · Duration: {sessions[0].duration_minutes || 0} min</div>
              <div>Response: {sessions[0].patient_response || "—"}</div>
            </div>
          </>
        )}
        <h3 style={{ marginTop: 12, color: "#047857" }}>After-care Advice</h3>
        <ul style={{ fontSize: 12 }}>{aftercare.map((a) => <li key={a}>{a}</li>)}</ul>
        {followups[0]?.next_session_date && (
          <div style={{ marginTop: 12, fontSize: 12 }}><b>Next follow-up:</b> {new Date(followups[0].next_session_date).toLocaleDateString()}</div>
        )}
        <div style={{ marginTop: 30, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <div>Patient Signature: ____________________</div>
          <div>Doctor Signature: Dr. {doctor?.full_name || "____________"}</div>
        </div>
        <p style={{ fontSize: 10, fontStyle: "italic", marginTop: 20, color: "#555" }}>
          Hijama AI is clinical decision-support only. Final treatment decision must be made by a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
