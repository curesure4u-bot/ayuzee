import { supabase } from "@/integrations/supabase/client";

export type CreateClaimParams = {
  patient_id: string;
  patient_name: string;
  insurance_id?: string;
  company_name: string;
  policy_number?: string;
  admission_id?: string;
  visit_id?: string;
  claim_amount: number;
  primary_diagnosis?: string;
  icd_code?: string;
  treatment_summary?: string;
  admission_date?: string;
  discharge_date?: string;
  branch?: string;
};

export type PreauthParams = {
  claimId: string;
  preauth_amount: number;
};

export function useInsuranceClaims() {
  const createClaim = async (params: CreateClaimParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const { data: claimNumber } = await (supabase as any).rpc("generate_claim_number");

    const { data, error } = await (supabase as any)
      .from("hms_insurance_claims")
      .insert({
        claim_number: claimNumber || `CLM-${Date.now()}`,
        patient_id: params.patient_id,
        patient_name: params.patient_name,
        insurance_id: params.insurance_id || null,
        company_name: params.company_name,
        policy_number: params.policy_number || null,
        admission_id: params.admission_id || null,
        visit_id: params.visit_id || null,
        claim_amount: params.claim_amount,
        primary_diagnosis: params.primary_diagnosis || null,
        icd_code: params.icd_code || null,
        treatment_summary: params.treatment_summary || null,
        admission_date: params.admission_date || null,
        discharge_date: params.discharge_date || null,
        status: "draft",
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id, claim_number")
      .single();

    if (error) throw error;
    return { claimId: data.id, claimNumber: data.claim_number };
  };

  const requestPreauth = async (params: PreauthParams) => {
    const { error } = await (supabase as any)
      .from("hms_insurance_claims")
      .update({
        preauth_amount: params.preauth_amount,
        preauth_status: "pending",
        preauth_date: new Date().toISOString().slice(0, 10),
        status: "preauth_pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.claimId);

    if (error) throw error;
  };

  const approvePreauth = async (claimId: string, approvedAmount: number, preauthNumber: string) => {
    const { error } = await (supabase as any)
      .from("hms_insurance_claims")
      .update({
        preauth_status: "approved",
        preauth_number: preauthNumber,
        approved_amount: approvedAmount,
        status: "preauth_approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (error) throw error;
  };

  const submitClaim = async (claimId: string) => {
    const { error } = await (supabase as any)
      .from("hms_insurance_claims")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (error) throw error;
  };

  const updateClaimStatus = async (claimId: string, status: string, details?: { settled_amount?: number; deduction_amount?: number; deduction_reason?: string; query_text?: string }) => {
    const updateData: Record<string, any> = { status, updated_at: new Date().toISOString() };

    if (status === "settled" || status === "approved") {
      updateData.settled_amount = details?.settled_amount || null;
      updateData.deduction_amount = details?.deduction_amount || null;
      updateData.deduction_reason = details?.deduction_reason || null;
      if (status === "settled") updateData.settled_at = new Date().toISOString();
      if (status === "approved") updateData.approved_at = new Date().toISOString();
    }
    if (status === "query_raised") {
      updateData.query_text = details?.query_text || null;
    }

    const { error } = await (supabase as any)
      .from("hms_insurance_claims")
      .update(updateData)
      .eq("id", claimId);

    if (error) throw error;
  };

  const getClaims = async (status?: string, branch = "Main Branch") => {
    let query = (supabase as any)
      .from("hms_insurance_claims")
      .select("*")
      .eq("branch", branch)
      .order("created_at", { ascending: false })
      .limit(50);

    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const getClaimsSummary = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_insurance_claims")
      .select("status, claim_amount, approved_amount, settled_amount")
      .eq("branch", branch);

    if (error) throw error;

    const summary = {
      total_claims: 0,
      total_amount: 0,
      approved_amount: 0,
      settled_amount: 0,
      pending: 0,
      under_review: 0,
      settled: 0,
      rejected: 0,
    };

    (data || []).forEach((c: any) => {
      summary.total_claims++;
      summary.total_amount += c.claim_amount || 0;
      summary.approved_amount += c.approved_amount || 0;
      summary.settled_amount += c.settled_amount || 0;
      if (["draft", "preauth_pending", "submitted"].includes(c.status)) summary.pending++;
      if (c.status === "under_review") summary.under_review++;
      if (c.status === "settled") summary.settled++;
      if (c.status === "rejected") summary.rejected++;
    });

    return summary;
  };

  return { createClaim, requestPreauth, approvePreauth, submitClaim, updateClaimStatus, getClaims, getClaimsSummary };
}
