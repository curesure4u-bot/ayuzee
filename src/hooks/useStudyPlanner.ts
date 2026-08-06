/**
 * Hook to manage Study Planner & Notes —
 * CRUD notes, log study sessions, and compute study stats.
 * Persists to Supabase tables: student_notes, student_study_sessions
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type StudentNote = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type StudySession = {
  id: string;
  user_id: string;
  subject: string;
  duration_minutes: number;
  notes: string | null;
  studied_at: string;
  created_at: string;
};

export type StudyStats = {
  totalMinutes: number;
  totalSessions: number;
  todayMinutes: number;
  weekMinutes: number;
  subjectBreakdown: { subject: string; minutes: number }[];
};

// ---------- Hook: useStudyNotes ----------

export function useStudyNotes() {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      const { data } = await (supabase as any)
        .from("student_notes")
        .select("*")
        .eq("user_id", uid)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      setNotes((data || []) as StudentNote[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (title: string, content: string, subject: string, tags: string[]) => {
      if (!userId) return null;

      const { data, error } = await (supabase as any)
        .from("student_notes")
        .insert({ user_id: userId, title, content, subject, tags })
        .select()
        .single();

      if (!error && data) {
        setNotes((prev) => [data as StudentNote, ...prev]);
        return data;
      }
      return null;
    },
    [userId]
  );

  const updateNote = useCallback(
    async (noteId: string, updates: { title?: string; content?: string; subject?: string; tags?: string[]; is_pinned?: boolean }) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("student_notes")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", noteId)
        .eq("user_id", userId);

      if (!error) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n))
        );
        return true;
      }
      return false;
    },
    [userId]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("student_notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", userId);

      if (!error) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        return true;
      }
      return false;
    },
    [userId]
  );

  const togglePin = useCallback(
    async (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;
      await updateNote(noteId, { is_pinned: !note.is_pinned });
    },
    [notes, updateNote]
  );

  return { notes, loading, userId, createNote, updateNote, deleteNote, togglePin, refetch: fetchNotes };
}

// ---------- Hook: useStudySessions ----------

export function useStudySessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats>({ totalMinutes: 0, totalSessions: 0, todayMinutes: 0, weekMinutes: 0, subjectBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      const { data } = await (supabase as any)
        .from("student_study_sessions")
        .select("*")
        .eq("user_id", uid)
        .order("studied_at", { ascending: false })
        .limit(100);

      const sessionList = (data || []) as StudySession[];
      setSessions(sessionList);

      // Compute stats
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

      let totalMinutes = 0;
      let todayMinutes = 0;
      let weekMinutes = 0;
      const subjectMap: Record<string, number> = {};

      sessionList.forEach((s) => {
        totalMinutes += s.duration_minutes;
        if (s.studied_at === today) todayMinutes += s.duration_minutes;
        if (s.studied_at >= weekAgo) weekMinutes += s.duration_minutes;
        subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration_minutes;
      });

      const subjectBreakdown = Object.entries(subjectMap)
        .map(([subject, minutes]) => ({ subject, minutes }))
        .sort((a, b) => b.minutes - a.minutes);

      setStats({ totalMinutes, totalSessions: sessionList.length, todayMinutes, weekMinutes, subjectBreakdown });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const logSession = useCallback(
    async (subject: string, durationMinutes: number, notes?: string) => {
      if (!userId || durationMinutes <= 0) return null;

      const { data, error } = await (supabase as any)
        .from("student_study_sessions")
        .insert({
          user_id: userId,
          subject,
          duration_minutes: durationMinutes,
          notes: notes || null,
          studied_at: new Date().toISOString().slice(0, 10),
        })
        .select()
        .single();

      if (!error && data) {
        setSessions((prev) => [data as StudySession, ...prev]);
        // Update stats optimistically
        setStats((prev) => ({
          ...prev,
          totalMinutes: prev.totalMinutes + durationMinutes,
          totalSessions: prev.totalSessions + 1,
          todayMinutes: prev.todayMinutes + durationMinutes,
          weekMinutes: prev.weekMinutes + durationMinutes,
        }));
        return data;
      }
      return null;
    },
    [userId]
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!userId) return false;

      const { error } = await (supabase as any)
        .from("student_study_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (!error) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        await fetchSessions(); // Recalculate stats
        return true;
      }
      return false;
    },
    [userId, fetchSessions]
  );

  return { sessions, stats, loading, userId, logSession, deleteSession, refetch: fetchSessions };
}
