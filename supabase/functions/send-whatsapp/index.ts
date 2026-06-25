import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser, requireInternalSecret } from "../_shared/auth.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Allow either a trusted internal caller (server-to-server with INTERNAL_WEBHOOK_SECRET)
  // OR an authenticated doctor/admin from the app. Patients/students cannot send.
  if (req.headers.get("x-internal-secret")) {
    const secretCheck = requireInternalSecret(req);
    if (secretCheck) return secretCheck;
  } else {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const [{ data: isDoctor }, { data: isAdmin }, { data: isSuper }] = await Promise.all([
      authClient.rpc("has_role", { _user_id: userId, _role: "doctor" }),
      authClient.rpc("has_role", { _user_id: userId, _role: "admin" }),
      authClient.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
    ]);
    if (!isDoctor && !isAdmin && !isSuper) {
      return new Response(
        JSON.stringify({ error: "Forbidden — doctor or admin role required" }),
        { status: 403, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }
  }

  try {
    const INTERAKT_KEY = Deno.env.get("INTERAKT_API_KEY");
    const body = await req.json().catch(() => ({}));
    let { to, template, params, message } = body ?? {};
    const { template_code, variables } = body ?? {};

    if (!to) return new Response(JSON.stringify({ error: "to is required" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    // If a template_code is provided, look up the saved message and fill {{vars}}
    if (template_code) {
      try {
        const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
        const { data: tpl } = await admin.from("hms_whatsapp_templates")
          .select("message_template").eq("template_code", template_code).maybeSingle();
        if (tpl?.message_template) {
          const vars: Record<string, string> = variables ?? {};
          message = String(tpl.message_template).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
        }
      } catch (_) { /* fall through */ }
    }

    // Clean phone to 10 digits
    const digits = String(to).replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) return new Response(JSON.stringify({ error: "Invalid phone number" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    // No API key = log and return simulated (dev/staging mode)
    if (!INTERAKT_KEY) {
      console.log("[send-whatsapp SIMULATED]", JSON.stringify({ to: digits, template, params, message }));
      return new Response(JSON.stringify({ ok: true, simulated: true }),
        { headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Build Interakt payload
    const payload: Record<string, unknown> = {
      countryCode: "+91",
      phoneNumber: digits,
      type: template ? "Template" : "Text",
    };

    if (template) {
      payload.template = { name: template, languageCode: "en", bodyValues: params ?? [] };
    } else {
      payload.data = { message: message ?? "" };
    }

    const resp = await fetch("https://api.interakt.ai/v1/public/message/", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${INTERAKT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await resp.json().catch(() => ({}));
    console.log("[send-whatsapp]", { to: digits, template, status: resp.status });

    try {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await admin.from("vaidya_whatsapp_log").insert({
        patient_phone: digits,
        message_preview: (message || "").slice(0, 280),
        template_name: template_code || template || null,
        status: resp.ok ? "sent" : "failed",
        sent_at: new Date().toISOString(),
      });
    } catch (_) { /* best-effort */ }

    return new Response(JSON.stringify({ ok: resp.ok, result }),
      { status: resp.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("send-whatsapp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
