import { useRole } from "@/hooks/useRole";
import {
  dashboardPathForPrimaryRole,
  labelForPrimaryRole,
  type PrimaryRole,
} from "@/providers/auth-types";
import {
  getDashboardPathForUser,
  getUserPrimaryRole,
} from "@/providers/RoleProvider";

export type AppRole = PrimaryRole;

export const dashboardPathForRole = dashboardPathForPrimaryRole;
export const labelForRole = labelForPrimaryRole;
export { getDashboardPathForUser, getUserPrimaryRole };

export const useUserRole = () => {
  const { primaryRole, loading } = useRole();
  return { role: primaryRole, loading };
};
