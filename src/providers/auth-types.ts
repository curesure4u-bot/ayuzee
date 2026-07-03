import type { Session, User } from "@supabase/supabase-js";

export type PortalRole =
  | "patient"
  | "doctor"
  | "therapist"
  | "venue_owner"
  | "student"
  | "admin"
  | "super_admin"
  | "product_admin"
  | "orders_admin"
  | "accounts_admin"
  | "doctor_admin"
  | "content_admin"
  | "ayush_admin"
  | "support_admin"
  | "manufacturer"
  | "provider"
  | "blog_admin";

export type PrimaryRole =
  | "patient"
  | "doctor"
  | "therapist"
  | "venue_owner"
  | "student"
  | "admin"
  | null;

export const PRIMARY_ROLE_PRIORITY: Exclude<PrimaryRole, null>[] = [
  "admin",
  "doctor",
  "therapist",
  "venue_owner",
  "student",
  "patient",
];

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface RoleContextValue {
  roles: PortalRole[];
  primaryRole: PrimaryRole;
  loading: boolean;
  hasRole: (role: PortalRole | PortalRole[]) => boolean;
  refreshRoles: () => Promise<void>;
}

export const dashboardPathForPrimaryRole = (role: PrimaryRole) => {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor";
  if (role === "therapist") return "/therapist";
  if (role === "venue_owner") return "/venue";
  if (role === "student") return "/student";
  return "/dashboard";
};

export const labelForPrimaryRole = (role: PrimaryRole) => {
  if (role === "admin") return "Admin";
  if (role === "doctor") return "Doctor";
  if (role === "therapist") return "Therapist";
  if (role === "venue_owner") return "Venue Owner";
  if (role === "student") return "Student";
  return "Patient";
};
