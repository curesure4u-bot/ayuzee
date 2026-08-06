/**
 * Hook for Student Admin Panel —
 * manage admin roles, promote/demote students, view all admins.
 * Persists to Supabase: student_admin_roles, student_profiles
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------- Types ----------

export type AdminRole = {
  id: string;
  user_id: string;
  role: string;
  college_name: string | null;
  granted_by: string | null;
  granted_at: string;
  is_active: boolean;
  full_name?: string;
};

export type StudentSearchResult = {
  user_id: string;
  full_name: string;
  college_name: string | null;
  course: string | null;
  year_of_study: number | null;
};

export type AdminStats = {
  total_admins: number;
  mega_admins: number;
  college_admins: number;
  quiz_masters: number;
  contributors: number;
};

// ---------- Hook: useStudentAdmin ----------

export function useStudentAdmin() {
  const [admins, setAdmins] = useState<AdminRole[]>([]);
  const [stats, setStats] = useState<AdminStats>({ total_admins: 0, mega_admins: 0, college_admins: 0, quiz_masters: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user.id ?? null;
    setUserId(uid);

    if (uid) {
      // Check own role
      const { data: myRoles } = await (supabase as any)
        .from("student_admin_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("is_active", true);

      const roles = (myRoles || []).map((r: any) => r.role);
      const isSA = roles.includes("mega_admin");
      setIsSuperAdmin(isSA);
      setUserRole(isSA ? "mega_admin" : roles[0] || null);

      // Fetch all admin roles
      const { data: allRoles } = await (supabase as any)
        .from("student_admin_roles")
        .select("*")
        .eq("is_active", true)
        .order("granted_at", { ascending: false });

      const roleList = (allRoles || []) as AdminRole[];

      // Enrich with names
      const userIds = [...new Set(roleList.map((r) => r.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await (supabase as any)
          .from("student_profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { nameMap[p.user_id] = p.full_name; });
        roleList.forEach((r) => { r.full_name = nameMap[r.user_id] || "Unknown"; });
      }

      setAdmins(roleList);

      // Compute stats
      const statsObj: AdminStats = { total_admins: roleList.length, mega_admins: 0, college_admins: 0, quiz_masters: 0, contributors: 0 };
      roleList.forEach((r) => {
        if (r.role === "mega_admin") statsObj.mega_admins++;
        else if (r.role === "college_admin") statsObj.college_admins++;
        else if (r.role === "quiz_master") statsObj.quiz_masters++;
        else if (r.role === "contributor") statsObj.contributors++;
      });
      setStats(statsObj);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // Search students by name or email
  const searchStudents = useCallback(async (query: string): Promise<StudentSearchResult[]> => {
    if (!query.trim() || query.trim().length < 2) return [];

    const { data } = await (supabase as any)
      .from("student_profiles")
      .select("user_id, full_name, college_name, course, year_of_study")
      .ilike("full_name", `%${query.trim()}%`)
      .limit(10);

    return (data || []) as StudentSearchResult[];
  }, []);

  // Promote a student to a role
  const promoteStudent = useCallback(async (targetUserId: string, role: string, collegeName?: string) => {
    if (!userId || !isSuperAdmin) return { success: false, error: "Only super admins can manage roles" };

    const { error } = await (supabase as any)
      .from("student_admin_roles")
      .insert({
        user_id: targetUserId,
        role,
        college_name: collegeName || null,
        granted_by: userId,
      });

    if (error) {
      if (error.message.includes("duplicate")) return { success: false, error: "User already has this role" };
      return { success: false, error: error.message };
    }

    await fetchAdmins();
    return { success: true };
  }, [userId, isSuperAdmin, fetchAdmins]);

  // Demote (deactivate) a student's role
  const demoteStudent = useCallback(async (roleId: string) => {
    if (!userId || !isSuperAdmin) return { success: false, error: "Only super admins can manage roles" };

    const { error } = await (supabase as any)
      .from("student_admin_roles")
      .update({ is_active: false })
      .eq("id", roleId);

    if (error) return { success: false, error: error.message };
    await fetchAdmins();
    return { success: true };
  }, [userId, isSuperAdmin, fetchAdmins]);

  // Self-promote as first super admin (only works if no super admin exists)
  const claimSuperAdmin = useCallback(async () => {
    // DISABLED — only platform owner (curesure4u@gmail.com) can grant mega_admin
    return { success: false, error: "Only the platform owner can grant Mega Admin role. Contact curesure4u@gmail.com." };
  }, []);

  return {
    admins, stats, loading, userId, userRole, isSuperAdmin,
    searchStudents, promoteStudent, demoteStudent, claimSuperAdmin,
    refetch: fetchAdmins,
  };
}
