/**
 * Hook to manage Case Study Library — listing, filtering, reading detail, and bookmarking.
 * Persists to Supabase tables: case_studies, case_study_bookmarks
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type CaseStudy = {
  id: string;
  title: string;
  subject: string;
  system: string;
  difficulty: string;
  tags: string[];
  summary: string;
  patient_history: string;
  examination: string;
  diagnosis: string;
  treatment: string;
  outcome: string;
  discussion: string | null;
  references: string | null;
  author_name: string | null;
  author_college: string | null;
  view_count: number;
  bookmark_count: number;
  created_at: string;
};

export type CaseStudyListItem = Pick<
  CaseStudy,
  "id" | "title" | "subject" | "system" | "difficulty" | "tags" | "summary" | "author_name" | "author_college" | "view_count" | "bookmark_count" | "created_at"
>;

// ---------- Hook: useCaseStudyList (browse + filter) ----------

export function useCaseStudyList() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyListItem[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("case_studies")
      .select("id, title, subject, system, difficulty, tags, summary, author_name, author_college, view_count, bookmark_count, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    setCaseStudies((data || []) as CaseStudyListItem[]);

    // Fetch user's bookmarks
    if (uid) {
      const { data: bookmarks } = await (supabase as any)
        .from("case_study_bookmarks")
        .select("case_study_id")
        .eq("user_id", uid);
      setBookmarkedIds((bookmarks || []).map((b: any) => b.case_study_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const toggleBookmark = useCallback(
    async (caseStudyId: string) => {
      if (!userId) return;

      const isBookmarked = bookmarkedIds.includes(caseStudyId);

      if (isBookmarked) {
        // Remove bookmark
        await (supabase as any)
          .from("case_study_bookmarks")
          .delete()
          .eq("case_study_id", caseStudyId)
          .eq("user_id", userId);

        setBookmarkedIds((prev) => prev.filter((id) => id !== caseStudyId));
        setCaseStudies((prev) =>
          prev.map((cs) =>
            cs.id === caseStudyId ? { ...cs, bookmark_count: Math.max(cs.bookmark_count - 1, 0) } : cs
          )
        );
      } else {
        // Add bookmark
        await (supabase as any)
          .from("case_study_bookmarks")
          .insert({ case_study_id: caseStudyId, user_id: userId });

        setBookmarkedIds((prev) => [...prev, caseStudyId]);
        setCaseStudies((prev) =>
          prev.map((cs) =>
            cs.id === caseStudyId ? { ...cs, bookmark_count: cs.bookmark_count + 1 } : cs
          )
        );
      }
    },
    [userId, bookmarkedIds]
  );

  return { caseStudies, bookmarkedIds, loading, userId, toggleBookmark, refetch: fetchList };
}

// ---------- Hook: useCaseStudyDetail (single case study) ----------

export function useCaseStudyDetail(caseStudyId: string | undefined) {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!caseStudyId) return;

    (async () => {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user.id ?? null;
      setUserId(uid);

      // Fetch full case study
      const { data } = await (supabase as any)
        .from("case_studies")
        .select("*")
        .eq("id", caseStudyId)
        .single();

      if (data) {
        setCaseStudy(data as CaseStudy);

        // Increment view count (fire-and-forget)
        (supabase as any)
          .from("case_studies")
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq("id", caseStudyId)
          .then(() => {});
      }

      // Check bookmark status
      if (uid) {
        const { data: bookmark } = await (supabase as any)
          .from("case_study_bookmarks")
          .select("id")
          .eq("case_study_id", caseStudyId)
          .eq("user_id", uid)
          .maybeSingle();
        setIsBookmarked(!!bookmark);
      }

      setLoading(false);
    })();
  }, [caseStudyId]);

  const toggleBookmark = useCallback(async () => {
    if (!userId || !caseStudyId) return;

    if (isBookmarked) {
      await (supabase as any)
        .from("case_study_bookmarks")
        .delete()
        .eq("case_study_id", caseStudyId)
        .eq("user_id", userId);
      setIsBookmarked(false);
      if (caseStudy) setCaseStudy({ ...caseStudy, bookmark_count: Math.max(caseStudy.bookmark_count - 1, 0) });
    } else {
      await (supabase as any)
        .from("case_study_bookmarks")
        .insert({ case_study_id: caseStudyId, user_id: userId });
      setIsBookmarked(true);
      if (caseStudy) setCaseStudy({ ...caseStudy, bookmark_count: caseStudy.bookmark_count + 1 });
    }
  }, [userId, caseStudyId, isBookmarked, caseStudy]);

  return { caseStudy, isBookmarked, loading, toggleBookmark };
}
