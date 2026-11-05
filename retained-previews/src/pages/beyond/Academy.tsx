import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  Lock,
  Play,
  PlayCircle,
  Radio,
  Star,
  Trophy,
  Video,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { earnXP, earnCoins } from "@/services/beyondGamification";

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnail_url: string | null;
  category: string;
  difficulty: string;
  estimated_hours: number;
  total_lessons: number;
  total_quizzes: number;
  instructor_name: string;
  is_free: boolean;
  price_inr: number;
  xp_reward: number;
  coin_reward: number;
  tags: string[];
}

interface Enrollment {
  course_id: string;
  status: string;
  progress_pct: number;
  lessons_completed: number;
  quizzes_passed: number;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  video_url: string | null;
  content_html: string | null;
  pdf_url: string | null;
  duration_minutes: number;
  sort_order: number;
  is_free_preview: boolean;
  drip_day: number;
  xp_reward: number;
}

interface LessonProgress {
  lesson_id: string;
  status: string;
  completed_at: string | null;
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  max_attempts: number;
  sort_order: number;
  xp_reward: number;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number;
  sort_order: number;
}

interface Certificate {
  id: string;
  certificate_number: string;
  holder_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  grade: string;
}

// ════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════

function LessonTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "video": return <Video className="h-4 w-4 text-blue-500" />;
    case "text": return <FileText className="h-4 w-4 text-green-500" />;
    case "pdf": return <BookOpen className="h-4 w-4 text-red-500" />;
    case "audio": return <Headphones className="h-4 w-4 text-purple-500" />;
    case "assignment": return <FileText className="h-4 w-4 text-amber-500" />;
    default: return <Play className="h-4 w-4" />;
  }
}

function DifficultyBadge({ level }: { level: string }) {
  const colors = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[level as keyof typeof colors] || colors.beginner}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

const Academy = () => {
  const [view, setView] = useState<"catalog" | "course" | "lesson" | "quiz">("catalog");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // Course detail state
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);

  // Lesson viewer state
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);

  const sb = supabase as any;

  useEffect(() => { loadCatalog(); }, []);

  // ─── Data Loading ─────────────────────────────────────────
  const loadCatalog = async () => {
    const { data: session } = await supabase.auth.getSession();
    const [coursesRes, enrollRes, certRes] = await Promise.all([
      sb.from("beyond_academy_courses").select("*").eq("is_published", true).order("created_at", { ascending: false }),
      session.session
        ? sb.from("beyond_academy_enrollments").select("course_id, status, progress_pct, lessons_completed, quizzes_passed").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
      session.session
        ? sb.from("beyond_academy_certificates").select("*").eq("user_id", session.session.user.id)
        : Promise.resolve({ data: [] }),
    ]);
    setCourses(coursesRes.data || []);
    setEnrollments(enrollRes.data || []);
    setCertificates(certRes.data || []);
    setLoading(false);
  };

  const openCourse = async (course: Course) => {
    setActiveCourse(course);
    setView("course");
    const { data: session } = await supabase.auth.getSession();
    const [lessonsRes, progressRes] = await Promise.all([
      sb.from("beyond_academy_lessons").select("*").eq("course_id", course.id).order("sort_order"),
      session.session
        ? sb.from("beyond_academy_lesson_progress").select("lesson_id, status, completed_at").eq("user_id", session.session.user.id).eq("course_id", course.id)
        : Promise.resolve({ data: [] }),
    ]);
    setLessons(lessonsRes.data || []);
    setLessonProgress(progressRes.data || []);
  };

  const enrollInCourse = async (courseId: string) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) { toast.error("Please sign in first"); return; }
    await sb.from("beyond_academy_enrollments").upsert({
      user_id: session.session.user.id,
      course_id: courseId,
      status: "active",
      progress_pct: 0,
      lessons_completed: 0,
      quizzes_passed: 0,
    }, { onConflict: "user_id,course_id" });
    setEnrollments((prev) => [...prev, { course_id: courseId, status: "active", progress_pct: 0, lessons_completed: 0, quizzes_passed: 0 }]);
    toast.success("Enrolled successfully! Let's start learning.");
  };

  // ─── Lesson Actions ───────────────────────────────────────
  const openLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView("lesson");
  };

  const completeLesson = async () => {
    if (!activeLesson) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    await sb.from("beyond_academy_lesson_progress").upsert({
      user_id: userId,
      lesson_id: activeLesson.id,
      course_id: activeLesson.course_id,
      status: "completed",
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    // Update progress
    setLessonProgress((prev) => {
      const filtered = prev.filter((p) => p.lesson_id !== activeLesson.id);
      return [...filtered, { lesson_id: activeLesson.id, status: "completed", completed_at: new Date().toISOString() }];
    });

    // Award XP
    await earnXP(userId, activeLesson.xp_reward, "academy_lesson", `Completed: ${activeLesson.title}`);

    // Update enrollment progress
    const newCompleted = lessonProgress.filter((p) => p.status === "completed").length + 1;
    const progressPct = Math.round((newCompleted / lessons.length) * 100);
    await sb.from("beyond_academy_enrollments").update({
      lessons_completed: newCompleted,
      progress_pct: progressPct,
      last_accessed_at: new Date().toISOString(),
      ...(progressPct === 100 ? { status: "completed", completed_at: new Date().toISOString() } : {}),
    }).eq("user_id", userId).eq("course_id", activeLesson.course_id);

    toast.success(`Lesson completed! +${activeLesson.xp_reward} XP`);

    // Check if course complete → issue certificate
    if (progressPct >= 100 && activeCourse) {
      await issueCertificate(userId, activeCourse);
    }

    // Move to next lesson
    const currentIdx = lessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIdx < lessons.length - 1) {
      setActiveLesson(lessons[currentIdx + 1]);
    } else {
      setView("course");
    }
  };

  const issueCertificate = async (userId: string, course: Course) => {
    const { data: profile } = await sb.from("beyond_profiles").select("full_name").eq("user_id", userId).maybeSingle();
    const certNumber = `BP-${course.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    await sb.from("beyond_academy_certificates").insert({
      user_id: userId,
      course_id: course.id,
      certificate_number: certNumber,
      holder_name: profile?.full_name || "Student",
      course_title: course.title,
      instructor_name: course.instructor_name,
      grade: "Pass",
    });
    await earnXP(userId, course.xp_reward, "course_complete", `Completed course: ${course.title}`);
    await earnCoins(userId, course.coin_reward, "course_complete", `Course completion reward`);
    toast.success("Congratulations! Course completed. Certificate issued!", { duration: 5000 });
  };

  // ─── Quiz Actions ─────────────────────────────────────────
  const openQuiz = async (quiz: Quiz) => {
    const { data } = await sb.from("beyond_academy_quiz_questions").select("*").eq("quiz_id", quiz.id).order("sort_order");
    setQuizQuestions(data || []);
    setActiveQuiz(quiz);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setView("quiz");
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;
    const userId = session.session.user.id;

    // Grade the quiz
    let score = 0;
    let totalPoints = 0;
    for (const q of quizQuestions) {
      totalPoints += q.points;
      if (quizAnswers[q.id] === q.correct_answer) {
        score += q.points;
      }
    }
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= activeQuiz.passing_score;

    // Save attempt
    await sb.from("beyond_academy_quiz_attempts").insert({
      user_id: userId,
      quiz_id: activeQuiz.id,
      score,
      total_points: totalPoints,
      percentage,
      passed,
      answers: quizAnswers,
    });

    if (passed) {
      await earnXP(userId, activeQuiz.xp_reward, "quiz_passed", `Passed: ${activeQuiz.title}`);
      toast.success(`Quiz passed! ${percentage}% — +${activeQuiz.xp_reward} XP`);
    } else {
      toast.error(`Score: ${percentage}%. Need ${activeQuiz.passing_score}% to pass. Try again!`);
    }

    setQuizResult({ score, total: totalPoints, passed });
    setQuizSubmitted(true);
  };

  // ─── RENDER: Course Catalog ───────────────────────────────
  const renderCatalog = () => {
    const enrolled = enrollments.map((e) => e.course_id);
    const myCourses = courses.filter((c) => enrolled.includes(c.id));
    const browseCourses = courses.filter((c) => !enrolled.includes(c.id));

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-violet-500" />
              Academy
            </h1>
            <p className="text-muted-foreground">Structured courses for your growth journey</p>
          </div>
          {certificates.length > 0 && (
            <Badge variant="outline" className="gap-1 w-fit">
              <Award className="h-3 w-3" /> {certificates.length} Certificate{certificates.length > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <Tabs defaultValue={myCourses.length > 0 ? "my-courses" : "browse"}>
          <TabsList>
            <TabsTrigger value="my-courses">My Courses ({myCourses.length})</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
            {certificates.length > 0 && <TabsTrigger value="certificates">Certificates</TabsTrigger>}
          </TabsList>

          {/* My Courses */}
          <TabsContent value="my-courses" className="space-y-4 mt-4">
            {myCourses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No courses enrolled yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Browse courses to start learning</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {myCourses.map((course) => {
                  const enroll = enrollments.find((e) => e.course_id === course.id);
                  return (
                    <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCourse(course)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{course.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{course.subtitle}</p>
                            <div className="mt-2">
                              <Progress value={enroll?.progress_pct || 0} className="h-2" />
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {enroll?.progress_pct || 0}% complete · {enroll?.lessons_completed || 0}/{course.total_lessons} lessons
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Browse All Courses */}
          <TabsContent value="browse" className="space-y-4 mt-4">
            {browseCourses.length === 0 && myCourses.length === courses.length ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">You're enrolled in all available courses!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {(browseCourses.length > 0 ? browseCourses : courses).map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-4">
                        <div className="flex items-start justify-between">
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/80 dark:bg-gray-900/80">
                            <GraduationCap className="h-5 w-5 text-violet-600" />
                          </div>
                          <div className="flex gap-1">
                            <DifficultyBadge level={course.difficulty} />
                            {course.is_free && <Badge variant="secondary" className="text-[10px] h-5">Free</Badge>}
                          </div>
                        </div>
                        <h3 className="font-semibold mt-3">{course.title}</h3>
                        {course.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{course.subtitle}</p>}
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Video className="h-3 w-3" />{course.total_lessons} lessons</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.estimated_hours}h</span>
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" />+{course.xp_reward} XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">by {course.instructor_name}</p>
                          <Button size="sm" onClick={() => { enrollInCourse(course.id); openCourse(course); }}>
                            Enroll Free
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Certificates */}
          <TabsContent value="certificates" className="space-y-4 mt-4">
            <div className="grid gap-3">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-amber-200 dark:border-amber-800/40">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{cert.course_title}</p>
                      <p className="text-xs text-muted-foreground">Issued: {new Date(cert.issued_at).toLocaleDateString()} · Grade: {cert.grade}</p>
                      <p className="text-[10px] text-muted-foreground">Certificate #{cert.certificate_number}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{cert.grade}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ─── RENDER: Course Detail ────────────────────────────────
  const renderCourseDetail = () => {
    if (!activeCourse) return null;
    const enrollment = enrollments.find((e) => e.course_id === activeCourse.id);
    const completedLessons = lessonProgress.filter((p) => p.status === "completed").map((p) => p.lesson_id);
    const cert = certificates.find((c) => c.course_id === activeCourse.id);

    return (
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Button variant="ghost" size="sm" className="mb-2 gap-1" onClick={() => { setView("catalog"); setActiveCourse(null); }}>
            <ArrowLeft className="h-4 w-4" /> Back to Academy
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">{activeCourse.title}</h2>
              {activeCourse.subtitle && <p className="text-sm text-muted-foreground">{activeCourse.subtitle}</p>}
              <div className="flex items-center gap-2 mt-1">
                <DifficultyBadge level={activeCourse.difficulty} />
                <span className="text-xs text-muted-foreground">{activeCourse.estimated_hours}h · {activeCourse.total_lessons} lessons</span>
                <span className="text-xs text-muted-foreground">by {activeCourse.instructor_name}</span>
              </div>
            </div>
            {!enrollment && (
              <Button onClick={() => enrollInCourse(activeCourse.id)}>Enroll Now</Button>
            )}
          </div>
        </div>

        {/* Progress */}
        {enrollment && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Your Progress</p>
                <span className="text-xs text-muted-foreground">{enrollment.lessons_completed}/{activeCourse.total_lessons} lessons</span>
              </div>
              <Progress value={enrollment.progress_pct} className="h-3" />
              {cert && (
                <div className="mt-2 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-green-600 font-medium">Course Completed — Certificate #{cert.certificate_number}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lessons List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-violet-500" />
              Lessons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isLocked = !enrollment && !lesson.is_free_preview;
                return (
                  <button
                    key={lesson.id}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isCompleted ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/40" :
                      isLocked ? "opacity-50 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
                    }`}
                    onClick={() => !isLocked && openLesson(lesson)}
                    disabled={isLocked}
                  >
                    <div className="shrink-0">
                      {isCompleted ? <CheckCircle2 className="h-5 w-5 text-green-500" /> :
                       isLocked ? <Lock className="h-5 w-5 text-muted-foreground" /> :
                       <Circle className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{idx + 1}.</span>
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                      </div>
                      {lesson.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{lesson.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <LessonTypeIcon type={lesson.lesson_type} />
                      {lesson.duration_minutes > 0 && (
                        <span className="text-[10px] text-muted-foreground">{lesson.duration_minutes}min</span>
                      )}
                      {lesson.is_free_preview && !enrollment && (
                        <Badge variant="outline" className="text-[9px] h-4">Preview</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ─── RENDER: Lesson Viewer ────────────────────────────────
  const renderLessonViewer = () => {
    if (!activeLesson) return null;
    const isCompleted = lessonProgress.some((p) => p.lesson_id === activeLesson.id && p.status === "completed");
    const currentIdx = lessons.findIndex((l) => l.id === activeLesson.id);

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => setView("course")}>
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Button>

        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <LessonTypeIcon type={activeLesson.lesson_type} />
            <span className="capitalize">{activeLesson.lesson_type}</span>
            {activeLesson.duration_minutes > 0 && <span>· {activeLesson.duration_minutes} min</span>}
            <span>· Lesson {currentIdx + 1} of {lessons.length}</span>
          </div>
          <h2 className="text-xl font-bold">{activeLesson.title}</h2>
          {activeLesson.description && <p className="text-muted-foreground mt-1">{activeLesson.description}</p>}
        </div>

        {/* Lesson Content */}
        <Card>
          <CardContent className="p-6">
            {activeLesson.lesson_type === "video" && activeLesson.video_url ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={activeLesson.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeLesson.title}
                />
              </div>
            ) : activeLesson.lesson_type === "video" ? (
              <div className="aspect-video rounded-lg bg-muted grid place-items-center">
                <div className="text-center">
                  <Video className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Video content coming soon</p>
                  <p className="text-xs text-muted-foreground mt-1">Jasir will upload the video here</p>
                </div>
              </div>
            ) : activeLesson.lesson_type === "text" && activeLesson.content_html ? (
              <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: activeLesson.content_html }} />
            ) : activeLesson.lesson_type === "pdf" && activeLesson.pdf_url ? (
              <div className="text-center space-y-3">
                <FileText className="h-16 w-16 text-red-500/50 mx-auto" />
                <p className="text-sm">PDF Workbook</p>
                <a href={activeLesson.pdf_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">Download PDF</Button>
                </a>
              </div>
            ) : activeLesson.lesson_type === "assignment" ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <FileText className="h-5 w-5" />
                  <p className="font-medium">Assignment</p>
                </div>
                <p className="text-sm">{activeLesson.assignment_text || activeLesson.description || "Complete the assignment as described in the lesson."}</p>
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Complete this assignment offline or using the platform tools, then mark it as done below.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Content will be available soon</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIdx === 0}
            onClick={() => currentIdx > 0 && setActiveLesson(lessons[currentIdx - 1])}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {!isCompleted && (
              <Button onClick={completeLesson} className="gap-1">
                <CheckCircle2 className="h-4 w-4" /> Mark Complete (+{activeLesson.xp_reward} XP)
              </Button>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            disabled={currentIdx === lessons.length - 1}
            onClick={() => currentIdx < lessons.length - 1 && setActiveLesson(lessons[currentIdx + 1])}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // ─── RENDER: Quiz Engine ──────────────────────────────────
  const renderQuiz = () => {
    if (!activeQuiz) return null;

    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1" onClick={() => { setView("course"); setActiveQuiz(null); }}>
          <ArrowLeft className="h-4 w-4" /> Back to Course
        </Button>

        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            {activeQuiz.title}
          </h2>
          {activeQuiz.description && <p className="text-muted-foreground mt-1">{activeQuiz.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            Pass mark: {activeQuiz.passing_score}% · {quizQuestions.length} questions · +{activeQuiz.xp_reward} XP on pass
          </p>
        </div>

        {/* Quiz Result Banner */}
        {quizResult && (
          <Card className={quizResult.passed ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : "border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"}>
            <CardContent className="p-4 flex items-center gap-3">
              {quizResult.passed ? <Trophy className="h-8 w-8 text-green-500" /> : <Radio className="h-8 w-8 text-red-500" />}
              <div>
                <p className="font-semibold">{quizResult.passed ? "Congratulations! You passed!" : "Not quite — try again!"}</p>
                <p className="text-sm text-muted-foreground">
                  Score: {quizResult.score}/{quizResult.total} ({Math.round((quizResult.score / quizResult.total) * 100)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        <div className="space-y-4">
          {quizQuestions.map((q, idx) => {
            const userAnswer = quizAnswers[q.id];
            const isCorrect = quizSubmitted && userAnswer === q.correct_answer;
            const isWrong = quizSubmitted && userAnswer && userAnswer !== q.correct_answer;

            return (
              <Card key={q.id} className={isCorrect ? "border-green-200" : isWrong ? "border-red-200" : ""}>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground mr-2">Q{idx + 1}.</span>
                    {q.question_text}
                  </p>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((option: string) => {
                      const isSelected = userAnswer === option;
                      const showCorrect = quizSubmitted && option === q.correct_answer;
                      const showWrong = quizSubmitted && isSelected && option !== q.correct_answer;
                      return (
                        <button
                          key={option}
                          className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                            showCorrect ? "border-green-400 bg-green-50 dark:bg-green-950/30" :
                            showWrong ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                            isSelected ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30" :
                            "hover:bg-accent"
                          }`}
                          onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [q.id]: option }))}
                          disabled={quizSubmitted}
                        >
                          <div className="flex items-center gap-2">
                            {showCorrect && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                            {showWrong && <Circle className="h-4 w-4 text-red-500 shrink-0" />}
                            {!quizSubmitted && (isSelected ? <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />)}
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (shown after submit) */}
                  {quizSubmitted && q.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-3">
                      <p className="text-xs text-blue-700 dark:text-blue-400"><strong>Explanation:</strong> {q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit / Retry */}
        <div className="flex justify-center gap-3">
          {!quizSubmitted ? (
            <Button
              size="lg"
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < quizQuestions.length}
            >
              Submit Quiz ({Object.keys(quizAnswers).length}/{quizQuestions.length} answered)
            </Button>
          ) : !quizResult?.passed ? (
            <Button size="lg" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizResult(null); }}>
              Try Again
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => { setView("course"); setActiveQuiz(null); }}>
              Back to Course
            </Button>
          )}
        </div>
      </div>
    );
  };

  // ─── MAIN RENDER ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="animate-pulse text-muted-foreground">Loading Academy...</div>
      </div>
    );
  }

  switch (view) {
    case "course": return renderCourseDetail();
    case "lesson": return renderLessonViewer();
    case "quiz": return renderQuiz();
    default: return renderCatalog();
  }
};

export default Academy;
