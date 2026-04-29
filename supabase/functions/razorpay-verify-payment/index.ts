// Verifies Razorpay HMAC signature and marks the matching record as paid.
// When orders.payment_status flips to 'paid', the orders_credit_referral DB trigger fires.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!KEY_SECRET) throw new Error("Razorpay secret not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      razorpay_order_id, razorpay_payment_id, razorpay_signature,
      internal_id, kind,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internal_id || !kind) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expected = createHmac("sha256", KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    if (expected !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const table = kind === "order" ? "orders"
      : kind === "appointment" ? "appointments"
      : kind === "therapy" ? "therapy_bookings"
      : kind === "therapy_session" ? "therapy_sessions"
      : null;
    if (!table) throw new Error("Invalid kind");

    const update: Record<string, unknown> = {
      payment_status: "paid",
      razorpay_payment_id,
      razorpay_order_id,
    };
    if (kind === "order") update.order_status = "confirmed";
    if (kind === "appointment") update.status = "confirmed";
    if (kind === "therapy") update.status = "confirmed";
    if (kind === "therapy_session") update.status = "therapist_assigned";

    const userIdCol = kind === "therapy_session" ? "patient_user_id" : "user_id";
    const { error } = await admin.from(table).update(update)
      .eq("id", internal_id).eq(userIdCol, userData.user.id);
    if (error) throw error;

    // Fire-and-forget WhatsApp confirmation (never blocks payment success)
    try {
      const { data: row } = await admin.from(table).select("*").eq("id", internal_id).maybeSingle();
      if (row) {
        let to: string | null = null;
        let message = "";
        if (kind === "order") {
          to = (row as any).phone ?? null;
          const name = (row as any).full_name ?? "Customer";
          const total = (row as any).total ?? "";
          const shortId = String(internal_id).slice(0, 8).toUpperCase();
          message = `Hi ${name}, your Ayuzee order AYZ-${shortId} for ₹${total} is confirmed. We'll notify you when it ships. Thank you!`;
        } else if (kind === "appointment") {
          const date = (row as any).appointment_date ?? "";
          const slot = (row as any).time_slot ?? "";
          message = `Your Ayuzee appointment is confirmed for ${date} at ${slot}. We'll send a reminder before your consultation.`;
          // Try fetch profile phone
          const { data: prof } = await admin.from("profiles").select("phone").eq("user_id", userData.user.id).maybeSingle();
          to = (prof as any)?.phone ?? null;
        } else if (kind === "therapy" || kind === "therapy_session") {
          message = `Your Ayuzee therapy booking is confirmed. Our team will reach out shortly with next steps.`;
          const { data: prof } = await admin.from("profiles").select("phone").eq("user_id", userData.user.id).maybeSingle();
          to = (prof as any)?.phone ?? null;
        }
        if (to && message) {
          await admin.functions.invoke("send-whatsapp", { body: { to, message } });
        }
      }
    } catch (waErr) {
      console.warn("WhatsApp notification failed (non-fatal):", waErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("verify-payment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
