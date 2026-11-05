import { useEffect, useRef, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, ClipboardList, Mic, Square, Upload, Sparkles, Brain, ShieldCheck, Loader2, Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  startAyuzeePdf, addTitle, addPlainTable, addSectionTable, addParagraph,
  finalizeAyuzeePdf, safeFileName,
} from "@/lib/pdf/ayuzeePdf";
import SuggestionField from "@/components/hms/SuggestionField";
import { AiPrescriptionDraftDialog } from "@/components/ai/AiPrescriptionDraftDialog";

const LANGS = [
  { v: "en", l: "English" }, { v: "hi", l: "Hindi" }, { v: "ta", l: "Tamil" },
  { v: "te", l: "Telugu" }, { v: "mr", l: "Marathi" },
];

type EMR = {
  transcript?: string; chief_complaint?: string; history?: string; examination?: string;
  vitals?: { bp?: string; pulse?: string; temperature?: string; weight?: string; spo2?: string };
  assessment?: string; plan?: string; prescription?: string; advice?: string; follow_up_date?: string;
};

const blankForm = {
  patient_id: "", visit_date: new Date().toISOString().slice(0, 10),
  chief_complaint: "", history: "", examination: "",
  vitals_bp: "", vitals_pulse: "", vitals_temp: "", vitals_weight: "", vitals_spo2: "",
  assessment: "", plan: "", prescription: "", advice: "",
  diagnosis: "", follow_up_date: "", fee: "", notes: "",
  abha_id: "", source_language: "en", transcript: "",
};

const Consultations = () => {
  const { userId } = useDoctor();
  const [items, setItems] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...blankForm });
  const [scribeText, setScribeText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [aiBusy, setAiBusy] = useState<"" | "scribe" | "cds" | "abha">("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [cds, setCds] = useState<any>(null);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const load = async () => {
    if (!userId) return;
    const [{ data: cons }, { data: pts }] = await Promise.all([
      (supabase as any).from("vaidya_consultations").select("*").eq("doctor_user_id", userId).order("visit_date", { ascending: false }),
      (supabase as any).from("vaidya_patients").select("id, full_name").eq("doctor_user_id", userId),
    ]);
    setItems(cons ?? []);
    setPatients(pts ?? []);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const resetForm = () => {
    setForm({ ...blankForm }); setScribeText(""); setCds(null); setAiGenerated(false);
  };

  const fileToBase64 = (blob: Blob): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onloadend = () => res((r.result as string).split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(blob);
    });

  const applyEMR = (emr: EMR) => {
    setForm((f) => ({
      ...f,
      chief_complaint: emr.chief_complaint || f.chief_complaint,
      history: emr.history || f.history,
      examination: emr.examination || f.examination,
      vitals_bp: emr.vitals?.bp || f.vitals_bp,
      vitals_pulse: emr.vitals?.pulse || f.vitals_pulse,
      vitals_temp: emr.vitals?.temperature || f.vitals_temp,
      vitals_weight: emr.vitals?.weight || f.vitals_weight,
      vitals_spo2: emr.vitals?.spo2 || f.vitals_spo2,
      assessment: emr.assessment || f.assessment,
      diagnosis: emr.assessment || f.diagnosis,
      plan: emr.plan || f.plan,
      prescription: emr.prescription || f.prescription,
      advice: emr.advice || f.advice,
      follow_up_date: emr.follow_up_date || f.follow_up_date,
      transcript: emr.transcript || f.transcript,
    }));
    setAiGenerated(true);
  };

  const runScribeFromText = async () => {
    if (!scribeText.trim()) return toast.error("Type or paste consultation notes first");
    setAiBusy("scribe");
    try {
      const { data, error } = await supabase.functions.invoke("ai-scribe", {
        body: { mode: "text", text: scribeText, language: form.source_language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      applyEMR(data.emr);
      toast.success("EMR drafted by AI — review & edit");
    } catch (e: any) { toast.error(e.message || "AI scribe failed"); }
    finally { setAiBusy(""); }
  };

  const runScribeFromAudio = async (blob: Blob) => {
    setAiBusy("scribe");
    try {
      const audioBase64 = await fileToBase64(blob);
      const { data, error } = await supabase.functions.invoke("ai-scribe", {
        body: { mode: "audio", audioBase64, language: form.source_language },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      applyEMR(data.emr);
      toast.success("Audio transcribed & EMR drafted");
    } catch (e: any) { toast.error(e.message || "AI scribe failed"); }
    finally { setAiBusy(""); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        runScribeFromAudio(blob);
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
    } catch (e: any) { toast.error("Mic permission denied"); }
  };

  const stopRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
  };

  const onAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runScribeFromAudio(file);
    e.target.value = "";
  };

  const runCDS = async () => {
    setAiBusy("cds");
    try {
      const { data, error } = await supabase.functions.invoke("ai-cds", {
        body: {
          chief_complaint: form.chief_complaint, history: form.history,
          examination: form.examination, assessment: form.assessment,
          prescription: form.prescription, prakriti: "",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCds(data.suggestions);
      toast.success("Clinical suggestions ready");
    } catch (e: any) { toast.error(e.message || "CDS failed"); }
    finally { setAiBusy(""); }
  };

  const submit = async () => {
    if (!userId) return;
    if (!form.patient_id) return toast.error("Select a patient");
    const vitals = {
      bp: form.vitals_bp, pulse: form.vitals_pulse, temperature: form.vitals_temp,
      weight: form.vitals_weight, spo2: form.vitals_spo2,
    };
    const { data: inserted, error } = await (supabase as any).from("vaidya_consultations").insert({
      doctor_user_id: userId,
      patient_id: form.patient_id,
      visit_date: form.visit_date,
      chief_complaint: form.chief_complaint || null,
      history: form.history || null,
      examination: form.examination || null,
      vitals,
      assessment: form.assessment || null,
      plan: form.plan || null,
      diagnosis: form.diagnosis || form.assessment || null,
      prescription: form.prescription || null,
      advice: form.advice || null,
      follow_up_date: form.follow_up_date || null,
      fee: form.fee ? Number(form.fee) : 0,
      notes: form.notes || null,
      transcript: form.transcript || null,
      abha_id: form.abha_id || null,
      source_language: form.source_language,
      ai_generated: aiGenerated,
      cds_suggestions: cds || {},
    }).select().single();
    if (error) return toast.error(error.message);

    if (form.abha_id && inserted) {
      try {
        await supabase.functions.invoke("abdm-link", {
          body: {
            consultation_id: inserted.id, abha_id: form.abha_id,
            patient_name: patients.find((p) => p.id === form.patient_id)?.full_name,
            fhir_payload: { resourceType: "Composition", title: "OPD Consultation", date: form.visit_date },
          },
        });
        toast.success("Consultation saved & linked to ABHA");
      } catch { toast.success("Consultation saved (ABHA push deferred)"); }
    } else {
      toast.success("Consultation saved");
    }

    setOpen(false); resetForm(); load();
  };

  const downloadConsultationPDF = (c: any) => {
    const name = patients.find((p) => p.id === c.patient_id)?.full_name ?? "Patient";
    const v = (c.vitals || {}) as any;
    const { doc } = startAyuzeePdf({
      clinicName: "Ayuzee Vaidya",
      subtitle: "OPD Consultation Record",
    });
    let y = addTitle(doc, 38, "Consultation", new Date(c.visit_date).toLocaleDateString("en-IN"));
    y = addPlainTable(doc, y, [
      ["Patient", name],
      ["Visit date", new Date(c.visit_date).toLocaleDateString("en-IN")],
      ["Chief complaint", c.chief_complaint || "—"],
      ["Diagnosis", c.diagnosis || c.assessment || "—"],
      ["Follow-up", c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString("en-IN") : "—"],
      ["Fee", c.fee ? `₹${c.fee}` : "—"],
      ["ABHA ID", c.abha_id || "—"],
    ]);
    const vitalsRows: (string | number)[][] = [];
    if (v.bp) vitalsRows.push(["BP", v.bp]);
    if (v.pulse) vitalsRows.push(["Pulse", v.pulse]);
    if (v.temperature) vitalsRows.push(["Temp", v.temperature]);
    if (v.weight) vitalsRows.push(["Weight", v.weight]);
    if (v.spo2) vitalsRows.push(["SpO₂", v.spo2]);
    if (vitalsRows.length) {
      y = addSectionTable(doc, y, {
        title: "Vitals",
        body: vitalsRows,
        columnStyles: { 0: { cellWidth: 40, fontStyle: "bold" } },
      });
    }
    if (c.history) y = addParagraph(doc, y, "History", c.history);
    if (c.examination) y = addParagraph(doc, y, "Examination", c.examination);
    if (c.assessment) y = addParagraph(doc, y, "Assessment / Diagnosis", c.assessment);
    if (c.prescription) y = addParagraph(doc, y, "Prescription (Rx)", c.prescription);
    if (c.plan) y = addParagraph(doc, y, "Plan", c.plan);
    if (c.advice) y = addParagraph(doc, y, "Advice (Pathya)", c.advice);
    if (c.notes) y = addParagraph(doc, y, "Notes", c.notes);
    finalizeAyuzeePdf(
      doc,
      `Consultation-${safeFileName(name)}-${c.visit_date}.pdf`,
      "Generated by Ayuzee Vaidya",
    );
    toast.success("PDF downloaded");
  };

  const filtered = items.filter((i) => {
    if (!q.trim()) return true;
    const name = patients.find((p) => p.id === i.patient_id)?.full_name?.toLowerCase() ?? "";
    const term = q.toLowerCase();
    return name.includes(term) || (i.diagnosis ?? "").toLowerCase().includes(term) || (i.chief_complaint ?? "").toLowerCase().includes(term);
  });

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">AI-Powered Consultation EMR</h1>
            <p className="text-xs text-muted-foreground">Voice-to-prescription · Multi-language · Clinical decision support · ABHA-ready</p>
          </div>
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-1 h-4 w-4" /> New Consultation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  New consultation
                  {aiGenerated && <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI-drafted</Badge>}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="ai" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ai"><Sparkles className="mr-1 h-3.5 w-3.5" /> AI Scribe</TabsTrigger>
                  <TabsTrigger value="emr">EMR</TabsTrigger>
                  <TabsTrigger value="cds"><Brain className="mr-1 h-3.5 w-3.5" /> CDS</TabsTrigger>
                  <TabsTrigger value="abha"><ShieldCheck className="mr-1 h-3.5 w-3.5" /> ABHA</TabsTrigger>
                </TabsList>

                {/* AI SCRIBE TAB */}
                <TabsContent value="ai" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Patient *</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.patient_id}
                        onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                        <option value="">— Select patient —</option>
                        {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Input language</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.source_language}
                        onChange={(e) => setForm({ ...form, source_language: e.target.value })}>
                        {LANGS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
                      </select>
                    </div>
                  </div>

                  <Card className="border-primary/30 bg-primary/5 p-3">
                    <p className="mb-2 text-xs font-medium">🎙️ Record consultation audio</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {!isRecording ? (
                        <Button size="sm" type="button" onClick={startRecording} disabled={aiBusy === "scribe"}>
                          <Mic className="mr-1 h-4 w-4" /> Start recording
                        </Button>
                      ) : (
                        <Button size="sm" type="button" variant="destructive" onClick={stopRecording}>
                          <Square className="mr-1 h-4 w-4" /> Stop & transcribe
                        </Button>
                      )}
                      <span className="text-xs text-muted-foreground">or</span>
                      <Label htmlFor="audio-upload" className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent">
                        <Upload className="h-4 w-4" /> Upload audio
                      </Label>
                      <Input id="audio-upload" type="file" accept="audio/*" className="hidden" onChange={onAudioFile} />
                      {aiBusy === "scribe" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                    {isRecording && <p className="mt-2 text-xs text-destructive animate-pulse">● Recording… speak naturally in {LANGS.find(l => l.v === form.source_language)?.l}</p>}
                  </Card>

                  <div>
                    <Label>Or paste/type rough notes</Label>
                    <Textarea rows={5} value={scribeText} onChange={(e) => setScribeText(e.target.value)}
                      placeholder="e.g. 35yo male, 5 days fever, headache, body ache, no cough. BP 120/80 pulse 88. Likely viral fever, Pitta-Vata vitiation. Rx Sudarshan ghan vati 2 tabs TID after food x 5 days, Tulsi kashayam 15ml BD..." />
                    <Button type="button" size="sm" className="mt-2" onClick={runScribeFromText} disabled={aiBusy === "scribe" || !scribeText.trim()}>
                      {aiBusy === "scribe" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
                      Generate EMR from text
                    </Button>
                  </div>

                  {form.transcript && (
                    <Card className="bg-muted/50 p-3">
                      <p className="text-xs font-semibold">Transcript</p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-4">{form.transcript}</p>
                    </Card>
                  )}
                </TabsContent>

                {/* EMR TAB */}
                <TabsContent value="emr" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Visit date</Label><Input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} /></div>
                    <div><Label>Fee (₹)</Label><Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} /></div>
                  </div>
                  <div><Label>Chief complaint</Label><SuggestionField type="chief_complaint" value={form.chief_complaint} onChange={(v) => setForm({ ...form, chief_complaint: v })} placeholder="Start typing or use a short code (e.g. bkp + space)" /></div>
                  <div><Label>History of present illness</Label><SuggestionField as="textarea" rows={2} type="chief_complaint" value={form.history} onChange={(v) => setForm({ ...form, history: v })} /></div>
                  <div><Label>Examination</Label><SuggestionField as="textarea" rows={2} type="examination" value={form.examination} onChange={(v) => setForm({ ...form, examination: v })} /></div>
                  <div className="grid grid-cols-5 gap-2">
                    <div><Label className="text-xs">BP</Label><Input value={form.vitals_bp} onChange={(e) => setForm({ ...form, vitals_bp: e.target.value })} /></div>
                    <div><Label className="text-xs">Pulse</Label><Input value={form.vitals_pulse} onChange={(e) => setForm({ ...form, vitals_pulse: e.target.value })} /></div>
                    <div><Label className="text-xs">Temp</Label><Input value={form.vitals_temp} onChange={(e) => setForm({ ...form, vitals_temp: e.target.value })} /></div>
                    <div><Label className="text-xs">Weight</Label><Input value={form.vitals_weight} onChange={(e) => setForm({ ...form, vitals_weight: e.target.value })} /></div>
                    <div><Label className="text-xs">SpO2</Label><Input value={form.vitals_spo2} onChange={(e) => setForm({ ...form, vitals_spo2: e.target.value })} /></div>
                  </div>
                  <div><Label>Assessment / Diagnosis</Label><SuggestionField as="textarea" rows={2} type="diagnosis" value={form.assessment} onChange={(v) => setForm({ ...form, assessment: v, diagnosis: v })} /></div>
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Prescription (Rx)</Label>
                      {form.patient_id && (
                        <AiPrescriptionDraftDialog
                          ayushSystem="ayurveda"
                          patientRecordTable="vaidya_patients"
                          patientRecordId={form.patient_id}
                          patientDisplayName={patients.find((p) => p.id === form.patient_id)?.full_name}
                          initialDiagnosis={form.assessment || form.diagnosis}
                          initialHistorySummary={[form.history, form.examination].filter(Boolean).join("\n")}
                        />
                      )}
                    </div>
                    <SuggestionField as="textarea" rows={4} type="medicine_name" value={form.prescription} onChange={(v) => setForm({ ...form, prescription: v })} placeholder="Pick from suggestions or type a short code" />
                  </div>
                  <div><Label>Plan</Label><SuggestionField as="textarea" rows={2} type="treatment_advice" value={form.plan} onChange={(v) => setForm({ ...form, plan: v })} /></div>
                  <div><Label>Advice (pathya / lifestyle)</Label><SuggestionField as="textarea" rows={2} type="diet_advice" value={form.advice} onChange={(v) => setForm({ ...form, advice: v })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Follow-up date</Label><Input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} /></div>
                    <div><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                  </div>
                </TabsContent>

                {/* CDS TAB */}
                <TabsContent value="cds" className="space-y-3 pt-3">
                  <Button type="button" size="sm" onClick={runCDS} disabled={aiBusy === "cds"}>
                    {aiBusy === "cds" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Brain className="mr-1 h-4 w-4" />}
                    Get AI clinical suggestions
                  </Button>
                  {!cds && <p className="text-xs text-muted-foreground">Fill EMR fields first, then run CDS for differentials, drug interactions, classical refs, and red flags.</p>}
                  {cds && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold">Differentials</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          {cds.differentials?.map((d: any, i: number) => (
                            <li key={i} className="rounded border border-border p-2">
                              <span className="font-medium">{d.diagnosis}</span> <Badge variant="outline" className="ml-1">{d.dosha}</Badge>
                              <p className="text-muted-foreground">{d.rationale}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {cds.interactions?.length > 0 && (
                        <div><p className="text-sm font-semibold text-destructive">⚠️ Interactions</p>
                          <ul className="mt-1 list-inside list-disc text-xs">{cds.interactions.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>
                      )}
                      {cds.classical_refs?.length > 0 && (
                        <div><p className="text-sm font-semibold">📚 Classical references</p>
                          <ul className="mt-1 list-inside list-disc text-xs">{cds.classical_refs.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>
                      )}
                      {cds.red_flags?.length > 0 && (
                        <div><p className="text-sm font-semibold text-destructive">🚩 Red flags</p>
                          <ul className="mt-1 list-inside list-disc text-xs">{cds.red_flags.map((x: string, i: number) => <li key={i}>{x}</li>)}</ul></div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* ABHA TAB */}
                <TabsContent value="abha" className="space-y-3 pt-3">
                  <div>
                    <Label>ABHA ID (14-digit or @abdm handle)</Label>
                    <Input placeholder="91-1234-5678-9012 or username@abdm" value={form.abha_id}
                      onChange={(e) => setForm({ ...form, abha_id: e.target.value })} />
                    <p className="mt-1 text-xs text-muted-foreground">When saved, this consultation will be pushed as a FHIR record to ABDM Health Locker (sandbox stub until ABDM credentials are configured).</p>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter><Button onClick={submit}>Save consultation</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, complaint, or diagnosis" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No consultations yet. Click "New Consultation" to try the AI scribe.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const name = patients.find((p) => p.id === c.patient_id)?.full_name ?? "Patient";
            return (
              <Card key={c.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary">
                      {name}
                      {c.ai_generated && <Badge variant="secondary" className="ml-2 gap-1"><Sparkles className="h-3 w-3" /> AI</Badge>}
                      {c.abha_id && <Badge variant="outline" className="ml-1 gap-1"><ShieldCheck className="h-3 w-3" /> ABHA</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.visit_date} · {c.chief_complaint || c.diagnosis || "—"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-right text-xs text-muted-foreground">
                      {c.follow_up_date && <p>Follow-up: {c.follow_up_date}</p>}
                      {c.fee > 0 && <p>Fee: ₹{c.fee}</p>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => downloadConsultationPDF(c)}>
                      <Download className="mr-1 h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                </div>
                {c.assessment && <p className="mt-2 text-sm"><span className="font-medium">Dx:</span> {c.assessment}</p>}
                {c.prescription && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">Rx: {c.prescription}</p>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Consultations;
