/**
 * Hook to manage Inter-College Quiz Competitions —
 * listing competitions, joining, fetching questions, submitting scores, and leaderboards.
 * Persists to Supabase tables: quiz_competitions, competition_participants, competition_scores
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type QuizCompetition = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "upcoming" | "active" | "completed";
  questions: QuizQuestion[];
  time_limit_seconds: number;
  max_participants: number | null;
  starts_at: string;
  ends_at: string;
  created_by: string;
  created_at: string;
  participant_count?: number;
};

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correct: number; // index of correct option
};

export type CompetitionScore = {
  id: string;
  competition_id: string;
  user_id: string;
  college_name: string | null;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_taken_seconds: number;
  submitted_at: string;
  student_name?: string;
};

export type CollegeLeaderboardEntry = {
  college_name: string;
  participants: number;
  total_score: number;
  avg_score: number;
  top_score: number;
};

// ---------- Hook: useQuizCompetitions (list + join) ----------

export function useQuizCompetitions() {
  const [competitions, setCompetitions] = useState<QuizCompetition[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState<string | null>(null);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    // Get user's college
    if (uid) {
      const { data: profile } = await (supabase as any)
        .from("student_profiles")
        .select("college_name")
        .eq("user_id", uid)
        .maybeSingle();
      setCollegeName(profile?.college_name ?? null);
    }

    // Fetch all competitions (without questions for listing)
    const { data } = await (supabase as any)
      .from("quiz_competitions")
      .select("id, title, description, subject, difficulty, status, time_limit_seconds, max_participants, starts_at, ends_at, created_by, created_at")
      .order("starts_at", { ascending: false });

    const comps = (data || []) as QuizCompetition[];

    // Get participant counts
    if (comps.length > 0) {
      const compIds = comps.map((c) => c.id);
      const { data: participants } = await (supabase as any)
        .from("competition_participants")
        .select("competition_id")
        .in("competition_id", compIds);

      const countMap: Record<string, number> = {};
      (participants || []).forEach((p: any) => {
        countMap[p.competition_id] = (countMap[p.competition_id] || 0) + 1;
      });
      comps.forEach((c) => {
        c.participant_count = countMap[c.id] || 0;
      });
    }

    setCompetitions(comps);

    // Fetch user's joined competitions
    if (uid) {
      const { data: joined } = await (supabase as any)
        .from("competition_participants")
        .select("competition_id")
        .eq("user_id", uid);
      setJoinedIds((joined || []).map((j: any) => j.competition_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  const joinCompetition = useCallback(
    async (competitionId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("competition_participants")
        .insert({ competition_id: competitionId, user_id: userId, college_name: collegeName });

      if (!error) {
        setJoinedIds((prev) => [...prev, competitionId]);
        setCompetitions((prev) =>
          prev.map((c) =>
            c.id === competitionId
              ? { ...c, participant_count: (c.participant_count || 0) + 1 }
              : c
          )
        );
        return true;
      }
      return false;
    },
    [userId, collegeName]
  );

  const createCompetition = useCallback(
    async (comp: {
      title: string;
      description: string;
      subject: string;
      difficulty: string;
      questions: QuizQuestion[];
      time_limit_seconds: number;
      starts_at: string;
      ends_at: string;
    }) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("quiz_competitions")
        .insert({ ...comp, created_by: userId, status: "upcoming" })
        .select()
        .single();

      if (error) return { error: error.message };
      await fetchCompetitions();
      return { data };
    },
    [userId, fetchCompetitions]
  );

  return {
    competitions,
    joinedIds,
    loading,
    userId,
    collegeName,
    joinCompetition,
    createCompetition,
    refetch: fetchCompetitions,
  };
}

// ---------- Hook: useCompetitionArena (live quiz play) ----------

export function useCompetitionArena(competitionId: string | undefined) {
  const [competition, setCompetition] = useState<QuizCompetition | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    if (!competitionId) return;

    (async () => {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: profile } = await (supabase as any)
          .from("student_profiles")
          .select("college_name")
          .eq("user_id", uid)
          .maybeSingle();
        setCollegeName(profile?.college_name ?? null);

        // Check if already submitted
        const { data: existing } = await (supabase as any)
          .from("competition_scores")
          .select("id")
          .eq("competition_id", competitionId)
          .eq("user_id", uid)
          .maybeSingle();
        setAlreadySubmitted(!!existing);
      }

      // Fetch full competition with questions
      const { data } = await (supabase as any)
        .from("quiz_competitions")
        .select("*")
        .eq("id", competitionId)
        .single();

      if (data) {
        setCompetition({
          ...data,
          questions: typeof data.questions === "string" ? JSON.parse(data.questions) : data.questions,
        } as QuizCompetition);
      }

      setLoading(false);
    })();
  }, [competitionId]);

  const submitScore = useCallback(
    async (correctAnswers: number, totalQuestions: number, timeTakenSeconds: number) => {
      if (!userId || !competitionId) return false;

      // Score: 10 points per correct answer + time bonus
      const baseScore = correctAnswers * 10;
      const timeBonus = Math.max(0, Math.floor((600 - timeTakenSeconds) / 10));
      const finalScore = baseScore + timeBonus;

      const { error } = await (supabase as any)
        .from("competition_scores")
        .insert({
          competition_id: competitionId,
          user_id: userId,
          college_name: collegeName,
          score: finalScore,
          correct_answers: correctAnswers,
          total_questions: totalQuestions,
          time_taken_seconds: timeTakenSeconds,
        });

      if (!error) {
        setAlreadySubmitted(true);
        return true;
      }
      return false;
    },
    [userId, competitionId, collegeName]
  );

  return { competition, loading, userId, collegeName, alreadySubmitted, submitScore };
}

// ---------- Hook: useCompetitionLeaderboard ----------

export function useCompetitionLeaderboard(competitionId: string | undefined) {
  const [scores, setScores] = useState<CompetitionScore[]>([]);
  const [collegeBoard, setCollegeBoard] = useState<CollegeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!competitionId) return;

    (async () => {
      setLoading(true);

      // Individual scores
      const { data: scoreData } = await (supabase as any)
        .from("competition_scores")
        .select("*")
        .eq("competition_id", competitionId)
        .order("score", { ascending: false })
        .limit(50);

      const scoreList = (scoreData || []) as CompetitionScore[];

      // Enrich with names
      const userIds = [...new Set(scoreList.map((s) => s.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from("student_profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          nameMap[p.user_id] = p.full_name;
        });
        scoreList.forEach((s) => {
          s.student_name = nameMap[s.user_id] || "Anonymous";
        });
      }

      setScores(scoreList);

      // College leaderboard (aggregate)
      const collegeMap: Record<string, CollegeLeaderboardEntry> = {};
      scoreList.forEach((s) => {
        const name = s.college_name || "Unknown College";
        if (!collegeMap[name]) {
          collegeMap[name] = { college_name: name, participants: 0, total_score: 0, avg_score: 0, top_score: 0 };
        }
        collegeMap[name].participants += 1;
        collegeMap[name].total_score += s.score;
        collegeMap[name].top_score = Math.max(collegeMap[name].top_score, s.score);
      });
      Object.values(collegeMap).forEach((entry) => {
        entry.avg_score = Math.round(entry.total_score / entry.participants);
      });

      setCollegeBoard(Object.values(collegeMap).sort((a, b) => b.total_score - a.total_score));
      setLoading(false);
    })();
  }, [competitionId]);

  return { scores, collegeBoard, loading };
}
