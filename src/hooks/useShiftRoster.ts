import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffShift {
  id: string;
  name: string;
  role: string;
  dept: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
}

const MOCK_ROSTER: StaffShift[] = [
  { id: "1", name: "Nurse Priya", role: "Nurse", dept: "IPD", mon: "M", tue: "M", wed: "M", thu: "A", fri: "A", sat: "A", sun: "O" },
  { id: "2", name: "Nurse Anu", role: "Nurse", dept: "IPD", mon: "A", tue: "A", wed: "A", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "3", name: "Nurse Kavitha", role: "Nurse", dept: "Panchakarma", mon: "M", tue: "M", wed: "M", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "4", name: "Suresh Therapist", role: "Therapist", dept: "Panchakarma", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "G", sun: "O" },
  { id: "5", name: "Priya Therapist", role: "Therapist", dept: "Panchakarma", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "O", sun: "O" },
  { id: "6", name: "Rajesh K", role: "Receptionist", dept: "Front Office", mon: "G", tue: "G", wed: "G", thu: "G", fri: "G", sat: "G", sun: "O" },
  { id: "7", name: "Vikram R", role: "Pharmacist", dept: "Pharmacy", mon: "M", tue: "M", wed: "M", thu: "A", fri: "A", sat: "M", sun: "O" },
  { id: "8", name: "Anita D", role: "Lab Tech", dept: "Laboratory", mon: "M", tue: "M", wed: "M", thu: "M", fri: "M", sat: "M", sun: "O" },
  { id: "9", name: "Night Nurse Sita", role: "Nurse", dept: "IPD", mon: "N", tue: "N", wed: "N", thu: "O", fri: "O", sat: "N", sun: "N" },
];

export const useShiftRoster = (weekStart?: string) => {
  const [roster, setRoster] = useState<StaffShift[]>(MOCK_ROSTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetWeek = weekStart || getMonday(new Date()).toISOString().split("T")[0];

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await (supabase as any)
        .from("hms_shift_roster")
        .select("*")
        .eq("week_start", targetWeek)
        .order("department");

      if (fetchErr) { setError(fetchErr.message); setLoading(false); return; }

      if (data && data.length > 0) {
        const mapped: StaffShift[] = data.map((r: any) => ({
          id: r.id,
          name: r.staff_name || "",
          role: r.role || "",
          dept: r.department || "",
          mon: r.mon || "O",
          tue: r.tue || "O",
          wed: r.wed || "O",
          thu: r.thu || "O",
          fri: r.fri || "O",
          sat: r.sat || "O",
          sun: r.sun || "O",
        }));
        setRoster(mapped);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, [targetWeek]);

  useEffect(() => { fetchRoster(); }, [fetchRoster]);

  const assignShift = async (staffId: string, day: string, shiftCode: string): Promise<boolean> => {
    const updates: Record<string, string> = { [day]: shiftCode };
    const { error: updateErr } = await (supabase as any)
      .from("hms_shift_roster")
      .update(updates)
      .eq("id", staffId);

    if (updateErr) {
      setRoster((prev) => prev.map((r) => r.id === staffId ? { ...r, [day]: shiftCode } : r));
      return true;
    }
    await fetchRoster();
    return true;
  };

  const departments = [...new Set(roster.map((r) => r.dept))];
  const totalStaff = roster.length;
  const overtimeStaff = roster.filter((r) => {
    const days = [r.mon, r.tue, r.wed, r.thu, r.fri, r.sat, r.sun];
    return days.filter((d) => d !== "O").length * 8 > 48;
  }).length;

  return {
    roster,
    loading,
    error,
    departments,
    totalStaff,
    overtimeStaff,
    assignShift,
    refetch: fetchRoster,
  };
};

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}
