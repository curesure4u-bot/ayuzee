import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart, CheckCircle2, Circle, TrendingDown, Star, Share2,
  Smile, Award, ArrowRight, Activity, Calendar, Gift, Sparkles,
  Sun, ThumbsUp, PartyPopper, Users, MessageSquare,
} from "lucide-react";

// ─── 5 healing stages (patient-friendly language, NO jargon) ───
const stages = [
  { id: 1, label: "Assessed", emoji: "🔍", desc: "We found the cause of your pain" },
  { id: 2, label: "Treatment Started", emoji: "🌱", desc: "Your healing has begun" },
  { id: 3, label: "Improving", emoji: "📈", desc: "You're getting better each day" },
  { id: 4, label: "Almost There", emoji: "💪", desc: "Nearly pain-free now" },
  { id: 5, label: "Recovered", emoji: "🎉", desc: "Back to your best self!" },
];

// ─── Encouraging messages based on progress ───
const getEncouragement = (pct: number) => {
  if (pct >= 90) return { msg: "Amazing! You've almost fully recovered. Keep up the great work! 🎉", color: "text-green-600" };
  if (pct >= 60) return { msg: "You're doing wonderfully! More than halfway to full recovery. 💪", color: "text-green-600" };
  if (pct >= 40) return { msg: "Great progress! Your body is healing beautifully. 🌱", color: "text-blue-600" };
  if (pct >= 20) return { msg: "You've started well. Every session brings you closer to relief. 😊", color: "text-blue-600" };
  return { msg: "Your healing journey has begun. Trust the process — you're in good hands. 🙏", color: "text-purple-600" };
};

export default function SpinePatientJourney() {
  // Patient data (editable for demo — in production loads from patient record)
  const [patient, setPatient] = useState({
    name: "Rajesh Kumar",
    condition: "Sciatica (Back & Leg Pain)",
    vasStart: 8,
    vasNow: 3,
    sessionsDone: 6,
    sessionsTotal: 10,
    startDate: "1 month ago",
    doctorName: "Dr. Mohamad Saleem",
  });

  // Auto-load most recent outcome-tracked patient from DB (falls back to demo)
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const { data } = await supabase
          .from("spine_therapy_sessions")
          .select("therapy_name, pain_before, pain_after, doctor_notes, created_at")
          .eq("status", "outcome_tracked")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data && data.pain_before != null) {
          let parsed: any = {};
          try { parsed = typeof data.doctor_notes === "string" ? JSON.parse(data.doctor_notes) : (data.doctor_notes || {}); } catch { parsed = {}; }
          const entries = parsed.entries || [];
          setPatient(prev => ({
            ...prev,
            name: parsed.patientName || prev.name,
            condition: parsed.condition || prev.condition,
            vasStart: data.pain_before ?? prev.vasStart,
            vasNow: data.pain_after ?? prev.vasNow,
            sessionsDone: entries.length || prev.sessionsDone,
            sessionsTotal: Math.max(entries.length, prev.sessionsTotal),
          }));
        }
      } catch { /* keep demo */ }
    };
    loadRecent();
  }, []);

  // Compute progress
  const painReduction = patient.vasStart > 0 ? Math.round(((patient.vasStart - patient.vasNow) / patient.vasStart) * 100) : 0;
  const sessionProgress = patient.sessionsTotal > 0 ? Math.round((patient.sessionsDone / patient.sessionsTotal) * 100) : 0;
  // Current stage based on pain reduction
  const currentStage = painReduction >= 90 ? 5 : painReduction >= 65 ? 4 : painReduction >= 35 ? 3 : painReduction > 0 ? 2 : 1;
  const encouragement = getEncouragement(painReduction);
  const sessionsLeft = patient.sessionsTotal - patient.sessionsDone;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Your Healing Journey
        </h1>
        <p className="text-muted-foreground mt-1">See how far you've come — {patient.name}</p>
      </div>

      {/* ═══ THE BIG PROGRESS — Pain Reduction (the number that matters most) ═══ */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-6 pb-6 text-center">
          <p className="text-sm text-muted-foreground">Your pain has reduced by</p>
          <p className="text-6xl font-bold text-green-600 my-2">{painReduction}%</p>
          <div className="flex items-center justify-center gap-3 text-lg">
            <Badge className="bg-red-100 text-red-600 text-base px-3 py-1">Started: {patient.vasStart}/10 😣</Badge>
            <ArrowRight className="h-5 w-5 text-green-500" />
            <Badge className="bg-green-100 text-green-700 text-base px-3 py-1">Now: {patient.vasNow}/10 🙂</Badge>
          </div>
          <p className={`text-sm font-medium mt-3 ${encouragement.color}`}>{encouragement.msg}</p>
        </CardContent>
      </Card>

      {/* ═══ 5-STAGE VISUAL JOURNEY (the big picture) ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-center">Where You Are in Your Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-6 left-8 right-8 h-1 bg-muted -z-0" />
            <div className="absolute top-6 left-8 h-1 bg-green-500 -z-0 transition-all" style={{ width: `${((currentStage - 1) / (stages.length - 1)) * 85}%` }} />
            {stages.map(stage => {
              const isDone = stage.id < currentStage;
              const isCurrent = stage.id === currentStage;
              return (
                <div key={stage.id} className="flex flex-col items-center gap-1 z-10 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition ${
                    isDone ? "bg-green-500 border-green-500" :
                    isCurrent ? "bg-white border-green-500 ring-4 ring-green-200 scale-110" :
                    "bg-muted border-muted-foreground/30"
                  }`}>
                    {isDone ? "✓" : stage.emoji}
                  </div>
                  <span className={`text-[10px] font-medium text-center ${isCurrent ? "text-green-600 font-bold" : isDone ? "text-green-600" : "text-muted-foreground"}`}>
                    {stage.label}
                  </span>
                  {isCurrent && <Badge className="bg-green-100 text-green-700 text-[8px]">You are here</Badge>}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3">
            {stages.find(s => s.id === currentStage)?.desc}
          </p>
        </CardContent>
      </Card>

      {/* ═══ SESSIONS PROGRESS ═══ */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1"><Activity className="h-4 w-4 text-blue-500" /> Treatment Sessions</span>
            <span className="text-sm font-bold">{patient.sessionsDone} of {patient.sessionsTotal} done</span>
          </div>
          <Progress value={sessionProgress} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-green-600 font-medium">✓ {patient.sessionsDone} completed</span>
            <span className="text-muted-foreground">{sessionsLeft} more to full recovery</span>
          </div>
        </CardContent>
      </Card>

      {/* ═══ WHAT'S NEXT (simple, clear) ═══ */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1"><Calendar className="h-4 w-4 text-blue-500" /> What's Next For You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {sessionsLeft > 0 ? (
              <>
                <div className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> Complete {sessionsLeft} more sessions</div>
                <div className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> Keep doing your home exercises daily</div>
                <div className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> Your next check-up with {patient.doctorName}</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> Treatment complete — you did it! 🎉</div>
                <div className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> Continue home exercises to stay pain-free</div>
                <div className="flex items-center gap-2"><Circle className="h-3 w-3 text-blue-400" /> Monthly maintenance check recommended</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ═══ MILESTONES / CELEBRATIONS ═══ */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Award className="h-4 w-4 text-amber-500" /> Your Achievements</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { done: patient.sessionsDone >= 1, emoji: "🌱", label: "First Session" },
              { done: painReduction >= 30, emoji: "📉", label: "Pain Down 30%" },
              { done: painReduction >= 50, emoji: "💪", label: "Halfway There" },
              { done: painReduction >= 90, emoji: "🏆", label: "Recovered" },
            ].map((m, i) => (
              <div key={i} className={`p-2 rounded-lg border text-center ${m.done ? "bg-amber-50 border-amber-200" : "opacity-40"}`}>
                <p className="text-2xl">{m.emoji}</p>
                <p className="text-[10px] font-medium mt-1">{m.label}</p>
                {m.done && <Badge className="bg-amber-100 text-amber-700 text-[8px] mt-1">Unlocked!</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ═══ REFERRAL PROMPT (growth engine — only when improving well) ═══ */}
      {painReduction >= 50 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-4 pb-4 text-center">
            <PartyPopper className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <p className="font-medium text-sm">You're healing beautifully! 🎉</p>
            <p className="text-xs text-muted-foreground mt-1">Know someone with back or neck pain? Refer them — you both get ₹200 off your next visit.</p>
            <Button size="sm" className="mt-3 gap-1 bg-purple-600 hover:bg-purple-700" onClick={() => {
              const text = `I'm recovering from ${patient.condition} at Ayuzee Spine AYUSH — my pain dropped ${painReduction}%! If you have back/neck pain, check them out. We both get ₹200 off.`;
              navigator.clipboard.writeText(text);
              toast.success("Referral message copied! Share it with friends & family.");
            }}>
              <Share2 className="h-4 w-4" /> Refer a Friend & Save ₹200
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ═══ SHARE MY PROGRESS ═══ */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => {
          const text = `My Healing Journey at Ayuzee Spine AYUSH 🌿\n\nCondition: ${patient.condition}\nPain reduced: ${patient.vasStart}/10 → ${patient.vasNow}/10 (${painReduction}% better!)\nSessions: ${patient.sessionsDone}/${patient.sessionsTotal}\n\nFeeling so much better! 🙏`;
          navigator.clipboard.writeText(text);
          toast.success("Your progress copied — share it on WhatsApp!");
        }}>
          <Share2 className="h-4 w-4" /> Share My Progress
        </Button>
      </div>

      {/* ═══ DOCTOR: Edit patient data (only visible to staff, small) ═══ */}
      <Card className="border-dashed">
        <CardHeader className="pb-2"><CardTitle className="text-[11px] text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Doctor: Update Patient Progress (for demo)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div><label className="text-[9px] text-muted-foreground">Patient Name</label><Input className="h-7 text-xs" value={patient.name} onChange={e => setPatient(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="text-[9px] text-muted-foreground">Condition</label><Input className="h-7 text-xs" value={patient.condition} onChange={e => setPatient(p => ({ ...p, condition: e.target.value }))} /></div>
            <div><label className="text-[9px] text-muted-foreground">Doctor</label><Input className="h-7 text-xs" value={patient.doctorName} onChange={e => setPatient(p => ({ ...p, doctorName: e.target.value }))} /></div>
            <div><label className="text-[9px] text-muted-foreground">VAS Start (0-10)</label><Input type="number" min="0" max="10" className="h-7 text-xs" value={patient.vasStart} onChange={e => setPatient(p => ({ ...p, vasStart: parseInt(e.target.value) || 0 }))} /></div>
            <div><label className="text-[9px] text-muted-foreground">VAS Now (0-10)</label><Input type="number" min="0" max="10" className="h-7 text-xs" value={patient.vasNow} onChange={e => setPatient(p => ({ ...p, vasNow: parseInt(e.target.value) || 0 }))} /></div>
            <div className="grid grid-cols-2 gap-1">
              <div><label className="text-[9px] text-muted-foreground">Done</label><Input type="number" min="0" className="h-7 text-xs" value={patient.sessionsDone} onChange={e => setPatient(p => ({ ...p, sessionsDone: parseInt(e.target.value) || 0 }))} /></div>
              <div><label className="text-[9px] text-muted-foreground">Total</label><Input type="number" min="1" className="h-7 text-xs" value={patient.sessionsTotal} onChange={e => setPatient(p => ({ ...p, sessionsTotal: parseInt(e.target.value) || 1 }))} /></div>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">In production this loads automatically from the patient's Outcome Tracker records — no manual entry needed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
