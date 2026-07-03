export { AuthProvider } from "@/providers/AuthProvider";
export { RoleProvider } from "@/providers/RoleProvider";
export { ProtectedRoute } from "@/providers/ProtectedRoute";
export type { AuthContextValue, PrimaryRole, PortalRole, RoleContextValue } from "@/providers/auth-types";
export {
  dashboardPathForPrimaryRole,
  labelForPrimaryRole,
  PRIMARY_ROLE_PRIORITY,
} from "@/providers/auth-types";
export {
  getDashboardPathForUser,
  getUserPrimaryRole,
} from "@/providers/RoleProvider";
