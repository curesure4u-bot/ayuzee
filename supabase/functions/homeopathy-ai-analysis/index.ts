// Constitutional analysis using Lovable AI Gateway (Gemini)
// Returns: constitutional portrait, dominant miasm, suggested remedies, totality summary
import { requireUser, corsHeaders } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authed = await requireUser(req);
    if (authed instanceof Response) return authed;

    const body = await req.json();
    const { case_data } = body ?? {};
    if (!case_data || typeof case_data !== "object") {
      return new Response(JSON.stringify({ error: "case_data required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const c = case_data;
    const lines: string[] = [];
    if (c.patient) lines.push(`Patient: ${c.patient.full_name ?? "n/a"}, ${c.patient.age ?? "?"} y, ${c.patient.gender ?? "?"}`);
    if (c.patient?.chief_complaint) lines.push(`Chief complaint: ${c.patient.chief_complaint}`);
    if (c.patient?.chronicity) lines.push(`Chronicity: ${c.patient.chronicity}`);
    if (c.mind) lines.push(`MIND / mentals: ${c.mind}`);
    if (c.thermal_state) lines.push(`Thermal: ${c.thermal_state}`);
    if (c.thirst) lines.push(`Thirst: ${c.thirst}`);
    if (c.cravings) lines.push(`Cravings: ${c.cravings}`);
    if (c.aversions) lines.push(`Aversions: ${c.aversions}`);
    if (c.sleep) lines.push(`Sleep: ${c.sleep}`);
    if (c.dreams) lines.push(`Dreams: ${c.dreams}`);
    if (c.perspiration) lines.push(`Perspiration: ${c.perspiration}`);
    if (c.modalities_better) lines.push(`Better from: ${c.modalities_better}`);
    if (c.modalities_worse) lines.push(`Worse from: ${c.modalities_worse}`);
    if (c.past_history) lines.push(`Past history: ${c.past_history}`);
    if (c.family_history) lines.push(`Family history: ${c.family_history}`);

    const prompt = `You are a senior classical homeopathy clinician performing a CONSTITUTIONAL ANALYSIS using the totality of symptoms method (Hahnemann + Kentian principles + miasmatic evaluation).

CASE DATA:
${lines.join("\n")}

Apply the constitutional method:
1. Identify the WHOLE PERSON pattern (mentals → emotions → physical generals → particulars).
2. Weight peculiar / characteristic / strange / rare symptoms (Aphorism §153) highest.
3. Determine dominant miasm (Psora / Sycosis / Syphilis / Tubercular).
4. Build totality and propose 3–5 most similar remedies with reasoning.

Return STRICT JSON only:
{
  "constitutional_portrait": "2-3 sentence portrait of the patient as a whole person",
  "dominant_miasm": "Psora|Sycosis|Syphilis|Tubercular|Mixed",
  "miasm_reasoning": "1-2 sentences",
  "totality_summary": "the synthesized totality in 2-3 sentences",
  "characteristic_symptoms": ["peculiar symptom 1", "..."],
  "suggested_remedies": [
    { "name": "Remedy", "abbreviation": "Abbr", "match_strength": "high|medium|low", "reasoning": "why this remedy fits the constitution" }
  ],
  "differentiating_questions": ["q1?", "q2?", "q3?"],
  "clinical_caution": "any safety / aggravation note for the prescriber"
}`;

    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "homeopathy-ai-analysis",
        system: "You are a homeopathy clinical decision-support assistant grounded in classical Hahnemannian/Kentian methodology. Output only valid JSON.",
        prompt,
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit, retry shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("AI error", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await r.json();
    const raw = j.response ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { totality_summary: raw }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
