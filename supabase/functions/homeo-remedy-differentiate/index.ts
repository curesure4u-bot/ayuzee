// Differentiate 2-4 homeopathic remedies using Lovable AI
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { remedies, case_summary } = await req.json();
    if (!Array.isArray(remedies) || remedies.length < 2) {
      return new Response(JSON.stringify({ error: "Provide 2-4 remedies" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) throw new Error("LOVABLE_API_KEY missing");

    const list = remedies.map((r: any, i: number) =>
      `${i + 1}. ${r.name}${r.abbreviation ? ` (${r.abbreviation})` : ""}${r.keynotes?.length ? `\n   Keynotes: ${r.keynotes.slice(0, 5).join("; ")}` : ""}${r.short_description ? `\n   Note: ${r.short_description}` : ""}`,
    ).join("\n");

    const prompt = `You are a senior homeopathy clinician. Differentiate the following remedies for clinical decision-support. Be concise, original, and clinical.

REMEDIES:
${list}

${case_summary ? `CASE CONTEXT:\n${case_summary}\n` : ""}
Return strict JSON with this shape:
{
  "comparison": [
    { "remedy": "Name", "core_picture": "...", "distinguishing_marks": ["...", "..."], "best_when": "...", "avoid_if": "..." }
  ],
  "differentiating_questions": ["question 1?", "question 2?", "question 3?"],
  "summary": "1-2 sentence guidance for the prescriber"
}`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a homeopathy clinical decision-support assistant. Output only valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
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
    const raw = j.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch { parsed = { summary: raw }; }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
