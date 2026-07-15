// Voice Assistant — transcribes user speech (or accepts text) and returns a
// structured intent { action, route, params, speech } for the client to execute.
// Uses Lovable AI Gateway for both STT and intent parsing.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_PROMPT = `You are Ayuzee's voice assistant router. The user speaks a short command; you must map it to ONE structured intent.

Ayuzee is an AYUSH healthcare aggregator (Ayurveda / Yoga / Unani / Siddha / Homeopathy) with booking, e-commerce, and diagnostic tools.

Available actions:
- "navigate"          — go to a known route. Populate "route".
- "search"            — global search. Populate params.query.
- "add_to_cart"       — find a product then add. Populate params.query.
- "start_booking"     — begin doctor/therapy booking. Populate params.specialty (optional) and route to /doctors or /therapies.
- "open_symptom_checker" — route to /diagnosis.
- "unknown"           — command not understood or unsafe (e.g. asking for a medical diagnosis).

Known routes: /, /doctors, /therapies, /shop, /shop/track, /cart, /checkout, /diagnosis, /ayurveda-advisor, /dashboard, /dashboard/appointments, /dashboard/orders, /health-conditions, /blog, /refund-policy, /contact.

Rules:
- NEVER answer medical questions. If the user asks "what should I take for X" or describes symptoms, return action "open_symptom_checker".
- Always include a short spoken confirmation in "speech" (<=15 words) that the client can read back.
- If ambiguous, choose "search" with the user's phrase as params.query.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    let transcript = typeof body?.text === "string" ? body.text.trim() : "";
    const audioBase64 = typeof body?.audioBase64 === "string" ? body.audioBase64 : "";
    const mime = typeof body?.mime === "string" ? body.mime : "audio/webm";

    // Step 1: transcribe audio if provided (STT still uses Lovable gateway directly —
    // ai-gateway does not proxy audio transcription).
    if (!transcript && audioBase64) {
      if (!LOVABLE_API_KEY) {
        return json({ error: "LOVABLE_API_KEY not configured for audio transcription" }, 500);
      }
      const bytes = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
      const ext = mime.includes("mp4") ? "mp4" : mime.includes("wav") ? "wav" : "webm";
      const form = new FormData();
      form.append("model", "openai/gpt-4o-mini-transcribe");
      form.append("file", new Blob([bytes], { type: mime }), `voice.${ext}`);
      const sttResp = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        body: form,
      });
      if (!sttResp.ok) {
        const t = await sttResp.text();
        console.error("STT error", sttResp.status, t);
        return json({ error: "Could not transcribe audio", detail: t }, 502);
      }
      const sttJson = await sttResp.json();
      transcript = String(sttJson?.text || "").trim();
    }

    if (!transcript) {
      return json({ error: "No speech detected. Please try again." }, 400);
    }

    // Step 2: intent extraction via ai-gateway response_schema
    const responseSchema = {
      name: "route_intent",
      description: "Map the user's spoken command to a structured intent.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["navigate", "search", "add_to_cart", "start_booking", "open_symptom_checker", "unknown"],
          },
          route: { type: "string", description: "App path starting with / — empty if not a navigate action" },
          params: {
            type: "object",
            properties: {
              query: { type: "string" },
              specialty: { type: "string" },
            },
            additionalProperties: false,
          },
          speech: { type: "string", description: "Short spoken confirmation to read back to the user" },
        },
        required: ["action", "route", "params", "speech"],
        additionalProperties: false,
      },
    };

    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "voice-command",
        system: SYSTEM_PROMPT,
        prompt: `User said: "${transcript}"`,
        response_schema: responseSchema,
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("Intent AI error", aiResp.status, t);
      return json({ error: "Intent parsing failed", detail: t }, 502);
    }

    const aiJson = await aiResp.json();
    const intent = aiJson?.result;
    if (!intent) {
      return json({ transcript, intent: { action: "unknown", route: "", params: {}, speech: "Sorry, I didn't catch that." } });
    }

    return json({ transcript, intent });
  } catch (e) {
    console.error("voice-command error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
