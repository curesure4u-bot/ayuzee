/**
 * Hook to manage Study Groups —
 * listing, creating, joining groups, and posting within groups.
 * Persists to Supabase: study_groups, study_group_members, study_group_posts
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type StudyGroup = {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  created_by: string;
  member_count: number;
  is_public: boolean;
  max_members: number;
  created_at: string;
};

export type StudyGroupPost = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  post_type: "discussion" | "resource" | "question" | "announcement";
  resource_url: string | null;
  created_at: string;
  author_name?: string;
};

// ---------- Hook: useStudyGroupList ----------

export function useStudyGroupList() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("study_groups")
      .select("*")
      .order("member_count", { ascending: false });

    setGroups((data || []) as StudyGroup[]);

    if (uid) {
      const { data: memberships } = await (supabase as any)
        .from("study_group_members")
        .select("group_id")
        .eq("user_id", uid);
      setMyGroupIds((memberships || []).map((m: any) => m.group_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(
    async (name: string, subject: string, description: string) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("study_groups")
        .insert({ name, subject, description, created_by: userId })
        .select()
        .single();

      if (error) return { error: error.message };

      // Auto-join creator as admin
      await (supabase as any).from("study_group_members").insert({
        group_id: data.id,
        user_id: userId,
        role: "admin",
      });

      await fetchGroups();
      return { data };
    },
    [userId, fetchGroups]
  );

  const joinGroup = useCallback(
    async (groupId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("study_group_members")
        .insert({ group_id: groupId, user_id: userId, role: "member" });

      if (!error) {
        setMyGroupIds((prev) => [...prev, groupId]);
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, member_count: g.member_count + 1 } : g))
        );
        return true;
      }
      return false;
    },
    [userId]
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("study_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);

      if (!error) {
        setMyGroupIds((prev) => prev.filter((id) => id !== groupId));
        setGroups((prev) =>
          prev.map((g) => (g.id === groupId ? { ...g, member_count: Math.max(g.member_count - 1, 0) } : g))
        );
        return true;
      }
      return false;
    },
    [userId]
  );

  return { groups, myGroupIds, loading, userId, createGroup, joinGroup, leaveGroup, refetch: fetchGroups };
}

// ---------- Hook: useStudyGroupDetail ----------

export function useStudyGroupDetail(groupId: string | undefined) {
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [posts, setPosts] = useState<StudyGroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    setUserId(session.session?.user.id ?? null);

    // Fetch group info
    const { data: groupData } = await (supabase as any)
      .from("study_groups")
      .select("*")
      .eq("id", groupId)
      .single();

    setGroup(groupData as StudyGroup | null);

    // Fetch posts
    const { data: postData } = await (supabase as any)
      .from("study_group_posts")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    const postList = (postData || []) as StudyGroupPost[];

    // Enrich with author names
    const userIds = [...new Set(postList.map((p) => p.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.full_name;
      });
      postList.forEach((post) => {
        post.author_name = nameMap[post.user_id] || "Anonymous";
      });
    }

    setPosts(postList);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const createPost = useCallback(
    async (content: string, postType: string, resourceUrl?: string) => {
      if (!userId || !groupId) return null;

      const { data, error } = await (supabase as any)
        .from("study_group_posts")
        .insert({
          group_id: groupId,
          user_id: userId,
          content,
          post_type: postType,
          resource_url: resourceUrl || null,
        })
        .select()
        .single();

      if (!error && data) {
        await fetchDetail();
        return data;
      }
      return null;
    },
    [userId, groupId, fetchDetail]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      const { error } = await (supabase as any)
        .from("study_group_posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", userId);

      if (!error) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return true;
      }
      return false;
    },
    [userId]
  );

  return { group, posts, loading, userId, createPost, deletePost, refetch: fetchDetail };
}
