import { requireUser } from "../_shared/auth.ts";
// AI Panchakarma planner — generates a day-wise schedule based on indication, prakriti, vikriti, and primary procedure
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { indication, prakriti, vikriti, primary_procedure, total_days, patient_age, patient_gender, notes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a senior Panchakarma Vaidya. Design a complete day-wise Panchakarma protocol following classical Ayurveda (Charaka Samhita Sutrasthana, Ashtanga Hridaya) divided into three phases:
1. Purvakarma (preparatory): Snehana (oleation - internal & external), Swedana (sudation)
2. Pradhanakarma (main): Vamana / Virechana / Basti (Anuvasana & Niruha) / Nasya / Raktamokshana
3. Paschatkarma (post-care): Samsarjana Krama (graded diet), Rasayana, lifestyle

For each day specify: phase, procedure, medicines (with classical formulations), diet, duration in minutes, and notes. Be specific to the patient's prakriti and indication. Include rest days where appropriate.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "panchakarma_plan",
          description: "Return a day-wise panchakarma protocol",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Overall plan summary and rationale" },
              precautions: { type: "array", items: { type: "string" } },
              expected_outcomes: { type: "array", items: { type: "string" } },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day_number: { type: "number" },
                    phase: { type: "string", enum: ["purvakarma", "pradhanakarma", "paschatkarma"] },
                    procedure: { type: "string" },
                    medicines: { type: "string" },
                    diet: { type: "string" },
                    duration_minutes: { type: "number" },
                    notes: { type: "string" },
                  },
                  required: ["day_number", "phase", "procedure", "medicines", "diet", "duration_minutes", "notes"],
                  additionalProperties: false,
                },
              },
            },
            required: ["summary", "precautions", "expected_outcomes", "days"],
            additionalProperties: false,
          },
        },
      },
    ];

    const userMsg = `Patient profile:
- Age: ${patient_age || "—"} | Gender: ${patient_gender || "—"}
- Indication / Disease: ${indication}
- Prakriti (constitution): ${prakriti || "Not assessed"}
- Vikriti (current imbalance): ${vikriti || "—"}
- Primary procedure requested: ${primary_procedure || "Doctor's discretion"}
- Total days: ${total_days || 14}
- Additional notes: ${notes || "—"}

Generate a complete ${total_days || 14}-day Panchakarma plan with all three phases.`;

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
        tool_choice: { type: "function", function: { name: "panchakarma_plan" } },
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
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return a plan");
    const plan = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-panchakarma-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
