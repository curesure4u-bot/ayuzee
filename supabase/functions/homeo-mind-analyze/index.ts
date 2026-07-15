import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { requireUser } from "../_shared/auth.ts";

const THEMES = [
  "humiliation", "rejection", "grief", "fear", "betrayal", "anger",
  "injustice", "performance anxiety", "dependence", "control",
  "abandonment", "oversensitivity",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { narrative } = await req.json();
    if (!narrative || typeof narrative !== "string") {
      return new Response(JSON.stringify({ error: "narrative is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a homeopathy clinical-decision support assistant trained in perception-based case analysis.
Read the patient narrative and identify the dominant emotional/mental themes from this fixed list:
${THEMES.join(", ")}.
Also extract: a short one-line "essence" of the case, the single most central remedy theme, and 3-5 likely remedy candidates (use classical names like Staphysagria, Natrum Muriaticum, Ignatia, Nux Vomica, Argentum Nitricum, Gelsemium, Lachesis, Sepia, Pulsatilla, Aurum Metallicum, Arsenicum Album, Chamomilla, Phosphorus, Lycopodium, Causticum, Aconitum Napellus, etc).
Return strictly via the analyze_case tool.`;

    const responseSchema = {
      name: "analyze_case",
      description: "Return mind-case analysis",
      parameters: {
        type: "object",
        properties: {
          essence: { type: "string" },
          detected_themes: { type: "array", items: { type: "string", enum: THEMES } },
          central_theme: { type: "string", enum: THEMES },
          remedy_cluster: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
          suggested_remedy: { type: "string" },
          differential_remedies: { type: "array", items: { type: "string" }, maxItems: 5 },
          key_reasons: { type: "string" },
        },
        required: ["essence", "detected_themes", "central_theme", "remedy_cluster", "suggested_remedy", "differential_remedies", "key_reasons"],
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
        feature: "homeo-mind-analyze",
        system: systemPrompt,
        prompt: narrative,
        response_schema: responseSchema,
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data.result ?? null;
    if (!args) throw new Error("No analysis returned");

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mind-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
