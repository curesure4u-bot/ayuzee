/**
 * Hook for Internship Marketplace —
 * browse listings, apply, view own applications.
 * Persists to Supabase: internship_listings, internship_applications
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type InternshipListing = {
  id: string;
  title: string;
  hospital_name: string;
  location: string;
  department: string;
  description: string;
  requirements: string | null;
  duration_weeks: number;
  stipend: string | null;
  spots_available: number;
  application_deadline: string | null;
  application_count: number;
  created_at: string;
};

export type InternshipApplication = {
  id: string;
  listing_id: string;
  user_id: string;
  cover_note: string;
  status: string;
  applied_at: string;
  listing_title?: string;
  hospital_name?: string;
};

export function useInternshipMarketplace() {
  const [listings, setListings] = useState<InternshipListing[]>([]);
  const [myApplications, setMyApplications] = useState<InternshipApplication[]>([]);
  const [appliedListingIds, setAppliedListingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    const { data } = await (supabase as any)
      .from("internship_listings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setListings((data || []) as InternshipListing[]);

    if (uid) {
      const { data: apps } = await (supabase as any)
        .from("internship_applications")
        .select("*")
        .eq("user_id", uid)
        .order("applied_at", { ascending: false });

      const appList = (apps || []) as InternshipApplication[];

      // Enrich with listing info
      const listingMap: Record<string, { title: string; hospital: string }> = {};
      (data || []).forEach((l: any) => { listingMap[l.id] = { title: l.title, hospital: l.hospital_name }; });
      appList.forEach((a) => {
        a.listing_title = listingMap[a.listing_id]?.title || "Internship";
        a.hospital_name = listingMap[a.listing_id]?.hospital || "";
      });

      setMyApplications(appList);
      setAppliedListingIds(appList.map((a) => a.listing_id));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const apply = useCallback(async (listingId: string, coverNote: string) => {
    if (!userId) return { success: false, error: "Not logged in" };

    const { error } = await (supabase as any)
      .from("internship_applications")
      .insert({ listing_id: listingId, user_id: userId, cover_note: coverNote });

    if (error) {
      if (error.message.includes("duplicate")) return { success: false, error: "Already applied" };
      return { success: false, error: error.message };
    }

    await fetchData();
    return { success: true };
  }, [userId, fetchData]);

  return { listings, myApplications, appliedListingIds, loading, userId, apply, refetch: fetchData };
}
