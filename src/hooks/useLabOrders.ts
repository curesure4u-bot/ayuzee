import { supabase } from "@/integrations/supabase/client";

export type LabTestOrder = {
  test_name: string;
  test_code?: string;
  test_id?: string;
  sample_type?: string;
  unit?: string;
  normal_range?: string;
};

export type CreateLabOrderParams = {
  visit_id?: string;
  patient_id: string;
  patient_display_id: string;
  patient_name: string;
  ordered_by_name: string;
  priority?: "routine" | "urgent" | "stat";
  clinical_notes?: string;
  diagnosis?: string;
  tests: LabTestOrder[];
  branch?: string;
};

export function useLabOrders() {
  const createOrder = async (params: CreateLabOrderParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    // Generate order number
    const { data: orderNumber } = await (supabase as any).rpc("generate_lab_order_number");

    const totalAmount = 0; // Would come from test pricing lookup

    // Insert order header
    const { data: order, error: orderError } = await (supabase as any)
      .from("hms_lab_orders")
      .insert({
        order_number: orderNumber || `LAB-${Date.now()}`,
        visit_id: params.visit_id || null,
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        patient_name: params.patient_name,
        ordered_by_name: params.ordered_by_name,
        ordered_by_id: uid,
        priority: params.priority || "routine",
        clinical_notes: params.clinical_notes || null,
        diagnosis: params.diagnosis || null,
        total_amount: totalAmount,
        branch: params.branch || "Main Branch",
      })
      .select("id, order_number")
      .single();

    if (orderError) throw orderError;

    // Insert test items
    if (params.tests.length > 0) {
      const items = params.tests.map((t) => ({
        order_id: order.id,
        test_id: t.test_id || null,
        test_name: t.test_name,
        test_code: t.test_code || null,
        sample_type: t.sample_type || "Blood",
        unit: t.unit || null,
        normal_range: t.normal_range || null,
        status: "pending",
      }));

      const { error: itemsError } = await (supabase as any)
        .from("hms_lab_order_items")
        .insert(items);

      if (itemsError) throw itemsError;
    }

    return { orderId: order.id, orderNumber: order.order_number };
  };

  const getPendingOrders = async (branch = "Main Branch") => {
    const { data, error } = await (supabase as any)
      .from("hms_lab_orders")
      .select("*, hms_lab_order_items(*)")
      .in("status", ["ordered", "sample_collected", "processing"])
      .eq("branch", branch)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  };

  const enterResult = async (itemId: string, resultValue: string, resultNumeric?: number, isAbnormal = false, isCritical = false) => {
    const { error } = await (supabase as any)
      .from("hms_lab_order_items")
      .update({
        result_value: resultValue,
        result_numeric: resultNumeric || null,
        is_abnormal: isAbnormal,
        is_critical: isCritical,
        status: "resulted",
        resulted_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) throw error;
  };

  const verifyResult = async (itemId: string, verifiedBy: string) => {
    const { error } = await (supabase as any)
      .from("hms_lab_order_items")
      .update({ status: "verified", verified_by: verifiedBy, verified_at: new Date().toISOString() })
      .eq("id", itemId);
    if (error) throw error;
  };

  const completeOrder = async (orderId: string) => {
    const { error } = await (supabase as any)
      .from("hms_lab_orders")
      .update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) throw error;
  };

  return { createOrder, getPendingOrders, enterResult, verifyResult, completeOrder };
}
