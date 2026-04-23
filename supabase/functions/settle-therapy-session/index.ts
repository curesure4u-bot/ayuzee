// Settle a completed therapy session: credit therapist wallet, log venue revenue,
// credit doctor referral, then mark payment_status = 'settled'. Idempotent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SessionRow = {
  id: string;
  therapy_name: string;
  status: string;
  payment_status: string;
  total_amount: number | null;
  platform_fee: number | null;
  therapist_earnings: number | null;
  venue_earnings: number | null;
  doctor_referral_fee: number | null;
  therapist_id: string | null;
  venue_id: string | null;
  doctor_user_id: string | null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { session_id } = await req.json().catch(() => ({}));
    if (!session_id || typeof session_id !== "string") {
      return json({ error: "session_id required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: s, error: sErr } = await supabase
      .from("therapy_sessions")
      .select("id, therapy_name, status, payment_status, total_amount, platform_fee, therapist_earnings, venue_earnings, doctor_referral_fee, therapist_id, venue_id, doctor_user_id")
      .eq("id", session_id)
      .maybeSingle();

    if (sErr || !s) return json({ error: "Session not found" }, 404);
    const session = s as SessionRow;

    if (session.status !== "completed") {
      return json({ skipped: true, reason: `status=${session.status}` });
    }
    if (session.payment_status === "settled") {
      return json({ skipped: true, reason: "already settled" });
    }

    const therapistAmt = Math.max(0, Math.round(Number(session.therapist_earnings ?? 0)));
    const venueAmt = Math.max(0, Math.round(Number(session.venue_earnings ?? 0)));
    const platformAmt = Math.max(0, Math.round(Number(session.platform_fee ?? 0)));
    const doctorAmt = Math.max(0, Math.round(Number(session.doctor_referral_fee ?? 0)));

    // ---- Credit therapist via ayuzee_wallets (if therapist has linked auth user) ----
    if (session.therapist_id && therapistAmt > 0) {
      const { data: therapist } = await supabase
        .from("therapists")
        .select("id, user_id")
        .eq("id", session.therapist_id)
        .maybeSingle();

      if (therapist?.user_id) {
        const walletId = await ensureWallet(supabase, therapist.user_id);
        await supabase.from("ayuzee_transactions").insert({
          wallet_id: walletId,
          user_id: therapist.user_id,
          type: "credit",
          amount: therapistAmt,
          reason: `Therapy earnings — ${session.therapy_name}`,
        });
      }
    }

    // ---- Log venue revenue ----
    if (session.venue_id && venueAmt > 0) {
      await supabase.from("venue_revenue_logs").insert({
        venue_id: session.venue_id,
        session_id: session.id,
        amount: venueAmt,
        type: "net_payout",
      });
    }
    if (session.venue_id && platformAmt > 0) {
      await supabase.from("venue_revenue_logs").insert({
        venue_id: session.venue_id,
        session_id: session.id,
        amount: platformAmt,
        type: "platform_deduction",
      });
    }

    // ---- Credit doctor referral ----
    if (session.doctor_user_id && doctorAmt > 0) {
      const walletId = await ensureWallet(supabase, session.doctor_user_id);
      await supabase.from("ayuzee_transactions").insert({
        wallet_id: walletId,
        user_id: session.doctor_user_id,
        type: "referral_credit",
        amount: doctorAmt,
        reason: `Therapy referral fee — ${session.therapy_name}`,
      });
    }

    // ---- Mark settled ----
    await supabase
      .from("therapy_sessions")
      .update({ payment_status: "settled" })
      .eq("id", session.id);

    return json({
      ok: true,
      settled: { therapist: therapistAmt, venue: venueAmt, doctor: doctorAmt, platform: platformAmt },
    });
  } catch (e) {
    console.error("settle-therapy-session error", e);
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

async function ensureWallet(supabase: ReturnType<typeof createClient>, userId: string): Promise<string> {
  const { data } = await supabase.from("ayuzee_wallets").select("id").eq("user_id", userId).maybeSingle();
  if (data?.id) return data.id as string;
  const { data: created } = await supabase
    .from("ayuzee_wallets")
    .insert({ user_id: userId })
    .select("id")
    .single();
  return created!.id as string;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
