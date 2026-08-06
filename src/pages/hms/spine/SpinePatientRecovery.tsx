import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity, TrendingUp, Target, Heart, Brain, Clock, Users,
  CheckCircle2, BarChart3, Calendar, Zap, Star, ArrowRight,
} from "lucide-react";

export default function SpinePatientRecovery() {
  const [selectedPatient] = useState("Ramesh K.");
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [liveScores, setLiveScores] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch therapy sessions for this patient
        const { data: sessions } = await supabase
          .from("spine_therapy_sessions")
          .select("*")
          .eq("patient_id", user.id)
          .order("session_date", { ascending: true });

        if (sessions && sessions.length > 0) {
          setLiveSessions(sessions);
        }

        // Fetch recovery scores
        const { data: scores } = await supabase
          .from("spine_recovery_scores")
          .select("*")
          .eq("patient_id", user.id)
          .order("score_date", { ascending: true });

        if (scores && scores.length > 0) {
          setLiveScores(scores);
        }
      } catch (err) {
        console.error("Error fetching patient recovery data:", err);
      }
    };
    fetchPatientData();
  }, []);

  // Build recovery scores from live sessions if available
  const hasLiveData = liveSessions.length > 0;

  const liveRecoveryScores = liveSessions.map((s, i) => ({
    date: s.session_date,
    vas: s.pain_after ?? s.pain_before ?? 5,
    rom: 30 + (i * 5), // estimated progression
    functional: 25 + (i * 7),
    recovery: Math.min(100, Math.round(((s.pain_before || 8) - (s.pain_after || s.pain_before || 5)) / (s.pain_before || 8) * 100) + (i * 8)),
    session: i + 1,
  }));

  const liveTherapiesUsed = liveSessions.reduce((acc: any[], s) => {
    const existing = acc.find(a => a.id === s.therapy_id);
    if (existing) { existing.sessions += 1; }
    else { acc.push({ id: s.therapy_id, name: s.therapy_name, sessions: 1, icon: "💊", lastVas: `${s.pain_before || "?"}→${s.pain_after || "?"}` }); }
    return acc;
  }, []);

  // Demo data for a patient's recovery journey
  const patientInfo = { name: "Ramesh K.", age: 45, diagnosis: "Sciatica (L4-S1)", startDate: "2026-05-01", currentSession: 14, totalPlanned: 20, tier: "Gold", branch: "Kadayanallur" };

  const recoveryScores = [
    { date: "2026-05-01", vas: 8, rom: 30, functional: 25, recovery: 12, session: 1 },
    { date: "2026-05-05", vas: 7, rom: 35, functional: 30, recovery: 20, session: 2 },
    { date: "2026-05-08", vas: 6, rom: 40, functional: 38, recovery: 30, session: 4 },
    { date: "2026-05-15", vas: 5, rom: 50, functional: 48, recovery: 42, session: 6 },
    { date: "2026-05-22", vas: 4, rom: 55, functional: 55, recovery: 52, session: 8 },
    { date: "2026-06-01", vas: 3, rom: 62, functional: 65, recovery: 62, session: 10 },
    { date: "2026-06-10", vas: 2, rom: 70, functional: 72, recovery: 72, session: 12 },
    { date: "2026-06-20", vas: 2, rom: 75, functional: 78, recovery: 78, session: 14 },
  ];

  const therapiesUsed = [
    { id: 1, name: "Acupuncture", sessions: 6, icon: "🪡", lastVas: "8→3" },
    { id: 14, name: "Marma Therapy", sessions: 4, icon: "🙏", lastVas: "6→2" },
    { id: 3, name: "Dry Needling", sessions: 3, icon: "📌", lastVas: "5→2" },
    { id: 9, name: "Cupping", sessions: 2, icon: "🫙", lastVas: "4→2" },
    { id: 4, name: "Trigger Point", sessions: 3, icon: "🎯", lastVas: "4→2" },
    { id: 12, name: "MET/Osteopathic", sessions: 2, icon: "🦴", lastVas: "3→2" },
  ];

  const prescription = {
    prescribed: [
      { therapy: "Acupuncture", planned: 8, done: 6, status: "active" },
      { therapy: "Marma Therapy", planned: 6, done: 4, status: "active" },
      { therapy: "Dry Needling", planned: 4, done: 3, status: "active" },
      { therapy: "Cupping", planned: 4, done: 2, status: "active" },
      { therapy: "Trigger Point", planned: 4, done: 3, status: "active" },
      { therapy: "MET/Osteopathic", planned: 4, done: 2, status: "active" },
      { therapy: "Corrective Exercise (M7-M9)", planned: 12, done: 8, status: "active" },
    ],
    modules: ["M1: Posture Intro", "M4: Lateral View", "M7: Corrective Exercise", "M9: Lower Cross (LCS)"],
    homeExercises: ["BL40 acupressure 3x/day", "Piriformis ball release (2 min)", "Cat-cow 10 reps morning", "Hip flexor stretch 30 sec x3"],
  };

  const latest = (hasLiveData ? liveRecoveryScores : recoveryScores)[((hasLiveData ? liveRecoveryScores : recoveryScores).length - 1)];
  const baseline = (hasLiveData ? liveRecoveryScores : recoveryScores)[0];
  const overallImprovement = latest.recovery - baseline.recovery;
  const activeRecoveryScores = hasLiveData ? liveRecoveryScores : recoveryScores;
  const activeTherapies = hasLiveData ? liveTherapiesUsed : therapiesUsed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Patient Recovery Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track recovery score · Session history · Prescription progress</p>
        </div>
        <Badge className="bg-green-100 text-green-700"><Target className="h-3 w-3 mr-1" /> Measurable Outcomes</Badge>
      </div>

      {/* Patient Card */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-600 grid place-items-center text-white font-bold text-lg">{patientInfo.name[0]}</div>
              <div>
                <p className="font-bold text-lg">{patientInfo.name} <span className="text-sm font-normal text-muted-foreground">({patientInfo.age}y)</span></p>
                <p className="text-sm text-muted-foreground">{patientInfo.diagnosis} · {patientInfo.branch}</p>
                {hasLiveData && <p className="text-[10px] text-green-600 font-medium">Live data from {liveSessions.length} recorded sessions</p>}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center"><p className="font-bold text-lg text-green-700">{latest.recovery}%</p><p className="text-muted-foreground">Recovery</p></div>
              <div className="text-center"><p className="font-bold text-lg text-blue-700">{hasLiveData ? liveSessions.length : patientInfo.currentSession}/{patientInfo.totalPlanned}</p><p className="text-muted-foreground">Sessions</p></div>
              <div className="text-center"><p className="font-bold text-lg text-purple-700">{latest.vas}/10</p><p className="text-muted-foreground">Current VAS</p></div>
              <Badge className="bg-amber-100 text-amber-700">{patientInfo.tier} Member</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="border-green-200"><CardContent className="p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-green-600" />
          <p className="text-2xl font-bold text-green-700 mt-1">{latest.recovery}%</p>
          <p className="text-[10px] text-muted-foreground">Overall Recovery</p>
          <p className="text-[9px] text-green-600">+{overallImprovement}% from baseline</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Target className="h-5 w-5 mx-auto text-red-600" />
          <p className="text-2xl font-bold mt-1">{baseline.vas} → {latest.vas}</p>
          <p className="text-[10px] text-muted-foreground">VAS Pain Score</p>
          <p className="text-[9px] text-green-600">{Math.round(((baseline.vas - latest.vas) / baseline.vas) * 100)}% reduction</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Activity className="h-5 w-5 mx-auto text-blue-600" />
          <p className="text-2xl font-bold mt-1">{latest.rom}°</p>
          <p className="text-[10px] text-muted-foreground">ROM (Flexion)</p>
          <p className="text-[9px] text-green-600">+{latest.rom - baseline.rom}° gained</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Heart className="h-5 w-5 mx-auto text-purple-600" />
          <p className="text-2xl font-bold mt-1">{latest.functional}%</p>
          <p className="text-[10px] text-muted-foreground">Functional Score</p>
          <p className="text-[9px] text-green-600">+{latest.functional - baseline.functional}% improvement</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Calendar className="h-5 w-5 mx-auto text-amber-600" />
          <p className="text-2xl font-bold mt-1">{patientInfo.currentSession}</p>
          <p className="text-[10px] text-muted-foreground">Sessions Done</p>
          <p className="text-[9px] text-muted-foreground">of {patientInfo.totalPlanned} planned</p>
        </CardContent></Card>
      </div>

      {/* Recovery Progress Timeline */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-5 w-5 text-green-600" /> Recovery Progress Over Time</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1 text-[9px] text-muted-foreground text-center mb-1">
              {activeRecoveryScores.slice(-8).map((s) => <span key={s.session}>S{s.session}</span>)}
            </div>
            {/* VAS Pain (inverted — lower is better) */}
            <div>
              <p className="text-xs font-medium text-red-600 mb-1">Pain Level (VAS) — lower is better</p>
              <div className="grid grid-cols-8 gap-1">
                {activeRecoveryScores.slice(-8).map((s) => (
                  <div key={s.session} className="text-center">
                    <div className="bg-red-100 rounded-sm overflow-hidden h-16 flex items-end">
                      <div className="w-full bg-red-400 transition-all" style={{ height: `${s.vas * 10}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-red-700">{s.vas}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Recovery % (higher is better) */}
            <div className="mt-3">
              <p className="text-xs font-medium text-green-600 mb-1">Recovery % — higher is better</p>
              <div className="grid grid-cols-8 gap-1">
                {activeRecoveryScores.slice(-8).map((s) => (
                  <div key={s.session} className="text-center">
                    <div className="bg-green-100 rounded-sm overflow-hidden h-16 flex items-end">
                      <div className="w-full bg-green-500 transition-all" style={{ height: `${s.recovery}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-green-700">{s.recovery}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Therapies Used */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Zap className="h-5 w-5 text-blue-600" /> Therapies Applied (from 15 Systems)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {activeTherapies.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                <span className="text-lg">{t.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.sessions} sessions completed</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-green-700">VAS: {t.lastVas}</p>
                </div>
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground pt-2 border-t">Total: {activeTherapies.reduce((s, t) => s + t.sessions, 0)} sessions across {activeTherapies.length} therapy systems</p>
          </CardContent>
        </Card>

        {/* Prescription Progress */}
        <Card className="border-purple-200">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5 text-purple-600" /> Prescription Progress</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {prescription.prescribed.map((rx) => (
              <div key={rx.therapy} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{rx.therapy}</span>
                  <span className="font-bold">{rx.done}/{rx.planned}</span>
                </div>
                <Progress value={(rx.done / rx.planned) * 100} className="h-1.5" />
              </div>
            ))}
            <Separator className="my-2" />
            <div>
              <p className="text-xs font-medium text-blue-700 mb-1">Modules Assigned:</p>
              <div className="flex flex-wrap gap-1">
                {prescription.modules.map(m => <Badge key={m} variant="outline" className="text-[9px]">{m}</Badge>)}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs font-medium text-green-700 mb-1">Home Exercises:</p>
              <ul className="text-[10px] space-y-0.5 text-muted-foreground">
                {prescription.homeExercises.map(e => <li key={e} className="flex items-start gap-1"><CheckCircle2 className="h-3 w-3 text-green-500 shrink-0 mt-0.5" />{e}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Badges */}
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> Recovery Milestones Achieved</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { badge: "First Session Done", earned: true },
              { badge: "50% Pain Reduction", earned: true },
              { badge: "10 Sessions Streak", earned: true },
              { badge: "ROM +30° Gained", earned: true },
              { badge: "Self-Care Master", earned: true },
              { badge: "70% Recovery", earned: true },
              { badge: "Pain-Free Week", earned: false },
              { badge: "100% Recovery", earned: false },
            ].map(m => (
              <Badge key={m.badge} className={m.earned ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}>
                {m.earned ? "🏆" : "🔒"} {m.badge}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
