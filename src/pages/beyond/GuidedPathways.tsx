import { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Lightbulb,
  PlayCircle,
  Rocket,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useBeyondGamification } from "@/hooks/useBeyondGamification";

interface Pathway {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_weeks: number;
  difficulty: string;
  total_lessons: number;
  xp_reward: number;
}

interface Lesson {
  id: string;
  pathway_id: string;
  week_number: number;
  day_number: number;
  title: string;
  content: string;
  action_item: string;
  reflection_question: string | null;
  book_recommendation: string | null;
  duration_minutes: number;
  sort_order: number;
}

interface Enrollment {
  pathway_id: string;
  status: string;
  progress_pct: number;
}

interface LessonCompletion {
  lesson_id: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  finance: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  wellness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  communication: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  leadership: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  productivity: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  career: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
};

const GuidedPathways = () => {
  const { addXP, addCoins, recordStreak, checkBadges } = useBeyondGamification();
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  // Active pathway view
  const [activePathway, setActivePathway] = useState<Pathway | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [reflection, setReflection] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [pathRes, enrollRes, compRes] = await Promise.all([
      (supabase as any).from("beyond_pathways").select("*").eq("is_published", true).order("title"),
      session.session
        ? (supabase as any).from("beyond_pathway_enrollments").select("pathway_id, status, progress_pct").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
      session.session
        ? (supabase as any).from("beyond_lesson_completions").select("lesson_id").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setPathways(pathRes.data || []);
    setEnrollments(enrollRes.data || []);
    setCompletions(compRes.data || []);
    setLoading(false);
  };

  const enrollInPathway = async (pathwayId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in"); return; }
    await (supabase as any).from("beyond_pathway_enrollments").upsert({
      user_id: session.session.user.id,
      pathway_id: pathwayId,
      status: "active",
    }, { onConflict: "user_id,pathway_id" });
    setEnrollments((prev) => [...prev.filter((e) => e.pathway_id !== pathwayId), { pathway_id: pathwayId, status: "active", progress_pct: 0 }]);
    await addXP(20, "pathway_enrolled", "Enrolled in a guided pathway");
    toast.success("Enrolled! +20 XP. Let's begin.");
  };

  const openPathway = async (pathway: Pathway) => {
    setActivePathway(pathway);
    const { data } = await (supabase as any)
      .from("beyond_pathway_lessons")
      .select("*")
      .eq("pathway_id", pathway.id)
      .order("sort_order");
    setLessons(data || []);
  };

  const completeLesson = async (lessonId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    await (supabase as any).from("beyond_lesson_completions").upsert({
      user_id: userId,
      lesson_id: lessonId,
      action_done: true,
      reflection_text: reflection || null,
    }, { onConflict: "user_id,lesson_id" });

    setCompletions((prev) => [...prev, { lesson_id: lessonId }]);
    setReflection("");

    // Update enrollment progress
    const totalLessons = lessons.length;
    const newCompletedCount = completions.filter((c) => lessons.some((l) => l.id === c.lesson_id)).length + 1;
    const progressPct = Math.round((newCompletedCount / totalLessons) * 100);

    await (supabase as any).from("beyond_pathway_enrollments").update({
      progress_pct: progressPct,
      status: progressPct >= 100 ? "completed" : "active",
      ...(progressPct >= 100 ? { completed_at: new Date().toISOString() } : {}),
    }).eq("user_id", userId).eq("pathway_id", activePathway!.id);

    setEnrollments((prev) => prev.map((e) =>
      e.pathway_id === activePathway!.id ? { ...e, progress_pct: progressPct, status: progressPct >= 100 ? "completed" : "active" } : e
    ));

    // Gamification
    await addXP(25, "lesson_completed", "Completed pathway lesson");
    await addCoins(10, "lesson_completed");
    await recordStreak("learning");

    if (progressPct >= 100) {
      await addXP(activePathway!.xp_reward, "pathway_completed", `Completed pathway: ${activePathway!.title}`);
      await addCoins(100, "pathway_completed");
      await checkBadges({ action: "pathways_completed" });
      toast.success(`🎉 Pathway Complete! +${activePathway!.xp_reward} XP + 100 coins!`);
    } else {
      toast.success("Lesson complete! +25 XP");
    }

    setActiveLesson(null);
  };

  const isLessonDone = (lessonId: string) => completions.some((c) => c.lesson_id === lessonId);

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><p className="text-muted-foreground animate-pulse">Loading pathways...</p></div>;
  }

  // ══════ LESSON PLAYER VIEW ══════
  if (activeLesson) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setActiveLesson(null)}>← Back to lessons</Button>
        <Card>
          <CardHeader>
            <Badge variant="outline" className="w-fit text-xs mb-1">Week {activeLesson.week_number} · Day {activeLesson.day_number}</Badge>
            <CardTitle>{activeLesson.title}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {activeLesson.duration_minutes} min read
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{activeLesson.content}</p>

            {/* Action Item */}
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <Target className="h-3 w-3" /> Today's Action
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">{activeLesson.action_item}</p>
            </div>

            {/* Reflection */}
            {activeLesson.reflection_question && (
              <div className="space-y-2">
                <p className="text-xs font-medium flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-indigo-500" /> Reflection
                </p>
                <p className="text-sm text-muted-foreground italic">{activeLesson.reflection_question}</p>
                <Textarea
                  placeholder="Your reflection (optional but powerful)..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Book */}
            {activeLesson.book_recommendation && (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <BookOpen className="h-4 w-4 text-green-500 shrink-0" />
                <p className="text-xs text-muted-foreground">Suggested: <span className="font-medium">{activeLesson.book_recommendation}</span></p>
              </div>
            )}

            {/* Complete Button */}
            {isLessonDone(activeLesson.id) ? (
              <Badge className="w-full justify-center py-2 bg-green-600">✓ Lesson Completed</Badge>
            ) : (
              <Button onClick={() => completeLesson(activeLesson.id)} className="w-full gap-2">
                <CheckCircle2 className="h-4 w-4" /> Mark as Done (+25 XP)
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ══════ PATHWAY LESSONS VIEW ══════
  if (activePathway) {
    const enrollment = enrollments.find((e) => e.pathway_id === activePathway.id);
    const completedCount = completions.filter((c) => lessons.some((l) => l.id === c.lesson_id)).length;
    const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    // Group lessons by week
    const weeks = [...new Set(lessons.map((l) => l.week_number))].sort();

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => { setActivePathway(null); setLessons([]); }}>← Back to pathways</Button>

        {/* Pathway Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-bold">{activePathway.title}</h2>
                <p className="text-xs text-muted-foreground">{activePathway.duration_weeks} weeks · {lessons.length} lessons · +{activePathway.xp_reward} XP on completion</p>
              </div>
              {!enrollment && (
                <Button size="sm" onClick={() => enrollInPathway(activePathway.id)}>Enroll</Button>
              )}
            </div>
            <Progress value={progressPct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{completedCount}/{lessons.length} lessons · {progressPct}% complete</p>
          </CardContent>
        </Card>

        {/* Lessons by Week */}
        {weeks.map((week) => (
          <Card key={week}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Week {week}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {lessons.filter((l) => l.week_number === week).map((lesson) => {
                const done = isLessonDone(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className="w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">Day {lesson.day_number} · {lesson.duration_minutes} min</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ══════ PATHWAY BROWSER (DEFAULT VIEW) ══════
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
            <Rocket className="h-7 w-7 text-indigo-500" />
            Guided Pathways
          </h1>
          <p className="text-muted-foreground">Structured programs — 5 min/day, real results in weeks</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1">
          <Award className="h-3 w-3" /> +25 XP per lesson
        </Badge>
      </div>

      {/* Active Pathways */}
      {enrollments.filter((e) => e.status === "active").length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-green-500" /> Your Active Pathways
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {enrollments.filter((e) => e.status === "active").map((enrollment) => {
              const pathway = pathways.find((p) => p.id === enrollment.pathway_id);
              if (!pathway) return null;
              return (
                <button
                  key={enrollment.pathway_id}
                  onClick={() => openPathway(pathway)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{pathway.title}</p>
                    <Progress value={enrollment.progress_pct} className="h-1.5 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">{enrollment.progress_pct}% complete</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Pathways Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pathways.map((pathway) => {
          const enrollment = enrollments.find((e) => e.pathway_id === pathway.id);
          const isEnrolled = !!enrollment;
          const isCompleted = enrollment?.status === "completed";
          return (
            <Card key={pathway.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${CATEGORY_COLORS[pathway.category] || "bg-muted"}`}>
                    {pathway.category}
                  </Badge>
                  {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <CardTitle className="text-sm mt-2">{pathway.title}</CardTitle>
                <CardDescription className="text-xs">{pathway.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end gap-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {pathway.duration_weeks} weeks</span>
                  <span>{pathway.total_lessons} lessons</span>
                  <Badge variant="outline" className="text-[10px]">{pathway.difficulty}</Badge>
                </div>
                {isEnrolled ? (
                  <Button size="sm" variant="outline" className="w-full" onClick={() => openPathway(pathway)}>
                    {isCompleted ? "Review" : `Continue (${enrollment!.progress_pct}%)`}
                  </Button>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => { enrollInPathway(pathway.id); openPathway(pathway); }}>
                    Start Pathway
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pathways.length === 0 && (
        <div className="text-center py-12">
          <Rocket className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No pathways available. Run the SQL seed script.</p>
        </div>
      )}
    </div>
  );
};

export default GuidedPathways;
