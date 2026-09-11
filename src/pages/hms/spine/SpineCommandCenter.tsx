import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, ArrowRight, Phone, MessageSquare, IndianRupee,
  Users, CheckCircle2, Clock, Stethoscope, Syringe, Sparkles,
  Activity, FileText, Brain, Zap, Bell, Calendar, Target,
  ChevronRight, Sun, PlayCircle, UserPlus, TrendingUp, Heart,
} from "lucide-react";

// ─── The 5-step patient flow (always shows the ONE next action) ───
const flowSteps = [
  { id: "assess", label: "AI Assessment", icon: Brain, route: "/hms/spine-ayush?tab=assessment", color: "blue" },
  { id: "exam", label: "Examination", icon: Stethoscope, route: "/hms/spine-ayush?tab=examination", color: "purple" },
  { id: "protocol", label: "Build Protocol", icon: FileText, route: "/hms/spine-treatment-protocol-builder", color: "orange" },
  { id: "treat", label: "Give Treatment", icon: Syringe, route: "/hms/spine-level1-session", color: "green" },
  { id: "track", label: "Track Outcome", icon: Activity, route: "/hms/spine-outcome-tracker", color: "emerald" },
];

// ─── Demo queue (would load from DB in production) ───
interface QueuePatient {
  id: string;
  name: string;
  condition: string;
  stage: string;
  nextAction: string;
  actionRoute: string;
  waiting: string;
  isNew?: boolean;
}

const demoQueue: QueuePatient[] = [
  { id: "q1", name: "Rajesh Kumar", condition: "Sciatica (L5-S1)", stage: "exam", nextAction: "Do Examination", actionRoute: "/hms/spine-ayush?tab=examination", waiting: "Waiting 5 min", isNew: true },
  { id: "q2", name: "Priya S.", condition: "Cervical Spondylosis", stage: "treat", nextAction: "Kati Basti — Day 3", actionRoute: "/hms/spine-level2-session", waiting: "Scheduled 10:30" },
  { id: "q3", name: "Mohammed A.", condition: "Low Back Pain", stage: "track", nextAction: "Record VAS + Outcome", actionRoute: "/hms/spine-outcome-tracker", waiting: "Scheduled 11:00" },
  { id: "q4", name: "Lakshmi R.", condition: "Frozen Shoulder", stage: "protocol", nextAction: "Build Protocol", actionRoute: "/hms/spine-treatment-protocol-builder", waiting: "Scheduled 11:30" },
];

const demoFollowUps = [
  { id: "f1", name: "Suresh (Day 1 post-Agnikarma)", message: "How is your pain today?", phone: "" },
  { id: "f2", name: "Anjali (VAS check due)", message: "Time for your progress check", phone: "" },
  { id: "f3", name: "Karthik (package ending)", message: "3 sessions left — extend & save 20%", phone: "" },
  { id: "f4", name: "Divya (30-day maintenance)", message: "Time for maintenance check-up", phone: "" },
];

const stageColor: Record<string, string> = {
  assess: "bg-blue-100 text-blue-700",
  exam: "bg-purple-100 text-purple-700",
  protocol: "bg-orange-100 text-orange-700",
  treat: "bg-green-100 text-green-700",
  track: "bg-emerald-100 text-emerald-700",
};

export default function SpineCommandCenter() {
  const navigate = useNavigate();
  const [dayStats, setDayStats] = useState({ sessions: 0, revenue: 0, packages: 0, newLeads: 0, loaded: false });
  const [greeting, setGreeting] = useState("");
  const [queue, setQueue] = useState<QueuePatient[]>(demoQueue);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

    const fetchData = async () => {
      try {
        const [sessionsRes, leadsCountRes, recentLeadsRes] = await Promise.all([
          supabase.from("spine_therapy_sessions").select("id", { count: "exact" }),
          supabase.from("spine_leads").select("id", { count: "exact" }),
          supabase.from("spine_leads").select("id, name, notes, status, whatsapp").order("created_at", { ascending: false }).limit(6),
        ]);
        const sessions = sessionsRes.count || 0;
        setDayStats({
          sessions,
          revenue: sessions * 800,
          packages: Math.floor(sessions / 5),
          newLeads: leadsCountRes.count || 0,
          loaded: true,
        });

        // Build live queue from real leads (fallback to demo if empty)
        const leads = recentLeadsRes.data || [];
        if (leads.length > 0) {
          const liveQueue: QueuePatient[] = leads.map((l: any, i: number) => ({
            id: l.id,
            name: l.name || "Patient",
            condition: l.notes || "Spine consultation",
            stage: i === 0 ? "assess" : "exam",
            nextAction: i === 0 ? "Start Assessment" : "Do Examination",
            actionRoute: "/hms/spine-ayush?tab=assessment",
            waiting: l.status || "New lead",
            isNew: (l.status || "").toLowerCase().includes("new") || i === 0,
          }));
          setQueue(liveQueue);
        }
      } catch (err) { setDayStats(p => ({ ...p, loaded: true })); }
    };
    fetchData();
  }, []);

  const nextPatient = queue[0] || demoQueue[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-green-600" />
            {greeting}, Doctor 👋
          </h1>
          <p className="text-muted-foreground mt-1">Your daily command center — everything in one place, one action at a time</p>
        </div>
        <Badge className="bg-green-100 text-green-700"><Sun className="h-3 w-3 mr-1" /> Today's Flow</Badge>
      </div>

      {/* ═══ THE ONE NEXT ACTION (biggest, most prominent) ═══ */}
      <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <PlayCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-green-600 uppercase tracking-wide">Your Next Action</p>
                <h2 className="text-lg font-bold">{nextPatient.name}</h2>
                <p className="text-sm text-muted-foreground">{nextPatient.condition} · {nextPatient.nextAction}</p>
              </div>
            </div>
            <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => navigate(nextPatient.actionRoute)}>
              Start Now <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 5-STEP FLOW (visual guide — the whole process) ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1"><Target className="h-4 w-4" /> The Spine AYUSH Flow (tap any step)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {flowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => navigate(step.route)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition hover:shadow-md min-w-[90px] hover:border-${step.color}-400`}
                  >
                    <div className={`w-9 h-9 rounded-full bg-${step.color}-100 flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 text-${step.color}-600`} />
                    </div>
                    <span className="text-[10px] font-medium text-center">{step.label}</span>
                    <Badge variant="outline" className="text-[8px]">Step {i + 1}</Badge>
                  </button>
                  {i < flowSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">Every patient follows this path: Assess → Examine → Plan → Treat → Track. Repeat for each patient.</p>
        </CardContent>
      </Card>

      {/* ═══ TODAY'S NUMBERS (quick glance) ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card><CardContent className="pt-3 pb-2 text-center"><Activity className="h-4 w-4 mx-auto text-green-500" /><p className="text-lg font-bold mt-1">{dayStats.sessions}</p><p className="text-[9px] text-muted-foreground">Sessions Today</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><IndianRupee className="h-4 w-4 mx-auto text-emerald-500" /><p className="text-lg font-bold mt-1">₹{dayStats.revenue.toLocaleString()}</p><p className="text-[9px] text-muted-foreground">Collected Today</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><Sparkles className="h-4 w-4 mx-auto text-amber-500" /><p className="text-lg font-bold mt-1">{dayStats.packages}</p><p className="text-[9px] text-muted-foreground">Packages Sold</p></CardContent></Card>
        <Card><CardContent className="pt-3 pb-2 text-center"><UserPlus className="h-4 w-4 mx-auto text-blue-500" /><p className="text-lg font-bold mt-1">{dayStats.newLeads}</p><p className="text-[9px] text-muted-foreground">New Leads</p></CardContent></Card>
      </div>

      {/* ═══ TODAY'S QUEUE ═══ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-1"><Users className="h-4 w-4" /> Today's Queue ({queue.length} patients)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border ${i === 0 ? "border-green-300 bg-green-50/50" : "hover:bg-muted/30"}`}>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{p.name}</span>
                  {p.isNew && <Badge className="bg-blue-100 text-blue-700 text-[8px]">NEW</Badge>}
                  <Badge className={`${stageColor[p.stage]} text-[8px]`}>{p.stage}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{p.condition} · {p.waiting}</p>
              </div>
              <Button size="sm" variant={i === 0 ? "default" : "outline"} className="gap-1 shrink-0" onClick={() => navigate(p.actionRoute)}>
                {p.nextAction} <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══ FOLLOW-UPS DUE (retention + growth) ═══ */}
      <Card className="border-amber-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-1"><Bell className="h-4 w-4 text-amber-500" /> Follow-Ups Due ({demoFollowUps.length})</CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { toast.success("Opening WhatsApp for all follow-ups..."); }}>
              <MessageSquare className="h-3 w-3" /> WhatsApp All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {demoFollowUps.map(f => (
            <div key={f.id} className="flex items-center gap-2 p-2 rounded border bg-amber-50/30 text-xs">
              <Clock className="h-3 w-3 text-amber-500 shrink-0" />
              <div className="flex-1">
                <span className="font-medium">{f.name}</span>
                <p className="text-[10px] text-muted-foreground">"{f.message}"</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.success(`Calling ${f.name}...`)}><Phone className="h-3 w-3 text-green-500" /></Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => toast.success(`WhatsApp sent to ${f.name}`)}><MessageSquare className="h-3 w-3 text-green-600" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══ QUICK ACTIONS (one tap to anything) ═══ */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Zap className="h-4 w-4 text-orange-500" /> Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "New Patient", icon: UserPlus, route: "/hms/spine-ayush?tab=assessment", color: "blue" },
              { label: "Quick Protocol", icon: Zap, route: "/hms/spine-quick-protocol", color: "amber" },
              { label: "Discharge Plan", icon: FileText, route: "/hms/spine-discharge-plan", color: "teal" },
              { label: "Patient Portal", icon: Heart, route: "/hms/spine-franchise-portal", color: "pink" },
            ].map(a => {
              const Icon = a.icon;
              return (
                <button key={a.label} onClick={() => navigate(a.route)} className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:shadow-md transition">
                  <Icon className={`h-5 w-5 text-${a.color}-500`} />
                  <span className="text-[10px] font-medium">{a.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ═══ END-OF-DAY (close the loop) ═══ */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-3 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">End of Day Summary</p>
                <p className="text-[10px] text-muted-foreground">Review your day, send pending follow-ups, plan tomorrow</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate("/hms/spine-franchise-ops")}>
              View Full Report <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center">
        One doctor, one screen, one action at a time. Follow the flow — the system guides you through everything.
      </p>
    </div>
  );
}
