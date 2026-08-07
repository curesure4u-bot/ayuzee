import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface InsuranceClaim {
  id: string;
  patientName: string;
  policyNo: string;
  insurer: string;
  claimAmount: number;
  approvedAmount: number;
  submittedDate: string;
  status: string;
  type: "cashless" | "reimbursement";
}

export interface InsuranceClaimsData {
  claims: InsuranceClaim[];
  totalClaimed: number;
  totalApproved: number;
  pendingCount: number;
  loading: boolean;
  error: string | null;
}

const MOCK_CLAIMS: InsuranceClaim[] = [
  { id: "1", patientName: "Ramesh Kumar", policyNo: "HI-2025-78934", insurer: "Star Health", claimAmount: 45000, approvedAmount: 42000, submittedDate: "2026-07-05", status: "approved", type: "cashless" },
  { id: "2", patientName: "Lakshmi Devi", policyNo: "NI-2026-12345", insurer: "National Insurance", claimAmount: 28000, approvedAmount: 0, submittedDate: "2026-07-12", status: "under_review", type: "cashless" },
  { id: "3", patientName: "Sunil Menon", policyNo: "AY-2025-56789", insurer: "Ayushman Bharat", claimAmount: 65000, approvedAmount: 65000, submittedDate: "2026-06-28", status: "settled", type: "cashless" },
  { id: "4", patientName: "Meera Nair", policyNo: "NHI-2026-44556", insurer: "New India Assurance", claimAmount: 35000, approvedAmount: 0, submittedDate: "2026-07-14", status: "submitted", type: "reimbursement" },
  { id: "5", patientName: "Anand Sharma", policyNo: "IC-2025-99887", insurer: "ICICI Lombard", claimAmount: 52000, approvedAmount: 0, submittedDate: "2026-07-10", status: "rejected", type: "cashless" },
];

export const useInsuranceClaims = (): InsuranceClaimsData & {
  createClaim: (claim: Omit<InsuranceClaim, "id" | "approvedAmount">) => Promise<boolean>;
  updateStatus: (id: string, status: string, approvedAmount?: number) => Promise<boolean>;
  refetch: () => void;
} => {
  const [data, setData] = useState<InsuranceClaimsData>({
    claims: MOCK_CLAIMS,
    totalClaimed: 225000,
    totalApproved: 107000,
    pendingCount: 2,
    loading: true,
    error: null,
  });

  const fetchClaims = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: rows, error } = await (supabase as any)
        .from("hms_insurance_claims")
        .select("*")
        .order("submitted_date", { ascending: false });

      if (error) {
        setData((prev) => ({ ...prev, loading: false, error: error.message }));
        return;
      }
      if (!rows || rows.length === 0) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      const claims: InsuranceClaim[] = rows.map((r: any) => ({
        id: r.id,
        patientName: r.patient_name,
        policyNo: r.policy_no,
        insurer: r.insurer,
        claimAmount: Number(r.claim_amount),
        approvedAmount: Number(r.approved_amount) || 0,
        submittedDate: r.submitted_date || "",
        status: r.status,
        type: r.claim_type as "cashless" | "reimbursement",
      }));

      setData({
        claims,
        totalClaimed: claims.reduce((s, c) => s + c.claimAmount, 0),
        totalApproved: claims.reduce((s, c) => s + c.approvedAmount, 0),
        pendingCount: claims.filter((c) => ["submitted", "under_review"].includes(c.status)).length,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  const createClaim = async (claim: Omit<InsuranceClaim, "id" | "approvedAmount">): Promise<boolean> => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await (supabase as any).from("hms_insurance_claims").insert({
      patient_name: claim.patientName,
      policy_no: claim.policyNo,
      insurer: claim.insurer,
      claim_type: claim.type,
      claim_amount: claim.claimAmount,
      submitted_date: claim.submittedDate || new Date().toISOString().split("T")[0],
      status: claim.status || "draft",
      created_by: sess.session?.user?.id,
    });
    if (!error) fetchClaims();
    return !error;
  };

  const updateStatus = async (id: string, status: string, approvedAmount?: number): Promise<boolean> => {
    const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
    if (approvedAmount !== undefined) updates.approved_amount = approvedAmount;
    if (status === "approved" || status === "settled") updates.approved_date = new Date().toISOString().split("T")[0];
    const { error } = await (supabase as any).from("hms_insurance_claims").update(updates).eq("id", id);
    if (!error) fetchClaims();
    return !error;
  };

  return { ...data, createClaim, updateStatus, refetch: fetchClaims };
};
