import { supabase } from "@/integrations/supabase/client";

export type AdmitPatientParams = {
  patient_id: string;
  patient_display_id: string;
  patient_name: string;
  ward_id: string;
  bed_id: string;
  ward_name: string;
  bed_number: string;
  admitting_doctor: string;
  department?: string;
  diagnosis?: string;
  reason_for_admission?: string;
  expected_discharge?: string;
  advance_amount?: number;
  branch?: string;
};

export function useIpdAdmission() {
  const admitPatient = async (params: AdmitPatientParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const { data: ipNumber } = await (supabase as any).rpc("generate_ip_number");

    // Create admission
    const { data: admission, error } = await (supabase as any)
      .from("hms_ip_admissions")
      .insert({
        ip_number: ipNumber || `IP-${Date.now()}`,
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        patient_name: params.patient_name,
        ward_id: params.ward_id,
        bed_id: params.bed_id,
        ward_name: params.ward_name,
        bed_number: params.bed_number,
        admitting_doctor: params.admitting_doctor,
        admitting_doctor_id: uid,
        department: params.department || null,
        diagnosis: params.diagnosis || null,
        reason_for_admission: params.reason_for_admission || null,
        expected_discharge: params.expected_discharge || null,
        advance_amount: params.advance_amount || 0,
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id, ip_number")
      .single();

    if (error) throw error;

    // Mark bed as occupied
    await (supabase as any)
      .from("hms_beds")
      .update({ status: "occupied", current_patient_id: params.patient_id, current_admission_id: admission.id })
      .eq("id", params.bed_id);

    return { admissionId: admission.id, ipNumber: admission.ip_number };
  };

  const dischargePatient = async (admissionId: string, dischargeType: string, dischargeSummary?: string) => {
    // Get admission to find bed
    const { data: admission } = await (supabase as any)
      .from("hms_ip_admissions")
      .select("bed_id")
      .eq("id", admissionId)
      .single();

    // Update admission
    const { error } = await (supabase as any)
      .from("hms_ip_admissions")
      .update({
        status: "discharged",
        discharge_date: new Date().toISOString(),
        discharge_type: dischargeType,
        discharge_summary: dischargeSummary || null,
        bill_status: "finalized",
        updated_at: new Date().toISOString(),
      })
      .eq("id", admissionId);

    if (error) throw error;

    // Free the bed
    if (admission?.bed_id) {
      await (supabase as any)
        .from("hms_beds")
        .update({ status: "available", current_patient_id: null, current_admission_id: null })
        .eq("id", admission.bed_id);
    }
  };

  const getActiveAdmissions = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_ip_admissions")
      .select("*")
      .eq("status", "admitted")
      .eq("branch", branch)
      .order("admission_date", { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const getAvailableBeds = async (wardId?: string) => {
    let query = (supabase as any)
      .from("hms_beds")
      .select("*, hms_wards(ward_name, ward_type, charge_per_day)")
      .eq("status", "available");

    if (wardId) query = query.eq("ward_id", wardId);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const getWards = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_wards")
      .select("*")
      .eq("is_active", true)
      .eq("branch", branch)
      .order("ward_name");

    if (error) throw error;
    return data || [];
  };

  return { admitPatient, dischargePatient, getActiveAdmissions, getAvailableBeds, getWards };
}
