import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TherapyPackage {
  id: string;
  name: string;
  durationDays: number;
  durationLabel: string;
  therapies: string[];
  sessionsPerDay: number;
  totalSessions: number;
  price: number;
  description: string;
}

export interface PanchakarmaPackagesData {
  packages: TherapyPackage[];
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock ───────────────────────────────────────────────────────────

const MOCK_PACKAGES: TherapyPackage[] = [
  { id: "1", name: "7-day Rejuvenation", durationDays: 7, durationLabel: "7 days", therapies: ["Abhyanga", "Shirodhara", "Steam Bath"], sessionsPerDay: 2, totalSessions: 14, price: 28000, description: "Basic rejuvenation with full body oil massage and Shirodhara for stress relief." },
  { id: "2", name: "14-day Full Panchakarma", durationDays: 14, durationLabel: "14 days", therapies: ["Snehapana", "Abhyanga", "Swedana", "Vamana", "Virechana", "Vasti", "Nasya"], sessionsPerDay: 3, totalSessions: 42, price: 85000, description: "Complete Panchakarma detoxification program with all 5 procedures." },
  { id: "3", name: "21-day Spine Care", durationDays: 21, durationLabel: "21 days", therapies: ["Kativasti", "Abhyanga", "Pizhichil", "Elakizhi", "Greevavasti"], sessionsPerDay: 2, totalSessions: 42, price: 65000, description: "Comprehensive spine care for disc problems, spondylosis and back pain." },
  { id: "4", name: "7-day Weight Management", durationDays: 7, durationLabel: "7 days", therapies: ["Udwarthanam", "Steam Bath", "Virechana", "Lekhana Vasti"], sessionsPerDay: 2, totalSessions: 14, price: 22000, description: "Ayurvedic weight management with dry powder massage and detox protocols." },
  { id: "5", name: "14-day Arthritis Care", durationDays: 14, durationLabel: "14 days", therapies: ["Abhyanga", "Elakizhi", "Podikizhi", "Januvasti", "Pizhichil"], sessionsPerDay: 2, totalSessions: 28, price: 55000, description: "Specialized program for joint pain, arthritis and musculoskeletal conditions." },
  { id: "6", name: "10-day Skin & Beauty", durationDays: 10, durationLabel: "10 days", therapies: ["Abhyanga", "Lepanam", "Takradhara", "Virechana", "Mukhalepam"], sessionsPerDay: 2, totalSessions: 20, price: 35000, description: "Ayurvedic beauty care for skin rejuvenation and dermatological conditions." },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const usePanchakarmaPackages = (): PanchakarmaPackagesData & {
  createPackage: (pkg: Omit<TherapyPackage, "id">) => Promise<boolean>;
  updatePackage: (id: string, updates: Partial<TherapyPackage>) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<PanchakarmaPackagesData>({
    packages: MOCK_PACKAGES,
    loading: true,
    error: null,
  });

  const fetchPackages = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: rows, error } = await (supabase as any)
        .from("pk_therapy_packages")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("PK packages fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const packages: TherapyPackage[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        durationDays: r.duration_days,
        durationLabel: r.duration_label || `${r.duration_days} days`,
        therapies: Array.isArray(r.therapies) ? r.therapies : [],
        sessionsPerDay: r.sessions_per_day || 2,
        totalSessions: r.total_sessions,
        price: Number(r.price),
        description: r.description || "",
      }));

      setData({ packages, loading: false, error: null });
    } catch (err: any) {
      console.error("PK packages unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const createPackage = async (pkg: Omit<TherapyPackage, "id">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();

    const { error } = await (supabase as any)
      .from("pk_therapy_packages")
      .insert({
        name: pkg.name,
        duration_days: pkg.durationDays,
        duration_label: pkg.durationLabel,
        therapies: pkg.therapies,
        sessions_per_day: pkg.sessionsPerDay,
        total_sessions: pkg.totalSessions,
        price: pkg.price,
        description: pkg.description,
        created_by: sess.session?.user?.id,
        is_active: true,
      });

    if (!error) fetchPackages();
    return !error;
  };

  const updatePackage = async (id: string, updates: Partial<TherapyPackage>): Promise<boolean> => {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.durationDays !== undefined) dbUpdates.duration_days = updates.durationDays;
    if (updates.durationLabel !== undefined) dbUpdates.duration_label = updates.durationLabel;
    if (updates.therapies !== undefined) dbUpdates.therapies = updates.therapies;
    if (updates.sessionsPerDay !== undefined) dbUpdates.sessions_per_day = updates.sessionsPerDay;
    if (updates.totalSessions !== undefined) dbUpdates.total_sessions = updates.totalSessions;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { error } = await (supabase as any)
      .from("pk_therapy_packages")
      .update(dbUpdates)
      .eq("id", id);

    if (!error) fetchPackages();
    return !error;
  };

  const deletePackage = async (id: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("pk_therapy_packages")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) fetchPackages();
    return !error;
  };

  return { ...data, createPackage, updatePackage, deletePackage, refetch: fetchPackages };
};
