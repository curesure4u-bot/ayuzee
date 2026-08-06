/**
 * Hook for Question Bank Manager —
 * CRUD questions, filter, approve/reject, bulk import, stats.
 * Persists to Supabase: question_bank, student_admin_roles
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type BankQuestion = {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
  reference_text: string | null;
  tags: string[];
  status: string;
  created_by: string;
  reviewed_by: string | null;
  review_note: string | null;
  used_count: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
};

export type QuestionFormData = {
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  reference_text?: string;
  tags?: string[];
};

export type QuestionStats = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  bySubject: { subject: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
};

// ---------- Hook: useQuestionBank ----------

export function useQuestionBank() {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [stats, setStats] = useState<QuestionStats>({ total: 0, approved: 0, pending: 0, rejected: 0, bySubject: [], byDifficulty: [] });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const computeStats = (list: BankQuestion[]): QuestionStats => {
    const bySubject: Record<string, number> = {};
    const byDifficulty: Record<string, number> = {};
    let approved = 0, pending = 0, rejected = 0;

    list.forEach((q) => {
      if (q.status === "approved") approved++;
      else if (q.status === "pending") pending++;
      else if (q.status === "rejected") rejected++;
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
      byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    });

    return {
      total: list.length,
      approved,
      pending,
      rejected,
      bySubject: Object.entries(bySubject).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count),
      byDifficulty: Object.entries(byDifficulty).map(([difficulty, count]) => ({ difficulty, count })),
    };
  };

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      // Check user's admin role
      const { data: roleData } = await (supabase as any)
        .from("student_admin_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("is_active", true)
        .order("role", { ascending: true })
        .limit(1);

      const role = roleData?.[0]?.role || null;
      setUserRole(role);

      // Fetch questions based on role
      let query = (supabase as any).from("question_bank").select("*");

      if (role === "mega_admin" || role === "quiz_master") {
        // See all questions
        query = query.order("created_at", { ascending: false });
      } else {
        // See own + approved
        query = query.or(`created_by.eq.${uid},status.eq.approved`).order("created_at", { ascending: false });
      }

      const { data } = await query.limit(500);
      const qList = (data || []) as BankQuestion[];

      // Enrich with creator names
      const creatorIds = [...new Set(qList.map((q) => q.created_by))];
      if (creatorIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from("student_profiles")
          .select("user_id, full_name")
          .in("user_id", creatorIds);
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
        qList.forEach((q) => { q.creator_name = nameMap[q.created_by] || "Unknown"; });
      }

      setQuestions(qList);
      setStats(computeStats(qList));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const createQuestion = useCallback(async (formData: QuestionFormData) => {
    if (!userId) return { success: false, error: "Not logged in" };

    const { data, error } = await (supabase as any)
      .from("question_bank")
      .insert({
        ...formData,
        tags: formData.tags || [],
        explanation: formData.explanation || null,
        reference_text: formData.reference_text || null,
        created_by: userId,
        status: (userRole === "mega_admin" || userRole === "quiz_master") ? "approved" : "pending",
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    await fetchQuestions();
    return { success: true, data };
  }, [userId, userRole, fetchQuestions]);

  const bulkImport = useCallback(async (questionsList: QuestionFormData[]) => {
    if (!userId) return { success: false, error: "Not logged in", count: 0 };

    const autoApprove = userRole === "mega_admin" || userRole === "quiz_master";
    const rows = questionsList.map((q) => ({
      ...q,
      tags: q.tags || [],
      explanation: q.explanation || null,
      reference_text: q.reference_text || null,
      created_by: userId,
      status: autoApprove ? "approved" : "pending",
    }));

    const { data, error } = await (supabase as any)
      .from("question_bank")
      .insert(rows)
      .select();

    if (error) return { success: false, error: error.message, count: 0 };
    await fetchQuestions();
    return { success: true, count: (data || []).length };
  }, [userId, userRole, fetchQuestions]);

  const updateQuestion = useCallback(async (questionId: string, updates: Partial<QuestionFormData>) => {
    if (!userId) return false;

    const { error } = await (supabase as any)
      .from("question_bank")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", questionId);

    if (!error) { await fetchQuestions(); return true; }
    return false;
  }, [userId, fetchQuestions]);

  const approveQuestion = useCallback(async (questionId: string, note?: string) => {
    if (!userId) return false;

    const { error } = await (supabase as any)
      .from("question_bank")
      .update({ status: "approved", reviewed_by: userId, review_note: note || null, updated_at: new Date().toISOString() })
      .eq("id", questionId);

    if (!error) { await fetchQuestions(); return true; }
    return false;
  }, [userId, fetchQuestions]);

  const rejectQuestion = useCallback(async (questionId: string, note: string) => {
    if (!userId) return false;

    const { error } = await (supabase as any)
      .from("question_bank")
      .update({ status: "rejected", reviewed_by: userId, review_note: note, updated_at: new Date().toISOString() })
      .eq("id", questionId);

    if (!error) { await fetchQuestions(); return true; }
    return false;
  }, [userId, fetchQuestions]);

  const deleteQuestion = useCallback(async (questionId: string) => {
    if (!userId) return false;

    const { error } = await (supabase as any)
      .from("question_bank")
      .delete()
      .eq("id", questionId);

    if (!error) { await fetchQuestions(); return true; }
    return false;
  }, [userId, fetchQuestions]);

  return {
    questions, stats, loading, userId, userRole,
    createQuestion, bulkImport, updateQuestion,
    approveQuestion, rejectQuestion, deleteQuestion,
    refetch: fetchQuestions,
  };
}
