// Panchakarma session reminders (pre & post) via Interakt WhatsApp.
// Trigger via cron (recommended: 18:00 IST for pre, 07:00 IST for post) or manually.
// Body (optional): { mode: "pre" | "post" | "both", date?: "YYYY-MM-DD" }
// Auth: internal cron caller uses x-internal-secret; admins may also invoke.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser, requireInternalSecret } from "../_shared/auth.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_SECRET = Deno.env.get("INTERNAL_WEBHOOK_SECRET") ?? "";

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtTime(t: string | null): string {
  if (!t) return "your scheduled time";
  const [h, m] = t.split(":");
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12}:${m} ${ampm}`;
}

async function sendWhatsApp(to: string, message: string, template_code?: string) {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": INTERNAL_SECRET,
      "Authorization": `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({ to, message, template_code }),
  });
  const json = await resp.json().catch(() => ({}));
  return { ok: resp.ok, json };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Allow either internal cron or an admin user
  if (req.headers.get("x-internal-secret")) {
    const check = requireInternalSecret(req);
    if (check) return check;
  } else {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;
    const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });
    const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
      authClient.rpc("has_role", { _user_id: userId, _role: "admin" }),
      authClient.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);
    if (!isAdmin && !isSuper) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode: "pre" | "post" | "both" = body.mode ?? "both";
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setUTCDate(now.getUTCDate() + 1);
    const yesterday = new Date(now); yesterday.setUTCDate(now.getUTCDate() - 1);
    const preDate = body.date ?? ymd(tomorrow);
    const postDate = body.date ?? ymd(yesterday);

    const results: { pre: unknown[]; post: unknown[] } = { pre: [], post: [] };

    // ---------- PRE reminders ----------
    if (mode === "pre" || mode === "both") {
      const { data: sessions, error } = await admin
        .from("panchakarma_sessions")
        .select(`
          id, patient_id, scheduled_date, scheduled_time, status,
          stage:panchakarma_template_stages ( stage_name, pre_procedure_instructions ),
          booking:panchakarma_course_bookings (
            template:panchakarma_course_templates ( name, therapy_type )
          )
        `)
        .eq("scheduled_date", preDate)
        .eq("status", "confirmed");
      if (error) throw error;

      for (const s of sessions ?? []) {
        const stage: any = Array.isArray((s as any).stage) ? (s as any).stage[0] : (s as any).stage;
        const bk: any = Array.isArray((s as any).booking) ? (s as any).booking[0] : (s as any).booking;
        const tpl: any = Array.isArray(bk?.template) ? bk.template[0] : bk?.template;
        const { data: prof } = await admin
          .from("profiles").select("phone, full_name").eq("user_id", s.patient_id).maybeSingle();
        if (!prof?.phone) { results.pre.push({ session: s.id, skipped: "no phone" }); continue; }

        const msg =
          `Namaste ${prof.full_name ?? ""}, this is a reminder for your Panchakarma session tomorrow.\n\n` +
          `🌿 *${tpl?.name ?? "Panchakarma"}* — ${stage?.stage_name ?? "Session"}\n` +
          `📅 ${preDate} at ${fmtTime(s.scheduled_time)}\n\n` +
          `*Pre-procedure instructions:*\n${stage?.pre_procedure_instructions ?? "Please follow your Vaidya's guidance."}\n\n` +
          `Reply here if you have any questions. — Ayuzee`;

        const r = await sendWhatsApp(prof.phone, msg, "panchakarma_pre_reminder");
        results.pre.push({ session: s.id, phone: prof.phone, ok: r.ok });
      }
    }

    // ---------- POST reminders ----------
    if (mode === "post" || mode === "both") {
      const { data: sessions, error } = await admin
        .from("panchakarma_sessions")
        .select(`
          id, patient_id, scheduled_date, scheduled_time, status, completion_notes,
          stage:panchakarma_template_stages ( stage_name, post_procedure_instructions ),
          booking:panchakarma_course_bookings (
            template:panchakarma_course_templates ( name, therapy_type )
          )
        `)
        .eq("scheduled_date", postDate)
        .eq("status", "completed");
      if (error) throw error;

      for (const s of sessions ?? []) {
        const stage: any = Array.isArray((s as any).stage) ? (s as any).stage[0] : (s as any).stage;
        const bk: any = Array.isArray((s as any).booking) ? (s as any).booking[0] : (s as any).booking;
        const tpl: any = Array.isArray(bk?.template) ? bk.template[0] : bk?.template;
        const { data: prof } = await admin
          .from("profiles").select("phone, full_name").eq("user_id", s.patient_id).maybeSingle();
        if (!prof?.phone) { results.post.push({ session: s.id, skipped: "no phone" }); continue; }

        const msg =
          `Namaste ${prof.full_name ?? ""}, we hope yesterday's session went well.\n\n` +
          `🌿 *${tpl?.name ?? "Panchakarma"}* — ${stage?.stage_name ?? "Session"}\n\n` +
          `*Post-procedure care for today:*\n${stage?.post_procedure_instructions ?? "Rest well and follow your Vaidya's advice."}\n\n` +
          `${s.completion_notes ? `Vaidya's note: ${s.completion_notes}\n\n` : ""}` +
          `Please share your feedback in the app so your Vaidya can adjust the plan if needed. — Ayuzee`;

        const r = await sendWhatsApp(prof.phone, msg, "panchakarma_post_care");
        results.post.push({ session: s.id, phone: prof.phone, ok: r.ok });
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      pre_date: preDate, post_date: postDate,
      pre_sent: results.pre.length, post_sent: results.post.length,
      results,
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("panchakarma-session-reminder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
