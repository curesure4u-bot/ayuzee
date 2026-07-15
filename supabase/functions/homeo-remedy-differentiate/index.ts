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

    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "homeo-remedy-differentiate",
        system: "You are a homeopathy clinical decision-support assistant. Output only valid JSON.",
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
