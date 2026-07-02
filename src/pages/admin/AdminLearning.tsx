import {  useEffect, useState  } from "react";
import { usePageSEO } from "@/hooks/usePageSEO";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, ArrowLeft, GraduationCap, Video, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const AdminLearning = () => {
  usePageSEO({ title: "Admin · Learning — Ayuzee", noIndex: true });
  const [tab, setTab] = useState<"courses" | "webinars">("courses");

  // courses state
  const [courses, setCourses] = useState<any[]>([]);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // webinars state
  const [webinars, setWebinars] = useState<any[]>([]);
  const [editingWebinar, setEditingWebinar] = useState<any | null>(null);

  useEffect(() => { loadAll();
  }, []);

  const loadAll = async () => {
    const [c, w] = await Promise.all([
      supabase.from("lms_courses").select("*").order("created_at", { ascending: false }),
      supabase.from("webinars").select("*").order("scheduled_at", { ascending: false }),
    ]);
    setCourses(c.data ?? []); setWebinars(w.data ?? []);
  };

  const loadCourseDetails = async (courseId: string) => {
    setOpenCourseId(courseId);
    const { data: l } = await supabase.from("lms_lessons").select("*").eq("course_id", courseId).order("sort_order");
    setLessons(l ?? []);
    const { data: q } = await supabase.from("lms_quizzes").select("*").eq("course_id", courseId).maybeSingle();
    setQuiz(q);
    if (q) {
      const { data: qs } = await supabase.from("lms_quiz_questions").select("*").eq("quiz_id", q.id).order("sort_order");
      setQuizQuestions(qs ?? []);
    } else { setQuizQuestions([]); }
  };

  const saveCourse = async () => {
    if (!editingCourse?.title) { toast.error("Title required"); return; }
    const slug = editingCourse.slug || `${slugify(editingCourse.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = { ...editingCourse, slug };
    delete payload.id;
    const { error } = editingCourse.id
      ? await supabase.from("lms_courses").update(payload).eq("id", editingCourse.id)
      : await supabase.from("lms_courses").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEditingCourse(null); loadAll();
  };

  const removeCourse = async (id: string) => {
    if (!confirm("Delete course (and all lessons/quiz)?")) return;
    await supabase.from("lms_courses").delete().eq("id", id);
    toast.success("Deleted"); loadAll(); if (openCourseId === id) setOpenCourseId(null);
  };

  const addLesson = async () => {
    const title = prompt("Lesson title?"); if (!title) return;
    const video_url = prompt("Video URL (YouTube/Vimeo)?") ?? "";
    const duration = Number(prompt("Duration in minutes?", "5")) || 5;
    await supabase.from("lms_lessons").insert({ course_id: openCourseId, title, video_url, duration_minutes: duration, sort_order: lessons.length });
    await supabase.from("lms_courses").update({ total_lessons: lessons.length + 1 }).eq("id", openCourseId!);
    loadCourseDetails(openCourseId!); loadAll();
  };

  const removeLesson = async (id: string) => {
    if (!confirm("Delete lesson?")) return;
    await supabase.from("lms_lessons").delete().eq("id", id);
    await supabase.from("lms_courses").update({ total_lessons: Math.max(0, lessons.length - 1) }).eq("id", openCourseId!);
    loadCourseDetails(openCourseId!); loadAll();
  };

  const createQuiz = async () => {
    const title = prompt("Quiz title?", "Final Quiz"); if (!title) return;
    await supabase.from("lms_quizzes").insert({ course_id: openCourseId, title, passing_score: 70 });
    loadCourseDetails(openCourseId!);
  };

  const addQuestion = async () => {
    const question = prompt("Question?"); if (!question || !quiz) return;
    const o1 = prompt("Option A?") ?? ""; const o2 = prompt("Option B?") ?? "";
    const o3 = prompt("Option C?") ?? ""; const o4 = prompt("Option D?") ?? "";
    const correct = Number(prompt("Correct option index (0=A, 1=B, 2=C, 3=D)?", "0")) || 0;
    await supabase.from("lms_quiz_questions").insert({
      quiz_id: quiz.id, question, options: [o1, o2, o3, o4].filter(Boolean), correct_index: correct, sort_order: quizQuestions.length,
    });
    loadCourseDetails(openCourseId!);
  };

  const removeQuestion = async (id: string) => {
    await supabase.from("lms_quiz_questions").delete().eq("id", id);
    loadCourseDetails(openCourseId!);
  };

  const saveWebinar = async () => {
    if (!editingWebinar?.title || !editingWebinar?.scheduled_at || !editingWebinar?.join_url || !editingWebinar?.speaker_name) {
      toast.error("Title, speaker, date, and join URL required"); return;
    }
    const payload = { ...editingWebinar };
    delete payload.id;
    const { error } = editingWebinar.id
      ? await supabase.from("webinars").update(payload).eq("id", editingWebinar.id)
      : await supabase.from("webinars").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved"); setEditingWebinar(null); loadAll();
  };

  const removeWebinar = async (id: string) => {
    if (!confirm("Delete webinar?")) return;
    await supabase.from("webinars").delete().eq("id", id);
    toast.success("Deleted"); loadAll();
  };

  return (
    <div className="space-y-6">
        <h1 className="font-display text-3xl">Learning Hub Admin</h1>
        <div className="mt-6 flex gap-2">
          <Button variant={tab === "courses" ? "hero" : "outline"} onClick={() => setTab("courses")}><GraduationCap className="h-4 w-4" /> Courses</Button>
          <Button variant={tab === "webinars" ? "hero" : "outline"} onClick={() => setTab("webinars")}><Video className="h-4 w-4" /> Webinars</Button>
        </div>

        {tab === "courses" && (
          <div className="mt-8">
            {editingCourse ? (
              <Card className="p-6">
                <h2 className="font-display text-2xl">{editingCourse.id ? "Edit course" : "New course"}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2"><Label>Title *</Label><Input value={editingCourse.title || ""} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={editingCourse.description || ""} onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })} /></div>
                  <div><Label>Category</Label><Input value={editingCourse.category || "Ayurveda"} onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })} /></div>
                  <div><Label>Level</Label>
                    <select value={editingCourse.level || "Beginner"} onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                    </select>
                  </div>
                  <div><Label>Instructor name</Label><Input value={editingCourse.instructor_name || ""} onChange={(e) => setEditingCourse({ ...editingCourse, instructor_name: e.target.value })} /></div>
                  <div><Label>Thumbnail URL</Label><Input value={editingCourse.thumbnail_url || ""} onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail_url: e.target.value })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={editingCourse.duration_minutes || 0} onChange={(e) => setEditingCourse({ ...editingCourse, duration_minutes: Number(e.target.value) })} /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={!!editingCourse.is_published} onChange={(e) => setEditingCourse({ ...editingCourse, is_published: e.target.checked })} /><Label>Published</Label></div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditingCourse(null)}>Cancel</Button>
                  <Button variant="hero" onClick={saveCourse}>Save</Button>
                </div>
              </Card>
            ) : openCourseId ? (
              <div>
                <button onClick={() => setOpenCourseId(null)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> All courses</button>
                <h2 className="mt-4 font-display text-2xl">Course Content</h2>
                <Card className="mt-4 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">Lessons ({lessons.length})</h3><Button size="sm" variant="hero" onClick={addLesson}><Plus className="h-3 w-3" /> Add lesson</Button></div>
                  <ul className="mt-3 divide-y divide-border">
                    {lessons.map((l, i) => (
                      <li key={l.id} className="flex items-center justify-between py-3">
                        <div><p className="font-medium">{i + 1}. {l.title}</p><p className="text-xs text-muted-foreground truncate max-w-md">{l.video_url}</p></div>
                        <Button size="sm" variant="ghost" onClick={() => removeLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card className="mt-4 p-5">
                  <div className="flex items-center justify-between"><h3 className="font-semibold">Quiz</h3>{!quiz && <Button size="sm" variant="hero" onClick={createQuiz}><Plus className="h-3 w-3" /> Create quiz</Button>}</div>
                  {quiz && (
                    <>
                      <p className="mt-2 text-sm text-muted-foreground">{quiz.title} · pass {quiz.passing_score}%</p>
                      <div className="mt-3 flex justify-end"><Button size="sm" variant="outline" onClick={addQuestion}><Plus className="h-3 w-3" /> Add question</Button></div>
                      <ul className="mt-3 divide-y divide-border">
                        {quizQuestions.map((q, i) => (
                          <li key={q.id} className="flex items-start justify-between py-3">
                            <div className="flex-1"><p className="font-medium">Q{i + 1}. {q.question}</p>
                              <ul className="mt-1 text-xs text-muted-foreground">
                                {(q.options as string[]).map((o, idx) => <li key={idx}>{idx === q.correct_index ? "✓ " : "  "}{String.fromCharCode(65 + idx)}. {o}</li>)}
                              </ul>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              </div>
            ) : (
              <>
                <div className="flex justify-end"><Button variant="hero" onClick={() => setEditingCourse({ title: "", category: "Ayurveda", level: "Beginner", is_published: false })}><Plus className="h-4 w-4" /> New course</Button></div>
                <div className="mt-4 space-y-3">
                  {courses.map((c) => (
                    <Card key={c.id} className="flex items-center gap-4 p-4">
                      {c.thumbnail_url ? <img src={c.thumbnail_url} alt="" className="h-16 w-24 rounded object-cover" /> : <div className="h-16 w-24 rounded gradient-soft" />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2"><h3 className="font-semibold">{c.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.is_published ? "Live" : "Draft"}</span></div>
                        <p className="text-xs text-muted-foreground">{c.category} · {c.total_lessons} lessons · {c.duration_minutes} min</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => loadCourseDetails(c.id)}>Manage <ChevronRight className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCourse(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removeCourse(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Card>
                  ))}
                  {courses.length === 0 && <Card className="p-12 text-center text-muted-foreground">No courses yet.</Card>}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "webinars" && (
          <div className="mt-8">
            {editingWebinar ? (
              <Card className="p-6">
                <h2 className="font-display text-2xl">{editingWebinar.id ? "Edit webinar" : "New webinar"}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2"><Label>Title *</Label><Input value={editingWebinar.title || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, title: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} value={editingWebinar.description || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, description: e.target.value })} /></div>
                  <div><Label>Speaker name *</Label><Input value={editingWebinar.speaker_name || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, speaker_name: e.target.value })} /></div>
                  <div><Label>Category</Label><Input value={editingWebinar.category || "Ayurveda"} onChange={(e) => setEditingWebinar({ ...editingWebinar, category: e.target.value })} /></div>
                  <div><Label>Scheduled at *</Label><Input type="datetime-local" value={editingWebinar.scheduled_at?.slice(0, 16) || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, scheduled_at: new Date(e.target.value).toISOString() })} /></div>
                  <div><Label>Duration (min)</Label><Input type="number" value={editingWebinar.duration_minutes || 60} onChange={(e) => setEditingWebinar({ ...editingWebinar, duration_minutes: Number(e.target.value) })} /></div>
                  <div className="md:col-span-2"><Label>Join URL (Zoom/Meet/YouTube Live) *</Label><Input value={editingWebinar.join_url || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, join_url: e.target.value })} /></div>
                  <div className="md:col-span-2"><Label>Recording URL (after the event)</Label><Input value={editingWebinar.recording_url || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, recording_url: e.target.value })} /></div>
                  <div><Label>Cover image URL</Label><Input value={editingWebinar.cover_image_url || ""} onChange={(e) => setEditingWebinar({ ...editingWebinar, cover_image_url: e.target.value })} /></div>
                  <div className="flex items-center gap-2"><input type="checkbox" checked={editingWebinar.is_published !== false} onChange={(e) => setEditingWebinar({ ...editingWebinar, is_published: e.target.checked })} /><Label>Published</Label></div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setEditingWebinar(null)}>Cancel</Button>
                  <Button variant="hero" onClick={saveWebinar}>Save</Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="flex justify-end"><Button variant="hero" onClick={() => setEditingWebinar({ title: "", category: "Ayurveda", duration_minutes: 60, is_published: true })}><Plus className="h-4 w-4" /> New webinar</Button></div>
                <div className="mt-4 space-y-3">
                  {webinars.map((w) => (
                    <Card key={w.id} className="flex items-center gap-4 p-4">
                      {w.cover_image_url ? <img src={w.cover_image_url} alt="" className="h-16 w-24 rounded object-cover" /> : <div className="h-16 w-24 rounded gradient-soft" />}
                      <div className="flex-1">
                        <h3 className="font-semibold">{w.title}</h3>
                        <p className="text-xs text-muted-foreground">{w.speaker_name} · {new Date(w.scheduled_at).toLocaleString()} · {w.rsvp_count} RSVPs</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setEditingWebinar(w)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removeWebinar(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </Card>
                  ))}
                  {webinars.length === 0 && <Card className="p-12 text-center text-muted-foreground">No webinars yet.</Card>}
                </div>
              </>
            )}
          </div>
        )}
    </div>
  );
};

export default AdminLearning;
