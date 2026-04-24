import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "patient" | "doctor" | "therapist" | "venue_owner" | "student" | "admin" | null;

const rolePriority: Exclude<AppRole, null>[] = ["admin", "doctor", "therapist", "venue_owner", "student", "patient"];

export const dashboardPathForRole = (role: AppRole) => {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor";
  if (role === "therapist") return "/therapist";
  if (role === "venue_owner") return "/venue";
  if (role === "student") return "/student";
  return "/dashboard";
};

export const labelForRole = (role: AppRole) => {
  if (role === "admin") return "Admin";
  if (role === "doctor") return "Doctor";
  if (role === "therapist") return "Therapist";
  if (role === "venue_owner") return "Venue Owner";
  if (role === "student") return "Student";
  return "Patient";
};

export const getUserPrimaryRole = async (userId: string): Promise<AppRole> => {
  const { data, error } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;
  const roles = new Set((data ?? []).map((row: { role: string }) => row.role));
  return rolePriority.find((role) => roles.has(role)) ?? "patient";
};

export const getDashboardPathForUser = async (userId: string) => dashboardPathForRole(await getUserPrimaryRole(userId));

export const useUserRole = () => {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRole = async (userId?: string) => {
      if (!userId) {
        if (active) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const nextRole = await getUserPrimaryRole(userId);
        if (active) setRole(nextRole);
      } catch {
        if (active) setRole("patient");
      } finally {
        if (active) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => loadRole(data.session?.user.id));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      loadRole(session?.user.id);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { role, loading };
};
