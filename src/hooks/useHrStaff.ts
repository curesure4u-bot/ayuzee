import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "present" | "absent" | "leave" | "half_day";
  phone: string;
  salary: number;
  joinDate: string;
  productivity: number;
}

export interface HrStaffData {
  staff: StaffMember[];
  totalStaff: number;
  present: number;
  absent: number;
  onLeave: number;
  totalPayroll: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock ───────────────────────────────────────────────────────────

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "Dr. Arun Sharma", role: "Senior Doctor", department: "Ayurveda", status: "present", phone: "9876543210", salary: 120000, joinDate: "2023-04-01", productivity: 92 },
  { id: "2", name: "Dr. Meena Patel", role: "Doctor", department: "Panchakarma", status: "present", phone: "9876543211", salary: 85000, joinDate: "2024-01-15", productivity: 88 },
  { id: "3", name: "Rajesh K", role: "Receptionist", department: "Front Office", status: "present", phone: "9876543212", salary: 25000, joinDate: "2024-06-01", productivity: 78 },
  { id: "4", name: "Sunita M", role: "Nurse", department: "IPD", status: "absent", phone: "9876543213", salary: 35000, joinDate: "2023-09-01", productivity: 85 },
  { id: "5", name: "Vikram R", role: "Pharmacist", department: "Pharmacy", status: "present", phone: "9876543214", salary: 40000, joinDate: "2024-03-01", productivity: 90 },
  { id: "6", name: "Anita D", role: "Lab Technician", department: "Laboratory", status: "present", phone: "9876543215", salary: 30000, joinDate: "2024-08-01", productivity: 82 },
  { id: "7", name: "Suresh Therapist", role: "Therapist (Senior)", department: "Panchakarma", status: "present", phone: "9876543216", salary: 35000, joinDate: "2022-01-10", productivity: 95 },
  { id: "8", name: "Priya Therapist", role: "Therapist", department: "Panchakarma", status: "present", phone: "9876543218", salary: 28000, joinDate: "2023-07-01", productivity: 91 },
  { id: "9", name: "Mohan P", role: "Therapist", department: "Panchakarma", status: "leave", phone: "9876543219", salary: 28000, joinDate: "2024-02-01", productivity: 75 },
  { id: "10", name: "Kavita S", role: "Admin Manager", department: "Administration", status: "present", phone: "9876543217", salary: 55000, joinDate: "2022-06-15", productivity: 87 },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrStaff = (search?: string): HrStaffData & {
  addStaff: (staff: Omit<StaffMember, "id" | "productivity">) => Promise<boolean>;
  updateAttendance: (id: string, attendance: string) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<HrStaffData>({
    staff: MOCK_STAFF,
    totalStaff: 10,
    present: 8,
    absent: 1,
    onLeave: 1,
    totalPayroll: 481000,
    loading: true,
    error: null,
  });

  const fetchStaff = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { data: rows, error } = await (supabase as any)
        .from("hms_staff")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.warn("HR staff fetch error (using fallback):", error.message);
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      let staff: StaffMember[] = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        department: r.department,
        status: r.today_attendance as StaffMember["status"],
        phone: r.phone || "",
        salary: Number(r.salary) || 0,
        joinDate: r.join_date || "",
        productivity: r.productivity_score || 80,
      }));

      if (search) {
        const s = search.toLowerCase();
        staff = staff.filter((st) =>
          st.name.toLowerCase().includes(s) ||
          st.role.toLowerCase().includes(s) ||
          st.department.toLowerCase().includes(s)
        );
      }

      const totalPayroll = staff.reduce((s, st) => s + st.salary, 0);

      setData({
        staff,
        totalStaff: staff.length,
        present: staff.filter((s) => s.status === "present").length,
        absent: staff.filter((s) => s.status === "absent").length,
        onLeave: staff.filter((s) => s.status === "leave").length,
        totalPayroll,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("HR staff unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, [search]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const addStaff = async (staff: Omit<StaffMember, "id" | "productivity">): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("hms_staff")
      .insert({
        name: staff.name,
        role: staff.role,
        department: staff.department,
        phone: staff.phone,
        salary: staff.salary,
        join_date: staff.joinDate,
        today_attendance: staff.status,
        is_active: true,
      });

    if (!error) fetchStaff();
    return !error;
  };

  const updateAttendance = async (id: string, attendance: string): Promise<boolean> => {
    const { error } = await (supabase as any)
      .from("hms_staff")
      .update({ today_attendance: attendance, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setData((prev) => ({
        ...prev,
        staff: prev.staff.map((s) => s.id === id ? { ...s, status: attendance as StaffMember["status"] } : s),
      }));
    }
    return !error;
  };

  return { ...data, addStaff, updateAttendance, refetch: fetchStaff };
};
