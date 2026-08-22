import { supabase } from "@/integrations/supabase/client";

export type PrescriptionItem = {
  medicine_name: string;
  generic_name?: string;
  medicine_type?: "internal" | "external" | "procedure" | "investigation";
  dosage?: string;
  frequency?: string;
  duration?: string;
  duration_days?: number;
  route?: string;
  timing?: string;
  anupana?: string;
  classical_ref?: string;
  quantity?: number;
  instructions?: string;
};

export type CreatePrescriptionParams = {
  visit_id?: string;
  patient_id: string;
  patient_display_id: string;
  patient_name: string;
  doctor_name: string;
  diagnosis?: string;
  icd_code?: string;
  namaste_code?: string;
  items: PrescriptionItem[];
  follow_up_date?: string;
  special_instructions?: string;
  diet_instructions?: string;
  branch?: string;
};

export function usePrescription() {
  const createPrescription = async (params: CreatePrescriptionParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    // Insert prescription header
    const { data: rx, error: rxError } = await (supabase as any)
      .from("hms_prescriptions")
      .insert({
        visit_id: params.visit_id || null,
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        patient_name: params.patient_name,
        doctor_user_id: uid,
        doctor_name: params.doctor_name,
        diagnosis: params.diagnosis || null,
        icd_code: params.icd_code || null,
        namaste_code: params.namaste_code || null,
        status: "active",
        pharmacy_status: "pending",
        is_signed: true,
        signed_at: new Date().toISOString(),
        follow_up_date: params.follow_up_date || null,
        special_instructions: params.special_instructions || null,
        diet_instructions: params.diet_instructions || null,
        branch: params.branch || "Main Branch",
      })
      .select("id")
      .single();

    if (rxError) throw rxError;

    // Insert prescription items
    if (params.items.length > 0) {
      const lineItems = params.items.map((item, idx) => ({
        prescription_id: rx.id,
        medicine_name: item.medicine_name,
        generic_name: item.generic_name || null,
        medicine_type: item.medicine_type || "internal",
        dosage: item.dosage || null,
        frequency: item.frequency || null,
        duration: item.duration || null,
        duration_days: item.duration_days || null,
        route: item.route || "oral",
        timing: item.timing || null,
        anupana: item.anupana || null,
        classical_ref: item.classical_ref || null,
        quantity: item.quantity || null,
        instructions: item.instructions || null,
        sort_order: idx,
      }));

      const { error: itemsError } = await (supabase as any)
        .from("hms_prescription_items")
        .insert(lineItems);

      if (itemsError) throw itemsError;
    }

    // Mark visit as prescription_given
    if (params.visit_id) {
      await (supabase as any)
        .from("hms_op_visits")
        .update({ prescription_given: true })
        .eq("id", params.visit_id);
    }

    return { prescriptionId: rx.id };
  };

  // Fetch pending prescriptions for pharmacy
  const getPendingForPharmacy = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_prescriptions")
      .select(`
        id, patient_display_id, patient_name, doctor_name, diagnosis,
        pharmacy_status, created_at, branch
      `)
      .eq("pharmacy_status", "pending")
      .eq("branch", branch)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  };

  // Get prescription items
  const getPrescriptionItems = async (prescriptionId: string) => {
    const { data, error } = await (supabase as any)
      .from("hms_prescription_items")
      .select("*")
      .eq("prescription_id", prescriptionId)
      .order("sort_order");

    if (error) throw error;
    return data || [];
  };

  // Mark as dispensed (pharmacy action)
  const markDispensed = async (prescriptionId: string) => {
    const { error } = await (supabase as any)
      .from("hms_prescriptions")
      .update({ pharmacy_status: "dispensed", status: "dispensed", updated_at: new Date().toISOString() })
      .eq("id", prescriptionId);

    if (error) throw error;

    // Also mark all items as dispensed
    await (supabase as any)
      .from("hms_prescription_items")
      .update({ is_dispensed: true })
      .eq("prescription_id", prescriptionId);
  };

  return { createPrescription, getPendingForPharmacy, getPrescriptionItems, markDispensed };
}
