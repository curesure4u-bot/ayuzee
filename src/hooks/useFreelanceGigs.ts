/**
 * Hook for Freelance Gigs — browse gigs, apply, track applications.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FreelanceGig = {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: string | null;
  duration: string | null;
  skills_required: string[];
  is_remote: boolean;
  location: string | null;
  poster_name: string | null;
  application_count: number;
  created_at: string;
};

export type GigApplication = {
  id: string;
  gig_id: string;
  user_id: string;
  pitch: string;
  portfolio_url: string | null;
  status: string;
  applied_at: string;
  gig_title?: string;
};

export function useFreelanceGigs() {
  const [gigs, setGigs] = useState<FreelanceGig[]>([]);
  const [myApplications, setMyApplications] = useState<GigApplication[]>([]);
  const [appliedGigIds, setAppliedGigIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("freelance_gigs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setGigs((data || []) as FreelanceGig[]);

    if (uid) {
      const { data: apps } = await (supabase as any)
        .from("freelance_gig_applications")
        .select("*")
        .eq("user_id", uid)
        .order("applied_at", { ascending: false });

      const appList = (apps || []) as GigApplication[];
      const gigMap: Record<string, string> = {};
      (data || []).forEach((g: any) => { gigMap[g.id] = g.title; });
      appList.forEach((a) => { a.gig_title = gigMap[a.gig_id] || "Gig"; });

      setMyApplications(appList);
      setAppliedGigIds(appList.map((a) => a.gig_id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applyToGig = useCallback(async (gigId: string, pitch: string, portfolioUrl?: string) => {
    if (!userId) return { success: false, error: "Not logged in" };
    const { error } = await (supabase as any)
      .from("freelance_gig_applications")
      .insert({ gig_id: gigId, user_id: userId, pitch, portfolio_url: portfolioUrl || null });
    if (error) {
      if (error.message.includes("duplicate")) return { success: false, error: "Already applied" };
      return { success: false, error: error.message };
    }
    await fetchData();
    return { success: true };
  }, [userId, fetchData]);

  return { gigs, myApplications, appliedGigIds, loading, userId, applyToGig, refetch: fetchData };
}
