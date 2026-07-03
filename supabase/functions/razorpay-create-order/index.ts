// Creates a Razorpay order server-side and returns the order_id to the client
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
    const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay keys not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const { order_id, kind } = await req.json();
    if (!order_id || !["order", "appointment", "therapy", "therapy_session"].includes(kind)) {
      return new Response(JSON.stringify({ error: "order_id and valid kind required" }), {
        status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // Use service role to read amount authoritatively
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let amountInr = 0;
    if (kind === "order") {
      const { data, error } = await admin.from("orders")
        .select("total, user_id, payment_status").eq("id", order_id).single();
      if (error || !data) throw new Error("Order not found");
      if (data.user_id !== userData.user.id) throw new Error("Forbidden");
      if (data.payment_status === "paid") throw new Error("Order already paid");
      amountInr = Number(data.total);
    } else if (kind === "appointment") {
      const { data, error } = await admin.from("appointments")
        .select("fee, user_id, payment_status").eq("id", order_id).single();
      if (error || !data) throw new Error("Appointment not found");
      if (data.user_id !== userData.user.id) throw new Error("Forbidden");
      if (data.payment_status === "paid") throw new Error("Already paid");
      amountInr = Number(data.fee);
    } else if (kind === "therapy") {
      const { data, error } = await admin.from("therapy_bookings")
        .select("price, user_id, payment_status").eq("id", order_id).single();
      if (error || !data) throw new Error("Booking not found");
      if (data.user_id !== userData.user.id) throw new Error("Forbidden");
      if (data.payment_status === "paid") throw new Error("Already paid");
      amountInr = Number(data.price);
    } else {
      // therapy_session — patient booking via Uber-style flow
      const { data, error } = await admin.from("therapy_sessions")
        .select("total_amount, patient_user_id, payment_status").eq("id", order_id).single();
      if (error || !data) throw new Error("Session not found");
      if (data.patient_user_id !== userData.user.id) throw new Error("Forbidden");
      if (data.payment_status === "paid") throw new Error("Already paid");
      amountInr = Number(data.total_amount);
    }

    if (amountInr <= 0) throw new Error("Invalid amount");

    const auth = btoa(`${KEY_ID}:${KEY_SECRET}`);
    const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(amountInr * 100), // paise
        currency: "INR",
        receipt: `${kind}_${order_id.slice(0, 30)}`,
        notes: { kind, internal_id: order_id, user_id: userData.user.id },
      }),
    });
    const rzpOrder = await rzpRes.json();
    if (!rzpRes.ok) throw new Error(rzpOrder?.error?.description || "Razorpay create failed");

    // Persist razorpay_order_id on the matching row
    const table = kind === "order" ? "orders"
      : kind === "appointment" ? "appointments"
      : kind === "therapy" ? "therapy_bookings"
      : "therapy_sessions";
    await admin.from(table).update({ razorpay_order_id: rzpOrder.id }).eq("id", order_id);

    return new Response(JSON.stringify({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: KEY_ID,
    }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (e) {
    console.error("create-order error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
