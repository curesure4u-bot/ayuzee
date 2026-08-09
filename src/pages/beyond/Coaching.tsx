import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MessageSquare,
  Play,
  Send,
  Star,
  Timer,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { earnXP } from "@/services/beyondGamification";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface Cohort {
  id: string; title: string; description: string; coach_name: string;
  starts_at: string; ends_at: string | null; duration_weeks: number;
  max_members: number; current_members: number; status: string; tier: string;
  what_you_get: string[]; schedule_summary: string | null;
  session_day: string | null; session_time: string | null; meeting_link: string | null;
  xp_reward: number;
}
interface Membership { cohort_id: string; status: string; sessions_attended: number; homework_completed: number; }
interface Session { id: string; cohort_id: string; title: string; description: string | null; session_number: number; scheduled_at: string; duration_minutes: number; meeting_link: string | null; recording_url: string | null; status: string; }
interface Homework { id: string; cohort_id: string; title: string; description: string; due_date: string | null; week_number: number; xp_reward: number; }
interface Submission { homework_id: string; submission_text: string | null; status: string; coach_feedback: string | null; submitted_at: string; }

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const Coaching = () => {
  const [view, setView] = useState<"list" | "cohort">("list");
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  // Cohort detail state
  const [activeCohort, setActiveCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionText, setSubmissionText] = useState("");
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null);

  const sb = supabase as any;

  useEffect(() => { loadCohorts(); }, []);

  const loadCohorts = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [cohortsRes, membRes] = await Promise.all([
      sb.from("beyond_coaching_cohorts").select("*").eq("is_published", true).order("starts_at"),
      session.session
        ? sb.from("beyond_coaching_members").select("cohort_id, status, sessions_attended, homework_completed").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setCohorts(cohortsRes.data || []);
    setMemberships(membRes.data || []);
    setLoading(false);
  };

  const openCohort = async (cohort: Cohort) => {
    setActiveCohort(cohort);
    setView("cohort");
    const { data: session } = await supabase.auth.getSession();
    const [sessRes, hwRes, subRes] = await Promise.all([
      sb.from("beyond_coaching_sessions").select("*").eq("cohort_id", cohort.id).order("session_number"),
      sb.from("beyond_coaching_homework").select("*").eq("cohort_id", cohort.id).order("sort_order"),
      session.session
        ? sb.from("beyond_coaching_submissions").select("homework_id, submission_text, status, coach_feedback, submitted_at").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setSessions(sessRes.data || []);
    setHomework(hwRes.data || []);
    setSubmissions(subRes.data || []);
  };

  const joinCohort = async (cohortId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in first"); return; }
    await sb.from("beyond_coaching_members").upsert({
      user_id: session.session.user.id,
      cohort_id: cohortId,
      status: "active",
    }, { onConflict: "user_id,cohort_id" });
    await sb.from("beyond_coaching_cohorts").update({ current_members: (cohorts.find(c => c.id === cohortId)?.current_members || 0) + 1 }).eq("id", cohortId);
    setMemberships((prev) => [...prev, { cohort_id: cohortId, status: "active", sessions_attended: 0, homework_completed: 0 }]);
    await earnXP(session.session.user.id, 50, "coaching_join", "Joined coaching cohort");
    toast.success("Welcome to the cohort! +50 XP");
  };

  const submitHomework = async (hwId: string) => {
    if (!submissionText.trim()) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;
    const hw = homework.find((h) => h.id === hwId);

    await sb.from("beyond_coaching_submissions").upsert({
      user_id: userId,
      homework_id: hwId,
      submission_text: submissionText.trim(),
      status: "submitted",
    }, { onConflict: "user_id,homework_id" });

    setSubmissions((prev) => [...prev.filter((s) => s.homework_id !== hwId), { homework_id: hwId, submission_text: submissionText.trim(), status: "submitted", coach_feedback: null, submitted_at: new Date().toISOString() }]);
    if (hw) await earnXP(userId, hw.xp_reward, "homework_submit", `Submitted: ${hw.title}`);
    setSubmissionText("");
    setActiveHomeworkId(null);
    toast.success(`Homework submitted! +${hw?.xp_reward || 50} XP`);
  };

  const markAttendance = async (sessionId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    await sb.from("beyond_coaching_attendance").upsert({
      user_id: session.session.user.id,
      session_id: sessionId,
      attended: true,
    }, { onConflict: "user_id,session_id" });
    await earnXP(session.session.user.id, 75, "coaching_session", "Attended coaching session");
    toast.success("Attendance marked! +75 XP");
  };

  // ─── RENDER: Cohort List ──────────────────────────────────
  const renderList = () => {
    const memberIds = memberships.map((m) => m.cohort_id);
    const myCohorts = cohorts.filter((c) => memberIds.includes(c.id));
    const available = cohorts.filter((c) => !memberIds.includes(c.id) && c.status !== "completed");

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
              <Users className="h-7 w-7 text-violet-500" />
              Coaching Cohorts
            </h1>
            <p className="text-muted-foreground">Group coaching for structured growth with accountability</p>
          </div>
        </div>

        <Tabs defaultValue={myCohorts.length > 0 ? "my-cohorts" : "available"}>
          <TabsList>
            <TabsTrigger value="my-cohorts">My Cohorts ({myCohorts.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({available.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my-cohorts" className="mt-4 space-y-4">
            {myCohorts.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">You haven't joined any cohorts yet</p>
              </CardContent></Card>
            ) : myCohorts.map((cohort) => {
              const mem = memberships.find((m) => m.cohort_id === cohort.id);
              return (
                <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCohort(cohort)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                        <Users className="h-7 w-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{cohort.title}</h3>
                          <Badge variant={cohort.status === "active" ? "default" : "outline"} className="text-[10px] capitalize">{cohort.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{cohort.schedule_summary}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{mem?.sessions_attended || 0} sessions attended</span>
                          <span>{mem?.homework_completed || 0} homework done</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="available" className="mt-4 space-y-4">
            {available.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No new cohorts available right now</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon for the next batch</p>
              </CardContent></Card>
            ) : available.map((cohort) => (
              <Card key={cohort.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="capitalize text-[10px]">{cohort.tier}</Badge>
                      <Badge variant="outline" className="text-[10px]">{cohort.duration_weeks} weeks</Badge>
                      <Badge variant="secondary" className="text-[10px] gap-0.5"><Users className="h-3 w-3" />{cohort.current_members}/{cohort.max_members}</Badge>
                    </div>
                    <h3 className="text-lg font-bold">{cohort.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cohort.description}</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    {cohort.what_you_get.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground">WHAT YOU GET:</p>
                        {cohort.what_you_get.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Starts {new Date(cohort.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{cohort.session_day} {cohort.session_time}</span>
                      <span className="flex items-center gap-1"><Zap className="h-3 w-3" />+{cohort.xp_reward} XP on completion</span>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={() => joinCohort(cohort.id)} disabled={cohort.current_members >= cohort.max_members}>
                      {cohort.current_members >= cohort.max_members ? "Batch Full" : "Join This Cohort"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ─── RENDER: Cohort Detail ────────────────────────────────
  const renderCohort = () => {
    if (!activeCohort) return null;
    const isMember = memberships.some((m) => m.cohort_id === activeCohort.id);
    const submittedIds = submissions.map((s) => s.homework_id);

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setView("list"); setActiveCohort(null); }}>
          <ArrowLeft className="h-4 w-4" /> Back to Cohorts
        </Button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={activeCohort.status === "active" ? "default" : "outline"} className="capitalize text-[10px]">{activeCohort.status}</Badge>
            <Badge variant="outline" className="text-[10px]">{activeCohort.duration_weeks} weeks</Badge>
          </div>
          <h2 className="text-2xl font-bold">{activeCohort.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">Coach: {activeCohort.coach_name} · {activeCohort.schedule_summary}</p>
        </div>

        {!isMember && (
          <Card className="border-violet-200 dark:border-violet-800/40">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Join this cohort</p>
                <p className="text-xs text-muted-foreground">{activeCohort.current_members}/{activeCohort.max_members} spots taken</p>
              </div>
              <Button onClick={() => joinCohort(activeCohort.id)}>Join Now</Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="sessions">
          <TabsList>
            <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
            <TabsTrigger value="homework">Homework ({homework.length})</TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-4 space-y-3">
            {sessions.map((sess) => {
              const isPast = new Date(sess.scheduled_at) < new Date();
              const isToday = new Date(sess.scheduled_at).toDateString() === new Date().toDateString();
              return (
                <Card key={sess.id} className={isToday ? "border-violet-300 dark:border-violet-700" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${isPast ? "bg-green-100 dark:bg-green-900/40" : isToday ? "bg-violet-100 dark:bg-violet-900/40" : "bg-muted"}`}>
                        {isPast ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                         isToday ? <Play className="h-5 w-5 text-violet-500" /> :
                         <span className="text-sm font-bold text-muted-foreground">{sess.session_number}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">{sess.title}</h4>
                          {isToday && <Badge variant="default" className="text-[9px]">Today</Badge>}
                        </div>
                        {sess.description && <p className="text-xs text-muted-foreground mt-0.5">{sess.description}</p>}
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(sess.scheduled_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(sess.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                          <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{sess.duration_minutes}min</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex flex-col gap-1">
                        {(isToday || isPast) && isMember && sess.meeting_link && (
                          <a href={sess.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1 text-xs"><Video className="h-3 w-3" />Join</Button>
                          </a>
                        )}
                        {isPast && sess.recording_url && (
                          <a href={sess.recording_url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="gap-1 text-xs"><Play className="h-3 w-3" />Replay</Button>
                          </a>
                        )}
                        {isToday && isMember && (
                          <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => markAttendance(sess.id)}>
                            <CheckCircle2 className="h-3 w-3" />Attended
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* Homework Tab */}
          <TabsContent value="homework" className="mt-4 space-y-3">
            {homework.map((hw) => {
              const sub = submissions.find((s) => s.homework_id === hw.id);
              const isSubmitted = !!sub;
              const isExpanded = activeHomeworkId === hw.id;
              return (
                <Card key={hw.id} className={isSubmitted ? "border-green-200 dark:border-green-800/40" : ""}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {isSubmitted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold">{hw.title}</h4>
                          <Badge variant="outline" className="text-[9px]">Week {hw.week_number}</Badge>
                          <Badge variant="secondary" className="text-[9px]">+{hw.xp_reward} XP</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{hw.description}</p>

                        {/* Submitted feedback */}
                        {sub && sub.status === "reviewed" && sub.coach_feedback && (
                          <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40">
                            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Coach Feedback:</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">{sub.coach_feedback}</p>
                          </div>
                        )}
                        {sub && sub.status === "submitted" && (
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Submitted — awaiting feedback
                          </p>
                        )}
                      </div>
                      {!isSubmitted && isMember && (
                        <Button size="sm" variant="outline" onClick={() => setActiveHomeworkId(isExpanded ? null : hw.id)}>
                          {isExpanded ? "Cancel" : "Submit"}
                        </Button>
                      )}
                    </div>

                    {/* Submission form */}
                    {isExpanded && !isSubmitted && (
                      <div className="ml-8 space-y-2 pt-2 border-t">
                        <Textarea
                          placeholder="Write your response here..."
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          className="text-sm min-h-[80px]"
                        />
                        <Button size="sm" onClick={() => submitHomework(hw.id)} disabled={!submissionText.trim()} className="gap-1">
                          <Send className="h-3 w-3" /> Submit Homework
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading coaching cohorts...</div>
      </div>
    );
  }

  return view === "cohort" ? renderCohort() : renderList();
};

export default Coaching;
