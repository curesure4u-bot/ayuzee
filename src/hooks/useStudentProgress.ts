/**
 * Hook to manage student gamification progress (XP, Coins, Streak, Quiz History)
 * Persists to Supabase `student_quiz_progress` table
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StudentProgress = {
  user_id: string;
  xp: number;
  coins: number;
  streak: number;
  last_quiz_date: string | null;
  quizzes_completed: number;
  correct_answers: number;
  total_answers: number;
  best_streak: number;
};

const DEFAULT_PROGRESS: Omit<StudentProgress, "user_id"> = {
  xp: 0,
  coins: 0,
  streak: 0,
  last_quiz_date: null,
  quizzes_completed: 0,
  correct_answers: 0,
  total_answers: 0,
  best_streak: 0,
};

export function useStudentProgress() {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Load progress on mount
  useEffect(() => {
    (async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id;
      if (!uid) { setLoading(false); return; }
      setUserId(uid);

      const { data, error } = await (supabase as any)
        .from("student_quiz_progress")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (data) {
        setProgress(data as StudentProgress);
      } else {
        // Create initial record
        const newProgress: StudentProgress = { user_id: uid, ...DEFAULT_PROGRESS };
        await (supabase as any).from("student_quiz_progress").insert(newProgress);
        setProgress(newProgress);
      }
      setLoading(false);
    })();
  }, []);

  // Record quiz completion
  const recordQuiz = useCallback(async (correctCount: number, totalCount: number, earnedXP: number, earnedCoins: number) => {
    if (!userId || !progress) return;

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = progress.last_quiz_date;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Calculate streak
    let newStreak = progress.streak;
    if (lastDate === yesterday) {
      newStreak = progress.streak + 1; // Continue streak
    } else if (lastDate !== today) {
      newStreak = 1; // Reset streak (missed a day)
    }
    // If same day, don't change streak

    const updated: Partial<StudentProgress> = {
      xp: progress.xp + earnedXP,
      coins: progress.coins + earnedCoins,
      streak: newStreak,
      best_streak: Math.max(progress.best_streak, newStreak),
      last_quiz_date: today,
      quizzes_completed: progress.quizzes_completed + 1,
      correct_answers: progress.correct_answers + correctCount,
      total_answers: progress.total_answers + totalCount,
    };

    const { error } = await (supabase as any)
      .from("student_quiz_progress")
      .update(updated)
      .eq("user_id", userId);

    if (!error) {
      setProgress({ ...progress, ...updated } as StudentProgress);
    }
    return updated;
  }, [userId, progress]);

  // Spend coins
  const spendCoins = useCallback(async (amount: number, reason: string): Promise<boolean> => {
    if (!userId || !progress || progress.coins < amount) return false;

    const { error } = await (supabase as any)
      .from("student_quiz_progress")
      .update({ coins: progress.coins - amount })
      .eq("user_id", userId);

    if (!error) {
      setProgress({ ...progress, coins: progress.coins - amount });
      // Log transaction
      await (supabase as any).from("student_coin_transactions").insert({
        user_id: userId,
        amount: -amount,
        reason,
        created_at: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }, [userId, progress]);

  return { progress, loading, recordQuiz, spendCoins, userId };
}
