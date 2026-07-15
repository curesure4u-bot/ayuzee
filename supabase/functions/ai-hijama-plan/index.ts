import { requireUser } from "../_shared/auth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const body = await req.json();

    const system = `You are Ayuzee Hijama AI, a clinical decision-support assistant for Hijama (cupping) therapy.
You DO NOT prescribe. You produce a structured suggestion for a qualified doctor to review and approve.
Always factor in contraindications. If risk is high, recommend deferral and doctor consultation.`;

    const prompt = `Patient assessment:
${JSON.stringify(body, null, 2)}

Return a structured Hijama plan suggestion using the provided tool.`;

    const responseSchema = {
      name: "hijama_plan",
      description: "Suggested Hijama therapy plan",
      parameters: {
        type: "object",
        properties: {
          risk_level: { type: "string", enum: ["low", "moderate", "high", "defer"] },
          contraindications_detected: { type: "array", items: { type: "string" } },
          suggested_type: { type: "string", description: "Dry / Wet (Hijama) / Moving / Fire / Flash" },
          suggested_point_zones: { type: "array", items: { type: "string" } },
          number_of_cups: { type: "string" },
          session_duration_minutes: { type: "string" },
          precautions: { type: "array", items: { type: "string" } },
          aftercare_advice: { type: "array", items: { type: "string" } },
          followup_timing: { type: "string" },
          doctor_notes: { type: "string", description: "Clinical reasoning summary" },
        },
        required: ["risk_level", "suggested_type", "suggested_point_zones", "precautions", "aftercare_advice", "doctor_notes"],
        additionalProperties: false,
      },
    };

    const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "ai-hijama-plan",
        system,
        prompt,
        response_schema: responseSchema,
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const plan = data.result ?? null;
    return new Response(JSON.stringify({ plan }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("hijama plan error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
