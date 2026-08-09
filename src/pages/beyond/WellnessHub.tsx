import { useState, useEffect, useRef } from "react";
import {
  Award,
  Heart,
  Moon,
  Smile,
  Frown,
  Meh,
  Wind,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

// ════════════════════════════════════════════════════════════
// BREATHING TIMER
// ════════════════════════════════════════════════════════════

const BREATHING_PATTERNS = [
  { id: "box_breathing", name: "Box Breathing", desc: "4-4-4-4 (calm & focus)", inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: "4_7_8", name: "4-7-8 Relaxing", desc: "Inhale 4, hold 7, exhale 8", inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: "deep_belly", name: "Deep Belly", desc: "5-5 (simplest)", inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
];

function BreathingTimer() {
  const { addXP, addCoins, recordStreak, grantBadge } = useBeyondGamification();
  const [pattern, setPattern] = useState(BREATHING_PATTERNS[0]);
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold1" | "exhale" | "hold2">("idle");
  const [seconds, setSeconds] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalCycleTime = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;

  useEffect(() => {
    if (phase === "idle") return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        setTotalElapsed((t) => t + 1);
        // Determine phase transitions
        if (phase === "inhale" && next >= pattern.inhale) {
          setPhase(pattern.hold1 > 0 ? "hold1" : "exhale");
          return 0;
        }
        if (phase === "hold1" && next >= pattern.hold1) {
          setPhase("exhale");
          return 0;
        }
        if (phase === "exhale" && next >= pattern.exhale) {
          if (pattern.hold2 > 0) { setPhase("hold2"); return 0; }
          setCycles((c) => c + 1);
          setPhase("inhale");
          return 0;
        }
        if (phase === "hold2" && next >= pattern.hold2) {
          setCycles((c) => c + 1);
          setPhase("inhale");
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, pattern]);

  const start = () => { setPhase("inhale"); setSeconds(0); setTotalElapsed(0); setCycles(0); };

  const stop = async () => {
    setPhase("idle");
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalElapsed >= 60) {
      const { data: session } = await supabase.auth.getSession();
      if (session.session) {
        await (supabase as any).from("beyond_breathing_sessions").insert({
          user_id: session.session.user.id,
          type: pattern.id,
          duration_seconds: totalElapsed,
        });
        await addXP(10, "breathing_done", "Completed breathing exercise");
        await recordStreak("wellness");
        await grantBadge("Deep Breath");
        toast.success(`Breathing done! ${cycles} cycles, +10 XP`);
      }
    } else if (totalElapsed > 0) {
      toast("Keep going! Aim for at least 1 minute for XP.");
    }
  };

  const phaseLabel = phase === "inhale" ? "Breathe In" : phase === "hold1" ? "Hold" : phase === "exhale" ? "Breathe Out" : phase === "hold2" ? "Hold" : "Ready";
  const phaseColor = phase === "inhale" ? "text-blue-500" : phase === "exhale" ? "text-emerald-500" : phase === "idle" ? "text-muted-foreground" : "text-amber-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-blue-500" />
          Breathing Exercise
        </CardTitle>
        <CardDescription>2 minutes can reset your nervous system between patients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pattern selector */}
        <div className="flex gap-2 flex-wrap">
          {BREATHING_PATTERNS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={pattern.id === p.id ? "default" : "outline"}
              onClick={() => { if (phase === "idle") setPattern(p); }}
              disabled={phase !== "idle"}
              className="text-xs"
            >
              {p.name}
            </Button>
          ))}
        </div>

        {/* Visual Circle */}
        <div className="flex flex-col items-center py-4">
          <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-1000 ${
            phase === "inhale" ? "scale-110 border-blue-400 bg-blue-50 dark:bg-blue-950/30" :
            phase === "exhale" ? "scale-90 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" :
            phase === "hold1" || phase === "hold2" ? "scale-105 border-amber-400 bg-amber-50 dark:bg-amber-950/30" :
            "scale-100 border-muted bg-muted/30"
          }`}>
            <div className="text-center">
              <p className={`text-lg font-bold ${phaseColor}`}>{phaseLabel}</p>
              {phase !== "idle" && <p className="text-2xl font-mono">{seconds}</p>}
            </div>
          </div>
          {phase !== "idle" && (
            <p className="text-xs text-muted-foreground mt-3">Cycle {cycles + 1} · {Math.floor(totalElapsed / 60)}:{String(totalElapsed % 60).padStart(2, "0")}</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {phase === "idle" ? (
            <Button onClick={start} className="gap-2"><Wind className="h-4 w-4" /> Start Breathing</Button>
          ) : (
            <Button onClick={stop} variant="secondary" className="gap-2">Stop & Save</Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">{pattern.desc} · Min 1 min for XP</p>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MOOD TRACKER
// ════════════════════════════════════════════════════════════

const MOODS = [
  { value: 1, emoji: "😫", label: "Very Low", color: "bg-red-100 border-red-300" },
  { value: 2, emoji: "😔", label: "Low", color: "bg-orange-100 border-orange-300" },
  { value: 3, emoji: "😐", label: "Neutral", color: "bg-yellow-100 border-yellow-300" },
  { value: 4, emoji: "🙂", label: "Good", color: "bg-green-100 border-green-300" },
  { value: 5, emoji: "😄", label: "Great", color: "bg-emerald-100 border-emerald-300" },
];

const MOOD_TAGS = ["tired", "anxious", "grateful", "productive", "overwhelmed", "peaceful", "frustrated", "hopeful", "lonely", "energized"];

function MoodTracker() {
  const { addXP, recordStreak } = useBeyondGamification();
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [todayLogged, setTodayLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkToday();
  }, []);

  const checkToday = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await (supabase as any)
      .from("beyond_mood_logs")
      .select("id")
      .eq("user_id", session.session.user.id)
      .eq("date", today)
      .maybeSingle();
    if (data) setTodayLogged(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveMood = async () => {
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_mood_logs").upsert({
      user_id: session.session.user.id,
      mood, energy, stress,
      tags: selectedTags,
      note: note || null,
      date: new Date().toISOString().split("T")[0],
    }, { onConflict: "user_id,date" });

    if (!todayLogged) {
      await addXP(15, "mood_logged", "Logged daily mood");
      await recordStreak("wellness");
    }
    setTodayLogged(true);
    toast.success(todayLogged ? "Mood updated!" : "Mood logged! +15 XP");
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5 text-amber-500" />
          Daily Mood Check
        </CardTitle>
        <CardDescription>30 seconds. How are you really feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mood selector */}
        <div>
          <p className="text-xs font-medium mb-2">Mood</p>
          <div className="flex gap-2 justify-center">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${
                  mood === m.value ? `${m.color} scale-110` : "border-muted hover:border-primary/30"
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Energy & Stress sliders */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Energy</span><span className="font-medium">{energy}/5</span>
            </div>
            <Slider value={[energy]} onValueChange={([v]) => setEnergy(v)} min={1} max={5} step={1} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Stress</span><span className="font-medium">{stress}/5</span>
            </div>
            <Slider value={[stress]} onValueChange={([v]) => setStress(v)} min={1} max={5} step={1} />
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs font-medium mb-2">How you feel (pick any)</p>
          <div className="flex flex-wrap gap-1.5">
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                  selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <Textarea
          placeholder="Anything else? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="text-sm"
        />

        <Button onClick={saveMood} disabled={saving} className="w-full">
          {saving ? "Saving..." : todayLogged ? "Update Mood" : "Log Mood (+15 XP)"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// GRATITUDE JOURNAL
// ════════════════════════════════════════════════════════════

function GratitudeJournal() {
  const { addXP, addCoins, recordStreak, grantBadge } = useBeyondGamification();
  const [entry1, setEntry1] = useState("");
  const [entry2, setEntry2] = useState("");
  const [entry3, setEntry3] = useState("");
  const [patientWin, setPatientWin] = useState("");
  const [todayDone, setTodayDone] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { checkToday(); }, []);

  const checkToday = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const today = new Date().toISOString().split("T")[0];
    const { data } = await (supabase as any)
      .from("beyond_gratitude_entries")
      .select("id, entry_1, entry_2, entry_3, patient_win")
      .eq("user_id", session.session.user.id)
      .eq("date", today)
      .maybeSingle();
    if (data) {
      setEntry1(data.entry_1 || "");
      setEntry2(data.entry_2 || "");
      setEntry3(data.entry_3 || "");
      setPatientWin(data.patient_win || "");
      setTodayDone(true);
    }
  };

  const save = async () => {
    if (!entry1.trim()) { toast.error("Write at least one thing you're grateful for"); return; }
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_gratitude_entries").upsert({
      user_id: session.session.user.id,
      entry_1: entry1,
      entry_2: entry2 || null,
      entry_3: entry3 || null,
      patient_win: patientWin || null,
      date: new Date().toISOString().split("T")[0],
    }, { onConflict: "user_id,date" });

    if (!todayDone) {
      await addXP(30, "gratitude_logged", "Wrote gratitude journal");
      await addCoins(10, "gratitude_logged");
      await recordStreak("reflection");
      await grantBadge("Scribe");
    }
    setTodayDone(true);
    toast.success(todayDone ? "Updated!" : "Gratitude logged! +30 XP");
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Gratitude Journal
        </CardTitle>
        <CardDescription>3 things you're grateful for today + 1 patient win.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Input placeholder="1. I'm grateful for..." value={entry1} onChange={(e) => setEntry1(e.target.value)} />
          <Input placeholder="2. I'm grateful for..." value={entry2} onChange={(e) => setEntry2(e.target.value)} />
          <Input placeholder="3. I'm grateful for..." value={entry3} onChange={(e) => setEntry3(e.target.value)} />
        </div>
        <div>
          <p className="text-xs font-medium mb-1">Patient Win (optional)</p>
          <Input placeholder="Something that went well with a patient today..." value={patientWin} onChange={(e) => setPatientWin(e.target.value)} />
        </div>
        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? "Saving..." : todayDone ? "Update Entry" : "Save (+30 XP)"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// BURNOUT QUIZ
// ════════════════════════════════════════════════════════════

function BurnoutQuiz() {
  const { addXP } = useBeyondGamification();
  const [exhaustion, setExhaustion] = useState(5);
  const [cynicism, setCynicism] = useState(5);
  const [inefficacy, setInefficiency] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalScore = ((exhaustion + cynicism + inefficacy) / 3).toFixed(1);
  const riskLevel = Number(totalScore) >= 7 ? "high" : Number(totalScore) >= 4 ? "moderate" : "low";

  const submit = async () => {
    setSaving(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { setSaving(false); return; }

    await (supabase as any).from("beyond_burnout_assessments").insert({
      user_id: session.session.user.id,
      exhaustion_score: exhaustion,
      cynicism_score: cynicism,
      inefficacy_score: inefficacy,
    });

    await addXP(20, "burnout_assessed", "Completed burnout self-check");
    setSubmitted(true);
    setSaving(false);
    toast.success("Burnout assessment saved! +20 XP");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Burnout Check
        </CardTitle>
        <CardDescription>Quick 3-dimension self-assessment (adapted from Maslach Burnout Inventory).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!submitted ? (
          <>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Emotional Exhaustion</span><span className="font-medium">{exhaustion}/10</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">How drained do you feel at end of workday?</p>
              <Slider value={[exhaustion]} onValueChange={([v]) => setExhaustion(v)} min={0} max={10} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Cynicism / Detachment</span><span className="font-medium">{cynicism}/10</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">How disconnected do you feel from patients/work?</p>
              <Slider value={[cynicism]} onValueChange={([v]) => setCynicism(v)} min={0} max={10} step={1} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Inefficacy / Self-doubt</span><span className="font-medium">{inefficacy}/10</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-1">How often do you feel your work doesn't make a difference?</p>
              <Slider value={[inefficacy]} onValueChange={([v]) => setInefficiency(v)} min={0} max={10} step={1} />
            </div>
            <Button onClick={submit} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Submit Assessment"}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-lg p-4 text-center ${
              riskLevel === "high" ? "bg-red-50 dark:bg-red-950/30" :
              riskLevel === "moderate" ? "bg-amber-50 dark:bg-amber-950/30" :
              "bg-green-50 dark:bg-green-950/30"
            }`}>
              <p className="text-2xl font-bold">{totalScore}/10</p>
              <Badge className={`mt-1 ${
                riskLevel === "high" ? "bg-red-600" : riskLevel === "moderate" ? "bg-amber-600" : "bg-green-600"
              }`}>
                {riskLevel === "high" ? "⚠️ High Risk" : riskLevel === "moderate" ? "⚡ Moderate" : "✓ Low Risk"}
              </Badge>
            </div>

            {riskLevel === "high" && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Important
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Your burnout score is high. Please consider talking to a trusted colleague, mentor, or professional.
                  You deserve support. Try: breathing exercise, reduce one commitment, prioritize sleep this week.
                </p>
              </div>
            )}
            {riskLevel === "moderate" && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  You're in the yellow zone. Focus on recovery: exercise, sleep, boundaries. Try the breathing tool daily.
                </p>
              </div>
            )}
            {riskLevel === "low" && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3">
                <p className="text-xs text-green-700 dark:text-green-300">
                  You're managing well! Keep your current habits going. Monthly re-checks help catch changes early.
                </p>
              </div>
            )}
            <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
              Take Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN WELLNESS HUB PAGE
// ════════════════════════════════════════════════════════════

const WellnessHub = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Heart className="h-7 w-7 text-rose-500" />
            Wellness Hub
          </h1>
          <p className="text-muted-foreground">Heal yourself first — you can't pour from an empty cup</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +10-30 XP per activity
        </Badge>
      </div>

      <Tabs defaultValue="breathe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="breathe" className="gap-1">
            <Wind className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Breathe</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="gap-1">
            <Smile className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mood</span>
          </TabsTrigger>
          <TabsTrigger value="gratitude" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Gratitude</span>
          </TabsTrigger>
          <TabsTrigger value="burnout" className="gap-1">
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Burnout</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breathe">
          <BreathingTimer />
        </TabsContent>

        <TabsContent value="mood">
          <MoodTracker />
        </TabsContent>

        <TabsContent value="gratitude">
          <GratitudeJournal />
        </TabsContent>

        <TabsContent value="burnout">
          <BurnoutQuiz />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WellnessHub;
