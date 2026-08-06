import { useEffect, useState } from "react";
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

export const useHmsAccess = (): HmsPermissions => {
  const [state, setState] = useState<HmsPermissions>({
    hasAccess: false,
    role: null,
    branch: null,
    branches: [],
    modules: [],
    centerType: null,
    vaidyaAccess: false,
    accessExpiry: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        if (active) setState(s => ({ ...s, hasAccess: false, loading: false }));
        return;
      }

      // Query doctor record with permission fields
      const { data } = await (supabase as any)
        .from("doctors")
        .select("hms_access, hms_branch, hms_center_type, hms_role, hms_branches, hms_modules, vaidya_access, hms_access_expiry")
        .eq("user_id", uid)
        .maybeSingle();

      if (!active) return;

      // Check expiry for temporary access (camp doctors)
      let accessValid = Boolean(data?.hms_access);
      if (data?.hms_access_expiry) {
        const expiry = new Date(data.hms_access_expiry);
        if (expiry < new Date()) accessValid = false; // expired
      }

      // Parse modules (stored as string[] or comma-separated or null)
      let modules: HmsModule[] = [];
      if (data?.hms_modules) {
        if (Array.isArray(data.hms_modules)) {
          modules = data.hms_modules;
        } else if (typeof data.hms_modules === "string") {
          modules = data.hms_modules.split(",").map((m: string) => m.trim()) as HmsModule[];
        }
      }

      // Parse branches (stored as string[] or single branch)
      let branches: string[] = [];
      if (data?.hms_branches && Array.isArray(data.hms_branches)) {
        branches = data.hms_branches;
      } else if (data?.hms_branch) {
        branches = [data.hms_branch];
      }

      // Role-based default modules (if hms_modules not explicitly set)
      const role = (data?.hms_role as HmsRole) || "branch_doctor";
      if (modules.length === 0 && accessValid) {
        switch (role) {
          case "owner": modules = ["all"]; break;
          case "branch_admin": modules = ["all"]; break;
          case "branch_doctor": modules = ["dashboard", "opd", "clinical", "patient", "lab", "ayush", "panchakarma", "spine"]; break;
          case "franchise_doctor": modules = ["dashboard", "opd", "clinical", "patient", "ayush", "spine"]; break;
          case "therapist": modules = ["opd", "panchakarma", "ayush", "spine"]; break;
          case "pharmacist": modules = ["stock"]; break;
          case "lab_tech": modules = ["lab"]; break;
          case "receptionist": modules = ["dashboard", "opd", "patient"]; break;
          case "camp_doctor": modules = ["opd", "clinical", "patient"]; break;
          case "nurse": modules = ["opd", "ipd", "patient"]; break;
          case "venue_partner": modules = ["opd", "panchakarma", "reports"]; break;
          case "service_provider": modules = ["lab", "stock"]; break;
          default: modules = ["dashboard", "opd", "clinical", "patient"];
        }
      }

      setState({
        hasAccess: accessValid,
        role,
        branch: data?.hms_branch ?? null,
        branches,
        modules,
        centerType: data?.hms_center_type ?? null,
        vaidyaAccess: Boolean(data?.vaidya_access),
        accessExpiry: data?.hms_access_expiry ?? null,
        loading: false,
      });
    };
    check();
    return () => { active = false; };
  }, []);

  return state;
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
