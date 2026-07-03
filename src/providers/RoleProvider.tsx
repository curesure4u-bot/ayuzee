import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/providers/AuthProvider";
import {
  dashboardPathForPrimaryRole,
  PRIMARY_ROLE_PRIORITY,
  type PortalRole,
  type PrimaryRole,
  type RoleContextValue,
} from "@/providers/auth-types";

const RoleContext = createContext<RoleContextValue | null>(null);

const ADMIN_ROLES: PortalRole[] = [
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
];

const resolvePrimaryRole = (roles: PortalRole[]): PrimaryRole => {
  const roleSet = new Set(roles);
  if (ADMIN_ROLES.some((role) => roleSet.has(role))) return "admin";
  return PRIMARY_ROLE_PRIORITY.find((role) => roleSet.has(role)) ?? "patient";
};

const fetchUserRoles = async (userId: string): Promise<PortalRole[]> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.role as PortalRole);
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider = ({ children }: RoleProviderProps) => {
  const { user, loading: authLoading } = useAuthContext();
  const [roles, setRoles] = useState<PortalRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextRoles = await fetchUserRoles(user.id);
      setRoles(nextRoles);
    } catch {
      setRoles(["patient"]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void refreshRoles();
  }, [authLoading, refreshRoles]);

  const hasRole = useCallback(
    (role: PortalRole | PortalRole[]) => {
      const required = Array.isArray(role) ? role : [role];
      return required.some((entry) => roles.includes(entry));
    },
    [roles],
  );

  const primaryRole = useMemo(() => resolvePrimaryRole(roles), [roles]);

  const value = useMemo<RoleContextValue>(
    () => ({
      roles,
      primaryRole,
      loading: authLoading || loading,
      hasRole,
      refreshRoles,
    }),
    [roles, primaryRole, authLoading, loading, hasRole, refreshRoles],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};

export const getUserPrimaryRole = async (userId: string): Promise<PrimaryRole> =>
  resolvePrimaryRole(await fetchUserRoles(userId));

export const getDashboardPathForUser = async (userId: string) =>
  dashboardPathForPrimaryRole(await getUserPrimaryRole(userId));
