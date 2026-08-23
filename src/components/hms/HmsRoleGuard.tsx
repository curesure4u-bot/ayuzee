import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Loader2 } from "lucide-react";

/**
 * HMS Role-based access guard.
 * Wraps a page/section and only renders children if user has required role.
 *
 * Usage:
 *   <HmsRoleGuard allowedRoles={["doctor", "admin"]}>
 *     <DoctorOnlyContent />
 *   </HmsRoleGuard>
 */

export type HmsRole = "admin" | "doctor" | "receptionist" | "pharmacist" | "lab_tech" | "therapist" | "nurse" | "accountant" | "hr" | "manager";

interface HmsRoleGuardProps {
  allowedRoles: HmsRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

// Cache user roles for session lifetime
let cachedRoles: HmsRole[] | null = null;
let cacheUserId: string | null = null;

export const useHmsRole = () => {
  const [roles, setRoles] = useState<HmsRole[]>(cachedRoles || []);
  const [loading, setLoading] = useState(!cachedRoles);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) { setLoading(false); return; }

      // Return cached if same user
      if (cacheUserId === uid && cachedRoles) {
        setRoles(cachedRoles);
        setLoading(false);
        return;
      }

      // Fetch from user_roles table
      const { data: roleRows } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);

      const userRoles: HmsRole[] = (roleRows || []).map((r: any) => r.role as HmsRole);

      // Also check hms_staff for role
      const { data: staffRow } = await (supabase as any)
        .from("hms_staff")
        .select("role, department")
        .eq("user_id", uid)
        .maybeSingle();

      if (staffRow?.role && !userRoles.includes(staffRow.role as HmsRole)) {
        userRoles.push(staffRow.role as HmsRole);
      }

      // Admin/super_admin has access to everything
      if (userRoles.some((r) => r === "admin" || (r as string) === "super_admin")) {
        userRoles.push("admin" as HmsRole);
      }

      cachedRoles = userRoles;
      cacheUserId = uid;
      setRoles(userRoles);
      setLoading(false);
    };

    fetchRoles();
  }, []);

  const hasRole = (role: HmsRole) => roles.includes(role) || roles.includes("admin");
  const hasAnyRole = (checkRoles: HmsRole[]) => checkRoles.some((r) => hasRole(r));

  return { roles, loading, hasRole, hasAnyRole };
};

export const HmsRoleGuard = ({ allowedRoles, children, fallback }: HmsRoleGuardProps) => {
  const { roles, loading, hasAnyRole } = useHmsRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAnyRole(allowedRoles)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-14 w-14 rounded-full bg-red-100 grid place-items-center mb-3">
          <Shield className="h-7 w-7 text-red-600" />
        </div>
        <h2 className="font-semibold text-lg">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          You don't have permission to access this section.
          Required role: {allowedRoles.join(" or ")}.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default HmsRoleGuard;
