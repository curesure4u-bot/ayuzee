import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Circle, Clock, Loader2, PlayCircle, Award, FileQuestion } from "lucide-react";
import { toast } from "sonner";

const getEmbedUrl = (url: string) => {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [cert, setCert] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  usePageSEO({
    title: course ? `${course.title} — Ayuzee Learning` : "Course",
  });

  useEffect(() => { load(); }, [slug]);

  const load = async () => {
    setLoading(true);
    const { data: c } = await supabase.from("lms_courses").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
    if (!c) { setLoading(false); return; }
    setCourse(c);
    const { data: l } = await supabase.from("lms_lessons").select("*").eq("course_id", c.id).order("sort_order");
    setLessons(l ?? []);
    const { data: q } = await supabase.from("lms_quizzes").select("*").eq("course_id", c.id).eq("is_published", true).maybeSingle();
    setQuiz(q);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id ?? null;
    setUserId(uid);
    if (uid) {
      const { data: prog } = await supabase.from("lms_progress").select("lesson_id").eq("course_id", c.id).eq("user_id", uid);
      setCompletedSet(new Set((prog ?? []).map((p: any) => p.lesson_id)));
      const { data: cer } = await supabase.from("lms_certificates").select("*").eq("course_id", c.id).eq("user_id", uid).maybeSingle();
      setCert(cer);
      if (q) {
        const { data: at } = await supabase.from("lms_quiz_attempts").select("*").eq("quiz_id", q.id).eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle();
        setAttempt(at);
      }
    }
    setLoading(false);
  };

  const markComplete = async (lessonId: string) => {
    if (!userId) { toast.info("Sign in to track progress"); navigate("/auth"); return; }
    if (completedSet.has(lessonId)) return;
    const { error } = await supabase.from("lms_progress").insert({ user_id: userId, course_id: course.id, lesson_id: lessonId });
    if (error) { toast.error(error.message); return; }
    const next = new Set(completedSet); next.add(lessonId); setCompletedSet(next);
    toast.success("Lesson marked complete");
  };

  const allLessonsDone = lessons.length > 0 && lessons.every((l) => completedSet.has(l.id));
  const progressPct = lessons.length ? Math.round((completedSet.size / lessons.length) * 100) : 0;
  const passed = attempt?.passed;
  const canIssueCert = allLessonsDone && (quiz ? passed : true) && !cert;

  const issueCert = async () => {
    if (!userId || !canIssueCert) return;
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("user_id", userId).maybeSingle();
    const name = prof?.full_name || "Ayuzee Learner";
    const { error, data } = await supabase.from("lms_certificates").insert({
      user_id: userId, course_id: course.id, recipient_name: name, course_title: course.title,
    }).select().maybeSingle();
    if (error) { toast.error(error.message); return; }
    setCert(data);
    toast.success("🎉 Certificate issued!");
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!course) return <div className="container py-24 text-center">Course not found. <Link to="/learning/courses" className="text-primary">Browse all</Link></div>;

  const active = lessons[activeIdx];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <Link to="/learning/courses" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All courses</Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black">
                {active?.video_url ? <iframe src={getEmbedUrl(active.video_url)} className="h-full w-full" allowFullScreen title={active.title} /> : <div className="grid h-full place-items-center text-muted-foreground"><PlayCircle className="h-16 w-16" /></div>}
              </div>
              <div className="p-6">
                <h1 className="font-display text-3xl">{course.title}</h1>
                <p className="mt-2 text-muted-foreground">{course.description}</p>
                {active && (
                  <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Lesson {activeIdx + 1}: {active.title}</h3>
                      <Button size="sm" variant={completedSet.has(active.id) ? "outline" : "hero"} onClick={() => markComplete(active.id)}>
                        {completedSet.has(active.id) ? <><CheckCircle2 className="h-4 w-4" /> Completed</> : "Mark complete"}
                      </Button>
                    </div>
                    {active.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{active.notes}</p>}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your progress</p>
              <p className="mt-1 font-display text-3xl">{progressPct}%</p>
              <Progress value={progressPct} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">{completedSet.size} / {lessons.length} lessons</p>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-border p-4 font-semibold">Lessons</div>
              <ul className="max-h-[400px] overflow-y-auto">
                {lessons.map((l, i) => (
                  <li key={l.id}>
                    <button onClick={() => setActiveIdx(i)} className={`flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left text-sm transition-smooth hover:bg-accent ${i === activeIdx ? "bg-accent" : ""}`}>
                      {completedSet.has(l.id) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      <span className="flex-1">{l.title}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {l.duration_minutes}m</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            {quiz && (
              <Card className="p-5">
                <div className="flex items-center gap-2"><FileQuestion className="h-5 w-5 text-primary" /><h3 className="font-semibold">Final Quiz</h3></div>
                <p className="mt-2 text-sm text-muted-foreground">{quiz.description || "Pass the quiz to earn your certificate."}</p>
                {attempt && <p className="mt-2 text-xs">Last attempt: <span className={passed ? "font-semibold text-primary" : "font-semibold text-secondary"}>{attempt.score}/{attempt.total_questions} {passed ? "(Passed)" : "(Try again)"}</span></p>}
                <Button asChild variant="hero" className="mt-3 w-full" disabled={!allLessonsDone}>
                  <Link to={`/learning/courses/${course.slug}/quiz`}>{allLessonsDone ? "Take quiz" : "Finish lessons first"}</Link>
                </Button>
              </Card>
            )}

            <Card className="p-5">
              <div className="flex items-center gap-2"><Award className="h-5 w-5 text-secondary" /><h3 className="font-semibold">Certificate</h3></div>
              {cert ? (
                <Button asChild variant="hero" className="mt-3 w-full"><Link to={`/learning/certificates/${cert.id}`}>View certificate</Link></Button>
              ) : canIssueCert ? (
                <Button onClick={issueCert} variant="hero" className="mt-3 w-full">Issue my certificate 🎉</Button>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Complete all lessons{quiz ? " and pass the quiz" : ""} to unlock.</p>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
