// Process payout: approve / reject / hold / process (manual or Razorpay)
// Deducts wallet balance + records audit trail.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "approve" | "reject" | "hold" | "process";

interface Body {
  payout_request_id: string;
  action: Action;
  payment_method?: "manual" | "razorpay" | "neft" | "rtgs" | "upi";
  utr_number?: string;
  rejection_reason?: string;
  hold_reason?: string;
  admin_note?: string;
  tds_amount?: number;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await admin.rpc("is_admin_or_super", { _user_id: userData.user.id });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = (await req.json().catch(() => ({}))) as Body;
    if (!body.payout_request_id || !body.action) return json({ error: "payout_request_id and action required" }, 400);

    const { data: pr, error: fetchErr } = await admin
      .from("payout_requests")
      .select("*")
      .eq("id", body.payout_request_id)
      .single();
    if (fetchErr || !pr) return json({ error: fetchErr?.message ?? "Payout request not found" }, 404);

    const fromStatus: string = pr.status;
    let toStatus = fromStatus;
    const updates: Record<string, unknown> = {};
    const nowIso = new Date().toISOString();

    // === APPROVE ===
    if (body.action === "approve") {
      if (fromStatus !== "pending" && fromStatus !== "hold")
        return json({ error: `Cannot approve from status '${fromStatus}'` }, 400);
      toStatus = "approved";
      updates.status = toStatus;
      updates.approved_by = userData.user.id;
      updates.approved_at = nowIso;
      if (body.admin_note) updates.admin_note = body.admin_note;
    }

    // === REJECT ===
    if (body.action === "reject") {
      if (!body.rejection_reason) return json({ error: "rejection_reason required" }, 400);
      toStatus = "rejected";
      updates.status = toStatus;
      updates.rejected_by = userData.user.id;
      updates.rejected_at = nowIso;
      updates.rejection_reason = body.rejection_reason;
      if (body.admin_note) updates.admin_note = body.admin_note;
    }

    // === HOLD ===
    if (body.action === "hold") {
      toStatus = "hold";
      updates.status = toStatus;
      updates.held_by = userData.user.id;
      updates.held_at = nowIso;
      updates.hold_reason = body.hold_reason ?? null;
      if (body.admin_note) updates.admin_note = body.admin_note;
    }

    // === PROCESS (deduct wallet, optionally call Razorpay) ===
    if (body.action === "process") {
      if (fromStatus !== "approved")
        return json({ error: `Payout must be approved before processing (current: '${fromStatus}')` }, 400);

      const tds = Number(body.tds_amount ?? pr.tds_amount ?? 0);
      const gross = Number(pr.amount);
      const net = Math.max(gross - tds, 0);

      // Look up wallet
      const { data: wallet, error: wErr } = await admin
        .from("ayuzee_wallets")
        .select("id, balance")
        .eq("user_id", pr.requester_user_id)
        .maybeSingle();
      if (wErr) return json({ error: wErr.message }, 500);
      if (!wallet) return json({ error: "Wallet not found for requester" }, 400);
      if (Number(wallet.balance) < gross) return json({ error: "Insufficient wallet balance" }, 400);

      let razorpay_payout_id: string | null = null;

      // Razorpay Payouts (only if explicitly chosen and creds available)
      if (body.payment_method === "razorpay") {
        const RZP_KEY = Deno.env.get("RAZORPAY_KEY_ID");
        const RZP_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
        const RZP_ACCOUNT = Deno.env.get("RAZORPAY_ACCOUNT_NUMBER");
        const RZP_FUND_ACCOUNT = pr.razorpay_payout_id; // optional pre-stored fund account
        if (!RZP_KEY || !RZP_SECRET || !RZP_ACCOUNT) {
          return json({ error: "Razorpay credentials not configured" }, 400);
        }
        const auth = btoa(`${RZP_KEY}:${RZP_SECRET}`);
        const rzpRes = await fetch("https://api.razorpay.com/v1/payouts", {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_number: RZP_ACCOUNT,
            fund_account_id: RZP_FUND_ACCOUNT,
            amount: Math.round(net * 100),
            currency: "INR",
            mode: "NEFT",
            purpose: "payout",
            reference_id: pr.id,
            narration: "Ayuzee Payout",
          }),
        });
        const rzpJson = await rzpRes.json();
        if (!rzpRes.ok) {
          return json({ error: "Razorpay payout failed", details: rzpJson }, 502);
        }
        razorpay_payout_id = rzpJson.id ?? null;
      }

      // Deduct from wallet (transaction inserts will run sync_ayuzee_balance trigger)
      const { error: txErr } = await admin.from("ayuzee_transactions").insert({
        wallet_id: wallet.id,
        user_id: pr.requester_user_id,
        type: "redeem",
        amount: gross,
        reason: `Payout #${pr.id.slice(0, 8)} (${body.payment_method ?? "manual"})`,
      });
      if (txErr) return json({ error: `Wallet debit failed: ${txErr.message}` }, 500);

      toStatus = "processed";
      updates.status = toStatus;
      updates.processed_at = nowIso;
      updates.payment_method = body.payment_method ?? "manual";
      updates.utr_number = body.utr_number ?? null;
      updates.tds_amount = tds;
      updates.net_amount = net;
      if (razorpay_payout_id) updates.razorpay_payout_id = razorpay_payout_id;
      if (body.admin_note) updates.admin_note = body.admin_note;
    }

    // Persist payout updates
    const { error: upErr } = await admin
      .from("payout_requests")
      .update(updates)
      .eq("id", body.payout_request_id);
    if (upErr) return json({ error: upErr.message }, 500);

    // Audit log
    await admin.from("payout_audit_log").insert({
      payout_request_id: body.payout_request_id,
      actor_user_id: userData.user.id,
      action: body.action,
      from_status: fromStatus,
      to_status: toStatus,
      notes: body.admin_note ?? body.rejection_reason ?? body.hold_reason ?? null,
      metadata: {
        payment_method: body.payment_method,
        utr_number: body.utr_number,
        tds_amount: body.tds_amount,
      },
    });

    return json({ ok: true, status: toStatus });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
