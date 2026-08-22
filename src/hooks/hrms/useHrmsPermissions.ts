import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── HRMS Module Identifiers ─────────────────────────────────────────────────

export type HrmsModule =
  | "dashboard"
  | "employees"
  | "attendance"
  | "duty_roster"
  | "leave"
  | "payroll"
  | "incentives"
  | "performance"
  | "recruitment"
  | "onboarding"
  | "training"
  | "documents"
  | "requests"
  | "disciplinary"
  | "assets"
  | "announcements"
  | "letters"
  | "exit"
  | "reports"
  | "settings"
  | "ess"; // Employee Self-Service

// ─── HRMS Role Hierarchy ─────────────────────────────────────────────────────

export type HrmsRole =
  | "super_admin"
  | "hr_admin"
  | "management"
  | "branch_manager"
  | "department_head"
  | "payroll_admin"
  | "employee";

// ─── Permission State ────────────────────────────────────────────────────────

export interface HrmsPermissions {
  hasAccess: boolean;
  role: HrmsRole;
  modules: HrmsModule[];
  branchIds: string[];
  departmentIds: string[];
  organisationId: string | null;
  employeeId: string | null; // hms_staff.id if linked
  userId: string | null;
  loading: boolean;
  error: string | null;
}

// ─── Role → Module Mapping ───────────────────────────────────────────────────

const ROLE_MODULES: Record<HrmsRole, HrmsModule[]> = {
  super_admin: [
    "dashboard", "employees", "attendance", "duty_roster", "leave", "payroll",
    "incentives", "performance", "recruitment", "onboarding", "training",
    "documents", "requests", "disciplinary", "assets", "announcements",
    "letters", "exit", "reports", "settings", "ess",
  ],
  hr_admin: [
    "dashboard", "employees", "attendance", "duty_roster", "leave", "payroll",
    "incentives", "performance", "recruitment", "onboarding", "training",
    "documents", "requests", "disciplinary", "assets", "announcements",
    "letters", "exit", "reports", "settings",
  ],
  management: [
    "dashboard", "employees", "attendance", "leave", "payroll", "performance",
    "recruitment", "reports",
  ],
  branch_manager: [
    "dashboard", "employees", "attendance", "duty_roster", "leave",
    "performance", "requests", "announcements", "reports",
  ],
  department_head: [
    "dashboard", "employees", "attendance", "duty_roster", "leave",
    "performance", "requests",
  ],
  payroll_admin: [
    "dashboard", "payroll", "incentives", "reports",
  ],
  employee: [
    "ess",
  ],
};

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsPermissions = (): HrmsPermissions => {
  const [state, setState] = useState<HrmsPermissions>({
    hasAccess: false,
    role: "employee",
    modules: [],
    branchIds: [],
    departmentIds: [],
    organisationId: null,
    employeeId: null,
    userId: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess.session?.user?.id;

        if (!uid) {
          if (active) setState((s) => ({ ...s, hasAccess: false, loading: false }));
          return;
        }

        // 1. Fetch user roles
        const { data: roleRows } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);

        const userRoles = new Set<string>((roleRows ?? []).map((r: any) => r.role));

        // 2. Determine HRMS role (priority-based)
        let hrmsRole: HrmsRole = "employee";
        if (userRoles.has("super_admin")) {
          hrmsRole = "super_admin";
        } else if (userRoles.has("admin")) {
          hrmsRole = "hr_admin";
        } else if (userRoles.has("accounts_admin")) {
          hrmsRole = "payroll_admin";
        } else if (userRoles.has("doctor_admin") || userRoles.has("doctor")) {
          // Check if they are a branch manager
          hrmsRole = "management";
        }

        // 3. Fetch linked employee record
        const { data: empRow } = await (supabase as any)
          .from("hms_staff")
          .select("id, branch_id, department_id, organisation_id, role")
          .eq("user_id", uid)
          .eq("is_active", true)
          .maybeSingle();

        let branchIds: string[] = [];
        let departmentIds: string[] = [];
        let organisationId: string | null = null;
        let employeeId: string | null = null;

        if (empRow) {
          employeeId = empRow.id;
          organisationId = empRow.organisation_id;
          if (empRow.branch_id) branchIds = [empRow.branch_id];
          if (empRow.department_id) departmentIds = [empRow.department_id];

          // Upgrade role if employee is a manager
          if (
            hrmsRole === "employee" &&
            empRow.role &&
            /manager/i.test(empRow.role)
          ) {
            hrmsRole = "branch_manager";
          }

          // Department head detection
          if (
            hrmsRole === "employee" &&
            empRow.role &&
            /head|lead|senior/i.test(empRow.role)
          ) {
            hrmsRole = "department_head";
          }
        }

        // 4. Determine accessible modules
        const modules = ROLE_MODULES[hrmsRole] || ROLE_MODULES.employee;

        // 5. Determine if user has HRMS access at all
        const hasAccess = hrmsRole !== "employee" || Boolean(employeeId);

        if (active) {
          setState({
            hasAccess,
            role: hrmsRole,
            modules,
            branchIds,
            departmentIds,
            organisationId,
            employeeId,
            userId: uid,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (active) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err.message || "Permission check failed",
          }));
        }
      }
    };

    check();
    return () => { active = false; };
  }, []);

  return state;
};

// ─── Helper: Check if user can access a specific HRMS module ─────────────────

export const canAccessHrmsModule = (
  permissions: HrmsPermissions,
  module: HrmsModule
): boolean => {
  if (!permissions.hasAccess) return false;
  if (permissions.role === "super_admin") return true;
  return permissions.modules.includes(module);
};

// ─── Helper: Check if user can manage employees in a branch ──────────────────

export const canManageBranch = (
  permissions: HrmsPermissions,
  branchId: string
): boolean => {
  if (!permissions.hasAccess) return false;
  if (permissions.role === "super_admin" || permissions.role === "hr_admin") return true;
  return permissions.branchIds.includes(branchId);
};

// ─── Helper: Check if user can view sensitive data (salary, documents) ───────

export const canViewSensitiveData = (permissions: HrmsPermissions): boolean => {
  return (
    permissions.role === "super_admin" ||
    permissions.role === "hr_admin" ||
    permissions.role === "payroll_admin"
  );
};

// ─── Helper: Check if user can only see their own data ───────────────────────

export const isSelfServiceOnly = (permissions: HrmsPermissions): boolean => {
  return permissions.role === "employee";
};
