import { requireUser } from "../_shared/auth.ts";
// AI Clinical Decision Support — differentials, drug interactions, classical Ayurveda references
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { chief_complaint, history, examination, assessment, prescription, prakriti } = await req.json();

    const systemPrompt = `You are a senior Ayurveda + integrative medicine consultant. Given a partial EMR, suggest:
1. 3-5 most likely differential diagnoses (allopathic + Ayurvedic dosha-based).
2. Any drug-drug or herb-drug interaction warnings in the proposed prescription.
3. Relevant classical Ayurveda references (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) — chapter/sutra if known.
4. Red flags / when to refer.
Be specific, cite the dosha imbalance, and never fabricate citations — if unsure, say "general Ayurvedic principles".`;

    const responseSchema = {
      name: "clinical_suggestions",
      description: "Return clinical decision support suggestions",
      parameters: {
        type: "object",
        properties: {
          differentials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                diagnosis: { type: "string" },
                rationale: { type: "string" },
                dosha: { type: "string", enum: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic", "Unspecified"] },
              },
              required: ["diagnosis", "rationale", "dosha"],
              additionalProperties: false,
            },
          },
          interactions: { type: "array", items: { type: "string" } },
          classical_refs: { type: "array", items: { type: "string" } },
          red_flags: { type: "array", items: { type: "string" } },
        },
        required: ["differentials", "interactions", "classical_refs", "red_flags"],
        additionalProperties: false,
      },
    };

    const userMsg = `Patient EMR:
- Chief complaint: ${chief_complaint || "—"}
- History: ${history || "—"}
- Examination: ${examination || "—"}
- Current assessment: ${assessment || "—"}
- Proposed prescription: ${prescription || "—"}
- Prakriti: ${prakriti || "Not assessed"}

Please return structured clinical suggestions.`;

    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "ai-cds",
        system: systemPrompt,
        prompt: userMsg,
        response_schema: responseSchema,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "AI rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const suggestions = data.result;
    if (!suggestions) throw new Error("AI did not return suggestions");

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-cds error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
