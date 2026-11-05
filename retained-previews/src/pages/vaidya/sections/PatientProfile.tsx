import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useDoctor } from "@/hooks/useDoctor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Phone,
  CalendarDays,
  Activity,
  FileText,
  Upload,
  Download,
  Trash2,
  Stethoscope,
  Heart,
  Flower2,
  Plus,
  Pill,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { ReportSummaryButton } from "@/components/ai/ReportSummaryButton";
import { AiPrescriptionDraftDialog } from "@/components/ai/AiPrescriptionDraftDialog";

interface PatientHeader {
  id: string;
  source: "user" | "vaidya";
  full_name: string;
  phone: string | null;
  age: number | null;
  gender: string | null;
  address: string | null;
  notes: string | null;
}

const PatientProfile = () => {
  const { source = "vaidya", id = "" } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const { userId, doctor } = useDoctor();

  const [patient, setPatient] = useState<PatientHeader | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab data
  const [visits, setVisits] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [yogaPlans, setYogaPlans] = useState<any[]>([]);

  // File upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("lab_report");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploading, setUploading] = useState(false);

  // Vitals add
  const [vitalsOpen, setVitalsOpen] = useState(false);
  const [vForm, setVForm] = useState({
    recorded_date: new Date().toISOString().slice(0, 10),
    weight_kg: "", height_cm: "", bp_systolic: "", bp_diastolic: "",
    pulse: "", spo2: "", temperature: "", blood_sugar_fasting: "", notes: "",
  });

  const loadAll = async () => {
    if (!userId || !id) return;
    setLoading(true);

    // 1. Patient header
    if (source === "vaidya") {
      const { data } = await supabase.from("vaidya_patients").select("*").eq("id", id).maybeSingle();
      if (data) setPatient({ id: data.id, source: "vaidya", full_name: data.full_name, phone: data.phone, age: data.age, gender: data.gender, address: data.address, notes: data.notes });
    } else {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", id).maybeSingle();
      if (data) setPatient({ id: data.user_id, source: "user", full_name: data.full_name ?? "Patient", phone: data.phone ?? null, age: null, gender: null, address: null, notes: null });
    }

    // 2. Visits (appointments) — only for registered users
    if (source === "user" && doctor?.id) {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", id)
        .eq("doctor_id", doctor.id)
        .order("appointment_date", { ascending: false });
      setVisits(data ?? []);
    } else {
      setVisits([]);
    }

    // 3. Consultations (Vaidya EMR)
    const { data: cons } = await supabase
      .from("vaidya_consultations")
      .select("*")
      .eq("doctor_user_id", userId)
      .eq("patient_id", id)
      .order("visit_date", { ascending: false });
    setConsultations(cons ?? []);

    // 4. Vitals (only for user-id patients)
    if (source === "user") {
      const { data } = await supabase
        .from("patient_vitals")
        .select("*")
        .eq("user_id", id)
        .order("recorded_date", { ascending: true });
      setVitals(data ?? []);
    } else {
      setVitals([]);
    }

    // 5. Files
    const fq = supabase.from("patient_files").select("*").eq("doctor_user_id", userId);
    const { data: fdata } = source === "user"
      ? await fq.eq("patient_user_id", id).order("created_at", { ascending: false })
      : await fq.eq("vaidya_patient_id", id).order("created_at", { ascending: false });
    setFiles(fdata ?? []);

    // 6. Yoga plans
    const yq = supabase.from("yoga_plans").select("*").eq("doctor_user_id", userId);
    const { data: ydata } = source === "user"
      ? await yq.eq("patient_user_id", id).order("created_at", { ascending: false })
      : await yq.ilike("patient_name", patient?.full_name ?? "").order("created_at", { ascending: false });
    setYogaPlans(ydata ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, id, source, doctor?.id]);

  const initials = useMemo(() => {
    const name = patient?.full_name ?? "P";
    return name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  }, [patient]);

  const submitVitals = async () => {
    if (source !== "user") return toast.error("Vitals require a registered patient account");
    const payload: any = {
      user_id: id,
      recorded_date: vForm.recorded_date,
      notes: vForm.notes || null,
    };
    ["weight_kg", "height_cm", "bp_systolic", "bp_diastolic", "pulse", "spo2", "temperature", "blood_sugar_fasting"].forEach((k) => {
      if ((vForm as any)[k]) payload[k] = Number((vForm as any)[k]);
    });
    const { error } = await supabase.from("patient_vitals").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Vitals recorded");
    setVitalsOpen(false);
    setVForm({ ...vForm, weight_kg: "", bp_systolic: "", bp_diastolic: "", pulse: "", spo2: "", temperature: "", blood_sugar_fasting: "", notes: "" });
    loadAll();
  };

  const handleUpload = async () => {
    if (!uploadFile || !userId) return;
    setUploading(true);
    const ext = uploadFile.name.split(".").pop();
    const path = `${userId}/${id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("patient-files").upload(path, uploadFile);
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const insertPayload: any = {
      doctor_user_id: userId,
      file_name: uploadFile.name,
      category: uploadCategory,
      description: uploadDesc || null,
      storage_path: path,
      mime_type: uploadFile.type,
      size_bytes: uploadFile.size,
    };
    if (source === "user") insertPayload.patient_user_id = id;
    else insertPayload.vaidya_patient_id = id;
    const { error: insErr } = await supabase.from("patient_files").insert(insertPayload);
    setUploading(false);
    if (insErr) return toast.error(insErr.message);
    toast.success("File uploaded");
    setUploadOpen(false);
    setUploadFile(null);
    setUploadDesc("");
    loadAll();
  };

  const downloadFile = async (f: any) => {
    const { data, error } = await supabase.storage.from("patient-files").createSignedUrl(f.storage_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  const deleteFile = async (f: any) => {
    if (!confirm(`Delete ${f.file_name}?`)) return;
    await supabase.storage.from("patient-files").remove([f.storage_path]);
    await supabase.from("patient_files").delete().eq("id", f.id);
    toast.success("Deleted");
    loadAll();
  };

  if (loading && !patient) {
    return <div className="mx-auto max-w-6xl p-6 text-center text-sm text-muted-foreground">Loading patient…</div>;
  }
  if (!patient) {
    return (
      <div className="mx-auto max-w-6xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Patient not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/vaidya/patients")}>
          <ArrowLeft className="mr-1 h-4 w-4" />Back to patients
        </Button>
      </div>
    );
  }

  const stats = [
    { label: "Visits", value: visits.length, icon: CalendarDays, gradient: "from-primary/80 to-primary" },
    { label: "Consultations", value: consultations.length, icon: Stethoscope, gradient: "from-sky-500/80 to-sky-500" },
    { label: "Vitals logs", value: vitals.length, icon: Heart, gradient: "from-rose-500/80 to-rose-500" },
    { label: "Files", value: files.length, icon: FileText, gradient: "from-emerald-500/80 to-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{patient.full_name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {patient.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>}
                  {patient.age && <span>{patient.age} yrs</span>}
                  {patient.gender && <span className="capitalize">{patient.gender}</span>}
                  <Badge variant="outline" className="capitalize">{patient.source === "user" ? "Registered" : "Walk-in"}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">PT-{patient.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`bg-gradient-to-br ${s.gradient} p-4 text-primary-foreground`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-90">{s.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
                </div>
                <Icon className="h-7 w-7 opacity-80" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="overview"><User className="mr-1 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="visits"><CalendarDays className="mr-1 h-4 w-4" />Visits</TabsTrigger>
          <TabsTrigger value="prescriptions"><Pill className="mr-1 h-4 w-4" />Rx</TabsTrigger>
          <TabsTrigger value="vitals"><Activity className="mr-1 h-4 w-4" />Vitals</TabsTrigger>
          <TabsTrigger value="files"><FileText className="mr-1 h-4 w-4" />Files</TabsTrigger>
          <TabsTrigger value="yoga"><Flower2 className="mr-1 h-4 w-4" />Yoga</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card className="p-5">
            <h3 className="mb-3 font-semibold">Patient summary</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label className="text-xs text-muted-foreground">Full name</Label><p className="text-sm">{patient.full_name}</p></div>
              <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="text-sm">{patient.phone || "—"}</p></div>
              <div><Label className="text-xs text-muted-foreground">Age</Label><p className="text-sm">{patient.age || "—"}</p></div>
              <div><Label className="text-xs text-muted-foreground">Gender</Label><p className="text-sm capitalize">{patient.gender || "—"}</p></div>
              <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Address</Label><p className="text-sm">{patient.address || "—"}</p></div>
              {patient.notes && <div className="sm:col-span-2"><Label className="text-xs text-muted-foreground">Notes</Label><p className="text-sm whitespace-pre-wrap">{patient.notes}</p></div>}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-semibold">Latest consultation</h3>
            {consultations[0] ? (
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Date:</span> {consultations[0].visit_date}</p>
                {consultations[0].diagnosis && <p><span className="text-muted-foreground">Diagnosis:</span> {consultations[0].diagnosis}</p>}
                {consultations[0].plan && <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Plan:</span> {consultations[0].plan}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No consultations recorded yet.</p>
            )}
          </Card>
        </TabsContent>

        {/* VISITS */}
        <TabsContent value="visits" className="mt-4">
          <Card className="p-4">
            {visits.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No appointment visits found.</p>
            ) : (
              <div className="space-y-2">
                {visits.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{v.appointment_date} · {v.time_slot || "—"}</p>
                      <p className="text-xs text-muted-foreground capitalize">{v.mode || "consultation"} · ₹{v.fee ?? 0}</p>
                    </div>
                    <Badge variant={v.status === "completed" ? "default" : "outline"} className="capitalize">{v.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* PRESCRIPTIONS / Consultations */}
        <TabsContent value="prescriptions" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Prescriptions</h3>
            <AiPrescriptionDraftDialog
              ayushSystem="ayurveda"
              patientRecordTable={source === "vaidya" ? "vaidya_patients" : "profiles"}
              patientRecordId={patient.id}
              patientUserId={source === "user" ? patient.id : null}
              patientDisplayName={patient.full_name}
              initialDiagnosis={consultations[0]?.diagnosis ?? ""}
              initialHistorySummary={patient.notes ?? ""}
            />
          </div>
          <Card className="p-4">
            {consultations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No consultations yet.</p>
            ) : (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.visit_date}</p>
                      <Badge variant="outline" className="text-xs">{c.ai_generated ? "AI Scribe" : "Manual"}</Badge>
                    </div>
                    {c.diagnosis && <p className="mt-1 text-sm"><span className="text-muted-foreground">Dx:</span> {c.diagnosis}</p>}
                    {c.prescription && <p className="mt-1 whitespace-pre-wrap text-sm"><span className="text-muted-foreground">Rx:</span> {c.prescription}</p>}
                    {c.advice && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">Advice: {c.advice}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* VITALS */}
        <TabsContent value="vitals" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Vitals trend</h3>
            <Dialog open={vitalsOpen} onOpenChange={setVitalsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={source !== "user"}>
                  <Plus className="mr-1 h-4 w-4" />Add vitals
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record vitals</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>Date</Label><Input type="date" value={vForm.recorded_date} onChange={(e) => setVForm({ ...vForm, recorded_date: e.target.value })} /></div>
                  <div><Label>Weight (kg)</Label><Input type="number" value={vForm.weight_kg} onChange={(e) => setVForm({ ...vForm, weight_kg: e.target.value })} /></div>
                  <div><Label>Height (cm)</Label><Input type="number" value={vForm.height_cm} onChange={(e) => setVForm({ ...vForm, height_cm: e.target.value })} /></div>
                  <div><Label>BP Systolic</Label><Input type="number" value={vForm.bp_systolic} onChange={(e) => setVForm({ ...vForm, bp_systolic: e.target.value })} /></div>
                  <div><Label>BP Diastolic</Label><Input type="number" value={vForm.bp_diastolic} onChange={(e) => setVForm({ ...vForm, bp_diastolic: e.target.value })} /></div>
                  <div><Label>Pulse</Label><Input type="number" value={vForm.pulse} onChange={(e) => setVForm({ ...vForm, pulse: e.target.value })} /></div>
                  <div><Label>SpO2 (%)</Label><Input type="number" value={vForm.spo2} onChange={(e) => setVForm({ ...vForm, spo2: e.target.value })} /></div>
                  <div><Label>Temp (°F)</Label><Input type="number" value={vForm.temperature} onChange={(e) => setVForm({ ...vForm, temperature: e.target.value })} /></div>
                  <div><Label>Sugar (Fasting)</Label><Input type="number" value={vForm.blood_sugar_fasting} onChange={(e) => setVForm({ ...vForm, blood_sugar_fasting: e.target.value })} /></div>
                  <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={vForm.notes} onChange={(e) => setVForm({ ...vForm, notes: e.target.value })} /></div>
                </div>
                <DialogFooter><Button onClick={submitVitals}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {source !== "user" ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Vitals tracking requires a registered patient account.
            </Card>
          ) : vitals.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No vitals recorded yet.</Card>
          ) : (
            <>
              <Card className="p-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vitals.map((v) => ({
                      date: v.recorded_date,
                      Weight: v.weight_kg,
                      BP_Sys: v.bp_systolic,
                      BP_Dia: v.bp_diastolic,
                      Pulse: v.pulse,
                      SpO2: v.spo2,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Weight" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="BP_Sys" stroke="#f43f5e" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="BP_Dia" stroke="#fb923c" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="Pulse" stroke="#0ea5e9" strokeWidth={2} dot />
                      <Line type="monotone" dataKey="SpO2" stroke="#10b981" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="mb-3 text-sm font-semibold">Recent entries</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr className="border-b">
                        <th className="py-2 pr-2">Date</th>
                        <th className="py-2 pr-2">BP</th>
                        <th className="py-2 pr-2">Pulse</th>
                        <th className="py-2 pr-2">Weight</th>
                        <th className="py-2 pr-2">SpO2</th>
                        <th className="py-2 pr-2">Temp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...vitals].reverse().map((v) => (
                        <tr key={v.id} className="border-b last:border-0">
                          <td className="py-2 pr-2">{v.recorded_date}</td>
                          <td className="py-2 pr-2">{v.bp_systolic ? `${v.bp_systolic}/${v.bp_diastolic}` : "—"}</td>
                          <td className="py-2 pr-2">{v.pulse ?? "—"}</td>
                          <td className="py-2 pr-2">{v.weight_kg ?? "—"}</td>
                          <td className="py-2 pr-2">{v.spo2 ?? "—"}</td>
                          <td className="py-2 pr-2">{v.temperature ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* FILES */}
        <TabsContent value="files" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Patient files</h3>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Upload className="mr-1 h-4 w-4" />Upload</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload file</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <Label>File *</Label>
                    <Input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={uploadCategory} onValueChange={setUploadCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="scan">Scan / Imaging</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="discharge">Discharge Summary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea rows={2} value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
                    {uploading ? "Uploading…" : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {files.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No files uploaded yet.</Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((f) => (
                <Card key={f.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{f.file_name}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] capitalize">{f.category.replace("_", " ")}</Badge>
                      {f.description && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{f.description}</p>}
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString()} · {f.size_bytes ? `${Math.round(f.size_bytes / 1024)} KB` : ""}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadFile(f)}>
                      <Download className="mr-1 h-3 w-3" />Open
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteFile(f)}>
                      <Trash2 className="h-3 w-3 text-rose-500" />
                    </Button>
                  </div>
                  <div className="mt-3">
                    <ReportSummaryButton
                      bucket="patient-files"
                      path={f.storage_path}
                      fileName={f.file_name}
                      patientId={source === "user" ? id : null}
                      refTable="patient_files"
                      refId={f.id}
                      documentKind={f.category?.replace("_", " ")}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* YOGA */}
        <TabsContent value="yoga" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Yoga therapy plans</h3>
            <Button size="sm" asChild>
              <Link to="/vaidya/yoga/plans/new"><Plus className="mr-1 h-4 w-4" />New plan</Link>
            </Button>
          </div>
          {yogaPlans.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No yoga plans for this patient.</Card>
          ) : (
            <div className="space-y-2">
              {yogaPlans.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.plan_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.condition_name || p.plan_type} · {p.duration_weeks} weeks · {p.frequency_per_week}×/week
                      </p>
                    </div>
                    <Badge variant={p.status === "active" ? "default" : "outline"} className="capitalize">{p.status}</Badge>
                  </div>
                  {p.doctor_notes && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.doctor_notes}</p>}
                  <Button size="sm" variant="link" asChild className="mt-1 px-0">
                    <Link to={`/vaidya/yoga/plans/${p.id}`}>Open plan →</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
