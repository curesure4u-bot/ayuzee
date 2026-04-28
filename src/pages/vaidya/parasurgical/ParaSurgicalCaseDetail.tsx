import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  ShieldAlert,
  Printer,
  Plus,
  Activity,
} from "lucide-react";
import BodyMap, { BodyPoint } from "@/components/parasurgical/BodyMap";

const THERAPY_TABS: { key: string; label: string }[] = [
  { key: "marma", label: "Marma" },
  { key: "varmam", label: "Varmam" },
  { key: "acupuncture", label: "Acupuncture" },
  { key: "tung", label: "Tung's" },
  { key: "dry-needling", label: "Dry Needling" },
  { key: "agni-karma", label: "Agni Karma" },
  { key: "viddha-karma", label: "Viddha Karma" },
];

const TECHNIQUES = [
  "Sedation",
  "Tonification",
  "Static hold",
  "Pulsed stimulation",
  "Heat stimulation",
  "Rotational stimulation",
  "Contralateral",
  "Distal",
  "Trigger point release",
  "Myofascial release",
];

type AISuggestion = { procedure: string; use: string };
type AIResult = {
  likely_pain_generator?: string;
  suggestions?: AISuggestion[];
  candidate_points?: string[];
  risks?: string[];
  combined_protocol?: string;
  disclaimer?: string;
};

const ALL_THERAPIES = [
  "Agni Karma",
  "Viddha Karma",
  "Marma Therapy",
  "Varmam Therapy",
  "Acupuncture Therapy",
  "Tung's Acupuncture Therapy",
  "Dry Needling Therapy",
  "Hijama / Cupping Support",
  "Manual Therapy",
  "Yoga Rehab Support",
  "Conservative Care",
];

const THERAPY_USES: Record<string, string> = {
  "Agni Karma": "For localized chronic pain, heel pain, OA support",
  "Viddha Karma": "For chronic musculoskeletal & neurological pain",
  "Marma Therapy": "For pain, mobility, soft-tissue dysfunction",
  "Varmam Therapy": "For neuromuscular pain & functional restoration",
  "Acupuncture Therapy": "For nerve pain, chronic pain, trigger pathways",
  "Tung's Acupuncture Therapy": "For distal point pain relief & mobility",
  "Dry Needling Therapy": "For trigger points / myofascial pain",
  "Hijama / Cupping Support": "For congestion, stiffness, detox support",
  "Manual Therapy": "For joint mobility & soft-tissue release",
  "Yoga Rehab Support": "For long-term mobility, posture & rehab",
  "Conservative Care": "For monitoring with rest, activity modification",
};

const therapyToTabKey = (label: string): string | null => {
  const l = label.toLowerCase();
  if (l.includes("marma")) return "marma";
  if (l.includes("varmam")) return "varmam";
  if (l.includes("tung")) return "tung";
  if (l.includes("dry needling")) return "dry-needling";
  if (l.includes("acupuncture")) return "acupuncture";
  if (l.includes("agni")) return "agni-karma";
  if (l.includes("viddha")) return "viddha-karma";
  return null;
};

const ParaSurgicalCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [caseRow, setCaseRow] = useState<any>(null);
  const [points, setPoints] = useState<BodyPoint[]>([]);
  const [therapy, setTherapy] = useState<string>("marma");
  const [side, setSide] = useState<"front" | "back">("back");
  const [selectedPoints, setSelectedPoints] = useState<BodyPoint[]>([]);
  const [hoverPoint, setHoverPoint] = useState<BodyPoint | null>(null);
  const [technique, setTechnique] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [ai, setAi] = useState<AIResult | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ai");
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([]);
  const [customTherapy, setCustomTherapy] = useState<string>("");
  const printableRef = useRef<HTMLDivElement>(null);

  const toggleTherapy = (name: string) =>
    setSelectedTherapies((arr) =>
      arr.includes(name) ? arr.filter((t) => t !== name) : [...arr, name],
    );

  const addCustomTherapy = () => {
    const v = customTherapy.trim();
    if (!v) return;
    if (!selectedTherapies.includes(v)) setSelectedTherapies((a) => [...a, v]);
    setCustomTherapy("");
  };

  const proceedWithSelection = async () => {
    if (selectedTherapies.length === 0) {
      toast.error("Select at least one therapy");
      return;
    }
    const first = selectedTherapies.find((t) => therapyToTabKey(t));
    if (first) {
      const k = therapyToTabKey(first);
      if (k) setTherapy(k);
    }
    if (caseRow) {
      await (supabase as any)
        .from("parasurgical_cases")
        .update({
          selected_procedure: selectedTherapies.join(" + "),
          status: "planned",
        })
        .eq("id", caseRow.id);
    }
    setActiveTab("map");
    toast.success("Proceeding with selected therapies");
  };

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [caseQ, ptsQ, sessQ, outQ] = await Promise.all([
      (supabase as any).from("parasurgical_cases").select("*").eq("id", id).single(),
      (supabase as any).from("parasurgical_points").select("*"),
      (supabase as any).from("parasurgical_sessions").select("*").eq("case_id", id).order("session_date", { ascending: false }),
      (supabase as any).from("parasurgical_outcomes").select("*").eq("case_id", id).order("followup_day", { ascending: true }),
    ]);
    if (caseQ.error) {
      toast.error("Case not found");
      navigate("/vaidya/parasurgical");
      return;
    }
    setCaseRow(caseQ.data);
    setPoints((ptsQ.data as BodyPoint[]) ?? []);
    setSessions(sessQ.data ?? []);
    setOutcomes(outQ.data ?? []);
    if (caseRow?.ai_analysis) setAi(caseQ.data.ai_analysis as AIResult);
    if (caseQ.data?.ai_analysis) setAi(caseQ.data.ai_analysis as AIResult);
    if (caseQ.data?.selected_procedure) {
      const sel: string[] = String(caseQ.data.selected_procedure)
        .split("+")
        .map((s) => s.trim())
        .filter(Boolean);
      setSelectedTherapies(sel);
      const t = THERAPY_TABS.find((t) =>
        caseQ.data.selected_procedure.toLowerCase().includes(t.key.replace("-", " ")),
      );
      if (t) setTherapy(t.key);
    }
    if (Array.isArray(caseQ.data?.selected_points)) {
      const ids = (caseQ.data.selected_points as any[]).map((p) => p.id);
      const all = (ptsQ.data as BodyPoint[]) ?? [];
      setSelectedPoints(all.filter((p) => ids.includes(p.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filteredPoints = useMemo(
    () => points.filter((p) => p.therapy === therapy),
    [points, therapy],
  );

  const toggleSelect = (p: BodyPoint) =>
    setSelectedPoints((arr) =>
      arr.find((x) => x.id === p.id) ? arr.filter((x) => x.id !== p.id) : [...arr, p],
    );

  const runAI = async () => {
    if (!caseRow) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-parasurgical-assistant", {
        body: { case: caseRow },
      });
      if (error) throw error;
      const result = (data as any)?.result as AIResult;
      setAi(result);
      await (supabase as any)
        .from("parasurgical_cases")
        .update({ ai_analysis: result, ai_suggestions: result?.suggestions ?? [] })
        .eq("id", caseRow.id);
      toast.success("AI analysis ready");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const saveSelection = async () => {
    if (!caseRow) return;
    const labelMap: Record<string, string> = {
      marma: "Marma Therapy",
      varmam: "Varmam Therapy",
      acupuncture: "Acupuncture Therapy",
      tung: "Tung's Acupuncture Therapy",
      "dry-needling": "Dry Needling Therapy",
      "agni-karma": "Agni Karma",
      "viddha-karma": "Viddha Karma",
    };
    const { error } = await (supabase as any)
      .from("parasurgical_cases")
      .update({
        selected_procedure: labelMap[therapy] ?? therapy,
        selected_points: selectedPoints.map((p) => ({
          id: p.id,
          name: p.name,
          point_code: p.point_code,
        })),
        status: "planned",
      })
      .eq("id", caseRow.id);
    if (error) {
      toast.error("Failed to save");
      return;
    }
    toast.success("Procedure plan saved");
    load();
  };

  const printReport = () => {
    if (!printableRef.current) return;
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(
      `<html><head><title>Para-Surgical Report</title>
       <style>
        body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #0f141b; }
        h1,h2,h3 { margin: 0 0 8px; }
        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .row { display:flex; gap:24px; flex-wrap:wrap; }
        .badge { display:inline-block; padding:2px 8px; border-radius:9999px; background:#f1f5f9; font-size:12px; margin-right:4px; }
        .footer { margin-top:24px; font-size:11px; color:#64748b; text-align:center; }
       </style></head><body>${printableRef.current.innerHTML}</body></html>`,
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  if (loading || !caseRow) {
    return (
      <div className="grid place-items-center h-64 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const contraindications: string[] = caseRow.contraindications ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate("/vaidya/parasurgical")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Cases
        </Button>
        <h1 className="font-display text-2xl font-semibold">{caseRow.patient_name}</h1>
        <Badge variant="outline">Pain {caseRow.pain_severity}/10</Badge>
        <Badge>{caseRow.status}</Badge>
        {caseRow.selected_procedure && (
          <Badge variant="secondary">{caseRow.selected_procedure}</Badge>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={printReport}>
            <Printer className="h-4 w-4 mr-1" /> PDF Report
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{caseRow.chief_complaint}</p>

      {contraindications.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4" /> Contraindication alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex flex-wrap gap-2">
              {contraindications.map((c) => (
                <Badge key={c} variant="outline" className="border-amber-500/40">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ai">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="ai">AI Selector</TabsTrigger>
          <TabsTrigger value="map">Body Map</TabsTrigger>
          <TabsTrigger value="technique">Technique</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
        </TabsList>

        {/* AI SELECTOR */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> AI Procedure Suggestions
                </CardTitle>
                <CardDescription>
                  Decision support — final choice rests with the licensed clinician.
                </CardDescription>
              </div>
              <Button onClick={runAI} disabled={aiLoading} variant="hero">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze Case"}
              </Button>
            </CardHeader>
            <CardContent>
              {!ai && (
                <p className="text-sm text-muted-foreground">
                  Click <strong>Analyze Case</strong> to get AI suggestions based on the assessment.
                </p>
              )}
              {ai && (
                <div className="space-y-4">
                  {ai.likely_pain_generator && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Likely pain generator
                      </p>
                      <p className="text-sm">{ai.likely_pain_generator}</p>
                    </div>
                  )}
                  {ai.suggestions && ai.suggestions.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-2">
                        Ranked procedures
                      </p>
                      <ul className="space-y-2">
                        {ai.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="rounded-md border border-border p-3 flex items-start gap-3"
                          >
                            <div className="grid place-items-center h-10 w-12 rounded bg-primary/10 text-primary font-semibold text-sm">
                              {Math.round(s.confidence)}%
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{s.procedure}</p>
                              <p className="text-sm text-muted-foreground">{s.rationale}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ai.candidate_points && ai.candidate_points.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Candidate points
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ai.candidate_points.map((p, i) => (
                          <Badge key={i} variant="secondary">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {ai.risks && ai.risks.length > 0 && (
                    <div>
                      <p className="text-xs uppercase text-amber-600 mb-1">Risks</p>
                      <ul className="text-sm list-disc list-inside text-muted-foreground">
                        {ai.risks.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ai.combined_protocol && (
                    <div>
                      <p className="text-xs uppercase text-muted-foreground mb-1">
                        Combined protocol
                      </p>
                      <p className="text-sm">{ai.combined_protocol}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground italic">
                    {ai.disclaimer ??
                      "Decision support only. A licensed clinician must approve before any procedure."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BODY MAP */}
        <TabsContent value="map">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Interactive Point Mapping
                </CardTitle>
                <CardDescription>Tap points to mark them for the procedure plan.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={side} onValueChange={(v) => setSide(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="back">Back</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="hero" size="sm" onClick={saveSelection}>
                  Save plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={therapy} onValueChange={setTherapy}>
                <TabsList className="flex-wrap h-auto">
                  {THERAPY_TABS.map((t) => (
                    <TabsTrigger key={t.key} value={t.key}>
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <BodyMap
                    side={side}
                    points={filteredPoints}
                    selectedIds={selectedPoints.map((p) => p.id)}
                    onTogglePoint={toggleSelect}
                    onHoverPoint={setHoverPoint}
                  />
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {filteredPoints.filter((p) => p.side === side).length} points • {side}
                  </p>
                </div>
                <div className="space-y-3">
                  {hoverPoint && (
                    <div className="rounded-md border border-border p-3 bg-muted/30">
                      <p className="font-semibold">
                        {hoverPoint.name}
                        {hoverPoint.point_code && (
                          <span className="text-muted-foreground"> • {hoverPoint.point_code}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {hoverPoint.anatomical_location}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase text-muted-foreground mb-2">
                      Selected ({selectedPoints.length})
                    </p>
                    {selectedPoints.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No points selected yet. Tap on the body to mark.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedPoints.map((p) => (
                          <li
                            key={p.id}
                            className="flex items-start justify-between gap-2 rounded border border-border p-2"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">
                                {p.name}
                                {p.point_code && (
                                  <span className="text-muted-foreground"> • {p.point_code}</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {p.anatomical_location}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleSelect(p)}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNIQUE */}
        <TabsContent value="technique">
          <Card>
            <CardHeader>
              <CardTitle>Technique selector</CardTitle>
              <CardDescription>
                Choose the stimulation method to apply for this session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TECHNIQUES.map((t) => (
                  <Button
                    key={t}
                    variant={technique === t ? "hero" : "outline"}
                    size="sm"
                    onClick={() => setTechnique(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Selected technique will be pre-filled when you record a new session.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS */}
        <TabsContent value="sessions">
          <SessionsPanel
            caseId={caseRow.id}
            doctorId={caseRow.doctor_user_id}
            procedure={caseRow.selected_procedure ?? ""}
            technique={technique}
            selectedPoints={selectedPoints}
            sessions={sessions}
            onChange={load}
          />
        </TabsContent>

        {/* OUTCOMES */}
        <TabsContent value="outcomes">
          <OutcomesPanel caseId={caseRow.id} outcomes={outcomes} onChange={load} />
        </TabsContent>
      </Tabs>

      {/* Hidden printable */}
      <div ref={printableRef} className="hidden">
        <h1>Ayuzee AYUSH Para-Surgical Therapy Report</h1>
        <div className="card">
          <h3>Patient</h3>
          <div className="row">
            <div><strong>Name:</strong> {caseRow.patient_name}</div>
            <div><strong>Age:</strong> {caseRow.age ?? "-"}</div>
            <div><strong>Gender:</strong> {caseRow.gender ?? "-"}</div>
          </div>
          <div><strong>Complaint:</strong> {caseRow.chief_complaint}</div>
          <div><strong>Pain:</strong> {caseRow.pain_severity}/10 • <strong>Location:</strong> {caseRow.pain_location ?? "-"}</div>
        </div>
        {caseRow.selected_procedure && (
          <div className="card">
            <h3>Procedure plan</h3>
            <div><strong>Procedure:</strong> {caseRow.selected_procedure}</div>
            <div><strong>Points:</strong>{" "}
              {selectedPoints.map((p) => (
                <span className="badge" key={p.id}>{p.name}{p.point_code ? ` (${p.point_code})` : ""}</span>
              ))}
            </div>
            {technique && <div><strong>Technique:</strong> {technique}</div>}
          </div>
        )}
        {sessions.length > 0 && (
          <div className="card">
            <h3>Sessions</h3>
            {sessions.map((s) => (
              <div key={s.id} style={{ marginBottom: 8 }}>
                <strong>{s.session_date}</strong> • {s.procedure} •
                Pain {s.pain_before ?? "-"} → {s.pain_after ?? "-"} • {s.technique ?? ""}
                {s.advice_given && <div><em>Advice:</em> {s.advice_given}</div>}
              </div>
            ))}
          </div>
        )}
        {outcomes.length > 0 && (
          <div className="card">
            <h3>Outcomes</h3>
            {outcomes.map((o) => (
              <div key={o.id}>
                Day {o.followup_day}: pain {o.pain_score}/10 • mobility {o.mobility_score}/10 •
                sleep {o.sleep_score}/10 {o.needs_repeat ? "• repeat advised" : ""}
              </div>
            ))}
          </div>
        )}
        <div className="footer">
          Precision Procedures • Intelligent Healing • Powered by Ayuzee AI<br/>
          Decision support only. Final procedure selection and execution must be performed by licensed qualified professionals.
        </div>
      </div>
    </div>
  );
};

/* ---------------- Sessions panel ---------------- */
const SessionsPanel = ({
  caseId,
  doctorId,
  procedure,
  technique,
  selectedPoints,
  sessions,
  onChange,
}: {
  caseId: string;
  doctorId: string;
  procedure: string;
  technique: string;
  selectedPoints: BodyPoint[];
  sessions: any[];
  onChange: () => void;
}) => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    procedure: procedure || "",
    technique: technique || "",
    duration_minutes: 30,
    pain_before: 5,
    pain_after: 3,
    immediate_response: "",
    complications: "",
    advice_given: "",
  });

  useEffect(() => {
    setForm((f) => ({ ...f, procedure: procedure || f.procedure, technique: technique || f.technique }));
  }, [procedure, technique]);

  const save = async () => {
    if (!form.procedure) {
      toast.error("Procedure is required");
      return;
    }
    const { error } = await (supabase as any).from("parasurgical_sessions").insert({
      case_id: caseId,
      doctor_user_id: doctorId,
      ...form,
      points_used: selectedPoints.map((p) => ({ id: p.id, name: p.name })),
    });
    if (error) {
      toast.error("Failed to save session");
      return;
    }
    toast.success("Session recorded");
    setShow(false);
    onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Session notes</CardTitle>
          <CardDescription>Per-visit procedural log.</CardDescription>
        </div>
        <Button size="sm" variant="hero" onClick={() => setShow((s) => !s)}>
          <Plus className="h-4 w-4 mr-1" /> {show ? "Cancel" : "New session"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {show && (
          <div className="grid gap-3 md:grid-cols-2 rounded-md border border-border p-4">
            <div>
              <Label>Procedure</Label>
              <Input
                value={form.procedure}
                onChange={(e) => setForm({ ...form, procedure: e.target.value })}
              />
            </div>
            <div>
              <Label>Technique</Label>
              <Input
                value={form.technique}
                onChange={(e) => setForm({ ...form, technique: e.target.value })}
              />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Pain before: {form.pain_before}</Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[form.pain_before]}
                  onValueChange={(v) => setForm({ ...form, pain_before: v[0] })}
                />
              </div>
              <div>
                <Label>Pain after: {form.pain_after}</Label>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[form.pain_after]}
                  onValueChange={(v) => setForm({ ...form, pain_after: v[0] })}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Immediate response</Label>
              <Textarea
                rows={2}
                value={form.immediate_response}
                onChange={(e) => setForm({ ...form, immediate_response: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Complications</Label>
              <Textarea
                rows={2}
                value={form.complications}
                onChange={(e) => setForm({ ...form, complications: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Advice given</Label>
              <Textarea
                rows={2}
                value={form.advice_given}
                onChange={(e) => setForm({ ...form, advice_given: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={save} variant="hero">
                Save session
              </Button>
            </div>
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.map((s) => (
              <li key={s.id} className="py-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-medium">{s.procedure}</p>
                  <div className="flex gap-2 items-center text-sm">
                    <Badge variant="outline">{s.session_date}</Badge>
                    <Badge>
                      Pain {s.pain_before ?? "-"} → {s.pain_after ?? "-"}
                    </Badge>
                  </div>
                </div>
                {s.technique && (
                  <p className="text-xs text-muted-foreground mt-1">Technique: {s.technique}</p>
                )}
                {s.advice_given && (
                  <p className="text-sm mt-1">Advice: {s.advice_given}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

/* ---------------- Outcomes panel ---------------- */
const OutcomesPanel = ({
  caseId,
  outcomes,
  onChange,
}: {
  caseId: string;
  outcomes: any[];
  onChange: () => void;
}) => {
  const [day, setDay] = useState<number>(7);
  const [form, setForm] = useState({
    pain_score: 3,
    mobility_score: 7,
    sleep_score: 7,
    walking_ability: "",
    rom_gain: "",
    needs_repeat: false,
    notes: "",
  });

  const save = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { error } = await (supabase as any).from("parasurgical_outcomes").insert({
      case_id: caseId,
      recorded_by: auth.user.id,
      followup_day: day,
      ...form,
    });
    if (error) {
      toast.error("Failed to save outcome");
      return;
    }
    toast.success("Outcome recorded");
    onChange();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome tracking</CardTitle>
        <CardDescription>Capture follow-up scores at 3 / 7 / 14 / 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 rounded-md border border-border p-4">
          <div>
            <Label>Follow-up day</Label>
            <Select value={String(day)} onValueChange={(v) => setDay(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 7, 14, 30].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    Day {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Walking ability</Label>
            <Input
              value={form.walking_ability}
              onChange={(e) => setForm({ ...form, walking_ability: e.target.value })}
            />
          </div>
          <div>
            <Label>Pain: {form.pain_score}/10</Label>
            <Slider
              min={0}
              max={10}
              value={[form.pain_score]}
              onValueChange={(v) => setForm({ ...form, pain_score: v[0] })}
            />
          </div>
          <div>
            <Label>Mobility: {form.mobility_score}/10</Label>
            <Slider
              min={0}
              max={10}
              value={[form.mobility_score]}
              onValueChange={(v) => setForm({ ...form, mobility_score: v[0] })}
            />
          </div>
          <div>
            <Label>Sleep: {form.sleep_score}/10</Label>
            <Slider
              min={0}
              max={10}
              value={[form.sleep_score]}
              onValueChange={(v) => setForm({ ...form, sleep_score: v[0] })}
            />
          </div>
          <div>
            <Label>ROM gain</Label>
            <Input
              value={form.rom_gain}
              onChange={(e) => setForm({ ...form, rom_gain: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <label className="md:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.needs_repeat}
              onChange={(e) => setForm({ ...form, needs_repeat: e.target.checked })}
            />
            Repeat session needed
          </label>
          <div className="md:col-span-2 flex justify-end">
            <Button variant="hero" onClick={save}>
              Save outcome
            </Button>
          </div>
        </div>

        {outcomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No outcomes recorded yet.</p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {outcomes.map((o) => (
              <div key={o.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Day {o.followup_day}</p>
                  {o.needs_repeat && <Badge variant="destructive">Repeat</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pain {o.pain_score}/10 • Mobility {o.mobility_score}/10 • Sleep {o.sleep_score}/10
                </p>
                {o.notes && <p className="text-sm mt-1">{o.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParaSurgicalCaseDetail;
