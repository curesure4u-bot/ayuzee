import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authResult = await requireUser(req);
  if (authResult instanceof Response) return authResult;
  const { userId } = authResult;

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Latest signed-off plan for this patient
    const { data: assessments } = await admin
      .from("swasthavritta_assessments")
      .select("id, vaidya_id")
      .eq("patient_id", userId)
      .order("created_at", { ascending: false });

    if (!assessments?.length) {
      return json({ error: "No Swasthavritta assessment found" }, 404);
    }

    const assessmentIds = assessments.map((a) => a.id);
    const { data: plan } = await admin
      .from("swasthavritta_plans")
      .select("id, assessment_id, signed_off")
      .in("assessment_id", assessmentIds)
      .eq("signed_off", true)
      .order("signed_off_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!plan) return json({ error: "No signed-off plan yet" }, 404);

    const parent = assessments.find((a) => a.id === plan.assessment_id);
    const vaidyaUserId = parent?.vaidya_id;
    if (!vaidyaUserId) return json({ error: "No Vaidya linked to this plan" }, 404);

    // Vaidya phone
    const { data: doc } = await admin
      .from("doctors")
      .select("full_name, phone")
      .eq("user_id", vaidyaUserId)
      .maybeSingle();
    if (!doc?.phone) return json({ error: "Vaidya phone not on file" }, 400);

    // Patient name
    const { data: prof } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle();
    const patientName = prof?.full_name || "Your patient";

    // Last 7 days of logs
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    const fromStr = from.toISOString().slice(0, 10);

    const { data: logs } = await admin
      .from("daily_regimen_logs")
      .select("log_date, checklist")
      .eq("patient_id", userId)
      .eq("plan_id", plan.id)
      .gte("log_date", fromStr)
      .order("log_date", { ascending: true });

    const lines: string[] = [];
    let totalPct = 0; let counted = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(from); d.setDate(from.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const row = logs?.find((l: any) => String(l.log_date).slice(0, 10) === key);
      if (!row) { lines.push(`${key.slice(5)}: no log`); continue; }
      const cl = (row as any).checklist ?? {};
      const items = Object.values(cl) as boolean[];
      const done = items.filter(Boolean).length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      totalPct += pct; counted += 1;
      lines.push(`${key.slice(5)}: ${done}/${items.length} (${pct}%)`);
    }
    const avg = counted ? Math.round(totalPct / counted) : 0;

    const message =
      `Namaste Dr. ${doc.full_name ?? ""},\n\n` +
      `${patientName}'s Swasthavritta adherence — last 7 days:\n` +
      lines.join("\n") +
      `\n\nAverage adherence: ${avg}%.\n` +
      `Sent from Ayuzee patient app.`;

    // Fan out to send-whatsapp via internal secret
    const secret = Deno.env.get("INTERNAL_WEBHOOK_SECRET");
    if (!secret) return json({ error: "Server misconfigured" }, 500);

    const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
        // apikey header required by functions runtime
        "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
      },
      body: JSON.stringify({ to: doc.phone, message }),
    });
    const result = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("send-whatsapp failed", resp.status, result);
      return json({ error: "WhatsApp send failed", details: result }, 502);
    }

    return json({ ok: true, avg_adherence: avg, days: counted });
  } catch (e) {
    console.error("swasthavritta-notify-vaidya error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
