/**
 * Therapist AI Session Notes — AYUSH-adapted Panchakarma documentation
 * Charaka-style fields, therapy templates, doctor intimation on submit.
 */

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Brain,
  Check,
  ChevronDown,
  ClipboardList,
  FileText,
  Flame,
  Loader2,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TherapistContext } from "./TherapistLayout";
import { maskPatientName, DOCTOR_INSTRUCTION_NOTICE, PRIVACY_NOTICE } from "@/utils/therapistPrivacy";

// ════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ════════════════════════════════════════════════════════════

interface SessionNote {
  id: string;
  session_id: string;
  patient_name: string;
  therapy_type: string;
  prakriti_observed: string | null;
  dosha_assessment: { vata: number; pitta: number; kapha: number };
  agni_status: string | null;
  ama_status: string | null;
  therapy_response: string | null;
  patient_tolerance: string | null;
  oil_decoction_used: string | null;
  quantity_used: string | null;
  temperature: string | null;
  duration_applied: number | null;
  rogi_bala: string | null;
  roga_bala: string | null;
  vyadhi_assessment: string | null;
  pulse_before: string | null;
  pulse_after: string | null;
  skin_response: string | null;
  sweat_response: string | null;
  procedure_notes: string | null;
  observations: string | null;
  after_care_instructions: string | null;
  adverse_reactions: string | null;
  recommendations_for_doctor: string | null;
  doctor_id: string | null;
  sent_to_doctor: boolean;
  doctor_acknowledged: boolean;
  doctor_response: string | null;
  ai_generated_summary: string | null;
  note_status: string;
  created_at: string;
}

interface CompletedSession {
  id: string;
  patient_name: string;
  therapy_name: string;
  therapy_code: string;
  scheduled_date: string;
  therapist_notes: string | null;
}

const THERAPY_TYPES = [
  { value: "abhyanga", label: "Abhyanga (Oil Massage)" },
  { value: "shirodhara", label: "Shirodhara (Oil Pouring)" },
  { value: "basti", label: "Basti (Enema Therapy)" },
  { value: "nasya", label: "Nasya (Nasal Therapy)" },
  { value: "vamana", label: "Vamana (Emesis)" },
  { value: "virechana", label: "Virechana (Purgation)" },
  { value: "swedana", label: "Swedana (Steam Therapy)" },
  { value: "udvartana", label: "Udvartana (Powder Massage)" },
  { value: "pizhichil", label: "Pizhichil (Oil Bath)" },
  { value: "njavarakizhi", label: "Njavarakizhi (Rice Bolus)" },
  { value: "elakizhi", label: "Elakizhi (Leaf Bolus)" },
  { value: "podikizhi", label: "Podikizhi (Powder Bolus)" },
  { value: "takradhara", label: "Takradhara (Buttermilk Pour)" },
  { value: "lepana", label: "Lepana (Paste Application)" },
  { value: "other", label: "Other" },
];

const AGNI_OPTIONS = [
  { value: "sama", label: "Sama (Balanced)" },
  { value: "tikshna", label: "Tikshna (Sharp/Intense)" },
  { value: "manda", label: "Manda (Weak/Dull)" },
  { value: "vishama", label: "Vishama (Irregular)" },
];

const AMA_OPTIONS = [
  { value: "absent", label: "Absent" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const TOLERANCE_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "moderate", label: "Moderate" },
  { value: "low", label: "Low" },
  { value: "poor", label: "Poor — Flag to Doctor" },
];

const TEMPERATURE_OPTIONS = [
  { value: "cold", label: "Cold" },
  { value: "room_temp", label: "Room Temperature" },
  { value: "warm", label: "Warm" },
  { value: "hot", label: "Hot" },
];

// ════════════════════════════════════════════════════════════
// AI SUMMARY GENERATOR (local, no API needed)
// ════════════════════════════════════════════════════════════

function generateAISummary(form: typeof INITIAL_FORM): string {
  const parts: string[] = [];
  parts.push(`Therapy: ${THERAPY_TYPES.find(t => t.value === form.therapy_type)?.label || form.therapy_type}`);
  if (form.prakriti_observed) parts.push(`Prakriti: ${form.prakriti_observed}`);
  if (form.dosha_vata || form.dosha_pitta || form.dosha_kapha) {
    parts.push(`Dosha Assessment — V:${form.dosha_vata}/10, P:${form.dosha_pitta}/10, K:${form.dosha_kapha}/10`);
  }
  if (form.agni_status) parts.push(`Agni: ${AGNI_OPTIONS.find(a => a.value === form.agni_status)?.label}`);
  if (form.ama_status) parts.push(`Ama: ${AMA_OPTIONS.find(a => a.value === form.ama_status)?.label}`);
  if (form.oil_decoction_used) parts.push(`Material: ${form.oil_decoction_used} (${form.quantity_used || 'qty N/A'}, ${TEMPERATURE_OPTIONS.find(t => t.value === form.temperature)?.label || form.temperature})`);
  if (form.duration_applied) parts.push(`Duration: ${form.duration_applied} min`);
  if (form.therapy_response) parts.push(`Response: ${form.therapy_response}`);
  if (form.patient_tolerance) parts.push(`Tolerance: ${form.patient_tolerance}`);
  if (form.rogi_bala) parts.push(`Rogi Bala: ${form.rogi_bala}`);
  if (form.roga_bala) parts.push(`Roga Bala: ${form.roga_bala}`);
  if (form.pulse_before || form.pulse_after) parts.push(`Pulse: ${form.pulse_before || '—'} → ${form.pulse_after || '—'}`);
  if (form.skin_response) parts.push(`Skin: ${form.skin_response}`);
  if (form.sweat_response) parts.push(`Sweat: ${form.sweat_response}`);
  if (form.adverse_reactions) parts.push(`⚠️ Adverse: ${form.adverse_reactions}`);
  if (form.observations) parts.push(`Observations: ${form.observations}`);
  if (form.after_care_instructions) parts.push(`After-care: ${form.after_care_instructions}`);
  if (form.recommendations_for_doctor) parts.push(`Doctor Note: ${form.recommendations_for_doctor}`);
  return parts.join("\n");
}

const INITIAL_FORM = {
  therapy_type: "abhyanga",
  prakriti_observed: "",
  dosha_vata: 5,
  dosha_pitta: 5,
  dosha_kapha: 5,
  agni_status: "",
  ama_status: "",
  therapy_response: "",
  patient_tolerance: "",
  oil_decoction_used: "",
  quantity_used: "",
  temperature: "",
  duration_applied: "",
  rogi_bala: "",
  roga_bala: "",
  vyadhi_assessment: "",
  pulse_before: "",
  pulse_after: "",
  skin_response: "",
  sweat_response: "",
  procedure_notes: "",
  observations: "",
  after_care_instructions: "",
  adverse_reactions: "",
  recommendations_for_doctor: "",
};

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════

const TherapistSessionNotes = () => {
  const { therapist } = useOutletContext<TherapistContext>();
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [previewSummary, setPreviewSummary] = useState("");

  useEffect(() => { loadData(); }, [therapist.id]);

  const loadData = async () => {
    const [notesRes, sessionsRes] = await Promise.all([
      (supabase as any).from("therapist_session_notes")
        .select("*")
        .eq("therapist_id", therapist.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("therapy_sessions")
        .select("id, patient_name, therapy_name, therapy_code, scheduled_date, therapist_notes")
        .eq("therapist_id", therapist.id)
        .eq("status", "completed")
        .order("scheduled_date", { ascending: false })
        .limit(20),
    ]);
    setNotes(notesRes.data || []);
    setCompletedSessions((sessionsRes.data as CompletedSession[]) || []);
    setLoading(false);
  };

  const startNote = (session: CompletedSession) => {
    setSelectedSession(session);
    setForm({ ...INITIAL_FORM, therapy_type: mapTherapyCode(session.therapy_code) });
    setPreviewSummary("");
    setDialogOpen(true);
  };

  const mapTherapyCode = (code: string): string => {
    const lower = code.toLowerCase();
    const match = THERAPY_TYPES.find(t => lower.includes(t.value) || t.value.includes(lower));
    return match?.value || "other";
  };

  const generatePreview = () => {
    const summary = generateAISummary(form);
    setPreviewSummary(summary);
  };

  const submitNote = async () => {
    if (!selectedSession) return;
    setSubmitting(true);

    const summary = generateAISummary(form);
    const payload = {
      therapist_id: therapist.id,
      session_id: selectedSession.id,
      patient_name: selectedSession.patient_name,
      therapy_type: form.therapy_type,
      prakriti_observed: form.prakriti_observed || null,
      dosha_assessment: { vata: form.dosha_vata, pitta: form.dosha_pitta, kapha: form.dosha_kapha },
      agni_status: form.agni_status || null,
      ama_status: form.ama_status || null,
      therapy_response: form.therapy_response || null,
      patient_tolerance: form.patient_tolerance || null,
      oil_decoction_used: form.oil_decoction_used || null,
      quantity_used: form.quantity_used || null,
      temperature: form.temperature || null,
      duration_applied: form.duration_applied ? parseInt(form.duration_applied) : null,
      rogi_bala: form.rogi_bala || null,
      roga_bala: form.roga_bala || null,
      vyadhi_assessment: form.vyadhi_assessment || null,
      pulse_before: form.pulse_before || null,
      pulse_after: form.pulse_after || null,
      skin_response: form.skin_response || null,
      sweat_response: form.sweat_response || null,
      procedure_notes: form.procedure_notes || null,
      observations: form.observations || null,
      after_care_instructions: form.after_care_instructions || null,
      adverse_reactions: form.adverse_reactions || null,
      recommendations_for_doctor: form.recommendations_for_doctor || null,
      ai_generated_summary: summary,
      note_status: "submitted",
      sent_to_doctor: true,
    };

    const { data, error } = await (supabase as any)
      .from("therapist_session_notes")
      .insert(payload)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save note");
      setSubmitting(false);
      return;
    }

    // Send intimation to doctor via messages table
    await (supabase as any).from("therapist_messages").insert({
      sender_type: "therapist",
      sender_id: therapist.id,
      recipient_type: "doctor",
      recipient_id: payload.doctor_id || "system",
      session_id: selectedSession.id,
      subject: `Session Note: ${maskPatientName(selectedSession.patient_name)} — ${THERAPY_TYPES.find(t => t.value === form.therapy_type)?.label}`,
      message: summary,
      message_type: form.adverse_reactions ? "adverse_event" : "general",
      is_urgent: form.patient_tolerance === "poor" || !!form.adverse_reactions,
    }).catch(() => {}); // Don't block on message send failure

    setNotes(prev => [data, ...prev]);
    setDialogOpen(false);
    setSubmitting(false);
    toast.success("Session note saved & sent to doctor!");
  };

  if (loading) {
    return <div className="grid min-h-[400px] place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-emerald-600" /> AI Session Notes
        </h1>
        <p className="text-sm text-muted-foreground">
          Document Panchakarma sessions with AYUSH-standard fields. Notes are auto-sent to the prescribing doctor.
        </p>
      </div>

      {/* Privacy & Doctor Instruction Notice */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
        <CardContent className="py-3 px-4">
          <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 shrink-0" />
            {DOCTOR_INSTRUCTION_NOTICE}
          </p>
        </CardContent>
      </Card>

      {/* Completed Sessions needing notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" /> Recent Completed Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No completed sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {completedSessions.map(s => {
                const hasNote = notes.some(n => n.session_id === s.id);
                return (
                  <div key={s.id} className="flex items-center justify-between border rounded-lg p-3 hover:border-primary/30 transition">
                    <div>
                      <p className="font-medium text-sm">{maskPatientName(s.patient_name)}</p>
                      <p className="text-xs text-muted-foreground">{s.therapy_name} · {s.scheduled_date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNote ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <Check className="mr-1 h-3 w-3" /> Note Added
                        </Badge>
                      ) : (
                        <Button size="sm" onClick={() => startNote(s)}>
                          <Sparkles className="mr-1 h-3.5 w-3.5" /> Create Note
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Notes History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" /> Note History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No notes created yet. Start by documenting a completed session above.</p>
          ) : notes.map(note => (
            <Collapsible key={note.id}>
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{maskPatientName(note.patient_name)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {THERAPY_TYPES.find(t => t.value === note.therapy_type)?.label || note.therapy_type}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {new Date(note.created_at).toLocaleDateString()}
                      </Badge>
                      {note.sent_to_doctor && (
                        <Badge className={`text-[10px] ${note.doctor_acknowledged ? "bg-green-500" : "bg-amber-500"} text-white`}>
                          {note.doctor_acknowledged ? "Doctor Acknowledged" : "Sent to Doctor"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-3 pt-3 border-t">
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {note.ai_generated_summary || "No summary available"}
                  </pre>
                  {note.doctor_response && (
                    <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Doctor's Response:</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{note.doctor_response}</p>
                    </div>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </CardContent>
      </Card>

      {/* Note Creation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <Sparkles className="h-5 w-5" /> Session Note — {maskPatientName(selectedSession?.patient_name || "")}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="clinical" className="mt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="clinical">Clinical</TabsTrigger>
              <TabsTrigger value="charaka">Charaka-Style</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="doctor">Doctor Note</TabsTrigger>
            </TabsList>

            {/* Tab 1: Clinical Assessment */}
            <TabsContent value="clinical" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Therapy Type</Label>
                  <Select value={form.therapy_type} onValueChange={v => setForm(f => ({ ...f, therapy_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {THERAPY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prakriti Observed</Label>
                  <Select value={form.prakriti_observed} onValueChange={v => setForm(f => ({ ...f, prakriti_observed: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vata_dominant">Vata Dominant</SelectItem>
                      <SelectItem value="pitta_dominant">Pitta Dominant</SelectItem>
                      <SelectItem value="kapha_dominant">Kapha Dominant</SelectItem>
                      <SelectItem value="vata_pitta">Vata-Pitta</SelectItem>
                      <SelectItem value="pitta_kapha">Pitta-Kapha</SelectItem>
                      <SelectItem value="vata_kapha">Vata-Kapha</SelectItem>
                      <SelectItem value="tridosha">Tridosha (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dosha Sliders */}
              <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                <p className="text-sm font-medium">Dosha Assessment (0-10)</p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-14 text-blue-600 font-medium">Vata: {form.dosha_vata}</span>
                    <Slider value={[form.dosha_vata]} onValueChange={([v]) => setForm(f => ({ ...f, dosha_vata: v }))} max={10} step={1} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-14 text-red-600 font-medium">Pitta: {form.dosha_pitta}</span>
                    <Slider value={[form.dosha_pitta]} onValueChange={([v]) => setForm(f => ({ ...f, dosha_pitta: v }))} max={10} step={1} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-14 text-green-600 font-medium">Kapha: {form.dosha_kapha}</span>
                    <Slider value={[form.dosha_kapha]} onValueChange={([v]) => setForm(f => ({ ...f, dosha_kapha: v }))} max={10} step={1} className="flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Agni Status</Label>
                  <Select value={form.agni_status} onValueChange={v => setForm(f => ({ ...f, agni_status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {AGNI_OPTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ama Status</Label>
                  <Select value={form.ama_status} onValueChange={v => setForm(f => ({ ...f, ama_status: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {AMA_OPTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Therapy Response</Label>
                  <Select value={form.therapy_response} onValueChange={v => setForm(f => ({ ...f, therapy_response: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient Tolerance</Label>
                  <Select value={form.patient_tolerance} onValueChange={v => setForm(f => ({ ...f, patient_tolerance: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {TOLERANCE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Procedure Notes</Label>
                <Textarea value={form.procedure_notes} onChange={e => setForm(f => ({ ...f, procedure_notes: e.target.value }))} rows={3} placeholder="Describe the procedure performed..." />
              </div>
              <div>
                <Label>Observations</Label>
                <Textarea value={form.observations} onChange={e => setForm(f => ({ ...f, observations: e.target.value }))} rows={2} placeholder="Key observations during therapy..." />
              </div>
            </TabsContent>

            {/* Tab 2: Charaka-Style */}
            <TabsContent value="charaka" className="space-y-4 mt-4">
              <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Charaka Samhita Documentation Style
                  </p>
                  <div>
                    <Label>Rogi Bala (Patient Strength)</Label>
                    <Select value={form.rogi_bala} onValueChange={v => setForm(f => ({ ...f, rogi_bala: v }))}>
                      <SelectTrigger><SelectValue placeholder="Assess patient strength..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pravara">Pravara (Excellent)</SelectItem>
                        <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                        <SelectItem value="avara">Avara (Weak)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Roga Bala (Disease Strength)</Label>
                    <Select value={form.roga_bala} onValueChange={v => setForm(f => ({ ...f, roga_bala: v }))}>
                      <SelectTrigger><SelectValue placeholder="Assess disease strength..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pravara">Pravara (Severe)</SelectItem>
                        <SelectItem value="madhyama">Madhyama (Moderate)</SelectItem>
                        <SelectItem value="avara">Avara (Mild)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vyadhi Assessment</Label>
                    <Textarea value={form.vyadhi_assessment} onChange={e => setForm(f => ({ ...f, vyadhi_assessment: e.target.value }))} rows={2} placeholder="Disease assessment in Ayurvedic terminology..." />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pulse Before Therapy</Label>
                  <Input value={form.pulse_before} onChange={e => setForm(f => ({ ...f, pulse_before: e.target.value }))} placeholder="e.g., Vata-type, rapid" />
                </div>
                <div>
                  <Label>Pulse After Therapy</Label>
                  <Input value={form.pulse_after} onChange={e => setForm(f => ({ ...f, pulse_after: e.target.value }))} placeholder="e.g., Calmer, more balanced" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Skin Response</Label>
                  <Input value={form.skin_response} onChange={e => setForm(f => ({ ...f, skin_response: e.target.value }))} placeholder="e.g., Good absorption, slight redness" />
                </div>
                <div>
                  <Label>Sweat Response</Label>
                  <Input value={form.sweat_response} onChange={e => setForm(f => ({ ...f, sweat_response: e.target.value }))} placeholder="e.g., Mild perspiration after 15 min" />
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Materials */}
            <TabsContent value="materials" className="space-y-4 mt-4">
              <div>
                <Label>Oil / Decoction Used</Label>
                <Input value={form.oil_decoction_used} onChange={e => setForm(f => ({ ...f, oil_decoction_used: e.target.value }))} placeholder="e.g., Dhanwantharam Tailam, Ksheerabala" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Quantity</Label>
                  <Input value={form.quantity_used} onChange={e => setForm(f => ({ ...f, quantity_used: e.target.value }))} placeholder="e.g., 200ml" />
                </div>
                <div>
                  <Label>Temperature</Label>
                  <Select value={form.temperature} onValueChange={v => setForm(f => ({ ...f, temperature: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {TEMPERATURE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration_applied} onChange={e => setForm(f => ({ ...f, duration_applied: e.target.value }))} placeholder="45" />
                </div>
              </div>
              <div>
                <Label>After-Care Instructions</Label>
                <Textarea value={form.after_care_instructions} onChange={e => setForm(f => ({ ...f, after_care_instructions: e.target.value }))} rows={3} placeholder="Rest for 30 min, avoid cold water, light diet..." />
              </div>
              <div>
                <Label className="text-red-600">Adverse Reactions (if any)</Label>
                <Textarea value={form.adverse_reactions} onChange={e => setForm(f => ({ ...f, adverse_reactions: e.target.value }))} rows={2} placeholder="Report any adverse reactions — this will flag the doctor..." className="border-red-200 focus:border-red-400" />
              </div>
            </TabsContent>

            {/* Tab 4: Doctor Communication */}
            <TabsContent value="doctor" className="space-y-4 mt-4">
              <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <Send className="h-3.5 w-3.5" /> This note will be sent to the prescribing doctor
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The doctor will be notified immediately if you flag adverse reactions or poor tolerance.
                  </p>
                </CardContent>
              </Card>
              <div>
                <Label>Recommendations / Questions for Doctor</Label>
                <Textarea value={form.recommendations_for_doctor} onChange={e => setForm(f => ({ ...f, recommendations_for_doctor: e.target.value }))} rows={4} placeholder="e.g., Suggest reducing oil temperature for next session. Patient reported discomfort during lateral position..." />
              </div>

              {/* AI Summary Preview */}
              <div>
                <Button variant="outline" onClick={generatePreview} className="w-full">
                  <Sparkles className="mr-2 h-4 w-4 text-amber-500" /> Generate AI Summary Preview
                </Button>
                {previewSummary && (
                  <pre className="mt-3 text-xs whitespace-pre-wrap bg-muted/50 p-3 rounded-lg border">
                    {previewSummary}
                  </pre>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitNote} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit & Notify Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TherapistSessionNotes;
