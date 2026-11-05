import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type OpdVisit = {
  id: string;
  op_number: number;
  patient_id: string;
  patient_display_id: string;
  visit_date: string;
  check_in_time: string;
  doctor_name: string | null;
  session_token: number;
  mode_visit: string;
  purpose: string;
  consultation_fee: number;
  bill_amount: number;
  bill_status: string;
  payment_mode: string;
  status: string;
  chief_complaint: string | null;
  vitals_captured: boolean;
  prescription_given: boolean;
  branch: string;
  notes: string | null;
  created_at: string;
  // Joined patient info
  patient_name?: string;
  patient_phone?: string;
  patient_age?: number;
  patient_gender?: string;
};

export function useOpdQueue(branch = "Main Branch") {
  const [visits, setVisits] = useState<OpdVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const loadQueue = async () => {
    const { data: visitsData } = await (supabase as any)
      .from("hms_op_visits")
      .select("*")
      .eq("visit_date", today)
      .eq("branch", branch)
      .order("session_token", { ascending: true });

    if (!visitsData || visitsData.length === 0) {
      setVisits([]);
      setLoading(false);
      return;
    }

    // Fetch patient details
    const patientIds = [...new Set(visitsData.map((v: any) => v.patient_id))];
    const { data: patients } = await (supabase as any)
      .from("hms_op_patients")
      .select("id, first_name, last_name, mobile, age_years, gender")
      .in("id", patientIds);

    const patMap = new Map(
      (patients || []).map((p: any) => [p.id, p])
    );

    const enriched: OpdVisit[] = visitsData.map((v: any) => {
      const pat = patMap.get(v.patient_id);
      return {
        ...v,
        patient_name: pat ? `${pat.first_name} ${pat.last_name || ""}`.trim() : v.patient_display_id,
        patient_phone: pat?.mobile || null,
        patient_age: pat?.age_years || null,
        patient_gender: pat?.gender || null,
      };
    });

    setVisits(enriched);
    setLoading(false);
  };

  const updateVisitStatus = async (visitId: string, newStatus: string) => {
    const updateData: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() };
    if (newStatus === "in_consultation") updateData.check_in_time = new Date().toISOString();
    if (newStatus === "completed" || newStatus === "checked_out") updateData.check_out_time = new Date().toISOString();

    const { error } = await (supabase as any)
      .from("hms_op_visits")
      .update(updateData)
      .eq("id", visitId);

    if (error) throw error;
  };

  useEffect(() => {
    loadQueue();

    // Real-time subscription
    const channel = supabase
      .channel("opd-queue-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hms_op_visits" },
        () => { loadQueue(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [branch]);

  return { visits, loading, loadQueue, updateVisitStatus };
}
