/**
 * Hook for Research Collaboration — post projects, request to collaborate.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ResearchProject = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  research_area: string;
  looking_for: string;
  skills_needed: string[];
  status: string;
  collaborator_count: number;
  created_at: string;
  author_name?: string;
};

export type CollabRequest = {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  project_title?: string;
};

export function useResearchCollaboration() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [myRequests, setMyRequests] = useState<CollabRequest[]>([]);
  const [requestedProjectIds, setRequestedProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("research_projects")
      .select("*")
      .order("created_at", { ascending: false });

    const pList = (data || []) as ResearchProject[];

    // Enrich with names
    const userIds = [...new Set(pList.map((p) => p.user_id))];
    if (userIds.length > 0) {
      const { data: profiles } = await (supabase as any)
        .from("student_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
      pList.forEach((p) => { p.author_name = nameMap[p.user_id] || "Researcher"; });
    }

    setProjects(pList);

    if (uid) {
      const { data: reqs } = await (supabase as any)
        .from("research_collaboration_requests")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      const reqList = (reqs || []) as CollabRequest[];
      const projMap: Record<string, string> = {};
      pList.forEach((p) => { projMap[p.id] = p.title; });
      reqList.forEach((r) => { r.project_title = projMap[r.project_id] || "Project"; });

      setMyRequests(reqList);
      setRequestedProjectIds(reqList.map((r) => r.project_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const createProject = useCallback(async (project: { title: string; description: string; research_area: string; looking_for: string; skills_needed: string[] }) => {
    if (!userId) return null;
    const { data, error } = await (supabase as any)
      .from("research_projects")
      .insert({ ...project, user_id: userId })
      .select().single();
    if (!error && data) { await fetchData(); return data; }
    return null;
  }, [userId, fetchData]);

  const sendRequest = useCallback(async (projectId: string, message: string) => {
    if (!userId) return { success: false, error: "Not logged in" };
    const { error } = await (supabase as any)
      .from("research_collaboration_requests")
      .insert({ project_id: projectId, user_id: userId, message });
    if (error) {
      if (error.message.includes("duplicate")) return { success: false, error: "Already requested" };
      return { success: false, error: error.message };
    }
    await fetchData();
    return { success: true };
  }, [userId, fetchData]);

  return { projects, myRequests, requestedProjectIds, loading, userId, createProject, sendRequest, refetch: fetchData };
}
