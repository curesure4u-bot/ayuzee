/**
 * Hook to manage Mentorship & Connect —
 * browse mentors, send/manage requests, and exchange messages.
 * Persists to Supabase: student_mentors, mentorship_requests, mentorship_messages
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type Mentor = {
  id: string;
  user_id: string;
  full_name: string;
  college_name: string | null;
  specialization: string;
  year_of_study: number | null;
  bio: string | null;
  subjects: string[];
  is_available: boolean;
  max_mentees: number;
  current_mentees: number;
  rating: number;
  created_at: string;
};

export type MentorshipRequest = {
  id: string;
  mentor_id: string;
  mentee_user_id: string;
  mentee_name: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  mentor_name?: string;
  mentor_specialization?: string;
};

export type MentorshipMessage = {
  id: string;
  request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

// ---------- Hook: useMentorList ----------

export function useMentorList() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Student");

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      const { data: profile } = await (supabase as any)
        .from("student_profiles")
        .select("full_name")
        .eq("user_id", uid)
        .maybeSingle();
      setUserName(profile?.full_name || "Student");
    }

    // Fetch available mentors
    const { data: mentorData } = await (supabase as any)
      .from("student_mentors")
      .select("*")
      .eq("is_available", true)
      .order("rating", { ascending: false });

    setMentors((mentorData || []) as Mentor[]);

    // Fetch user's requests
    if (uid) {
      const { data: requests } = await (supabase as any)
        .from("mentorship_requests")
        .select("*")
        .eq("mentee_user_id", uid)
        .order("created_at", { ascending: false });

      const reqList = (requests || []) as MentorshipRequest[];

      // Enrich with mentor names
      if (reqList.length > 0) {
        const mentorIds = [...new Set(reqList.map((r) => r.mentor_id))];
        const { data: mentorProfiles } = await (supabase as any)
          .from("student_mentors")
          .select("id, full_name, specialization")
          .in("id", mentorIds);

        const mentorMap: Record<string, { name: string; spec: string }> = {};
        (mentorProfiles || []).forEach((m: any) => {
          mentorMap[m.id] = { name: m.full_name, spec: m.specialization };
        });

        reqList.forEach((r) => {
          r.mentor_name = mentorMap[r.mentor_id]?.name || "Mentor";
          r.mentor_specialization = mentorMap[r.mentor_id]?.spec || "";
        });
      }

      setMyRequests(reqList);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const sendRequest = useCallback(
    async (mentorId: string, message: string) => {
      if (!userId) return { success: false, error: "Not logged in" };

      const { error } = await (supabase as any)
        .from("mentorship_requests")
        .insert({
          mentor_id: mentorId,
          mentee_user_id: userId,
          mentee_name: userName,
          message,
        });

      if (error) {
        if (error.message.includes("duplicate")) {
          return { success: false, error: "You already sent a request to this mentor" };
        }
        return { success: false, error: error.message };
      }

      await fetchMentors();
      return { success: true };
    },
    [userId, userName, fetchMentors]
  );

  return { mentors, myRequests, loading, userId, sendRequest, refetch: fetchMentors };
}

// ---------- Hook: useMentorshipMessages ----------

export function useMentorshipMessages(requestId: string | undefined) {
  const [messages, setMessages] = useState<MentorshipMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);

    const { data: session } = await supabase.auth.getSession();
    setUserId(session.session?.user.id ?? null);

    const { data } = await (supabase as any)
      .from("mentorship_messages")
      .select("*")
      .eq("request_id", requestId)
      .order("created_at", { ascending: true });

    setMessages((data || []) as MentorshipMessage[]);
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId || !requestId || !content.trim()) return null;

      const { data, error } = await (supabase as any)
        .from("mentorship_messages")
        .insert({ request_id: requestId, sender_id: userId, content: content.trim() })
        .select()
        .single();

      if (!error && data) {
        setMessages((prev) => [...prev, data as MentorshipMessage]);
        return data;
      }
      return null;
    },
    [userId, requestId]
  );

  return { messages, loading, userId, sendMessage, refetch: fetchMessages };
}
