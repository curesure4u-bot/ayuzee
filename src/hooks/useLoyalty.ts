import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LoyaltyTier = "silver" | "gold" | "platinum";

export interface LoyaltyMember {
  id: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  totalSpent: number;
  visits: number;
  joinDate: string;
  nextReward: string;
}

const MOCK_MEMBERS: LoyaltyMember[] = [
  { id: "1", name: "Ramesh Kumar", tier: "platinum", points: 4500, totalSpent: 185000, visits: 28, joinDate: "2024-06-01", nextReward: "Free Abhyanga session" },
  { id: "2", name: "Lakshmi Devi", tier: "gold", points: 2200, totalSpent: 85000, visits: 15, joinDate: "2025-01-15", nextReward: "10% off next package" },
  { id: "3", name: "Priya Menon", tier: "gold", points: 1800, totalSpent: 72000, visits: 12, joinDate: "2025-03-20", nextReward: "Free consultation" },
  { id: "4", name: "Sunil Menon", tier: "silver", points: 900, totalSpent: 35000, visits: 8, joinDate: "2025-08-01", nextReward: "5% off medicines" },
  { id: "5", name: "Anand Sharma", tier: "silver", points: 450, totalSpent: 18000, visits: 4, joinDate: "2026-02-10", nextReward: "Welcome reward pending" },
  { id: "6", name: "Kavitha R.", tier: "platinum", points: 5200, totalSpent: 220000, visits: 35, joinDate: "2023-11-01", nextReward: "Complimentary health checkup" },
];

export const useLoyalty = () => {
  const [members, setMembers] = useState<LoyaltyMember[]>(MOCK_MEMBERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_loyalty_members")
        .select("*")
        .order("points", { ascending: false });

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: LoyaltyMember[] = data.map((r: any) => ({
          id: r.id,
          name: r.patient_name || "",
          tier: r.tier || "silver",
          points: r.points || 0,
          totalSpent: r.total_spent || 0,
          visits: r.visits || 0,
          joinDate: r.join_date || "",
          nextReward: r.next_reward || "",
        }));
        setMembers(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const totalPoints = members.reduce((s, m) => s + m.points, 0);
  const totalLifetimeValue = members.reduce((s, m) => s + m.totalSpent, 0);

  return { members, loading, error, totalPoints, totalLifetimeValue, refetch: fetchMembers };
};
