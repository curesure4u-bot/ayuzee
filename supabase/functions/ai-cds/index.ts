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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a senior Ayurveda + integrative medicine consultant. Given a partial EMR, suggest:
1. 3-5 most likely differential diagnoses (allopathic + Ayurvedic dosha-based).
2. Any drug-drug or herb-drug interaction warnings in the proposed prescription.
3. Relevant classical Ayurveda references (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) — chapter/sutra if known.
4. Red flags / when to refer.
Be specific, cite the dosha imbalance, and never fabricate citations — if unsure, say "general Ayurvedic principles".`;

    const tools = [
      {
        type: "function",
        function: {
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
        },
      },
    ];

    const userMsg = `Patient EMR:
- Chief complaint: ${chief_complaint || "—"}
- History: ${history || "—"}
- Examination: ${examination || "—"}
- Current assessment: ${assessment || "—"}
- Proposed prescription: ${prescription || "—"}
- Prakriti: ${prakriti || "Not assessed"}

Please return structured clinical suggestions.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMsg },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "clinical_suggestions" } },
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

    const json = await aiResp.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return suggestions");
    const suggestions = JSON.parse(toolCall.function.arguments);

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
