import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminUserRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles: string[];
};

export type UseAdminUsersParams = {
  search: string;
  role: string; // "all" or specific app_role
  status: "all" | "active" | "inactive";
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
};

export const ALL_ROLES = [
  "all",
  "patient",
  "doctor",
  "therapist",
  "venue_owner",
  "student",
  "provider",
  "admin",
  "super_admin",
  "product_admin",
  "orders_admin",
  "accounts_admin",
  "doctor_admin",
  "content_admin",
  "ayush_admin",
  "support_admin",
  "blog_admin",
] as const;

export const useAdminUsers = (params: UseAdminUsersParams) => {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const from = (params.page - 1) * params.pageSize;
        const to = from + params.pageSize - 1;

        let query = (supabase as any)
          .from("profiles")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (params.search.trim()) {
          const term = `%${params.search.trim()}%`;
          query = query.or(
            `full_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
          );
        }
        if (params.status === "active") query = query.eq("is_active", true);
        if (params.status === "inactive") query = query.eq("is_active", false);
        if (params.fromDate) query = query.gte("created_at", params.fromDate);
        if (params.toDate) query = query.lte("created_at", params.toDate);

        const { data: profiles, count, error: pErr } = await query.range(from, to);
        if (pErr) throw pErr;

        const userIds = (profiles ?? []).map((p: any) => p.user_id);
        let rolesMap = new Map<string, string[]>();
        if (userIds.length) {
          const { data: roleRows } = await (supabase as any)
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", userIds);
          (roleRows ?? []).forEach((r: any) => {
            const arr = rolesMap.get(r.user_id) ?? [];
            arr.push(r.role);
            rolesMap.set(r.user_id, arr);
          });
        }

        let merged: AdminUserRow[] = (profiles ?? []).map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          full_name: p.full_name,
          email: p.email,
          phone: p.phone,
          avatar_url: p.avatar_url,
          city: p.city,
          state: p.state,
          is_active: p.is_active ?? true,
          created_at: p.created_at,
          updated_at: p.updated_at,
          roles: rolesMap.get(p.user_id) ?? ["patient"],
        }));

        if (params.role !== "all") {
          merged = merged.filter((r) => r.roles.includes(params.role));
        }

        if (active) {
          setRows(merged);
          setTotal(count ?? merged.length);
        }
      } catch (e: any) {
        if (active) setError(e.message ?? "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [
    params.search,
    params.role,
    params.status,
    params.fromDate,
    params.toDate,
    params.page,
    params.pageSize,
    refreshKey,
  ]);

  return { rows, total, loading, error, refresh: () => setRefreshKey((k) => k + 1) };
};
