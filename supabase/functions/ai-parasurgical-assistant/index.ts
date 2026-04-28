// Ayuzee Para-Surgical Therapy AI assistant
// Suggests likely pain generator, ranked procedure options, candidate points,
// risks, and a combined protocol. Decision support only — not auto-prescribing.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CaseInput {
  patient_name?: string;
  age?: number;
  gender?: string;
  chief_complaint?: string;
  pain_location?: string;
  duration?: string;
  pain_severity?: number;
  radiation?: string;
  numbness?: boolean;
  stiffness?: boolean;
  swelling?: boolean;
  rom_restriction?: string;
  previous_treatment?: string;
  diabetes?: boolean;
  hypertension?: boolean;
  bleeding_history?: boolean;
  surgery_history?: string;
  posture_issues?: string;
  lifestyle_factors?: string;
  doctor_notes?: string;
  contraindications?: string[];
}

const PROCEDURES = [
  "Agni Karma",
  "Viddha Karma",
  "Marma Therapy",
  "Varmam Therapy",
  "Acupuncture Therapy",
  "Tung's Acupuncture Therapy",
  "Dry Needling Therapy",
  "Cupping / Hijama Support",
  "Manual Therapy",
  "Conservative Rehab / Yoga",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = (await req.json()) as { case: CaseInput };
    const c = body?.case ?? {};

    const sysPrompt = `You are an AYUSH para-surgical clinical decision support assistant.
You assist qualified doctors only. You DO NOT auto-prescribe.
Always remind that the final decision rests with the licensed clinician.
Output strictly via the suggested tool function.

Available procedures: ${PROCEDURES.join(", ")}.
Score each suggestion 0-100 by symptom-procedure fit, considering chronicity,
tissue involved, nerve signs, contraindications, and patient safety.`;

    const userPrompt = `Patient case (decision support):
${JSON.stringify(c, null, 2)}

Tasks:
1. Identify likely pain generator(s).
2. Rank up to 5 best procedures from the list with confidence %.
3. Suggest candidate point names (Marma/Acu/Tung/TrP) relevant to the location.
4. List safety risks / contraindication red flags.
5. Suggest a combined protocol (1-2 sentences).`;

    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: sysPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "parasurgical_recommendation",
                description:
                  "Structured procedural recommendation for AYUSH para-surgical therapy.",
                parameters: {
                  type: "object",
                  properties: {
                    likely_pain_generator: { type: "string" },
                    suggestions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          procedure: { type: "string", enum: PROCEDURES },
                          confidence: { type: "number" },
                          rationale: { type: "string" },
                        },
                        required: ["procedure", "confidence", "rationale"],
                      },
                    },
                    candidate_points: {
                      type: "array",
                      items: { type: "string" },
                    },
                    risks: { type: "array", items: { type: "string" } },
                    combined_protocol: { type: "string" },
                    disclaimer: { type: "string" },
                  },
                  required: [
                    "likely_pain_generator",
                    "suggestions",
                    "candidate_points",
                    "risks",
                    "combined_protocol",
                    "disclaimer",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "parasurgical_recommendation" },
          },
        }),
      },
    );

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (resp.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Workspace settings.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: unknown = null;
    if (toolCall?.function?.arguments) {
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (_e) {
        parsed = null;
      }
    }

    return new Response(
      JSON.stringify({
        result:
          parsed ??
          {
            likely_pain_generator: "Unavailable",
            suggestions: [],
            candidate_points: [],
            risks: [],
            combined_protocol: "",
            disclaimer:
              "Decision support only. A licensed clinician must approve.",
          },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("ai-parasurgical-assistant error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
