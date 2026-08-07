import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ward {
  id: string;
  name: string;
  beds: number;
  occupied: number;
  wardType: string;
  chargePerDay: number;
}

export interface Admission {
  id: string;
  patient: string;
  ward: string;
  bed: string;
  doctor: string;
  admitDate: string;
  status: string;
  diagnosis: string;
}

export interface IpdData {
  wards: Ward[];
  admissions: Admission[];
  totalBeds: number;
  totalOccupied: number;
  loading: boolean;
  error: string | null;
}

// ─── Fallback mock ───────────────────────────────────────────────────────────

const MOCK_WARDS: Ward[] = [
  { id: "1", name: "General Male", beds: 20, occupied: 12, wardType: "general", chargePerDay: 800 },
  { id: "2", name: "General Female", beds: 20, occupied: 15, wardType: "general", chargePerDay: 800 },
  { id: "3", name: "Private Rooms", beds: 10, occupied: 7, wardType: "private", chargePerDay: 2500 },
  { id: "4", name: "ICU", beds: 6, occupied: 4, wardType: "icu", chargePerDay: 5000 },
  { id: "5", name: "Pediatric", beds: 8, occupied: 3, wardType: "pediatric", chargePerDay: 1200 },
  { id: "6", name: "Maternity", beds: 10, occupied: 6, wardType: "maternity", chargePerDay: 1500 },
];

const MOCK_ADMISSIONS: Admission[] = [
  { id: "1", patient: "Ravi Kumar", ward: "General Male", bed: "GM-04", doctor: "Dr. Sharma", admitDate: "2026-08-05", status: "active", diagnosis: "" },
  { id: "2", patient: "Priya Devi", ward: "Maternity", bed: "MT-02", doctor: "Dr. Meena", admitDate: "2026-08-04", status: "active", diagnosis: "" },
  { id: "3", patient: "Anand Singh", ward: "ICU", bed: "ICU-03", doctor: "Dr. Patel", admitDate: "2026-08-06", status: "critical", diagnosis: "" },
  { id: "4", patient: "Lakshmi R", ward: "Private Rooms", bed: "PVT-05", doctor: "Dr. Reddy", admitDate: "2026-08-02", status: "discharge_pending", diagnosis: "" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useIpd = (): IpdData & { refetch: () => void } => {
  const [data, setData] = useState<IpdData>({
    wards: MOCK_WARDS,
    admissions: MOCK_ADMISSIONS,
    totalBeds: 74,
    totalOccupied: 47,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch wards
      const { data: wards, error: wardErr } = await (supabase as any)
        .from("hms_wards")
        .select("*")
        .eq("is_active", true)
        .order("name");

      // Fetch active admissions
      const { data: admissions, error: admErr } = await (supabase as any)
        .from("hms_ip_admissions")
        .select("*")
        .not("status", "in", '("discharged","expired")')
        .order("admission_date", { ascending: false });

      if (wardErr && admErr) {
        console.warn("IPD fetch error (using fallback):", wardErr?.message);
        setData((prev) => ({ ...prev, loading: false, error: wardErr?.message }));
        return;
      }

      if ((!wards || wards.length === 0) && (!admissions || admissions.length === 0)) {
        setData((prev) => ({ ...prev, loading: false, error: null }));
        return;
      }

      const mappedWards: Ward[] = (wards || []).map((w: any) => ({
        id: w.id,
        name: w.name,
        beds: w.total_beds,
        occupied: w.occupied_beds || 0,
        wardType: w.ward_type,
        chargePerDay: Number(w.charge_per_day) || 0,
      }));

      const mappedAdmissions: Admission[] = (admissions || []).map((a: any) => ({
        id: a.id,
        patient: a.patient_name,
        ward: a.ward_name || "—",
        bed: a.bed_number || "—",
        doctor: a.doctor_name || "—",
        admitDate: a.admission_date,
        status: a.status,
        diagnosis: a.diagnosis || "",
      }));

      const totalBeds = mappedWards.reduce((s, w) => s + w.beds, 0);
      const totalOccupied = mappedWards.reduce((s, w) => s + w.occupied, 0);

      setData({
        wards: mappedWards.length > 0 ? mappedWards : MOCK_WARDS,
        admissions: mappedAdmissions.length > 0 ? mappedAdmissions : MOCK_ADMISSIONS,
        totalBeds: totalBeds || 74,
        totalOccupied: totalOccupied || 47,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("IPD unexpected error:", err);
      setData((prev) => ({ ...prev, loading: false, error: err.message || "Unknown error" }));
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { ...data, refetch: fetchData };
};
