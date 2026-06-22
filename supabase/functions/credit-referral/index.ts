// Credits 5% referral commission to the referrer's Ayuzee wallet
// Called by a Postgres trigger via pg_net when an order's payment_status flips to "paid"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireInternalSecret } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const COMMISSION_PCT = 0.05; // 5%

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Only trusted internal callers (trigger / pg_net / other edge functions) may invoke.
  const secretCheck = requireInternalSecret(req);
  if (secretCheck) return secretCheck;

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, user_id, total, payment_status")
      .eq("id", order_id)
      .single();
    if (orderErr || !order) throw new Error("Order not found");
    if (order.payment_status !== "paid") {
      return new Response(JSON.stringify({ skipped: "order not paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Idempotency: was this order already credited?
    const { data: existing } = await supabase
      .from("ayuzee_transactions")
      .select("id")
      .eq("order_id", order_id)
      .eq("type", "referral_credit")
      .maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ skipped: "already credited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Find buyer's referrer
    const { data: buyerProfile } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("user_id", order.user_id)
      .maybeSingle();
    if (!buyerProfile?.referred_by) {
      return new Response(JSON.stringify({ skipped: "no referrer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const referrerId = buyerProfile.referred_by;

    // 4. Get/create referrer wallet
    let { data: wallet } = await supabase
      .from("ayuzee_wallets")
      .select("id")
      .eq("user_id", referrerId)
      .maybeSingle();
    if (!wallet) {
      const { data: newWallet, error: wErr } = await supabase
        .from("ayuzee_wallets")
        .insert({ user_id: referrerId })
        .select("id")
        .single();
      if (wErr) throw wErr;
      wallet = newWallet;
    }

    // 5. Credit commission (sync_ayuzee_balance trigger updates the wallet balance)
    const commission = Math.round(Number(order.total) * COMMISSION_PCT);
    if (commission <= 0) {
      return new Response(JSON.stringify({ skipped: "zero commission" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: txErr } = await supabase.from("ayuzee_transactions").insert({
      wallet_id: wallet.id,
      user_id: referrerId,
      type: "referral_credit",
      amount: commission,
      order_id: order_id,
      reason: `Referral commission · 5% of ₹${order.total}`,
    });
    if (txErr) throw txErr;

    return new Response(
      JSON.stringify({ ok: true, referrer: referrerId, commission }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("credit-referral error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
