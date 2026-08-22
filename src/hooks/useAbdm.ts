import { supabase } from "@/integrations/supabase/client";

export type LinkAbhaParams = {
  patient_id: string;
  patient_display_id: string;
  abha_number: string;
  abha_address?: string;
  verification_method: "aadhaar_otp" | "mobile_otp" | "demographics" | "driving_license";
  abdm_name?: string;
  abdm_gender?: string;
  abdm_dob?: string;
  abdm_phone?: string;
  branch?: string;
};

export function useAbdm() {
  const linkAbha = async (params: LinkAbhaParams) => {
    const { data, error } = await (supabase as any)
      .from("hms_abha_records")
      .insert({
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        abha_number: params.abha_number,
        abha_address: params.abha_address || null,
        verified: true,
        verification_method: params.verification_method,
        verified_at: new Date().toISOString(),
        abdm_name: params.abdm_name || null,
        abdm_gender: params.abdm_gender || null,
        abdm_dob: params.abdm_dob || null,
        abdm_phone: params.abdm_phone || null,
        status: "linked",
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (error) throw error;
    return { abhaRecordId: data.id };
  };

  const getPatientAbha = async (patientId: string) => {
    const { data, error } = await (supabase as any)
      .from("hms_abha_records")
      .select("*")
      .eq("patient_id", patientId)
      .eq("status", "linked")
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const unlinkAbha = async (recordId: string) => {
    const { error } = await (supabase as any)
      .from("hms_abha_records")
      .update({ status: "unlinked", updated_at: new Date().toISOString() })
      .eq("id", recordId);
    if (error) throw error;
  };

  const pushHealthRecord = async (patientId: string, recordType: string, fhirBundleId?: string) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    // Get ABHA record
    const abha = await getPatientAbha(patientId);
    if (!abha) throw new Error("Patient does not have a linked ABHA ID");

    const { data, error } = await (supabase as any)
      .from("hms_abdm_exchange_log")
      .insert({
        patient_id: patientId,
        abha_record_id: abha.id,
        direction: "push",
        record_type: recordType,
        fhir_bundle_id: fhirBundleId || null,
        status: "completed", // In real integration, would be 'initiated' then updated async
        initiated_by: uid,
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    // Increment pushed count
    await (supabase as any)
      .from("hms_abha_records")
      .update({
        records_pushed: (abha.records_pushed || 0) + 1,
        last_sync_at: new Date().toISOString(),
      })
      .eq("id", abha.id);

    return { exchangeId: data.id };
  };

  const getExchangeHistory = async (patientId: string) => {
    const { data, error } = await (supabase as any)
      .from("hms_abdm_exchange_log")
      .select("*")
      .eq("patient_id", patientId)
      .order("initiated_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  };

  return { linkAbha, getPatientAbha, unlinkAbha, pushHealthRecord, getExchangeHistory };
}
