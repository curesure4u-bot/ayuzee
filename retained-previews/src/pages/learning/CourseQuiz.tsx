import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const CourseQuiz = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase.from("lms_courses").select("*").eq("slug", slug).maybeSingle();
      setCourse(c);
      if (!c) { setLoading(false); return; }
      const { data: q } = await supabase.from("lms_quizzes").select("*").eq("course_id", c.id).eq("is_published", true).maybeSingle();
      setQuiz(q);
      if (q) {
        const { data: qs } = await supabase.from("lms_quiz_questions").select("*").eq("quiz_id", q.id).order("sort_order");
        setQuestions(qs ?? []);
      }
      const { data: sess } = await supabase.auth.getSession();
      setUserId(sess.session?.user.id ?? null);
      setLoading(false);
    })();
  }, [slug]);

  const submit = async () => {
    if (!userId) { navigate("/auth"); return; }
    if (Object.keys(answers).length < questions.length) { toast.error("Answer all questions"); return; }
    let score = 0;
    questions.forEach((q) => { if (answers[q.id] === q.correct_index) score++; });
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= (quiz.passing_score ?? 70);
    await supabase.from("lms_quiz_attempts").insert({
      user_id: userId, quiz_id: quiz.id, course_id: course.id, score, total_questions: questions.length, passed, answers,
    });
    setSubmitted({ score, total: questions.length, passed });
  };

  if (loading) return <div className="grid place-items-center py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!quiz) return <div className="container py-24 text-center">No quiz for this course.</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <Link to={`/learning/courses/${slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to course</Link>
        <div className="mx-auto mt-6 max-w-3xl">
          <h1 className="font-display text-3xl">{quiz.title}</h1>
          <p className="mt-2 text-muted-foreground">Passing score: {quiz.passing_score}%</p>

          {submitted ? (
            <Card className="mt-8 p-8 text-center">
              {submitted.passed ? <CheckCircle2 className="mx-auto h-16 w-16 text-primary" /> : <XCircle className="mx-auto h-16 w-16 text-secondary" />}
              <h2 className="mt-4 font-display text-3xl">{submitted.passed ? "Passed!" : "Not yet"}</h2>
              <p className="mt-2 text-lg">You scored <strong>{submitted.score} / {submitted.total}</strong> ({Math.round((submitted.score / submitted.total) * 100)}%)</p>
              <Button asChild variant="hero" className="mt-6"><Link to={`/learning/courses/${slug}`}>Back to course</Link></Button>
            </Card>
          ) : (
            <div className="mt-8 space-y-6">
              {questions.map((q, i) => (
                <Card key={q.id} className="p-6">
                  <p className="font-semibold">Q{i + 1}. {q.question}</p>
                  <div className="mt-4 space-y-2">
                    {(q.options as string[]).map((opt, idx) => (
                      <label key={idx} className={`flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-smooth hover:border-primary ${answers[q.id] === idx ? "border-primary bg-accent" : ""}`}>
                        <input type="radio" name={q.id} checked={answers[q.id] === idx} onChange={() => setAnswers({ ...answers, [q.id]: idx })} className="accent-primary" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              ))}
              <Button variant="hero" size="lg" onClick={submit} className="w-full">Submit quiz</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseQuiz;
