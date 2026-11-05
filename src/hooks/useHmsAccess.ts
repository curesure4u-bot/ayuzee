import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useAccountSession } from "@/features/accounts/accountService";
import { supabase } from "@/integrations/supabase/client";

export type HmsRole = 
  | "owner" 
  | "branch_admin" 
  | "branch_doctor" 
  | "franchise_doctor" 
  | "therapist" 
  | "pharmacist" 
  | "lab_tech" 
  | "receptionist" 
  | "camp_doctor" 
  | "nurse"
  | "venue_partner"
  | "service_provider";

export type HmsModule = 
  | "dashboard" | "opd" | "clinical" | "patient" | "ipd" | "lab" 
  | "stock" | "accounts" | "mis" | "ayush" | "panchakarma" | "spine"
  | "hr" | "marketing" | "masters" | "reports" | "all";

export interface HmsPermissions {
  hasAccess: boolean;
  role: HmsRole | null;
  branch: string | null;
  branches: string[];        // multiple branches allowed
  modules: HmsModule[];      // which modules this user can access
  centerType: string | null;
  vaidyaAccess: boolean;     // separate Vaidya tools access
  accessExpiry: string | null; // for camp/temporary doctors
  loading: boolean;
}

const roles = ["owner", "branch_admin", "branch_doctor", "franchise_doctor", "therapist", "pharmacist", "lab_tech", "receptionist", "camp_doctor", "nurse", "venue_partner", "service_provider"] as const;
const modules = ["dashboard", "opd", "clinical", "patient", "ipd", "lab", "stock", "accounts", "mis", "ayush", "panchakarma", "spine", "hr", "marketing", "masters", "reports", "all"] as const;
const permissionSchema = z.object({
  hms_access: z.boolean(), is_approved: z.boolean(), is_suspended: z.boolean(),
  hms_role: z.enum(roles).nullable(), hms_branch: z.string().nullable(),
  hms_center_type: z.string().nullable(), hms_branches: z.array(z.string()).nullable(),
  hms_modules: z.union([z.array(z.string()), z.string()]).nullable(),
  vaidya_access: z.boolean(), hms_access_expiry: z.string().nullable(),
});
export const useHmsAccess = (): HmsPermissions => {
  const account = useAccountSession();
  const uid = account.session?.user.id;
  const query = useQuery({
    queryKey: ["account", "hms-permissions", uid, account.revision],
    enabled: Boolean(uid && account.account && !account.loading && !account.error),
    queryFn: async () => {
      if (!uid) return null;
      const { data, error } = await supabase.from("doctors")
        .select("hms_access,is_approved,is_suspended,hms_role,hms_branch,hms_center_type,hms_branches,hms_modules,vaidya_access,hms_access_expiry")
        .eq("user_id", uid).maybeSingle();
      if (error) throw error;
      return data ? permissionSchema.parse(data) : null;
    },
  });
  const data = !account.loading && !account.error && uid ? query.data : null;
  const expiry = data?.hms_access_expiry ? Date.parse(data.hms_access_expiry) : null;
  const approved = Boolean(data?.is_approved && !data?.is_suspended);
  const valid = approved && (expiry === null || (Number.isFinite(expiry) && expiry > Date.now()));
  const hasAccess = Boolean(valid && data?.hms_access && data?.hms_role);
  const rawModules = Array.isArray(data?.hms_modules) ? data.hms_modules : (data?.hms_modules ?? "").split(",");
  return {
    hasAccess, role: hasAccess && data ? data.hms_role : null,
    branch: hasAccess && data ? data.hms_branch : null,
    branches: hasAccess && data ? (data.hms_branches ?? (data.hms_branch ? [data.hms_branch] : [])) : [],
    modules: hasAccess ? rawModules.map(value => value.trim()).filter((value): value is HmsModule => modules.some(module => module === value)) : [],
    centerType: hasAccess && data ? data.hms_center_type : null,
    vaidyaAccess: Boolean(valid && data?.vaidya_access),
    accessExpiry: data?.hms_access_expiry ?? null,
    loading: account.loading || Boolean(uid && query.isLoading),
  };
};

// Helper: Check if user can access a specific module
export const canAccessModule = (permissions: HmsPermissions, module: HmsModule): boolean => {
  if (!permissions.hasAccess) return false;
  if (permissions.modules.includes("all")) return true;
  return permissions.modules.includes(module);
};

// Helper: Check if user can access a specific branch's data
export const canAccessBranch = (permissions: HmsPermissions, branchName: string): boolean => {
  if (!permissions.hasAccess) return false;
  if (permissions.role === "owner" || permissions.role === "branch_admin") return true;
  return permissions.branches.includes(branchName);
};
