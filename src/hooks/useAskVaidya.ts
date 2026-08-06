/**
 * Hook to manage Ask a Vaidya —
 * post questions, fetch answers, upvote questions.
 * Persists to Supabase: vaidya_questions, vaidya_answers, vaidya_question_upvotes
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type VaidyaQuestion = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  subject: string;
  tags: string[];
  is_resolved: boolean;
  answer_count: number;
  upvotes: number;
  created_at: string;
  author_name?: string;
};

export type VaidyaAnswer = {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  is_accepted: boolean;
  upvotes: number;
  created_at: string;
  author_name?: string;
};

// ---------- Hook: useVaidyaQuestions (list + create + upvote) ----------

export function useVaidyaQuestions() {
  const [questions, setQuestions] = useState<VaidyaQuestion[]>([]);
  const [myUpvotedIds, setMyUpvotedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("vaidya_questions")
      .select("*")
      .order("created_at", { ascending: false });

    const qList = (data || []) as VaidyaQuestion[];

    // Enrich with author names
    const userIds = [...new Set(qList.map((q) => q.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.full_name;
      });
      qList.forEach((q) => {
        q.author_name = nameMap[q.user_id] || "Anonymous";
      });
    }

    setQuestions(qList);

    // Fetch user's upvotes
    if (uid) {
      const { data: upvotes } = await (supabase as any)
        .from("vaidya_question_upvotes")
        .select("question_id")
        .eq("user_id", uid);
      setMyUpvotedIds((upvotes || []).map((u: any) => u.question_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const createQuestion = useCallback(
    async (title: string, body: string, subject: string, tags: string[]) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("vaidya_questions")
        .insert({ user_id: userId, title, body, subject, tags })
        .select()
        .single();

      if (!error && data) {
        await fetchQuestions();
        return data;
      }
      return null;
    },
    [userId, fetchQuestions]
  );

  const toggleUpvote = useCallback(
    async (questionId: string) => {
      if (!userId) return;

      const isUpvoted = myUpvotedIds.includes(questionId);

      if (isUpvoted) {
        await (supabase as any)
          .from("vaidya_question_upvotes")
          .delete()
          .eq("question_id", questionId)
          .eq("user_id", userId);

        setMyUpvotedIds((prev) => prev.filter((id) => id !== questionId));
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, upvotes: Math.max(q.upvotes - 1, 0) } : q))
        );
      } else {
        await (supabase as any)
          .from("vaidya_question_upvotes")
          .insert({ question_id: questionId, user_id: userId });

        setMyUpvotedIds((prev) => [...prev, questionId]);
        setQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q))
        );
      }
    },
    [userId, myUpvotedIds]
  );

  const markResolved = useCallback(
    async (questionId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("vaidya_questions")
        .update({ is_resolved: true, updated_at: new Date().toISOString() })
        .eq("id", questionId)
        .eq("user_id", userId);

      if (!error) {
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, is_resolved: true } : q)));
        return true;
      }
      return false;
    },
    [userId]
  );

  return { questions, myUpvotedIds, loading, userId, createQuestion, toggleUpvote, markResolved, refetch: fetchQuestions };
}

// ---------- Hook: useVaidyaAnswers (answers for a question) ----------

export function useVaidyaAnswers(questionId: string | undefined) {
  const [answers, setAnswers] = useState<VaidyaAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchAnswers = useCallback(async () => {
    if (!questionId) return;
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    setUserId(session.session?.user.id ?? null);

    const { data } = await (supabase as any)
      .from("vaidya_answers")
      .select("*")
      .eq("question_id", questionId)
      .order("is_accepted", { ascending: false })
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: true });

    const aList = (data || []) as VaidyaAnswer[];

    // Enrich with author names
    const userIds = [...new Set(aList.map((a) => a.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.full_name;
      });
      aList.forEach((a) => {
        a.author_name = nameMap[a.user_id] || "Vaidya";
      });
    }

    setAnswers(aList);
    setLoading(false);
  }, [questionId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const createAnswer = useCallback(
    async (content: string) => {
      if (!userId || !questionId) return null;

      const { data, error } = await (supabase as any)
        .from("vaidya_answers")
        .insert({ question_id: questionId, user_id: userId, content })
        .select()
        .single();

      if (!error && data) {
        await fetchAnswers();
        return data;
      }
      return null;
    },
    [userId, questionId, fetchAnswers]
  );

  const deleteAnswer = useCallback(
    async (answerId: string) => {
      const { error } = await (supabase as any)
        .from("vaidya_answers")
        .delete()
        .eq("id", answerId)
        .eq("user_id", userId);

      if (!error) {
        setAnswers((prev) => prev.filter((a) => a.id !== answerId));
        return true;
      }
      return false;
    },
    [userId]
  );

  return { answers, loading, userId, createAnswer, deleteAnswer, refetch: fetchAnswers };
}
