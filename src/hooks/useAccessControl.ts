import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AccessRole {
  id: string;
  roleName: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
}

const MOCK_ROLES: AccessRole[] = [
  { id: "1", roleName: "Super Admin", description: "Full system access", usersCount: 2, permissions: ["all"], isSystem: true },
  { id: "2", roleName: "Doctor", description: "Clinical modules, prescriptions, patient records", usersCount: 5, permissions: ["opd", "ipd", "prescription", "patient", "lab_order", "reports"], isSystem: true },
  { id: "3", roleName: "Nurse", description: "Nursing station, vitals, MAR, care plans", usersCount: 8, permissions: ["nursing", "vitals", "mar", "patient_view"], isSystem: true },
  { id: "4", roleName: "Receptionist", description: "Registration, appointments, billing", usersCount: 3, permissions: ["registration", "appointments", "billing", "queue"], isSystem: true },
  { id: "5", roleName: "Pharmacist", description: "Stock management, dispensing, purchase", usersCount: 2, permissions: ["pharmacy", "stock", "dispensing"], isSystem: true },
  { id: "6", roleName: "Lab Technician", description: "Lab operations, result entry, reports", usersCount: 2, permissions: ["lab", "result_entry", "reports"], isSystem: true },
  { id: "7", roleName: "Therapist", description: "Panchakarma schedule, therapy notes", usersCount: 5, permissions: ["pk_schedule", "therapy_notes", "patient_view"], isSystem: true },
  { id: "8", roleName: "Accounts", description: "Billing, payments, GST, reports", usersCount: 2, permissions: ["billing", "accounts", "gst", "reports", "payroll"], isSystem: true },
  { id: "9", roleName: "Branch Manager", description: "Branch-level dashboard and reports", usersCount: 1, permissions: ["dashboard", "reports", "staff", "branch_settings"], isSystem: false },
];

export const useAccessControl = () => {
  const [roles, setRoles] = useState<AccessRole[]>(MOCK_ROLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_access_roles")
        .select("*")
        .order("role_name");

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }
      if (data && data.length > 0) {
        setRoles(data.map((r: any) => ({
          id: r.id, roleName: r.role_name || "", description: r.description || "",
          usersCount: r.users_count || 0, permissions: r.permissions || [],
          isSystem: r.is_system || false,
        })));
      }
      setLoading(false);
    } catch (err: any) { setError(err.message); setLoading(false); }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const totalUsers = roles.reduce((s, r) => s + r.usersCount, 0);

  return { roles, loading, error, totalUsers, refetch: fetchRoles };
};
