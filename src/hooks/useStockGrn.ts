import { supabase } from "@/integrations/supabase/client";

export type GrnItem = {
  product_id?: string;
  product_name: string;
  batch_number: string;
  expiry_date: string; // YYYY-MM-DD
  ordered_qty?: number;
  received_qty: number;
  free_qty?: number;
  purchase_rate: number;
  mrp?: number;
  gst_pct?: number;
};

export type CreateGrnParams = {
  po_id?: string;
  supplier_name: string;
  supplier_invoice_no?: string;
  supplier_invoice_date?: string;
  items: GrnItem[];
  branch?: string;
};

export type CreatePoParams = {
  supplier_name: string;
  supplier_contact?: string;
  items: { product_name: string; quantity: number; rate: number }[];
  expected_delivery?: string;
  notes?: string;
  branch?: string;
};

export function useStockGrn() {
  const createPurchaseOrder = async (params: CreatePoParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const { data: poNumber } = await (supabase as any).rpc("generate_po_number");

    const totalAmount = params.items.reduce((s, i) => s + i.quantity * i.rate, 0);

    const { data: po, error } = await (supabase as any)
      .from("hms_purchase_orders")
      .insert({
        po_number: poNumber || `PO-${Date.now()}`,
        supplier_name: params.supplier_name,
        supplier_contact: params.supplier_contact || null,
        total_amount: totalAmount,
        net_amount: totalAmount,
        status: "confirmed",
        expected_delivery: params.expected_delivery || null,
        notes: params.notes || null,
        branch: params.branch || "Main Branch",
        created_by: uid,
      })
      .select("id, po_number")
      .single();

    if (error) throw error;
    return { poId: po.id, poNumber: po.po_number };
  };

  const createGrn = async (params: CreateGrnParams) => {
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    const { data: grnNumber } = await (supabase as any).rpc("generate_grn_number");

    const totalAmount = params.items.reduce((s, i) => s + i.received_qty * i.purchase_rate, 0);

    // Insert GRN header
    const { data: grn, error: grnError } = await (supabase as any)
      .from("hms_grn")
      .insert({
        grn_number: grnNumber || `GRN-${Date.now()}`,
        po_id: params.po_id || null,
        supplier_name: params.supplier_name,
        supplier_invoice_no: params.supplier_invoice_no || null,
        supplier_invoice_date: params.supplier_invoice_date || null,
        total_amount: totalAmount,
        status: "confirmed",
        received_by: uid,
        branch: params.branch || "Main Branch",
      })
      .select("id, grn_number")
      .single();

    if (grnError) throw grnError;

    // Insert GRN items
    const lineItems = params.items.map((item) => ({
      grn_id: grn.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      batch_number: item.batch_number,
      expiry_date: item.expiry_date,
      ordered_qty: item.ordered_qty || 0,
      received_qty: item.received_qty,
      free_qty: item.free_qty || 0,
      purchase_rate: item.purchase_rate,
      mrp: item.mrp || null,
      gst_pct: item.gst_pct || 0,
      total: item.received_qty * item.purchase_rate,
    }));

    const { error: itemsError } = await (supabase as any)
      .from("hms_grn_items")
      .insert(lineItems);

    if (itemsError) throw itemsError;

    // Update stock quantities for each product
    for (const item of params.items) {
      if (item.product_id) {
        // Increment current_stock
        const { data: prod } = await (supabase as any)
          .from("hms_stock_products")
          .select("current_stock")
          .eq("id", item.product_id)
          .single();

        if (prod) {
          await (supabase as any)
            .from("hms_stock_products")
            .update({
              current_stock: (prod.current_stock || 0) + item.received_qty + (item.free_qty || 0),
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product_id);
        }
      }
    }

    // Update PO status if linked
    if (params.po_id) {
      await (supabase as any)
        .from("hms_purchase_orders")
        .update({ status: "fully_received", updated_at: new Date().toISOString() })
        .eq("id", params.po_id);
    }

    return { grnId: grn.id, grnNumber: grn.grn_number, totalAmount };
  };

  const getProducts = async (branch = "Main Branch", search?: string) => {
    let query = (supabase as any)
      .from("hms_stock_products")
      .select("*")
      .eq("branch", branch)
      .eq("is_active", true)
      .order("product_name")
      .limit(50);

    if (search) query = query.ilike("product_name", `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  return { createPurchaseOrder, createGrn, getProducts };
}
