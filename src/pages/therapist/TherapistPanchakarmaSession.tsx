import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Lock, ShieldAlert } from "lucide-react";

type Session = {
  id: string;
  course_id: string;
  session_number: number;
  status: string;
  room_id: string | null;
  therapist_id: string | null;
  adverse_event_flag: boolean;
  pre_procedure_assessment: any;
  procedure_log: any;
  transfer_note: string | null;
  scheduled_at: string | null;
};
type Course = { id: string; therapy_type_id: string; prescribing_vaidya_id: string; provisional_diagnosis: string | null; patient_id: string };
type TherapyType = { id: string; name: string; description: string | null; protocol_steps: any };

const RULE_LABELS: Record<string, string> = {
  room_checklist_missing: "Today's room checklist for the assigned room is missing or not marked all-clear.",
  infection_control_missing: "Infection-control log for this session hasn't been recorded yet.",
  room_not_assigned: "This session has no room assigned. Ask reception to assign one.",
  therapist_not_assigned: "You are not the assigned therapist for this session.",
  therapist_double_booked: "You have another session at the same time — resolve the clash first.",
  session_flagged: "Session is on hold because of an adverse-event flag. Waiting for Vaidya review.",
  session_completed: "This session is already completed and cannot be changed.",
  privilege_denied: "You don't have permission for this step.",
  invalid_status_transition: "This status change isn't allowed from the current state.",
};

const parseRule = (err: any): { rule: string | null; message: string } => {
  const detail = String(err?.details ?? err?.detail ?? err?.hint ?? "");
  const m = /rule=([a-z_]+)/i.exec(detail);
  const rule = m ? m[1] : null;
  const friendly = rule && RULE_LABELS[rule] ? RULE_LABELS[rule] : (err?.message ?? "Blocked by a server safety check.");
  return { rule, message: friendly };
};

const ROOM_CHECK_ITEMS = [
  { key: "cleaned", label: "Room cleaned & mopped" },
  { key: "table_ready", label: "Droni / procedure table prepared" },
  { key: "oils_warmed", label: "Medicated oils / decoctions warmed" },
  { key: "linen_fresh", label: "Fresh linen & towels laid out" },
  { key: "equipment_ok", label: "Equipment & utensils sterilised" },
  { key: "temp_light", label: "Room temperature & lighting adjusted" },
];
const INFECTION_ITEMS: Array<{ key: keyof InfectionState; label: string }> = [
  { key: "hand_hygiene", label: "Hand hygiene performed (WHO 6-step)" },
  { key: "room_disinfected", label: "Surfaces disinfected" },
  { key: "ppe_used", label: "PPE (gloves / apron / mask) worn" },
  { key: "linen_changed", label: "Linen changed for this patient" },
  { key: "bmw_segregated", label: "Bio-medical waste bins segregated & lined" },
];
type InfectionState = { hand_hygiene: boolean; room_disinfected: boolean; ppe_used: boolean; linen_changed: boolean; bmw_segregated: boolean };

const DEFAULT_PROCEDURE_STEPS = [
  "Poorvakarma – snehana / swedana as indicated",
  "Positioning & rakshoghna mantra",
  "Main procedure administered per protocol",
  "Vital signs during procedure recorded",
  "Patient response & tolerance observed",
  "Wind-down, cleaning & rest advised",
];

export default function TherapistPanchakarmaSession() {
  const { id: sessionId } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [therapy, setTherapy] = useState<TherapyType | null>(null);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [vaidyaUserId, setVaidyaUserId] = useState<string | null>(null);

  // Step 1
  const [roomChecklistId, setRoomChecklistId] = useState<string | null>(null);
  const [roomChecks, setRoomChecks] = useState<Record<string, boolean>>({});
  const [roomNotes, setRoomNotes] = useState("");
  // Step 2
  const [infectionLogId, setInfectionLogId] = useState<string | null>(null);
  const [infection, setInfection] = useState<InfectionState>({ hand_hygiene: false, room_disinfected: false, ppe_used: false, linen_changed: false, bmw_segregated: false });
  // Step 3
  const [assessment, setAssessment] = useState({ pulse: "", bp: "", temp: "", tongue: "", complaints: "", tolerance_ok: false });
  // Step 4
  const [procLog, setProcLog] = useState<Record<string, { done: boolean; note: string }>>({});
  const [procOverall, setProcOverall] = useState("");
  // Step 5
  const [transferNote, setTransferNote] = useState("");

  // Adverse event dialog state
  const [aeSeverity, setAeSeverity] = useState<"near_miss" | "minor" | "major" | "critical">("minor");
  const [aeDescription, setAeDescription] = useState("");

  // Last server rule rejection (from DB trigger)
  const [blockedRule, setBlockedRule] = useState<{ rule: string | null; message: string } | null>(null);

  const load = async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { nav("/therapist/auth"); return; }

    const { data: t } = await supabase.from("therapists").select("id").eq("user_id", u.user.id).maybeSingle();
    setTherapistId(t?.id ?? null);

    const { data: s } = await supabase
      .from("panchakarma_procedure_sessions")
      .select("id,course_id,session_number,status,room_id,therapist_id,adverse_event_flag,pre_procedure_assessment,procedure_log,transfer_note,scheduled_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (!s) { toast.error("Session not found."); setLoading(false); return; }
    setSession(s as Session);
    setTransferNote(s.transfer_note ?? "");
    if (s.pre_procedure_assessment && typeof s.pre_procedure_assessment === "object") {
      setAssessment({ ...assessment, ...(s.pre_procedure_assessment as any) });
    }
    if (s.procedure_log && typeof s.procedure_log === "object") {
      const pl = s.procedure_log as any;
      if (pl.steps) setProcLog(pl.steps);
      if (pl.overall) setProcOverall(pl.overall);
    }

    const { data: c } = await supabase
      .from("panchakarma_courses")
      .select("id,therapy_type_id,prescribing_vaidya_id,provisional_diagnosis,patient_id")
      .eq("id", s.course_id).maybeSingle();
    setCourse((c as Course) ?? null);

    if (c) {
      const [{ data: tt }, { data: doc }] = await Promise.all([
        supabase.from("panchakarma_therapy_types").select("id,name,description,protocol_steps").eq("id", c.therapy_type_id).maybeSingle(),
        supabase.from("doctors").select("user_id").eq("id", c.prescribing_vaidya_id).maybeSingle(),
      ]);
      setTherapy((tt as TherapyType) ?? null);
      setVaidyaUserId((doc as any)?.user_id ?? null);
    }

    // Today's room checklist for this room
    if (s.room_id) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: rc } = await supabase
        .from("panchakarma_room_checklists")
        .select("id,items_checked,all_clear,notes")
        .eq("room_id", s.room_id).eq("checklist_date", today)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (rc) {
        setRoomChecklistId(rc.id);
        setRoomChecks((rc.items_checked as any) ?? {});
        setRoomNotes(rc.notes ?? "");
      }
    }
    // Existing infection log
    const { data: ic } = await supabase
      .from("panchakarma_infection_control_logs")
      .select("id,hand_hygiene,room_disinfected,ppe_used,linen_changed,bmw_segregated")
      .eq("session_id", sessionId).order("logged_at", { ascending: false }).limit(1).maybeSingle();
    if (ic) {
      setInfectionLogId(ic.id);
      setInfection({
        hand_hygiene: ic.hand_hygiene, room_disinfected: ic.room_disinfected,
        ppe_used: ic.ppe_used, linen_changed: ic.linen_changed, bmw_segregated: ic.bmw_segregated,
      });
    }

    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sessionId]);

  // Step completion booleans
  const roomAllClear = ROOM_CHECK_ITEMS.every((i) => !!roomChecks[i.key]);
  const step1Done = !!roomChecklistId && roomAllClear;
  const infectionAllClear = INFECTION_ITEMS.every((i) => infection[i.key]);
  const step2Done = !!infectionLogId && infectionAllClear;
  const step3Done = !!(session?.pre_procedure_assessment && (session.pre_procedure_assessment as any).tolerance_ok);
  const step4Done = !!(session?.procedure_log && (session.procedure_log as any).overall);
  const step5Done = !!(session?.transfer_note && session.transfer_note.trim().length > 0);

  const flagged = session?.status === "flagged" || session?.adverse_event_flag;

  const surface = (error: any) => {
    const parsed = parseRule(error);
    setBlockedRule(parsed);
    toast.error(parsed.message);
  };

  const updateSession = async (patch: Partial<Session>) => {
    if (!session) return null;
    const { data, error } = await supabase
      .from("panchakarma_procedure_sessions")
      .update(patch as any)
      .eq("id", session.id)
      .select("id,course_id,session_number,status,room_id,therapist_id,adverse_event_flag,pre_procedure_assessment,procedure_log,transfer_note,scheduled_at")
      .maybeSingle();
    if (error) { surface(error); return null; }
    setBlockedRule(null);
    if (data) setSession(data as Session);
    return data;
  };

  // --- Step 1 save ---
  const saveRoomChecklist = async () => {
    if (!session?.room_id) { toast.error("No room assigned for this session."); return; }
    if (!therapistId) { toast.error("Therapist profile not found."); return; }
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      room_id: session.room_id,
      checklist_date: today,
      items_checked: roomChecks,
      all_clear: roomAllClear,
      notes: roomNotes || null,
    };
    let id = roomChecklistId;
    if (id) {
      const { error } = await supabase.from("panchakarma_room_checklists").update(payload).eq("id", id);
      if (error) { surface(error); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("panchakarma_room_checklists").insert(payload).select("id").single();
      if (error) { surface(error); setSaving(false); return; }
      id = data.id; setRoomChecklistId(id);
    }
    setSaving(false);
    toast.success(roomAllClear ? "Room ready ✓" : "Checklist saved");
  };

  // --- Step 2 save ---
  const saveInfectionLog = async () => {
    if (!session) return;
    if (!step1Done) { toast.error("Complete room readiness first."); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = { session_id: session.id, ...infection, logged_by: u.user?.id, logged_at: new Date().toISOString() };
    let id = infectionLogId;
    if (id) {
      const { error } = await supabase.from("panchakarma_infection_control_logs").update(payload).eq("id", id);
      if (error) { surface(error); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("panchakarma_infection_control_logs").insert(payload).select("id").single();
      if (error) { surface(error); setSaving(false); return; }
      id = data.id; setInfectionLogId(id);
    }
    // advance status to in_progress once both checklists clear
    if (infectionAllClear && session.status !== "in_progress" && session.status !== "post_care_pending" && session.status !== "completed") {
      await updateSession({ status: "in_progress" as any });
    }
    setSaving(false);
    toast.success(infectionAllClear ? "Infection control cleared ✓" : "Log saved");
  };

  // --- Step 3 save ---
  const saveAssessment = async () => {
    if (!step2Done) { toast.error("Complete infection control first."); return; }
    setSaving(true);
    await updateSession({ pre_procedure_assessment: assessment as any });
    setSaving(false);
    toast.success("Pre-procedure assessment recorded");
  };

  // --- Step 4 save ---
  const saveProcedureLog = async () => {
    if (!step3Done) { toast.error("Complete pre-procedure assessment first."); return; }
    setSaving(true);
    await updateSession({ procedure_log: { steps: procLog, overall: procOverall, ended_at: new Date().toISOString() } as any });
    setSaving(false);
    toast.success("Procedure log saved");
  };

  // --- Step 5 save ---
  const saveTransferNote = async () => {
    if (!step4Done) { toast.error("Complete procedure log first."); return; }
    if (!transferNote.trim()) { toast.error("Transfer note is required."); return; }
    setSaving(true);
    await updateSession({ transfer_note: transferNote.trim(), status: "post_care_pending" as any });
    setSaving(false);
    toast.success("Handover complete — Vaidya will approve post-care plan.");
  };

  // --- Adverse event flag (urgent, bypass queue) ---
  const flagAdverseEvent = async () => {
    if (!session || !course) return;
    if (!aeDescription.trim()) { toast.error("Please describe the event."); return; }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      // 1. Create adverse event record
      const { error: aeErr } = await supabase.from("panchakarma_adverse_events").insert({
        session_id: session.id,
        reported_by: u.user?.id,
        severity: aeSeverity,
        description: aeDescription.trim(),
        vaidya_notified_at: new Date().toISOString(),
      });
      if (aeErr) throw aeErr;

      // 2. Flag session and freeze workflow
      await updateSession({ adverse_event_flag: true, status: "flagged" as any });

      // 3. Urgent Vaidya notification — bypass queue, insert directly
      if (vaidyaUserId) {
        await supabase.from("notifications").insert({
          user_id: vaidyaUserId,
          type: "panchakarma_adverse_event",
          title: `🚨 Panchakarma adverse event — ${aeSeverity.replace("_", " ")}`,
          message: `Session #${session.session_number} (${therapy?.name ?? "therapy"}) flagged by therapist. Immediate review required.`,
          link: `/vaidya/panchakarma/session/${session.id}`,
          metadata: { session_id: session.id, severity: aeSeverity, course_id: course.id },
        });
      }
      toast.success("Vaidya has been alerted. Session is on hold.");
      setAeDescription("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to flag event.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading session…</div>;
  if (!session || !course) return <div className="p-6 text-sm text-destructive">Session unavailable.</div>;
  if (session.therapist_id && therapistId && session.therapist_id !== therapistId) {
    return <div className="p-6 text-sm text-destructive">This session is not assigned to you.</div>;
  }

  const StepHeader = ({ n, title, done, locked }: { n: number; title: string; done: boolean; locked: boolean }) => (
    <div className="flex items-center gap-2">
      <span className={`h-7 w-7 grid place-items-center rounded-full text-xs font-semibold ${done ? "bg-emerald-600 text-white" : locked ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>
        {done ? <CheckCircle2 className="h-4 w-4" /> : locked ? <Lock className="h-3.5 w-3.5" /> : n}
      </span>
      <h3 className="font-display text-base">{title}</h3>
      {done && <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">Done</Badge>}
      {locked && !done && <Badge variant="outline">Locked</Badge>}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => nav("/therapist/sessions")}>
            <ArrowLeft className="h-4 w-4" /> Back to sessions
          </Button>
          <h1 className="font-display text-2xl font-semibold">
            {therapy?.name ?? "Panchakarma"} · Session #{session.session_number}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {course.provisional_diagnosis || "No diagnosis noted"} · Status:{" "}
            <span className="font-medium">{session.status.replace(/_/g, " ")}</span>
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={session.status === "completed"}>
              <ShieldAlert className="h-4 w-4" /> Flag adverse event
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Flag adverse event</AlertDialogTitle>
              <AlertDialogDescription>
                This immediately halts the session and pages the supervising Vaidya.
                Only use for real clinical concerns.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Severity</Label>
                <Select value={aeSeverity} onValueChange={(v) => setAeSeverity(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="near_miss">Near miss</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>What happened?</Label>
                <Textarea rows={4} value={aeDescription} onChange={(e) => setAeDescription(e.target.value.slice(0, 2000))} placeholder="Describe symptoms, patient response, actions taken so far…" />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={flagAdverseEvent} className="bg-destructive hover:bg-destructive/90">
                Flag & alert Vaidya
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {flagged && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-destructive">Session on hold — adverse event flagged</div>
            <p className="text-destructive/80 mt-1">
              This session is frozen until the supervising Vaidya reviews and resolves the flag. No further steps can be logged.
            </p>
          </div>
        </div>
      )}

      {blockedRule && !flagged && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-destructive">Blocked by server safety check</div>
            <p className="mt-1">{blockedRule.message}</p>
            {blockedRule.rule && <p className="text-[11px] text-muted-foreground mt-1">Rule: <code>{blockedRule.rule}</code></p>}
          </div>
        </div>
      )}

      {/* Step 1: Room */}
      <Card className={flagged ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader><StepHeader n={1} title="Room readiness" done={step1Done} locked={false} /></CardHeader>
        <CardContent className="space-y-3">
          {!session.room_id && <p className="text-xs text-destructive">No room assigned yet — ask reception.</p>}
          <div className="grid sm:grid-cols-2 gap-2">
            {ROOM_CHECK_ITEMS.map((it) => (
              <label key={it.key} className="flex items-center gap-2 text-sm rounded-md border p-2">
                <Checkbox checked={!!roomChecks[it.key]} onCheckedChange={(v) => setRoomChecks((s) => ({ ...s, [it.key]: !!v }))} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>
          <Textarea rows={2} placeholder="Notes (optional)" value={roomNotes} onChange={(e) => setRoomNotes(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={saveRoomChecklist} disabled={saving || !session.room_id}>Save room checklist</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Infection control */}
      <Card className={flagged || !step1Done ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader><StepHeader n={2} title="Infection control" done={step2Done} locked={!step1Done} /></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            {INFECTION_ITEMS.map((it) => (
              <label key={it.key} className="flex items-center gap-2 text-sm rounded-md border p-2">
                <Checkbox checked={infection[it.key]} onCheckedChange={(v) => setInfection((s) => ({ ...s, [it.key]: !!v }))} />
                <span>{it.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={saveInfectionLog} disabled={saving || !step1Done}>Save infection log</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Pre-procedure assessment */}
      <Card className={flagged || !step2Done ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader><StepHeader n={3} title="Pre-procedure assessment" done={step3Done} locked={!step2Done} /></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1"><Label className="text-xs">Nadi / Pulse</Label>
              <Input value={assessment.pulse} onChange={(e) => setAssessment({ ...assessment, pulse: e.target.value })} placeholder="72/min" /></div>
            <div className="space-y-1"><Label className="text-xs">BP</Label>
              <Input value={assessment.bp} onChange={(e) => setAssessment({ ...assessment, bp: e.target.value })} placeholder="120/80" /></div>
            <div className="space-y-1"><Label className="text-xs">Temp (°F)</Label>
              <Input value={assessment.temp} onChange={(e) => setAssessment({ ...assessment, temp: e.target.value })} placeholder="98.4" /></div>
            <div className="space-y-1"><Label className="text-xs">Jihva / Tongue</Label>
              <Input value={assessment.tongue} onChange={(e) => setAssessment({ ...assessment, tongue: e.target.value })} placeholder="Clean, moist" /></div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Presenting complaints / notes</Label>
            <Textarea rows={2} value={assessment.complaints} onChange={(e) => setAssessment({ ...assessment, complaints: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={assessment.tolerance_ok} onCheckedChange={(v) => setAssessment({ ...assessment, tolerance_ok: !!v })} />
            <span>Patient is fit to receive today's procedure (no contraindication)</span>
          </label>
          <div className="flex justify-end">
            <Button onClick={saveAssessment} disabled={saving || !step2Done}>Save assessment</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Procedure execution log */}
      <Card className={flagged || !step3Done ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader>
          <StepHeader n={4} title="Procedure execution log" done={step4Done} locked={!step3Done} />
        </CardHeader>
        <CardContent className="space-y-3">
          {(() => {
            const raw = therapy?.protocol_steps;
            const arr: string[] = Array.isArray(raw)
              ? raw.map((s: any) => (typeof s === "string" ? s : s?.label ?? s?.step ?? s?.name ?? JSON.stringify(s))).filter(Boolean)
              : [];
            const steps = arr.length ? arr : DEFAULT_PROCEDURE_STEPS;
            const usingProtocol = arr.length > 0;
            return (
              <>
                <p className="text-xs text-muted-foreground">
                  {usingProtocol
                    ? <>Approved protocol for <span className="font-medium">{therapy?.name}</span> (v{(therapy as any)?.version ?? "?"}). Mark each step as performed.</>
                    : <>No protocol steps configured for <span className="font-medium">{therapy?.name}</span> — using standard checklist.</>}
                </p>
                <div className="space-y-2">
                  {steps.map((step, i) => {
                    const key = `s${i}`;
                    const cur = procLog[key] ?? { done: false, note: "" };
                    return (
                      <div key={key} className="rounded-md border p-3 space-y-2">
                        <label className="flex items-start gap-2 text-sm">
                          <Checkbox checked={cur.done} onCheckedChange={(v) => setProcLog((s) => ({ ...s, [key]: { ...cur, done: !!v } }))} />
                          <span className="font-medium">{step}</span>
                        </label>
                        <Input placeholder="Observation (optional)" value={cur.note} onChange={(e) => setProcLog((s) => ({ ...s, [key]: { ...cur, note: e.target.value } }))} />
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
          <div className="space-y-1">
            <Label className="text-xs">Overall procedure summary</Label>
            <Textarea rows={3} value={procOverall} onChange={(e) => setProcOverall(e.target.value)} placeholder="Duration, quantities of medicated oil/decoction, patient tolerance…" />
          </div>
          <div className="flex justify-end">
            <Button onClick={saveProcedureLog} disabled={saving || !step3Done}>Save procedure log</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Transfer note */}
      <Card className={flagged || !step4Done ? "opacity-60 pointer-events-none" : ""}>
        <CardHeader><StepHeader n={5} title="Transfer note to Vaidya" done={step5Done} locked={!step4Done} /></CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={5} value={transferNote} onChange={(e) => setTransferNote(e.target.value.slice(0, 3000))}
            placeholder="Summary handover to the supervising Vaidya: patient's response, anything unusual, post-care advice already given…"
          />
          <div className="flex justify-end">
            <Button onClick={saveTransferNote} disabled={saving || !step4Done}>Complete handover</Button>
          </div>
          {session.status === "post_care_pending" && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
              Handover submitted. Awaiting Vaidya's post-care approval.
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-[11px] text-muted-foreground text-center">
        Every step is time-stamped and audited. Do not skip or backfill.
      </p>
    </div>
  );
}
