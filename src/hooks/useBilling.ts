import { supabase } from "@/integrations/supabase/client";

export type BillItem = {
  item_type: "service" | "medicine" | "investigation" | "procedure" | "consumable" | "package";
  item_name: string;
  quantity: number;
  unit_price: number;
  discount_pct?: number;
  tax_pct?: number;
  total: number;
  hsn_code?: string;
};

export type CreateBillParams = {
  patient_id: string;
  patient_display_id: string;
  patient_name: string;
  visit_id?: string;
  bill_type?: string;
  items: BillItem[];
  discount_amount?: number;
  discount_reason?: string;
  payment_mode: string;
  payment_reference?: string;
  doctor_name?: string;
  department?: string;
  rate_plan?: string;
  branch?: string;
};

export function useBilling() {
  const createBill = async (params: CreateBillParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;

    // Generate bill number
    const { data: billNumber } = await (supabase as any).rpc("generate_bill_number", {
      p_branch: params.branch || "Main Branch",
    });

    const subtotal = params.items.reduce((sum, i) => sum + i.total, 0);
    const discountAmount = params.discount_amount || 0;
    const taxAmount = params.items.reduce((sum, i) => sum + (i.total * (i.tax_pct || 0) / 100), 0);
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Insert bill
    const { data: bill, error: billError } = await (supabase as any)
      .from("hms_bills")
      .insert({
        bill_number: billNumber || `INV-${Date.now()}`,
        visit_id: params.visit_id || null,
        patient_id: params.patient_id,
        patient_display_id: params.patient_display_id,
        patient_name: params.patient_name,
        bill_type: params.bill_type || "consultation",
        subtotal,
        discount_amount: discountAmount,
        discount_reason: params.discount_reason || null,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: totalAmount,
        balance_amount: 0,
        payment_status: "paid",
        payment_mode: params.payment_mode,
        payment_reference: params.payment_reference || null,
        doctor_name: params.doctor_name || null,
        department: params.department || null,
        rate_plan: params.rate_plan || "general",
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id, bill_number")
      .single();

    if (billError) throw billError;

    // Insert line items
    if (params.items.length > 0) {
      const lineItems = params.items.map((item) => ({
        bill_id: bill.id,
        item_type: item.item_type,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_pct: item.discount_pct || 0,
        tax_pct: item.tax_pct || 0,
        total: item.total,
        hsn_code: item.hsn_code || null,
      }));

      await (supabase as any).from("hms_bill_items").insert(lineItems);
    }

    // Create payment receipt
    const { data: receiptNumber } = await (supabase as any).rpc("generate_receipt_number");

    await (supabase as any).from("hms_payment_receipts").insert({
      receipt_number: receiptNumber || `RCP-${Date.now()}`,
      bill_id: bill.id,
      patient_id: params.patient_id,
      amount: totalAmount,
      payment_mode: params.payment_mode,
      payment_reference: params.payment_reference || null,
      received_by: uid,
      branch: params.branch || "Main Branch",
    });

    // Also update the visit billing status if visit_id provided
    if (params.visit_id) {
      await (supabase as any)
        .from("hms_op_visits")
        .update({
          bill_amount: totalAmount,
          bill_status: "paid",
          payment_mode: params.payment_mode,
        })
        .eq("id", params.visit_id);
    }

    return { billId: bill.id, billNumber: bill.bill_number, totalAmount };
  };

  return { createBill };
}
