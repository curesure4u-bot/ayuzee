/**
 * Hook for Startup Incubator — pitch ideas, upvote, find co-founders.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StartupIdea = {
  id: string;
  user_id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  looking_for: string[];
  upvotes: number;
  created_at: string;
  author_name?: string;
};

export function useStartupIncubator() {
  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [myUpvotedIds, setMyUpvotedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("startup_ideas")
      .select("*")
      .order("upvotes", { ascending: false });

    const list = (data || []) as StartupIdea[];
    const userIds = [...new Set(list.map((i) => i.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any).from("student_profiles").select("user_id, full_name").in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      list.forEach((i) => { i.author_name = nameMap[i.user_id] || "Founder"; });
    }
    setIdeas(list);

    if (uid) {
      const { data: upvotes } = await (supabase as any).from("startup_idea_upvotes").select("idea_id").eq("user_id", uid);
      setMyUpvotedIds((upvotes || []).map((u: any) => u.idea_id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createIdea = useCallback(async (idea: { title: string; tagline: string; description: string; category: string; stage: string; looking_for: string[] }) => {
    if (!userId) return null;
    const { data, error } = await (supabase as any).from("startup_ideas").insert({ ...idea, user_id: userId }).select().single();
    if (!error && data) { await fetchData(); return data; }
    return null;
  }, [userId, fetchData]);

  const toggleUpvote = useCallback(async (ideaId: string) => {
    if (!userId) return;
    const isUpvoted = myUpvotedIds.includes(ideaId);
    if (isUpvoted) {
      await (supabase as any).from("startup_idea_upvotes").delete().eq("idea_id", ideaId).eq("user_id", userId);
      setMyUpvotedIds((prev) => prev.filter((id) => id !== ideaId));
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, upvotes: Math.max(i.upvotes - 1, 0) } : i)));
    } else {
      await (supabase as any).from("startup_idea_upvotes").insert({ idea_id: ideaId, user_id: userId });
      setMyUpvotedIds((prev) => [...prev, ideaId]);
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, upvotes: i.upvotes + 1 } : i)));
    }
  }, [userId, myUpvotedIds]);

  return { ideas, myUpvotedIds, loading, userId, createIdea, toggleUpvote, refetch: fetchData };
}
