import { supabase } from "@/integrations/supabase/client";

export type QuizQuestion = {
  id: string;
  subject: string;
  topic: string | null;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  difficulty: string;
  source: string | null;
};

export type SubmitQuizParams = {
  quiz_type: "daily" | "subject" | "competition" | "weekly_challenge" | "practice";
  subject?: string;
  answers: { question_id: string; selected: number; correct: boolean; time_ms?: number }[];
  time_taken_seconds?: number;
};

export function useStudentQuiz() {
  const getDailyQuestions = async (count = 5) => {
    const { data, error } = await (supabase as any)
      .from("hms_quiz_questions")
      .select("*")
      .eq("is_active", true)
      .limit(count);

    if (error) throw error;
    // Shuffle
    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    return shuffled as QuizQuestion[];
  };

  const getQuestionsBySubject = async (subject: string, count = 10, difficulty?: string) => {
    let query = (supabase as any)
      .from("hms_quiz_questions")
      .select("*")
      .eq("is_active", true)
      .eq("subject", subject)
      .limit(count);

    if (difficulty) query = query.eq("difficulty", difficulty);

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []).sort(() => Math.random() - 0.5)) as QuizQuestion[];
  };

  const submitQuiz = async (params: SubmitQuizParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) throw new Error("Not authenticated");

    const correctCount = params.answers.filter((a) => a.correct).length;
    const totalQ = params.answers.length;
    const scorePct = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
    const coinsEarned = correctCount * 2; // 2 coins per correct answer

    // Save attempt
    const { data: attempt, error: attemptError } = await (supabase as any)
      .from("hms_quiz_attempts")
      .insert({
        user_id: uid,
        quiz_type: params.quiz_type,
        subject: params.subject || null,
        total_questions: totalQ,
        correct_answers: correctCount,
        wrong_answers: totalQ - correctCount,
        score_pct: scorePct,
        time_taken_seconds: params.time_taken_seconds || null,
        coins_earned: coinsEarned,
        answers: params.answers,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (attemptError) throw attemptError;

    // Update progress
    const { data: progress } = await (supabase as any)
      .from("hms_student_progress")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);

    if (progress) {
      const isNewDay = progress.last_quiz_date !== today;
      const newStreak = isNewDay ? (progress.current_streak || 0) + 1 : progress.current_streak;

      await (supabase as any)
        .from("hms_student_progress")
        .update({
          total_coins: (progress.total_coins || 0) + coinsEarned,
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, progress.longest_streak || 0),
          last_quiz_date: today,
          total_quizzes_taken: (progress.total_quizzes_taken || 0) + 1,
          total_correct: (progress.total_correct || 0) + correctCount,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", uid);
    } else {
      await (supabase as any)
        .from("hms_student_progress")
        .insert({
          user_id: uid,
          total_coins: coinsEarned,
          current_streak: 1,
          longest_streak: 1,
          last_quiz_date: today,
          total_quizzes_taken: 1,
          total_correct: correctCount,
        });
    }

    return { attemptId: attempt.id, score: scorePct, coinsEarned, streak: progress ? (progress.current_streak || 0) + 1 : 1 };
  };

  const getProgress = async () => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return null;

    const { data } = await (supabase as any)
      .from("hms_student_progress")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    return data;
  };

  const getAttemptHistory = async (limit = 20) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    if (!uid) return [];

    const { data, error } = await (supabase as any)
      .from("hms_quiz_attempts")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  };

  const getSubjects = async () => {
    const { data, error } = await (supabase as any)
      .from("hms_quiz_questions")
      .select("subject")
      .eq("is_active", true);

    if (error) throw error;
    const unique = [...new Set((data || []).map((d: any) => d.subject))];
    return unique as string[];
  };

  return { getDailyQuestions, getQuestionsBySubject, submitQuiz, getProgress, getAttemptHistory, getSubjects };
}
