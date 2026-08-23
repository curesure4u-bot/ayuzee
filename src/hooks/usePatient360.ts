import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Patient360 {
  // Patient info
  patient: {
    id: string;
    patient_id: string;
    first_name: string;
    last_name: string | null;
    mobile: string;
    gender: string | null;
    age_years: number | null;
    blood_group: string | null;
    prakriti: string | null;
    allergies: string[] | null;
    chronic_conditions: string[] | null;
    total_visits: number;
    last_visit_date: string | null;
  } | null;
  // Recent visits
  visits: {
    id: string;
    visit_date: string;
    doctor_name: string | null;
    purpose: string;
    status: string;
    chief_complaint: string | null;
    bill_amount: number;
  }[];
  // Prescriptions
  prescriptions: {
    id: string;
    doctor_name: string;
    diagnosis: string | null;
    status: string;
    created_at: string;
    item_count: number;
  }[];
  // Lab orders
  labOrders: {
    id: string;
    order_number: string;
    ordered_by_name: string;
    status: string;
    order_date: string;
    test_count: number;
  }[];
  // Bills
  bills: {
    id: string;
    bill_number: string;
    bill_date: string;
    total_amount: number;
    paid_amount: number;
    payment_status: string;
    bill_type: string;
  }[];
  // Panchakarma enrollments
  pkEnrollments: {
    id: string;
    package_name: string;
    start_date: string;
    total_sessions: number;
    completed_sessions: number;
    pain_score_before: number | null;
    pain_score_after: number | null;
    status: string;
  }[];
  // Loading state
  loading: boolean;
  error: string | null;
}

export function usePatient360(patientId?: string) {
  const [data, setData] = useState<Patient360>({
    patient: null, visits: [], prescriptions: [], labOrders: [], bills: [], pkEnrollments: [],
    loading: true, error: null,
  });

  useEffect(() => {
    if (!patientId) {
      setData((prev) => ({ ...prev, loading: false }));
      return;
    }

    const load = async () => {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Fetch all in parallel
        const [patientRes, visitsRes, rxRes, labRes, billsRes, pkRes] = await Promise.all([
          (supabase as any).from("hms_op_patients").select("*").eq("id", patientId).single(),
          (supabase as any).from("hms_op_visits").select("id, visit_date, doctor_name, purpose, status, chief_complaint, bill_amount").eq("patient_id", patientId).order("visit_date", { ascending: false }).limit(20),
          (supabase as any).from("hms_prescriptions").select("id, doctor_name, diagnosis, status, created_at").eq("patient_id", patientId).order("created_at", { ascending: false }).limit(15),
          (supabase as any).from("hms_lab_orders").select("id, order_number, ordered_by_name, status, order_date").eq("patient_id", patientId).order("order_date", { ascending: false }).limit(15),
          (supabase as any).from("hms_bills").select("id, bill_number, bill_date, total_amount, paid_amount, payment_status, bill_type").eq("patient_id", patientId).eq("is_cancelled", false).order("bill_date", { ascending: false }).limit(20),
          (supabase as any).from("hms_pk_enrollments").select("id, package_name, start_date, total_sessions, completed_sessions, pain_score_before, pain_score_after, status").eq("patient_id", patientId).order("start_date", { ascending: false }).limit(10),
        ]);

        // Get prescription item counts
        const rxIds = (rxRes.data || []).map((r: any) => r.id);
        let rxItemCounts: Record<string, number> = {};
        if (rxIds.length > 0) {
          const { data: items } = await (supabase as any)
            .from("hms_prescription_items")
            .select("prescription_id")
            .in("prescription_id", rxIds);
          (items || []).forEach((i: any) => {
            rxItemCounts[i.prescription_id] = (rxItemCounts[i.prescription_id] || 0) + 1;
          });
        }

        // Get lab test counts
        const labIds = (labRes.data || []).map((l: any) => l.id);
        let labTestCounts: Record<string, number> = {};
        if (labIds.length > 0) {
          const { data: items } = await (supabase as any)
            .from("hms_lab_order_items")
            .select("order_id")
            .in("order_id", labIds);
          (items || []).forEach((i: any) => {
            labTestCounts[i.order_id] = (labTestCounts[i.order_id] || 0) + 1;
          });
        }

        setData({
          patient: patientRes.data || null,
          visits: (visitsRes.data || []).map((v: any) => ({
            id: v.id, visit_date: v.visit_date, doctor_name: v.doctor_name,
            purpose: v.purpose, status: v.status, chief_complaint: v.chief_complaint,
            bill_amount: v.bill_amount || 0,
          })),
          prescriptions: (rxRes.data || []).map((r: any) => ({
            id: r.id, doctor_name: r.doctor_name, diagnosis: r.diagnosis,
            status: r.status, created_at: r.created_at,
            item_count: rxItemCounts[r.id] || 0,
          })),
          labOrders: (labRes.data || []).map((l: any) => ({
            id: l.id, order_number: l.order_number, ordered_by_name: l.ordered_by_name,
            status: l.status, order_date: l.order_date,
            test_count: labTestCounts[l.id] || 0,
          })),
          bills: (billsRes.data || []).map((b: any) => ({
            id: b.id, bill_number: b.bill_number, bill_date: b.bill_date,
            total_amount: b.total_amount, paid_amount: b.paid_amount,
            payment_status: b.payment_status, bill_type: b.bill_type,
          })),
          pkEnrollments: (pkRes.data || []).map((p: any) => ({
            id: p.id, package_name: p.package_name, start_date: p.start_date,
            total_sessions: p.total_sessions, completed_sessions: p.completed_sessions,
            pain_score_before: p.pain_score_before, pain_score_after: p.pain_score_after,
            status: p.status,
          })),
          loading: false,
          error: null,
        });
      } catch (e: any) {
        setData((prev) => ({ ...prev, loading: false, error: e.message }));
      }
    };

    load();
  }, [patientId]);

  return data;
}
