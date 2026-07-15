import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) return json({ error: "Missing Authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes } = await userClient.auth.getUser();
    const user = userRes?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: isAdmin, error: roleErr } = await admin.rpc("is_admin_or_super", { _user_id: user.id });
    if (roleErr || !isAdmin) return json({ error: "Admin only" }, 403);

    const body = await req.json().catch(() => ({}));
    const orderId: string | undefined = body?.order_id;
    if (!orderId || typeof orderId !== "string") return json({ error: "order_id required" }, 400);

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id,full_name,phone,address_line1,address_line2,city,state,pincode,total,delhivery_waybill,order_items(product_name,quantity,unit_price)")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) return json({ error: "Order not found" }, 404);

    if (order.delhivery_waybill) {
      return json({ waybill: order.delhivery_waybill, already: true });
    }

    const token = Deno.env.get("DELHIVERY_API_TOKEN");
    const pickupName = Deno.env.get("DELHIVERY_PICKUP_NAME") ?? "Ayuzee Warehouse";

    // Fallback: simulate a waybill so the flow works without live credentials.
    if (!token) {
      const waybill = `SIM${Date.now().toString().slice(-10)}`;
      await admin
        .from("orders")
        .update({
          delhivery_waybill: waybill,
          courier_partner: "delhivery-sim",
          dispatched_at: new Date().toISOString(),
        })
        .eq("id", orderId);
      return json({ waybill, simulated: true });
    }

    const items = (order as any).order_items ?? [];
    const productsDesc = items.map((i: any) => `${i.product_name} x${i.quantity}`).join(", ") || "Ayuzee Order";

    const shipmentPayload = {
      shipments: [
        {
          name: order.full_name,
          add: [order.address_line1, order.address_line2].filter(Boolean).join(", "),
          pin: order.pincode,
          city: order.city,
          state: order.state,
          country: "India",
          phone: order.phone,
          order: `AYZ-${orderId.slice(0, 8).toUpperCase()}`,
          payment_mode: "Prepaid",
          products_desc: productsDesc,
          quantity: items.reduce((s: number, i: any) => s + (i.quantity ?? 1), 0) || 1,
          total_amount: order.total,
          cod_amount: 0,
          seller_name: "Ayuzee",
        },
      ],
      pickup_location: { name: pickupName },
    };

    const form = new URLSearchParams();
    form.set("format", "json");
    form.set("data", JSON.stringify(shipmentPayload));

    const resp = await fetch("https://track.delhivery.com/api/cmu/create.json", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: form.toString(),
    });

    const text = await resp.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { /* ignore */ }

    const waybill: string | undefined = data?.packages?.[0]?.waybill;
    if (!resp.ok || !waybill) {
      console.error("Delhivery create error", resp.status, text);
      return json({ error: "Delhivery API error", details: data?.rmk ?? text }, 502);
    }

    await admin
      .from("orders")
      .update({
        delhivery_waybill: waybill,
        courier_partner: "delhivery",
        dispatched_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return json({ waybill, simulated: false });
  } catch (err) {
    console.error("create-delhivery-shipment error", err);
    return json({ error: (err as Error).message ?? "Server error" }, 500);
  }
});
