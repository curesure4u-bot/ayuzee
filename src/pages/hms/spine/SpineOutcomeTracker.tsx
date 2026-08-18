import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingDown, TrendingUp, Activity, BarChart3, Plus, Save,
  Trash2, Target, Brain, Zap, Heart, CheckCircle2, AlertTriangle,
  Calendar, ArrowDown, ArrowUp, Minus, LineChart, Award,
  ThermometerSun, Move, Grip, Eye,
} from "lucide-react";

// ─── Types ───
interface OutcomeEntry {
  id: string;
  date: string;
  sessionNumber: number;
  vasScore: number;
  romFlexion: number;
  romExtension: number;
  romLateralLeft: number;
  romLateralRight: number;
  romRotationLeft: number;
  romRotationRight: number;
  nerveFunction: string;
  slrLeft: number;
  slrRight: number;
  muscleStrength: string;
  sensationStatus: string;
  functionalScore: number;
  sleepQuality: number;
  adlScore: number;
  therapiesGiven: string;
  notes: string;
}

// ─── Helper ───
const generateId = () => Math.random().toString(36).substr(2, 9);
const today = () => new Date().toISOString().split("T")[0];

// ─── Outcome Norms ───
const vasLabels = ["No Pain", "Minimal", "Mild", "Uncomfortable", "Moderate", "Distracting", "Distressing", "Unmanageable", "Intense", "Severe", "Worst Possible"];
const nerveFunctionOptions = ["Normal", "Mild deficit", "Moderate deficit", "Severe deficit", "Complete loss"];
const muscleStrengthOptions = ["5/5 (Normal)", "4/5 (Slight weakness)", "3/5 (Against gravity only)", "2/5 (Gravity eliminated)", "1/5 (Trace)", "0/5 (No contraction)"];
const sensationOptions = ["Normal", "Mild numbness", "Moderate numbness", "Severe numbness", "Complete loss", "Tingling/Paresthesia"];

export default function SpineOutcomeTracker() {
  const [patientName, setPatientName] = useState("");
  const [condition, setCondition] = useState("");
  const [entries, setEntries] = useState<OutcomeEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<OutcomeEntry, "id">>({
    date: today(),
    sessionNumber: 1,
    vasScore: 5,
    romFlexion: 60,
    romExtension: 20,
    romLateralLeft: 25,
    romLateralRight: 25,
    romRotationLeft: 45,
    romRotationRight: 45,
    nerveFunction: "Normal",
    slrLeft: 70,
    slrRight: 70,
    muscleStrength: "5/5 (Normal)",
    sensationStatus: "Normal",
    functionalScore: 50,
    sleepQuality: 5,
    adlScore: 50,
    therapiesGiven: "",
    notes: "",
  });

  // Add entry
  const addEntry = () => {
    if (!patientName) { toast.error("Enter patient name first"); return; }
    const entry: OutcomeEntry = { id: generateId(), ...newEntry };
    setEntries(prev => [...prev, entry]);
    setNewEntry(prev => ({
      ...prev,
      date: today(),
      sessionNumber: prev.sessionNumber + 1,
      notes: "",
      therapiesGiven: "",
    }));
    setShowAddForm(false);
    toast.success(`Session ${entry.sessionNumber} recorded`);
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  // Computed stats
  const stats = useMemo(() => {
    if (entries.length < 2) return null;
    const first = entries[0];
    const last = entries[entries.length - 1];
    const vasChange = first.vasScore - last.vasScore;
    const vasPercent = first.vasScore > 0 ? Math.round((vasChange / first.vasScore) * 100) : 0;
    const romFlexionChange = last.romFlexion - first.romFlexion;
    const functionalChange = last.functionalScore - first.functionalScore;
    const slrLeftChange = last.slrLeft - first.slrLeft;
    const slrRightChange = last.slrRight - first.slrRight;
    const sleepChange = last.sleepQuality - first.sleepQuality;
    const adlChange = last.adlScore - first.adlScore;

    // Recovery velocity (VAS points per session)
    const velocity = entries.length > 1 ? (vasChange / (entries.length - 1)).toFixed(1) : "0";

    // Projected sessions to VAS 0-1
    const projected = parseFloat(velocity) > 0 ? Math.ceil((last.vasScore - 1) / parseFloat(velocity)) : null;

    return {
      vasChange, vasPercent, romFlexionChange, functionalChange,
      slrLeftChange, slrRightChange, sleepChange, adlChange,
      velocity, projected,
      firstVas: first.vasScore, lastVas: last.vasScore,
      totalSessions: entries.length,
    };
  }, [entries]);

  // VAS color
  const getVasColor = (score: number) => {
    if (score <= 2) return "text-green-600 bg-green-50";
    if (score <= 4) return "text-blue-600 bg-blue-50";
    if (score <= 6) return "text-amber-600 bg-amber-50";
    if (score <= 8) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getVasBg = (score: number) => {
    if (score <= 2) return "bg-green-500";
    if (score <= 4) return "bg-blue-500";
    if (score <= 6) return "bg-amber-500";
    if (score <= 8) return "bg-orange-500";
    return "bg-red-500";
  };

  // Simple bar chart renderer
  const renderMiniChart = (data: number[], max: number, label: string, color: string, invert = false) => {
    if (data.length === 0) return null;
    const chartMax = max || 10;
    return (
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
        <div className="flex items-end gap-0.5 h-12">
          {data.map((val, i) => {
            const height = invert
              ? ((chartMax - val) / chartMax) * 100
              : (val / chartMax) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full rounded-t ${color} opacity-${70 + Math.min(i * 5, 30)} transition-all`}
                  style={{ height: `${Math.max(height, 4)}%`, minHeight: "2px", opacity: 0.5 + (i / data.length) * 0.5 }}
                  title={`Session ${i + 1}: ${val}`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          <span>S1</span>
          <span>S{data.length}</span>
        </div>
      </div>
    );
  };

  // Save to Supabase
  const handleSave = async () => {
    if (!patientName) { toast.error("Enter patient name"); return; }
    if (entries.length === 0) { toast.error("Add at least one session entry"); return; }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("You must be logged in"); setSaving(false); return; }

      const { error } = await supabase.from("spine_therapy_sessions").insert({
        patient_id: user.id,
        doctor_id: user.id,
        session_number: 0,
        therapy_name: `Outcome Tracker: ${condition || "Spine"}`,
        duration_minutes: 0,
        status: "outcome_tracked",
        doctor_notes: JSON.stringify({
          type: "outcome_tracker",
          patientName,
          condition,
          entries,
          stats,
          trackedAt: new Date().toISOString(),
        }),
        pain_before: entries[0]?.vasScore || null,
        pain_after: entries[entries.length - 1]?.vasScore || null,
      });

      if (error) {
        toast.error("Save failed: " + error.message);
      } else {
        toast.success("Outcome data saved successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  // Recovery grade
  const getRecoveryGrade = () => {
    if (!stats) return { grade: "—", color: "text-gray-400", label: "Insufficient data" };
    const pct = stats.vasPercent;
    if (pct >= 80) return { grade: "A+", color: "text-green-600", label: "Excellent Recovery" };
    if (pct >= 60) return { grade: "A", color: "text-green-500", label: "Very Good Recovery" };
    if (pct >= 40) return { grade: "B", color: "text-blue-600", label: "Good Recovery" };
    if (pct >= 20) return { grade: "C", color: "text-amber-600", label: "Moderate Recovery" };
    if (pct > 0) return { grade: "D", color: "text-orange-600", label: "Slow Recovery" };
    return { grade: "F", color: "text-red-600", label: "No Improvement" };
  };

  const recovery = getRecoveryGrade();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="h-6 w-6 text-emerald-600" />
            Spine Outcome Tracker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track VAS pain scores, ROM, nerve function & functional recovery across sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700">
            <Brain className="h-3 w-3 mr-1" /> Tool #2 of 5
          </Badge>
          {entries.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="h-3 w-3" /> {entries.length} sessions
            </Badge>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium">Patient Name / ID</label>
              <Input
                placeholder="e.g. Rajesh Kumar"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Condition</label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sciatica">Gridhrasi (Sciatica)</SelectItem>
                  <SelectItem value="cervical">Cervical Spondylosis</SelectItem>
                  <SelectItem value="lbp">Chronic Low Back Pain</SelectItem>
                  <SelectItem value="disc">Disc Herniation</SelectItem>
                  <SelectItem value="frozen">Frozen Shoulder</SelectItem>
                  <SelectItem value="headache">Cervicogenic Headache</SelectItem>
                  <SelectItem value="knee">Knee Pain (Postural)</SelectItem>
                  <SelectItem value="si">SI Joint Dysfunction</SelectItem>
                  <SelectItem value="thoracic">Upper Back Pain</SelectItem>
                  <SelectItem value="stiffness">Morning Stiffness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full gap-1" onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4" /> {showAddForm ? "Hide Form" : "Record Session"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Dashboard (only if entries exist) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Recovery Grade */}
          <Card className="col-span-2 sm:col-span-1">
            <CardContent className="pt-4 pb-3 text-center">
              <Award className={`h-6 w-6 mx-auto ${recovery.color}`} />
              <p className={`text-3xl font-bold mt-1 ${recovery.color}`}>{recovery.grade}</p>
              <p className="text-[9px] text-muted-foreground">{recovery.label}</p>
            </CardContent>
          </Card>

          {/* VAS Change */}
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">VAS Change</span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">-{stats.vasChange}</p>
              <p className="text-[9px] text-muted-foreground">{stats.firstVas} → {stats.lastVas} ({stats.vasPercent}% ↓)</p>
            </CardContent>
          </Card>

          {/* ROM Improvement */}
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Move className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">ROM Δ</span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mt-1">+{stats.romFlexionChange}°</p>
              <p className="text-[9px] text-muted-foreground">Flexion improvement</p>
            </CardContent>
          </Card>

          {/* Functional Score */}
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Function</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 mt-1">+{stats.functionalChange}%</p>
              <p className="text-[9px] text-muted-foreground">ADL improvement</p>
            </CardContent>
          </Card>

          {/* Velocity */}
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">Velocity</span>
              </div>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.velocity}</p>
              <p className="text-[9px] text-muted-foreground">VAS pts/session</p>
            </CardContent>
          </Card>

          {/* Projected */}
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <div className="flex items-center justify-center gap-1">
                <Target className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">ETA Pain-Free</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {stats.projected ? `${stats.projected}` : "—"}
              </p>
              <p className="text-[9px] text-muted-foreground">{stats.projected ? "sessions remaining" : "insufficient data"}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visual Charts */}
      {entries.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Recovery Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {renderMiniChart(entries.map(e => e.vasScore), 10, "VAS Pain (↓ better)", "bg-red-500", true)}
              {renderMiniChart(entries.map(e => e.romFlexion), 90, "ROM Flexion (↑ better)", "bg-blue-500")}
              {renderMiniChart(entries.map(e => e.functionalScore), 100, "Functional % (↑ better)", "bg-purple-500")}
              {renderMiniChart(entries.map(e => e.slrLeft), 90, "SLR Left° (↑ better)", "bg-emerald-500")}
              {renderMiniChart(entries.map(e => e.sleepQuality), 10, "Sleep Quality (↑ better)", "bg-indigo-500")}
              {renderMiniChart(entries.map(e => e.adlScore), 100, "ADL Score (↑ better)", "bg-amber-500")}
            </div>

            {/* VAS Timeline */}
            <Separator className="my-4" />
            <div>
              <p className="text-xs font-medium mb-2">VAS Pain Timeline</p>
              <div className="flex items-center gap-1">
                {entries.map((e, i) => (
                  <div key={e.id} className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getVasBg(e.vasScore)}`}>
                      {e.vasScore}
                    </div>
                    {i < entries.length - 1 && (
                      <div className="flex items-center">
                        {entries[i + 1].vasScore < e.vasScore ? (
                          <ArrowDown className="h-3 w-3 text-green-500" />
                        ) : entries[i + 1].vasScore > e.vasScore ? (
                          <ArrowUp className="h-3 w-3 text-red-500" />
                        ) : (
                          <Minus className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                {entries.map(e => (
                  <span key={e.id} className="text-[8px] text-muted-foreground w-8 text-center">S{e.sessionNumber}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Session Form */}
      {showAddForm && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4" /> Record Session #{newEntry.sessionNumber}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium">Date</label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={e => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Session #</label>
                <Input
                  type="number"
                  min="1"
                  value={newEntry.sessionNumber}
                  onChange={e => setNewEntry(prev => ({ ...prev, sessionNumber: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium">Therapies Given</label>
                <Input
                  placeholder="e.g. Kati Basti + Agnikarma + Acupuncture"
                  value={newEntry.therapiesGiven}
                  onChange={e => setNewEntry(prev => ({ ...prev, therapiesGiven: e.target.value }))}
                />
              </div>
            </div>

            {/* VAS Score */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1">
                <ThermometerSun className="h-3 w-3" /> VAS Pain Score: <span className={`font-bold ${getVasColor(newEntry.vasScore).split(" ")[0]}`}>{newEntry.vasScore}/10</span>
                <span className="text-muted-foreground ml-1">({vasLabels[newEntry.vasScore]})</span>
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px]">0</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newEntry.vasScore}
                  onChange={e => setNewEntry(prev => ({ ...prev, vasScore: parseInt(e.target.value) }))}
                  className="flex-1 h-2 accent-red-500"
                />
                <span className="text-[10px]">10</span>
              </div>
              <div className="flex justify-between mt-0.5">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setNewEntry(prev => ({ ...prev, vasScore: i }))}
                    className={`w-6 h-6 rounded text-[9px] font-bold transition ${newEntry.vasScore === i ? getVasColor(i) + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* ROM */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1 mb-2">
                <Move className="h-3 w-3" /> Range of Motion (degrees)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Flexion</label>
                  <Input type="number" min="0" max="90" value={newEntry.romFlexion} onChange={e => setNewEntry(prev => ({ ...prev, romFlexion: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Extension</label>
                  <Input type="number" min="0" max="45" value={newEntry.romExtension} onChange={e => setNewEntry(prev => ({ ...prev, romExtension: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Lat. Flex (L)</label>
                  <Input type="number" min="0" max="45" value={newEntry.romLateralLeft} onChange={e => setNewEntry(prev => ({ ...prev, romLateralLeft: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Lat. Flex (R)</label>
                  <Input type="number" min="0" max="45" value={newEntry.romLateralRight} onChange={e => setNewEntry(prev => ({ ...prev, romLateralRight: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Rotation (L)</label>
                  <Input type="number" min="0" max="80" value={newEntry.romRotationLeft} onChange={e => setNewEntry(prev => ({ ...prev, romRotationLeft: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Rotation (R)</label>
                  <Input type="number" min="0" max="80" value={newEntry.romRotationRight} onChange={e => setNewEntry(prev => ({ ...prev, romRotationRight: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
            </div>

            {/* Nerve Function */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1 mb-2">
                <Zap className="h-3 w-3" /> Neurological Assessment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Nerve Function</label>
                  <Select value={newEntry.nerveFunction} onValueChange={v => setNewEntry(prev => ({ ...prev, nerveFunction: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {nerveFunctionOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">SLR Left (°)</label>
                  <Input type="number" min="0" max="90" value={newEntry.slrLeft} onChange={e => setNewEntry(prev => ({ ...prev, slrLeft: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">SLR Right (°)</label>
                  <Input type="number" min="0" max="90" value={newEntry.slrRight} onChange={e => setNewEntry(prev => ({ ...prev, slrRight: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Muscle Strength</label>
                  <Select value={newEntry.muscleStrength} onValueChange={v => setNewEntry(prev => ({ ...prev, muscleStrength: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {muscleStrengthOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Sensation</label>
                  <Select value={newEntry.sensationStatus} onValueChange={v => setNewEntry(prev => ({ ...prev, sensationStatus: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {sensationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Functional Scores */}
            <div>
              <label className="text-xs font-medium flex items-center gap-1 mb-2">
                <Activity className="h-3 w-3" /> Functional Assessment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground">Functional Score (%): {newEntry.functionalScore}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newEntry.functionalScore}
                    onChange={e => setNewEntry(prev => ({ ...prev, functionalScore: parseInt(e.target.value) }))}
                    className="w-full h-2 accent-purple-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Bed-bound</span><span>Normal function</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Sleep Quality (0-10): {newEntry.sleepQuality}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={newEntry.sleepQuality}
                    onChange={e => setNewEntry(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
                    className="w-full h-2 accent-indigo-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>No sleep</span><span>Perfect sleep</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">ADL Score (%): {newEntry.adlScore}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newEntry.adlScore}
                    onChange={e => setNewEntry(prev => ({ ...prev, adlScore: parseInt(e.target.value) }))}
                    className="w-full h-2 accent-amber-500"
                  />
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Fully dependent</span><span>Fully independent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium">Session Notes</label>
              <Textarea
                placeholder="Observations, patient response, any adverse effects..."
                className="h-16 text-xs mt-1"
                value={newEntry.notes}
                onChange={e => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" onClick={addEntry} className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Record Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History Table */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Session History ({entries.length} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-center p-2">VAS</th>
                    <th className="text-center p-2">ROM(Flex)</th>
                    <th className="text-center p-2">SLR(L/R)</th>
                    <th className="text-center p-2">Nerve</th>
                    <th className="text-center p-2">Func%</th>
                    <th className="text-center p-2">Sleep</th>
                    <th className="text-left p-2">Therapies</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, idx) => (
                    <tr key={e.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">S{e.sessionNumber}</td>
                      <td className="p-2">{e.date}</td>
                      <td className="p-2 text-center">
                        <Badge className={`${getVasColor(e.vasScore)} text-[10px]`}>{e.vasScore}/10</Badge>
                      </td>
                      <td className="p-2 text-center">{e.romFlexion}°</td>
                      <td className="p-2 text-center">{e.slrLeft}° / {e.slrRight}°</td>
                      <td className="p-2 text-center">
                        <Badge variant="outline" className="text-[9px]">
                          {e.nerveFunction === "Normal" ? "✓" : "⚠"} {e.nerveFunction}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">{e.functionalScore}%</td>
                      <td className="p-2 text-center">{e.sleepQuality}/10</td>
                      <td className="p-2 max-w-[150px] truncate" title={e.therapiesGiven}>{e.therapiesGiven || "—"}</td>
                      <td className="p-2">
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeEntry(e.id)}>
                          <Trash2 className="h-3 w-3 text-red-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comparison: First vs Last */}
            {stats && (
              <>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2 rounded bg-green-50 border border-green-100 text-center">
                    <p className="text-[9px] text-muted-foreground">Pain Reduction</p>
                    <p className="text-sm font-bold text-green-600">{stats.vasPercent}%</p>
                  </div>
                  <div className="p-2 rounded bg-blue-50 border border-blue-100 text-center">
                    <p className="text-[9px] text-muted-foreground">SLR Improved</p>
                    <p className="text-sm font-bold text-blue-600">+{stats.slrLeftChange}° / +{stats.slrRightChange}°</p>
                  </div>
                  <div className="p-2 rounded bg-indigo-50 border border-indigo-100 text-center">
                    <p className="text-[9px] text-muted-foreground">Sleep Improved</p>
                    <p className="text-sm font-bold text-indigo-600">+{stats.sleepChange} pts</p>
                  </div>
                  <div className="p-2 rounded bg-amber-50 border border-amber-100 text-center">
                    <p className="text-[9px] text-muted-foreground">ADL Improved</p>
                    <p className="text-sm font-bold text-amber-600">+{stats.adlChange}%</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {entries.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <LineChart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="font-medium text-muted-foreground">No sessions recorded yet</h3>
            <p className="text-xs text-muted-foreground mt-1">Click "Record Session" to start tracking patient outcomes</p>
            <Button className="mt-4 gap-1" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4" /> Record First Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => {
            const report = `
SPINE OUTCOME REPORT — ${patientName}
Condition: ${condition || "Spine"}
Sessions Tracked: ${entries.length}
${stats ? `
RECOVERY SUMMARY:
• Recovery Grade: ${recovery.grade} (${recovery.label})
• VAS: ${stats.firstVas} → ${stats.lastVas} (${stats.vasPercent}% reduction)
• ROM Flexion: +${stats.romFlexionChange}° improvement
• Functional Score: +${stats.functionalChange}% improvement
• Sleep Quality: +${stats.sleepChange} points
• ADL Score: +${stats.adlChange}%
• Recovery Velocity: ${stats.velocity} VAS points/session
• Projected sessions to pain-free: ${stats.projected || "N/A"}
` : ""}
SESSION DETAILS:
${entries.map(e => `S${e.sessionNumber} (${e.date}): VAS=${e.vasScore}, ROM-Flex=${e.romFlexion}°, SLR=${e.slrLeft}°/${e.slrRight}°, Func=${e.functionalScore}%, Sleep=${e.sleepQuality}/10 | ${e.therapiesGiven}`).join("\n")}
            `.trim();
            navigator.clipboard.writeText(report);
            toast.success("Outcome report copied to clipboard!");
          }}>
            Copy Report
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Outcome Data"}
          </Button>
        </div>
      )}
    </div>
  );
}
