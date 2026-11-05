import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Mic, Square, Upload, Sparkles, Loader2, CheckCircle2, Video,
  ClipboardList, Stethoscope, Pill, HeartPulse,
} from "lucide-react";
import { toast } from "sonner";

type EMR = {
  transcript?: string;
  chief_complaint?: string;
  history?: string;
  examination?: string;
  vitals?: { bp?: string; pulse?: string; temperature?: string; weight?: string; spo2?: string };
  assessment?: string;
  plan?: string;
  prescription?: string;
  advice?: string;
  follow_up_date?: string;
};

const blank = {
  subjective: "",
  objective: "",
  vitals_bp: "", vitals_pulse: "", vitals_temp: "", vitals_weight: "", vitals_spo2: "",
  prakriti: "", vikriti: "", nadi: "", agni: "",
  assessment: "", diagnosis: "", plan: "",
  prescription: "", advice: "", follow_up_date: "",
  transcript: "",
};

const ConsultationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appt, setAppt] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [preForm, setPreForm] = useState<any>(null);
  const [me, setMe] = useState<{ id: string; isDoctor: boolean } | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [isRecording, setIsRecording] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [completing, setCompleting] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user || !id) return;

      const { data: a } = await (supabase as any)
        .from("appointments").select("*").eq("id", id).maybeSingle();
      if (!a) { toast.error("Appointment not found"); return; }
      setAppt(a);
      setMe({ id: auth.user.id, isDoctor: auth.user.id === a.doctor_id });

      const [{ data: pat }, { data: doc }, { data: pf }, { data: existing }] = await Promise.all([
        (supabase as any).from("profiles").select("user_id, full_name, phone").eq("user_id", a.user_id).maybeSingle(),
        (supabase as any).from("profiles").select("user_id, full_name").eq("user_id", a.doctor_id).maybeSingle(),
        (supabase as any).from("pre_consultation_forms").select("*").eq("appointment_id", id).maybeSingle(),
        (supabase as any).from("consultation_assessments").select("*").eq("appointment_id", id).maybeSingle(),
      ]);
      setPatient(pat); setDoctor(doc); setPreForm(pf);

      if (existing) {
        setForm((f) => ({
          ...f,
          subjective: existing.subjective || "",
          objective: existing.objective || "",
          vitals_bp: existing.vitals?.bp || "",
          vitals_pulse: existing.vitals?.pulse || "",
          vitals_temp: existing.vitals?.temperature || "",
          vitals_weight: existing.vitals?.weight || "",
          vitals_spo2: existing.vitals?.spo2 || "",
          prakriti: existing.vitals?.prakriti || "",
          vikriti: existing.vitals?.vikriti || "",
          nadi: existing.vitals?.nadi || "",
          agni: existing.vitals?.agni || "",
          assessment: existing.assessment || "",
          diagnosis: existing.diagnosis || "",
          plan: existing.plan || "",
          prescription: existing.prescription || "",
          advice: existing.advice || "",
          follow_up_date: existing.follow_up_date || "",
        }));
      }
    };
    load();
  }, [id]);

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
      subjective: emr.chief_complaint
        ? [emr.chief_complaint, emr.history].filter(Boolean).join("\n\n")
        : f.subjective,
      objective: emr.examination || f.objective,
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
  };

  const runScribeFromAudio = async (blob: Blob) => {
    setAiBusy(true);
    try {
      const audioBase64 = await fileToBase64(blob);
      const { data, error } = await supabase.functions.invoke("ai-scribe", {
        body: { mode: "audio", audioBase64, language: "en" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      applyEMR(data.emr);
      toast.success("EMR drafted from audio — review & edit");
    } catch (e: any) { toast.error(e.message || "AI scribe failed"); }
    finally { setAiBusy(false); }
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
    } catch { toast.error("Mic permission denied"); }
  };

  const stopRecording = () => { mediaRecRef.current?.stop(); setIsRecording(false); };

  const onAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runScribeFromAudio(file);
    e.target.value = "";
  };

  const completeConsultation = async () => {
    if (!appt || !me) return;
    setCompleting(true);
    try {
      const vitals = {
        bp: form.vitals_bp, pulse: form.vitals_pulse, temperature: form.vitals_temp,
        weight: form.vitals_weight, spo2: form.vitals_spo2,
        prakriti: form.prakriti, vikriti: form.vikriti, nadi: form.nadi, agni: form.agni,
      };
      const payload = {
        appointment_id: appt.id,
        doctor_user_id: appt.doctor_id,
        patient_user_id: appt.user_id,
        subjective: form.subjective || null,
        objective: form.objective || null,
        vitals,
        assessment: form.assessment || null,
        diagnosis: form.diagnosis || form.assessment || null,
        plan: form.plan || null,
        prescription: form.prescription || null,
        advice: form.advice || null,
        follow_up_date: form.follow_up_date || null,
      };

      const { data: existing } = await (supabase as any)
        .from("consultation_assessments").select("id").eq("appointment_id", appt.id).maybeSingle();

      const { error } = existing
        ? await (supabase as any).from("consultation_assessments").update(payload).eq("id", existing.id)
        : await (supabase as any).from("consultation_assessments").insert(payload);
      if (error) throw error;

      await (supabase as any).from("appointments").update({ status: "completed" }).eq("id", appt.id);

      // Best-effort WhatsApp summary
      if (patient?.phone) {
        const summaryUrl = `${window.location.origin}/dashboard/appointments`;
        const message = `Namaste ${patient.full_name || "Patient"}, your consultation with Dr. ${doctor?.full_name || ""} is complete.\n\nDiagnosis: ${form.diagnosis || form.assessment || "—"}\nRx: ${form.prescription?.slice(0, 150) || "—"}\nAdvice: ${form.advice?.slice(0, 150) || "—"}\n\nFull summary: ${summaryUrl}`;
        try {
          await supabase.functions.invoke("send-whatsapp", {
            body: { to: patient.phone, message },
          });
        } catch { /* non-blocking */ }
      }

      toast.success("Consultation completed & summary sent");
      navigate(me.isDoctor ? "/vaidya/upcoming-appointments" : "/dashboard/appointments");
    } catch (e: any) {
      toast.error(e.message || "Failed to complete");
    } finally { setCompleting(false); }
  };

  if (!appt || !me) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-slate-950 text-slate-200">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const joinUrl = appt.zoom_start_url || "";

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" className="text-slate-300 hover:text-white"
            onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Exit
          </Button>
          <div>
            <p className="text-sm font-semibold">Consultation Room</p>
            <p className="text-xs text-slate-400">
              {patient?.full_name || "Patient"} · {appt.appointment_date} {appt.time_slot}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {me.isDoctor && <Badge variant="outline" className="border-emerald-500/40 text-emerald-300">Doctor view</Badge>}
          <Badge variant="outline" className="border-slate-700 text-slate-300">{appt.mode}</Badge>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* LEFT — Video + pre-form brief */}
        <div className={`flex flex-col ${me.isDoctor ? "lg:w-1/2" : "lg:w-full"} border-b border-slate-800 lg:border-b-0 lg:border-r`}>
          <div className="relative flex-1 bg-black">
            {joinUrl ? (
              <iframe
                src={joinUrl}
                title="Video consultation"
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="h-full w-full border-0"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-center">
                <div>
                  <Video className="mx-auto h-12 w-12 text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">Video link not configured for this appointment.</p>
                  <p className="text-xs text-slate-500">Add a Zoom join URL in the appointment details.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pre-form brief */}
          <div className="max-h-64 overflow-y-auto border-t border-slate-800 bg-slate-900/60 p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <ClipboardList className="h-3.5 w-3.5" /> Patient pre-consultation brief
            </p>
            {!preForm ? (
              <p className="text-xs text-slate-500">Patient has not submitted the pre-consultation form.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                <div><span className="text-slate-500">Chief complaint:</span> <span className="text-slate-200">{preForm.chief_complaint || "—"}</span></div>
                <div><span className="text-slate-500">Duration:</span> <span className="text-slate-200">{preForm.duration || "—"}</span></div>
                <div><span className="text-slate-500">Severity:</span> <span className="text-slate-200">{preForm.severity || "—"}</span></div>
                <div><span className="text-slate-500">Allergies:</span> <span className="text-slate-200">{preForm.allergies || "—"}</span></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Current meds:</span> <span className="text-slate-200">{preForm.current_medications || "—"}</span></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Medical history:</span> <span className="text-slate-200">{preForm.medical_history || "—"}</span></div>
                <div className="sm:col-span-2"><span className="text-slate-500">Lifestyle:</span> <span className="text-slate-200">{preForm.lifestyle_notes || "—"}</span></div>
                {preForm.symptoms?.length ? (
                  <div className="sm:col-span-2 flex flex-wrap gap-1">
                    {preForm.symptoms.map((s: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-200">{s}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Doctor EMR panel */}
        {me.isDoctor && (
          <div className="flex flex-col lg:w-1/2 overflow-hidden">
            {/* AI Scribe bar */}
            <Card className="m-3 border-emerald-500/30 bg-emerald-500/5 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-200">AI Scribe</p>
                {!isRecording ? (
                  <Button size="sm" type="button" onClick={startRecording} disabled={aiBusy}>
                    <Mic className="mr-1 h-4 w-4" /> Record
                  </Button>
                ) : (
                  <Button size="sm" type="button" variant="destructive" onClick={stopRecording}>
                    <Square className="mr-1 h-4 w-4" /> Stop & transcribe
                  </Button>
                )}
                <Label htmlFor="room-audio" className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Label>
                <Input id="room-audio" type="file" accept="audio/*" className="hidden" onChange={onAudioFile} />
                {aiBusy && <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />}
                {isRecording && <span className="text-xs text-red-400 animate-pulse">● recording</span>}
              </div>
            </Card>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <Tabs defaultValue="soap" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-900">
                  <TabsTrigger value="soap"><ClipboardList className="mr-1 h-3.5 w-3.5" /> SOAP</TabsTrigger>
                  <TabsTrigger value="assess"><Stethoscope className="mr-1 h-3.5 w-3.5" /> Assessment</TabsTrigger>
                  <TabsTrigger value="rx"><Pill className="mr-1 h-3.5 w-3.5" /> Rx</TabsTrigger>
                  <TabsTrigger value="adv"><HeartPulse className="mr-1 h-3.5 w-3.5" /> Advice</TabsTrigger>
                </TabsList>

                <TabsContent value="soap" className="space-y-3 pt-3">
                  <div>
                    <Label className="text-slate-300">Subjective</Label>
                    <Textarea rows={4} value={form.subjective}
                      onChange={(e) => setForm({ ...form, subjective: e.target.value })}
                      className="bg-slate-900 border-slate-700" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Objective / Examination</Label>
                    <Textarea rows={3} value={form.objective}
                      onChange={(e) => setForm({ ...form, objective: e.target.value })}
                      className="bg-slate-900 border-slate-700" />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div><Label className="text-xs text-slate-400">BP</Label><Input value={form.vitals_bp} onChange={(e) => setForm({ ...form, vitals_bp: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-xs text-slate-400">Pulse</Label><Input value={form.vitals_pulse} onChange={(e) => setForm({ ...form, vitals_pulse: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-xs text-slate-400">Temp</Label><Input value={form.vitals_temp} onChange={(e) => setForm({ ...form, vitals_temp: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-xs text-slate-400">Wt</Label><Input value={form.vitals_weight} onChange={(e) => setForm({ ...form, vitals_weight: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-xs text-slate-400">SpO₂</Label><Input value={form.vitals_spo2} onChange={(e) => setForm({ ...form, vitals_spo2: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                  </div>
                </TabsContent>

                <TabsContent value="assess" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-slate-300">Prakriti</Label><Input placeholder="e.g. Vata-Pitta" value={form.prakriti} onChange={(e) => setForm({ ...form, prakriti: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-slate-300">Vikriti</Label><Input placeholder="e.g. Pitta vitiation" value={form.vikriti} onChange={(e) => setForm({ ...form, vikriti: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-slate-300">Nadi (pulse)</Label><Input placeholder="e.g. Vata-Pitta, jerky" value={form.nadi} onChange={(e) => setForm({ ...form, nadi: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                    <div><Label className="text-slate-300">Agni (digestion)</Label><Input placeholder="e.g. Vishama / Tikshna" value={form.agni} onChange={(e) => setForm({ ...form, agni: e.target.value })} className="bg-slate-900 border-slate-700" /></div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Assessment / Diagnosis</Label>
                    <Textarea rows={3} value={form.assessment}
                      onChange={(e) => setForm({ ...form, assessment: e.target.value, diagnosis: e.target.value })}
                      className="bg-slate-900 border-slate-700" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Plan</Label>
                    <Textarea rows={3} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="bg-slate-900 border-slate-700" />
                  </div>
                </TabsContent>

                <TabsContent value="rx" className="space-y-3 pt-3">
                  <div>
                    <Label className="text-slate-300">Prescription (Rx)</Label>
                    <Textarea rows={10} placeholder="Sudarshan ghan vati 2 tabs TID after food x 5 days&#10;Tulsi kashayam 15ml BD"
                      value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                      className="bg-slate-900 border-slate-700 font-mono text-sm" />
                  </div>
                </TabsContent>

                <TabsContent value="adv" className="space-y-3 pt-3">
                  <div>
                    <Label className="text-slate-300">Advice (Pathya / lifestyle)</Label>
                    <Textarea rows={6} value={form.advice} onChange={(e) => setForm({ ...form, advice: e.target.value })} className="bg-slate-900 border-slate-700" />
                  </div>
                  <div>
                    <Label className="text-slate-300">Follow-up date</Label>
                    <Input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className="bg-slate-900 border-slate-700" />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="border-t border-slate-800 bg-slate-900/80 p-3">
              <Button className="w-full" size="lg" onClick={completeConsultation} disabled={completing}>
                {completing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Complete consultation & send summary
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoom;
