/**
 * Hook to manage College Chapters — listing, joining, creating chapters,
 * posting discussions, and replying.
 * Persists to Supabase tables: college_chapters, chapter_members, chapter_posts, chapter_replies
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type CollegeChapter = {
  id: string;
  college_name: string;
  description: string | null;
  state: string | null;
  course: string | null;
  created_by: string;
  member_count: number;
  created_at: string;
};

export type ChapterPost = {
  id: string;
  chapter_id: string;
  user_id: string;
  title: string;
  content: string;
  reply_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
};

export type ChapterReply = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
};

// ---------- Hook: useCollegeChapters (list + join/create) ----------

export function useCollegeChapters() {
  const [chapters, setChapters] = useState<CollegeChapter[]>([]);
  const [myChapterIds, setMyChapterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    // Fetch all chapters
    const { data: chaptersData } = await (supabase as any)
      .from("college_chapters")
      .select("*")
      .order("member_count", { ascending: false });

    setChapters((chaptersData as CollegeChapter[]) || []);

    // Fetch user's memberships
    if (uid) {
      const { data: memberships } = await (supabase as any)
        .from("chapter_members")
        .select("chapter_id")
        .eq("user_id", uid);

      setMyChapterIds((memberships || []).map((m: any) => m.chapter_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const createChapter = useCallback(
    async (collegeName: string, description: string, state: string, course: string) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("college_chapters")
        .insert({
          college_name: collegeName,
          description,
          state,
          course,
          created_by: userId,
        })
        .select()
        .single();

      if (error) return { error: error.message };

      // Auto-join creator
      await (supabase as any).from("chapter_members").insert({
        chapter_id: data.id,
        user_id: userId,
      });

      await fetchChapters();
      return { data };
    },
    [userId, fetchChapters]
  );

  const joinChapter = useCallback(
    async (chapterId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("chapter_members")
        .insert({ chapter_id: chapterId, user_id: userId });

      if (!error) {
        setMyChapterIds((prev) => [...prev, chapterId]);
        setChapters((prev) =>
          prev.map((c) => (c.id === chapterId ? { ...c, member_count: c.member_count + 1 } : c))
        );
        return true;
      }
      return false;
    },
    [userId]
  );

  const leaveChapter = useCallback(
    async (chapterId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("chapter_members")
        .delete()
        .eq("chapter_id", chapterId)
        .eq("user_id", userId);

      if (!error) {
        setMyChapterIds((prev) => prev.filter((id) => id !== chapterId));
        setChapters((prev) =>
          prev.map((c) =>
            c.id === chapterId ? { ...c, member_count: Math.max(c.member_count - 1, 0) } : c
          )
        );
        return true;
      }
      return false;
    },
    [userId]
  );

  return { chapters, myChapterIds, loading, userId, createChapter, joinChapter, leaveChapter, refetch: fetchChapters };
}

// ---------- Hook: useChapterPosts (posts within a chapter) ----------

export function useChapterPosts(chapterId: string | undefined) {
  const [posts, setPosts] = useState<ChapterPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!chapterId) return;
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    setUserId(session.session?.user.id ?? null);

    const { data } = await (supabase as any)
      .from("chapter_posts")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });

    const posts = (data || []) as ChapterPost[];

    // Enrich with author names
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.full_name;
      });

      posts.forEach((post) => {
        post.author_name = nameMap[post.user_id] || "Anonymous";
      });
    }

    setPosts(posts);
    setLoading(false);
  }, [chapterId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(
    async (title: string, content: string) => {
      if (!userId || !chapterId) return null;

      const { data, error } = await (supabase as any)
        .from("chapter_posts")
        .insert({ chapter_id: chapterId, user_id: userId, title, content })
        .select()
        .single();

      if (!error && data) {
        await fetchPosts();
        return data;
      }
      return null;
    },
    [userId, chapterId, fetchPosts]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      const { error } = await (supabase as any)
        .from("chapter_posts")
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

  return { posts, loading, userId, createPost, deletePost, refetch: fetchPosts };
}

// ---------- Hook: useChapterReplies (replies on a post) ----------

export function useChapterReplies(postId: string | undefined) {
  const [replies, setReplies] = useState<ChapterReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchReplies = useCallback(async () => {
    if (!postId) return;
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    setUserId(session.session?.user.id ?? null);

    const { data } = await (supabase as any)
      .from("chapter_replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    const replies = (data || []) as ChapterReply[];

    // Enrich with author names
    const userIds = [...new Set(replies.map((r) => r.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => {
        nameMap[p.user_id] = p.full_name;
      });

      replies.forEach((reply) => {
        reply.author_name = nameMap[reply.user_id] || "Anonymous";
      });
    }

    setReplies(replies);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  const createReply = useCallback(
    async (content: string) => {
      if (!userId || !postId) return null;

      const { data, error } = await (supabase as any)
        .from("chapter_replies")
        .insert({ post_id: postId, user_id: userId, content })
        .select()
        .single();

      if (!error && data) {
        await fetchReplies();
        return data;
      }
      return null;
    },
    [userId, postId, fetchReplies]
  );

  const deleteReply = useCallback(
    async (replyId: string) => {
      const { error } = await (supabase as any)
        .from("chapter_replies")
        .delete()
        .eq("id", replyId)
        .eq("user_id", userId);

      if (!error) {
        setReplies((prev) => prev.filter((r) => r.id !== replyId));
        return true;
      }
      return false;
    },
    [userId]
  );

  return { replies, loading, userId, createReply, deleteReply, refetch: fetchReplies };
}
