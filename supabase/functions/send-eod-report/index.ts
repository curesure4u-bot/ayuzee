import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser, requireInternalSecret, corsHeaders } from "../_shared/auth.ts";

const cors = corsHeaders;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    // Allow either an internal cron secret (server-to-server) OR an admin user.
    const hasInternal = req.headers.get("x-internal-secret");
    if (hasInternal) {
      const denied = requireInternalSecret(req);
      if (denied) return denied;
    } else {
      const authed = await requireUser(req);
      if (authed instanceof Response) return authed;
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: isAdmin } = await adminClient.rpc("is_admin_or_super", {
        _user_id: authed.userId,
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    const { branch_id } = await req.json();
    if (!branch_id) return new Response(JSON.stringify({ error: "branch_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: cfg } = await admin.from("hms_report_configs").select("*").eq("branch_id", branch_id).maybeSingle();
    if (!cfg) return new Response(JSON.stringify({ error: "No config for branch" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });

    const { data: branch } = await admin.from("hms_branches").select("branch_name").eq("id", branch_id).maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const sections: string[] = [];

    const types = (cfg as any).report_types || [];

    if (types.includes("daily_collection")) {
      const { data: bills } = await admin.from("vaidya_bills").select("total").gte("bill_date", today);
      const total = ((bills as any) || []).reduce((s: number, b: any) => s + Number(b.total || 0), 0);
      sections.push(`<h3>Daily Collection</h3><p>Total: <strong>₹${total.toFixed(2)}</strong> from ${bills?.length || 0} bills</p>`);
    }
    if (types.includes("patient_count")) {
      const { count: total } = await admin.from("vaidya_patients").select("*", { count: "exact", head: true });
      const { count: today_new } = await admin.from("vaidya_patients").select("*", { count: "exact", head: true }).gte("created_at", today);
      sections.push(`<h3>Patient Count</h3><p>Total: <strong>${total ?? 0}</strong> · New today: <strong>${today_new ?? 0}</strong></p>`);
    }
    if (types.includes("appointments")) {
      const { count } = await admin.from("vaidya_queue_tokens").select("*", { count: "exact", head: true }).eq("token_date", today);
      sections.push(`<h3>Appointments</h3><p>Tokens today: <strong>${count ?? 0}</strong></p>`);
    }
    if (types.includes("pending_bills")) {
      const { data } = await admin.from("vaidya_bills").select("bill_no,total").eq("payment_status", "pending").limit(10);
      sections.push(`<h3>Pending Bills</h3><p>${(data || []).length} pending</p>`);
    }
    if (types.includes("bed_occupancy")) {
      const { data } = await admin.from("hms_ward_beds").select("status");
      const occ = ((data as any) || []).filter((b: any) => b.status === "occupied").length;
      const tot = ((data as any) || []).length;
      sections.push(`<h3>Bed Occupancy</h3><p>${occ} / ${tot} occupied</p>`);
    }

    const html = `
      <div style="font-family:sans-serif;padding:20px;max-width:680px;margin:auto">
        <h2 style="color:#065f46">HMS Tools Ultra — End of Day Report</h2>
        <p><strong>${(branch as any)?.branch_name || "Branch"}</strong> · ${today}</p>
        ${sections.join("") || "<p>No sections selected.</p>"}
        <hr/>
        <p style="font-size:11px;color:#666">Powered by Ayuzee · HMS Tools Ultra</p>
      </div>`;

    const recipients = (cfg as any).recipient_emails || [];
    let status = "sent";
    let error_msg: string | null = null;

    try {
      const { error } = await admin.functions.invoke("send-email", {
        body: {
          to: recipients, subject: `EOD Report — ${(branch as any)?.branch_name} — ${today}`,
          html, from: "HMS Tools Ultra <noreply@ayuzee.com>",
        },
      });
      if (error) { status = "failed"; error_msg = error.message; }
    } catch (e) {
      status = "failed"; error_msg = e instanceof Error ? e.message : "send failed";
    }

    await admin.from("hms_report_logs").insert({ branch_id, status, recipient_emails: recipients, error_msg });
    if (status === "sent") await admin.from("hms_report_configs").update({ last_sent_at: new Date().toISOString() }).eq("id", (cfg as any).id);

    return new Response(JSON.stringify({ ok: status === "sent", status, error_msg }),
      { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
