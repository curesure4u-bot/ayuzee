import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser, requireInternalSecret } from "../_shared/auth.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Allow either a logged-in user (called from the app) OR a trusted internal
  // caller passing INTERNAL_WEBHOOK_SECRET (server-to-server invocations).
  if (req.headers.get("x-internal-secret")) {
    const secretCheck = requireInternalSecret(req);
    if (secretCheck) return secretCheck;
  } else {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
  }

  try {
    const INTERAKT_KEY = Deno.env.get("INTERAKT_API_KEY");
    const body = await req.json().catch(() => ({}));
    const { to, template, params, message } = body ?? {};

    if (!to) return new Response(JSON.stringify({ error: "to is required" }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

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

    return new Response(JSON.stringify({ ok: resp.ok, result }),
      { status: resp.ok ? 200 : 502, headers: { ...cors, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("send-whatsapp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
