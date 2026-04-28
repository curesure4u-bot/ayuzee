import { useEffect, useMemo, useRef, useState } from "react";
import { useDoctor } from "@/hooks/useDoctor";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Camera, Upload, Sparkles, FileText, GitCompareArrows, Activity,
  ShieldAlert, Printer, ChevronLeft, CheckCircle2, AlertTriangle, Loader2,
  User, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  analyzeLandmarks, computeScores, generateCorrectivePlan,
  type ViewAnalysis, type ViewType, type Landmark,
} from "@/lib/posture/poseAnalysis";
import { detectFromImage } from "@/lib/posture/poseDetector";
import { PostureSkeleton } from "@/components/posture/PostureSkeleton";
import { PrescriptionPrintable } from "@/components/vaidya/PrescriptionPrintable";

type Mode = "dashboard" | "new" | "report" | "compare";

interface CaptureSlot {
  view: ViewType;
  file?: File;
  url?: string;
  storagePath?: string;
  landmarks?: Landmark[] | null;
  analysis?: ViewAnalysis;
  detecting?: boolean;
}

const VIEW_ORDER: { view: ViewType; label: string; required: boolean; tip: string }[] = [
  { view: "front", label: "Front view", required: true, tip: "Face the camera, arms relaxed at sides." },
  { view: "side", label: "Side view", required: true, tip: "Turn 90° to your left, arms hanging naturally." },
  { view: "back", label: "Back view", required: true, tip: "Face away from the camera, arms relaxed." },
  { view: "walking", label: "Walking video (optional)", required: false, tip: "10-second clip walking toward and away." },
];

const ALIGNMENT_TIPS = [
  "Stand straight and relaxed",
  "Full body must be visible",
  "Feet shoulder-width apart",
  "Camera at chest height",
  "Plain, contrasting background",
  "Even, bright lighting (no shadows)",
];

const riskColor = (lvl?: string) => {
  if (!lvl) return "bg-muted text-foreground";
  if (lvl.startsWith("Good")) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";
  if (lvl.startsWith("Mild")) return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
  if (lvl.startsWith("Moderate")) return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30";
};

const sevColor = (s: string) =>
  s === "severe" ? "text-rose-600" : s === "moderate" ? "text-orange-600" : s === "mild" ? "text-amber-600" : "text-emerald-600";

const Ring = ({ value, label, sub }: { value: number; label: string; sub?: string }) => {
  const pct = Math.max(0, Math.min(100, value));
  // Lower is better — invert for visual fill
  const good = 100 - pct;
  const color = pct <= 25 ? "#10b981" : pct <= 50 ? "#f59e0b" : pct <= 75 ? "#f97316" : "#e11d48";
  const circ = 2 * Math.PI * 36;
  const offset = circ - (good / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r="36" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
          <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="6" fill="none"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-lg font-bold">{pct}</div>
            <div className="text-[10px] text-muted-foreground">/100</div>
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs font-medium text-center">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
};

const PosturePage = () => {
  const { doctor, userId } = useDoctor();
  const [mode, setMode] = useState<Mode>("dashboard");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<any>(null);
  const [activeImages, setActiveImages] = useState<any[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [compareIds, setCompareIds] = useState<{ a?: string; b?: string }>({});

  // New assessment form state
  const [pName, setPName] = useState("");
  const [pAge, setPAge] = useState("");
  const [pGender, setPGender] = useState("male");
  const [pPhone, setPPhone] = useState("");
  const [slots, setSlots] = useState<CaptureSlot[]>(VIEW_ORDER.map((v) => ({ view: v.view })));
  const [analyzing, setAnalyzing] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  const fetchList = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("vaidya_posture_assessments" as any)
      .select("*")
      .eq("doctor_user_id", userId)
      .order("assessment_date", { ascending: false })
      .order("created_at", { ascending: false });
    setList((data as any[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (userId) fetchList(); }, [userId]);

  const loadAssessment = async (id: string) => {
    setActiveId(id);
    const { data: a } = await supabase
      .from("vaidya_posture_assessments" as any)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    const { data: imgs } = await supabase
      .from("vaidya_posture_images" as any)
      .select("*")
      .eq("assessment_id", id);
    setActive(a);
    setActiveImages((imgs as any[]) ?? []);
    // Sign URLs
    const map: Record<string, string> = {};
    for (const img of (imgs as any[]) ?? []) {
      const { data: signed } = await supabase.storage
        .from("posture-images")
        .createSignedUrl(img.storage_path, 60 * 60);
      if (signed?.signedUrl) map[img.id] = signed.signedUrl;
    }
    setSignedUrls(map);
  };

  // ---------- New assessment handlers ----------
  const handleFile = async (idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, file, url, landmarks: undefined, analysis: undefined } : s)));
  };

  const runDetectionOnSlot = async (idx: number) => {
    const slot = slots[idx];
    if (!slot.url || slot.view === "walking") return;
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, detecting: true } : s)));
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = slot.url;
      await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; });
      const lm = await detectFromImage(img);
      const analysis = lm ? analyzeLandmarks(slot.view, lm) : undefined;
      setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, landmarks: lm, analysis, detecting: false } : s)));
      if (!lm) toast.error(`No body detected in ${slot.view} view.`);
    } catch (e: any) {
      setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, detecting: false } : s)));
      toast.error("Pose detection failed. Try a clearer image.");
    }
  };

  const startNew = () => {
    setMode("new");
    setPName(""); setPAge(""); setPGender("male"); setPPhone("");
    setSlots(VIEW_ORDER.map((v) => ({ view: v.view })));
  };

  const submitAssessment = async () => {
    if (!userId) { toast.error("Sign in required"); return; }
    if (!pName.trim()) { toast.error("Patient name is required"); return; }
    const required = slots.filter((s) => s.view !== "walking");
    if (required.some((s) => !s.file)) { toast.error("Please upload front, side and back images."); return; }
    setAnalyzing(true);
    try {
      // Detect any not-yet-detected
      const detected: CaptureSlot[] = [];
      for (let i = 0; i < slots.length; i++) {
        let s = slots[i];
        if (s.view !== "walking" && s.url && !s.landmarks && !s.analysis) {
          const img = new Image();
          img.src = s.url;
          await new Promise((r, j) => { img.onload = () => r(null); img.onerror = j; });
          const lm = await detectFromImage(img);
          s = { ...s, landmarks: lm, analysis: lm ? analyzeLandmarks(s.view, lm) : undefined };
        }
        detected.push(s);
      }
      const analyses = detected.map((s) => s.analysis).filter(Boolean) as ViewAnalysis[];
      const scores = computeScores(analyses);
      const allFindings = analyses.flatMap((a) => a.findings);
      const plan = generateCorrectivePlan(analyses);

      // Insert assessment
      const { data: ins, error: e1 } = await supabase
        .from("vaidya_posture_assessments" as any)
        .insert({
          doctor_user_id: userId,
          patient_name: pName.trim(),
          patient_age: pAge ? parseInt(pAge) : null,
          patient_gender: pGender,
          patient_phone: pPhone || null,
          head_score: scores.head,
          shoulder_score: scores.shoulder,
          spine_score: scores.spine,
          pelvic_score: scores.pelvic,
          knee_score: scores.knee,
          overall_index: scores.overall,
          risk_level: scores.riskLevel,
          findings: allFindings as any,
          corrective_plan: plan.exercises as any,
          yoga_recommendations: plan.yoga as any,
          ergonomic_advice: plan.ergonomics.join("\n"),
          status: "analyzed",
        })
        .select("*")
        .single();
      if (e1 || !ins) throw e1 ?? new Error("Insert failed");
      const assessmentId = (ins as any).id;

      // Upload images & insert image rows
      for (const s of detected) {
        if (!s.file) continue;
        const ext = s.file.name.split(".").pop() || "jpg";
        const path = `${userId}/${assessmentId}/${s.view}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("posture-images")
          .upload(path, s.file, { upsert: true, contentType: s.file.type });
        if (upErr) { toast.error(`Upload failed for ${s.view}`); continue; }
        await supabase.from("vaidya_posture_images" as any).insert({
          assessment_id: assessmentId,
          doctor_user_id: userId,
          view_type: s.view,
          storage_path: path,
          landmarks: (s.landmarks ?? null) as any,
        });
      }

      toast.success("Posture assessment saved");
      await fetchList();
      await loadAssessment(assessmentId);
      setMode("report");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save assessment");
    } finally {
      setAnalyzing(false);
    }
  };

  // ---------- Report editing ----------
  const updateActive = async (patch: Partial<any>) => {
    if (!activeId) return;
    const { error } = await supabase
      .from("vaidya_posture_assessments" as any)
      .update(patch)
      .eq("id", activeId);
    if (error) { toast.error(error.message); return; }
    setActive((p: any) => ({ ...p, ...patch }));
    fetchList();
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm("Delete this assessment?")) return;
    await supabase.from("vaidya_posture_assessments" as any).delete().eq("id", id);
    toast.success("Deleted");
    if (activeId === id) { setActiveId(null); setActive(null); setMode("dashboard"); }
    fetchList();
  };

  const print = () => window.print();

  // ---------- Compare ----------
  const [compareData, setCompareData] = useState<{ a?: any; b?: any; aImgs?: any[]; bImgs?: any[]; aUrls?: Record<string,string>; bUrls?: Record<string,string> }>({});

  const loadCompare = async () => {
    if (!compareIds.a || !compareIds.b) { toast.error("Select two assessments"); return; }
    const ids = [compareIds.a, compareIds.b];
    const { data: assess } = await supabase
      .from("vaidya_posture_assessments" as any).select("*").in("id", ids);
    const { data: imgs } = await supabase
      .from("vaidya_posture_images" as any).select("*").in("assessment_id", ids);
    const a = (assess as any[])?.find((x) => x.id === compareIds.a);
    const b = (assess as any[])?.find((x) => x.id === compareIds.b);
    const aImgs = (imgs as any[])?.filter((x) => x.assessment_id === compareIds.a) ?? [];
    const bImgs = (imgs as any[])?.filter((x) => x.assessment_id === compareIds.b) ?? [];
    const sign = async (rows: any[]) => {
      const m: Record<string, string> = {};
      for (const r of rows) {
        const { data: s } = await supabase.storage.from("posture-images").createSignedUrl(r.storage_path, 3600);
        if (s?.signedUrl) m[r.id] = s.signedUrl;
      }
      return m;
    };
    setCompareData({ a, b, aImgs, bImgs, aUrls: await sign(aImgs), bUrls: await sign(bImgs) });
  };

  // ---------- Render ----------

  const summary = useMemo(() => {
    const total = list.length;
    const severe = list.filter((x) => x.risk_level?.startsWith("Severe")).length;
    const mod = list.filter((x) => x.risk_level?.startsWith("Moderate")).length;
    const mild = list.filter((x) => x.risk_level?.startsWith("Mild")).length;
    const good = list.filter((x) => x.risk_level?.startsWith("Good")).length;
    return { total, severe, mod, mild, good };
  }, [list]);

  return (
    <div className="space-y-6 print:space-y-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
            Ayuzee AI Posture Screening
          </h1>
          <p className="text-sm text-muted-foreground">
            Powered by Spine Ayush Intelligence — capture, analyze, and correct postural imbalances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mode !== "dashboard" && (
            <Button variant="outline" size="sm" onClick={() => { setMode("dashboard"); setActive(null); setActiveId(null); }}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
          )}
          {mode === "dashboard" && (
            <>
              <Button variant="outline" size="sm" onClick={() => setMode("compare")}>
                <GitCompareArrows className="h-4 w-4 mr-1" /> Before / After
              </Button>
              <Button size="sm" onClick={startNew}>
                <Plus className="h-4 w-4 mr-1" /> New Assessment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* DASHBOARD */}
      {mode === "dashboard" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total", value: summary.total, color: "from-emerald-500/15 to-emerald-500/5", icon: Activity },
              { label: "Good", value: summary.good, color: "from-emerald-500/15 to-emerald-500/5", icon: CheckCircle2 },
              { label: "Mild", value: summary.mild, color: "from-amber-500/15 to-amber-500/5", icon: AlertTriangle },
              { label: "Moderate", value: summary.mod, color: "from-orange-500/15 to-orange-500/5", icon: AlertTriangle },
              { label: "Severe", value: summary.severe, color: "from-rose-500/15 to-rose-500/5", icon: ShieldAlert },
            ].map((s) => (
              <Card key={s.label} className={`p-4 bg-gradient-to-br ${s.color}`}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</div>
                <div className="mt-1 text-2xl font-bold">{s.value}</div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Patient Posture Reports</h2>
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {list.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No assessments yet. Click <span className="font-medium">New Assessment</span> to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-muted-foreground border-b">
                    <tr>
                      <th className="py-2 pr-3">Patient</th>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Index</th>
                      <th className="py-2 pr-3">Risk</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((a) => (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="py-2 pr-3 font-medium">{a.patient_name}</td>
                        <td className="py-2 pr-3 text-muted-foreground">{a.assessment_date}</td>
                        <td className="py-2 pr-3 font-semibold">{a.overall_index ?? "—"}</td>
                        <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-xs ${riskColor(a.risk_level)}`}>{a.risk_level ?? "—"}</span></td>
                        <td className="py-2 pr-3">
                          {a.doctor_approved
                            ? <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700">Approved</Badge>
                            : <Badge variant="outline">{a.status}</Badge>}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => { loadAssessment(a.id); setMode("report"); }}>
                            <FileText className="h-4 w-4 mr-1" /> Open
                          </Button>
                          <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteAssessment(a.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-amber-500/5 border-amber-500/30">
            <div className="flex gap-3 text-sm">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Disclaimer:</span> This AI posture screening is for educational
                and clinical support only. It does not replace physical examination, X-ray, MRI, or doctor diagnosis.
              </p>
            </div>
          </Card>
        </>
      )}

      {/* NEW ASSESSMENT */}
      {mode === "new" && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="p-4 lg:col-span-1 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Patient details</h3>
            <div>
              <Label>Full name</Label>
              <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="e.g. Ramesh Iyer" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Age</Label>
                <Input value={pAge} onChange={(e) => setPAge(e.target.value)} type="number" placeholder="35" />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={pGender} onValueChange={setPGender}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={pPhone} onChange={(e) => setPPhone(e.target.value)} placeholder="+91…" />
            </div>

            <div className="pt-2 border-t">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2"><Camera className="h-4 w-4" /> Camera alignment</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {ALIGNMENT_TIPS.map((t) => (
                  <li key={t} className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>

            <Button className="w-full" onClick={submitAssessment} disabled={analyzing}>
              {analyzing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…</> : <><Sparkles className="h-4 w-4 mr-2" /> Analyze & Save</>}
            </Button>
          </Card>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {slots.map((s, idx) => {
              const meta = VIEW_ORDER[idx];
              return (
                <Card key={s.view} className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold capitalize">{meta.label}</div>
                      <div className="text-[11px] text-muted-foreground">{meta.tip}</div>
                    </div>
                    {s.analysis && (
                      <Badge variant="outline" className="text-xs">
                        {s.analysis.findings.length} finding{s.analysis.findings.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                  <div className="rounded-md border-2 border-dashed border-border min-h-[180px] grid place-items-center bg-muted/20 overflow-hidden">
                    {s.url ? (
                      s.view === "walking" ? (
                        <video src={s.url} controls className="max-h-60 w-full" />
                      ) : (
                        <PostureSkeleton imageUrl={s.url} landmarks={s.landmarks ?? null} />
                      )
                    ) : (
                      <div className="text-center text-xs text-muted-foreground p-4">
                        <Upload className="h-6 w-6 mx-auto mb-2 opacity-60" />
                        Upload {meta.label.toLowerCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept={s.view === "walking" ? "video/*" : "image/*"}
                        capture={s.view === "walking" ? undefined : "environment"}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(idx, e.target.files[0])}
                      />
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <span><Camera className="h-3.5 w-3.5 mr-1" /> {s.url ? "Replace" : "Capture / Upload"}</span>
                      </Button>
                    </label>
                    {s.view !== "walking" && s.url && (
                      <Button variant="secondary" size="sm" onClick={() => runDetectionOnSlot(idx)} disabled={s.detecting}>
                        {s.detecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* REPORT */}
      {mode === "report" && active && (
        <ReportView
          active={active}
          images={activeImages}
          urls={signedUrls}
          onUpdate={updateActive}
          onPrint={print}
          doctor={doctor}
        />
      )}

      {/* COMPARE */}
      {mode === "compare" && (
        <Card className="p-4 space-y-4">
          <div className="grid md:grid-cols-3 gap-3 items-end">
            <div>
              <Label>First visit</Label>
              <Select value={compareIds.a} onValueChange={(v) => setCompareIds((p) => ({ ...p, a: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {list.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.patient_name} — {a.assessment_date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Follow-up</Label>
              <Select value={compareIds.b} onValueChange={(v) => setCompareIds((p) => ({ ...p, b: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {list.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.patient_name} — {a.assessment_date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={loadCompare}>Compare</Button>
          </div>

          {compareData.a && compareData.b && (
            <CompareView data={compareData} />
          )}
        </Card>
      )}
    </div>
  );
};

// ---------------- Report sub-view ----------------
const ReportView = ({ active, images, urls, onUpdate, onPrint, doctor }: any) => {
  const findings: any[] = active.findings ?? [];
  const plan: any[] = active.corrective_plan ?? [];
  const yoga: string[] = active.yoga_recommendations ?? [];
  const ergo: string[] = (active.ergonomic_advice ?? "").split("\n").filter(Boolean);

  const [notes, setNotes] = useState(active.doctor_notes ?? "");
  const [diag, setDiag] = useState(active.diagnosis ?? "");
  const [tx, setTx] = useState(active.treatment_plan ?? "");
  const [follow, setFollow] = useState(active.follow_up_date ?? "");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-semibold">{active.patient_name}</h2>
          <p className="text-xs text-muted-foreground">{active.patient_age ? `${active.patient_age} yrs` : ""} {active.patient_gender ? `· ${active.patient_gender}` : ""} {active.patient_phone ? `· ${active.patient_phone}` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}><Printer className="h-4 w-4 mr-1" /> Print PDF</Button>
          {!active.doctor_approved && (
            <Button size="sm" onClick={() => onUpdate({ doctor_approved: true, status: "approved", doctor_notes: notes, diagnosis: diag, treatment_plan: tx, follow_up_date: follow || null })}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Approve report
            </Button>
          )}
          {active.doctor_approved && <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">Approved</Badge>}
        </div>
      </div>

      {/* Score rings */}
      <Card className="p-4 print:hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Posture Index</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${riskColor(active.risk_level)}`}>{active.risk_level}</span>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <Ring value={active.overall_index ?? 0} label="Overall" sub="Index" />
          <Ring value={active.head_score ?? 0} label="Head" />
          <Ring value={active.shoulder_score ?? 0} label="Shoulder" />
          <Ring value={active.spine_score ?? 0} label="Spine" />
          <Ring value={active.pelvic_score ?? 0} label="Pelvis" />
          <Ring value={active.knee_score ?? 0} label="Knee" />
        </div>
      </Card>

      <Tabs defaultValue="overview" className="print:hidden">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images & Landmarks</TabsTrigger>
          <TabsTrigger value="plan">Corrective Plan</TabsTrigger>
          <TabsTrigger value="doctor">Doctor Review</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Detected imbalances</h4>
            {findings.length === 0
              ? <p className="text-sm text-muted-foreground">No significant imbalances detected.</p>
              : (
                <ul className="space-y-2">
                  {findings.map((f, i) => (
                    <li key={i} className="text-sm flex gap-3">
                      <span className={`mt-1 h-2 w-2 rounded-full ${f.severity === "severe" ? "bg-rose-500" : f.severity === "moderate" ? "bg-orange-500" : "bg-amber-500"}`} />
                      <div>
                        <div className="font-medium">{f.label} <span className={`ml-2 text-xs ${sevColor(f.severity)}`}>({f.severity})</span></div>
                        <div className="text-xs text-muted-foreground">{f.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {images.map((img: any) => (
              <Card key={img.id} className="p-2">
                <div className="text-xs font-medium capitalize mb-1">{img.view_type} view</div>
                {img.view_type === "walking"
                  ? <video src={urls[img.id]} controls className="w-full rounded" />
                  : urls[img.id] && <PostureSkeleton imageUrl={urls[img.id]} landmarks={img.landmarks} />
                }
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plan" className="space-y-3">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Corrective exercises</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {plan.map((ex: any, i: number) => (
                <div key={i} className="p-3 rounded-md border bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{ex.name}</div>
                    <Badge variant="outline" className="text-[10px] capitalize">{ex.category}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{ex.duration}</div>
                  {ex.instructions && <div className="text-xs mt-1">{ex.instructions}</div>}
                </div>
              ))}
            </div>
          </Card>
          {yoga.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Yoga recommendations</h4>
              <div className="flex flex-wrap gap-2">
                {yoga.map((y) => <Badge key={y} variant="secondary">{y}</Badge>)}
              </div>
            </Card>
          )}
          {ergo.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Ergonomic advice</h4>
              <ul className="text-sm space-y-1 list-disc pl-5">
                {ergo.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="doctor" className="space-y-3">
          <Card className="p-4 space-y-3">
            <div>
              <Label>Diagnosis</Label>
              <Textarea value={diag} onChange={(e) => setDiag(e.target.value)} placeholder="Clinical diagnosis…" />
            </div>
            <div>
              <Label>Treatment plan</Label>
              <Textarea value={tx} onChange={(e) => setTx(e.target.value)} placeholder="Therapies, manual interventions…" />
            </div>
            <div>
              <Label>Doctor notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Edit AI findings, add observations…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Follow-up date</Label>
                <Input type="date" value={follow ?? ""} onChange={(e) => setFollow(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => onUpdate({ doctor_notes: notes, diagnosis: diag, treatment_plan: tx, follow_up_date: follow || null })}>
                  Save review
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PRINTABLE PDF VIEW */}
      <div className="hidden print:block bg-white text-black" style={{ padding: "18mm 16mm" }}>
        <div style={{ borderBottom: "3px double #10b981", paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#065f46" }}>
            Ayuzee AI Posture Screening Report
          </div>
          <div style={{ fontSize: 10, color: "#666" }}>
            Powered by Spine Ayush Intelligence · {doctor?.clinic_name ?? "Ayuzee Clinic"}
          </div>
        </div>
        <table style={{ width: "100%", fontSize: 11, marginBottom: 10 }}>
          <tbody>
            <tr>
              <td><strong>Patient:</strong> {active.patient_name}</td>
              <td><strong>Age/Sex:</strong> {active.patient_age ?? "—"} / {active.patient_gender ?? "—"}</td>
              <td><strong>Date:</strong> {active.assessment_date}</td>
            </tr>
            <tr>
              <td colSpan={3}>
                <strong>Phone:</strong> {active.patient_phone ?? "—"} &nbsp;
                <strong>Posture Index:</strong> {active.overall_index}/100 ({active.risk_level})
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 10 }}>
          {[
            ["Head", active.head_score],
            ["Shoulder", active.shoulder_score],
            ["Spine", active.spine_score],
            ["Pelvis", active.pelvic_score],
            ["Knee", active.knee_score],
          ].map(([l, v]) => (
            <div key={l as string} style={{ border: "1px solid #d1d5db", padding: 6, borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#666" }}>{l as string}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{(v as number) ?? "—"}</div>
            </div>
          ))}
        </div>

        <div style={{ fontWeight: 700, fontSize: 12, marginTop: 8, color: "#065f46" }}>Findings</div>
        <ul style={{ fontSize: 11, paddingLeft: 16 }}>
          {findings.length === 0
            ? <li>No significant imbalances detected.</li>
            : findings.map((f, i) => (
              <li key={i}><strong>{f.label}</strong> ({f.severity}) — {f.description}</li>
            ))}
        </ul>

        <div style={{ fontWeight: 700, fontSize: 12, marginTop: 8, color: "#065f46" }}>Corrective Plan</div>
        <ul style={{ fontSize: 11, paddingLeft: 16 }}>
          {plan.map((ex: any, i: number) => (
            <li key={i}><strong>{ex.name}</strong> — {ex.duration}{ex.instructions ? `. ${ex.instructions}` : ""}</li>
          ))}
        </ul>

        {ergo.length > 0 && (
          <>
            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 8, color: "#065f46" }}>Ergonomic Advice</div>
            <ul style={{ fontSize: 11, paddingLeft: 16 }}>{ergo.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </>
        )}

        {(diag || tx || notes) && (
          <>
            <div style={{ fontWeight: 700, fontSize: 12, marginTop: 8, color: "#065f46" }}>Doctor Review</div>
            {diag && <div style={{ fontSize: 11 }}><strong>Diagnosis:</strong> {diag}</div>}
            {tx && <div style={{ fontSize: 11 }}><strong>Treatment:</strong> {tx}</div>}
            {notes && <div style={{ fontSize: 11 }}><strong>Notes:</strong> {notes}</div>}
          </>
        )}

        {follow && <div style={{ fontSize: 11, marginTop: 6 }}><strong>Follow-up:</strong> {follow}</div>}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 10 }}>
          <div>
            <div style={{ borderTop: "1px solid #333", width: 180, marginTop: 30 }} />
            <div>Doctor signature</div>
            <div style={{ color: "#666" }}>{doctor?.full_name ?? ""}</div>
          </div>
          <div style={{ maxWidth: 260, color: "#666", fontSize: 9 }}>
            Disclaimer: This AI posture screening is for educational and clinical support only.
            It does not replace physical examination, X-ray, MRI, or doctor diagnosis.
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------- Compare sub-view ----------------
const CompareView = ({ data }: { data: any }) => {
  const a = data.a, b = data.b;
  const delta = (b.overall_index ?? 0) - (a.overall_index ?? 0);
  const improved = delta < 0;
  const sections: [string, string][] = [
    ["head_score", "Head"], ["shoulder_score", "Shoulder"],
    ["spine_score", "Spine"], ["pelvic_score", "Pelvis"], ["knee_score", "Knee"],
  ];
  return (
    <div className="space-y-4">
      <div className={`p-3 rounded-md ${improved ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-rose-500/10 border border-rose-500/30"}`}>
        <div className="text-sm">
          {improved ? "Improvement" : "Regression"}: overall index changed by{" "}
          <span className="font-bold">{delta > 0 ? `+${delta}` : delta}</span>{" "}
          from {a.overall_index} → {b.overall_index}.
        </div>
      </div>

      <div className="space-y-2">
        {sections.map(([k, label]) => {
          const av = a[k] ?? 0, bv = b[k] ?? 0;
          return (
            <div key={k} className="grid grid-cols-12 items-center gap-2 text-sm">
              <div className="col-span-2 text-xs text-muted-foreground">{label}</div>
              <div className="col-span-4"><Progress value={100 - av} /></div>
              <div className="col-span-1 text-right text-xs">{av}</div>
              <div className="col-span-4"><Progress value={100 - bv} /></div>
              <div className="col-span-1 text-right text-xs">{bv}</div>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[{ a: a, imgs: data.aImgs, urls: data.aUrls, label: "First visit" },
          { a: b, imgs: data.bImgs, urls: data.bUrls, label: "Follow-up" }].map((side: any) => (
          <Card key={side.label} className="p-3">
            <div className="text-xs text-muted-foreground mb-1">{side.label} · {side.a.assessment_date}</div>
            <div className="grid grid-cols-3 gap-2">
              {side.imgs.filter((i: any) => i.view_type !== "walking").map((img: any) => (
                <div key={img.id}>
                  {side.urls[img.id] && <PostureSkeleton imageUrl={side.urls[img.id]} landmarks={img.landmarks} />}
                  <div className="text-[10px] text-center text-muted-foreground capitalize mt-1">{img.view_type}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PosturePage;
