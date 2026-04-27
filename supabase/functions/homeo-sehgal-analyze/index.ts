// Sehgal-method narrative analyzer:
// Input: free-text patient narrative + optional structured case fields
// Output: detected emotional themes, ranked remedies, suggested similimum, follow-up questions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { narrative, caseData } = await req.json();
    const text = String(narrative || "").trim();
    if (!text && !caseData) {
      return json({ error: "narrative or caseData required" }, 400);
    }

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load all themes (id, name, slug, triggers, reaction, description) — keep payload light
    const { data: themesRaw, error: tErr } = await sb
      .from("homeo_emotional_themes")
      .select("emotional_theme, slug, short_description, trigger_patterns, dominant_reaction, likely_remedies_ranked, differential_remedies, followup_questions")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (tErr) throw tErr;
    const themes = themesRaw ?? [];

    // Build a compact theme catalogue for the model (keep tokens low)
    const themeCatalogue = themes.map((t: any) => ({
      theme: t.emotional_theme,
      slug: t.slug,
      desc: t.short_description,
      triggers: (t.trigger_patterns ?? []).slice(0, 6),
      reactions: (t.dominant_reaction ?? []).slice(0, 6),
    }));

    const fullText = [
      text,
      caseData?.chief_complaint && `Chief: ${caseData.chief_complaint}`,
      caseData?.mental_state && `Mental: ${caseData.mental_state}`,
      caseData?.life_situation && `Life: ${caseData.life_situation}`,
      caseData?.significant_events && `Events: ${caseData.significant_events}`,
      caseData?.emotional_themes?.length && `Marked themes: ${caseData.emotional_themes.join(", ")}`,
      caseData?.fears?.length && `Fears: ${caseData.fears.join(", ")}`,
    ].filter(Boolean).join("\n");

    const systemPrompt = `You are a classical homeopath trained in Dr. M. L. Sehgal's "Revolutionised" method (perception/delusion-based prescribing).
Analyse the patient narrative and identify which emotional themes from the provided catalogue match.
Be conservative — only pick themes with clear textual evidence. For each detected theme, rate confidence 0–100 and quote the supporting phrase.
Return STRICT JSON via the provided tool. Do not invent themes outside the catalogue.`;

    const userPrompt = `THEME CATALOGUE (slug → description, triggers, reactions):
${JSON.stringify(themeCatalogue)}

PATIENT NARRATIVE & CASE:
${fullText}

Detect 3–6 most relevant themes (by slug). For each, give:
- confidence 0..100
- evidence: the exact phrase(s) from the narrative that support it
- reasoning: 1 short sentence

Also produce a "case_summary": 2-3 sentence Sehgalian portrait of the patient's mental state (perceptions / delusions / reactions).`;

    const tool = {
      type: "function",
      function: {
        name: "sehgal_analysis",
        description: "Return detected emotional themes with evidence and a case summary.",
        parameters: {
          type: "object",
          properties: {
            case_summary: { type: "string" },
            detected_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slug: { type: "string" },
                  confidence: { type: "number" },
                  evidence: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" },
                },
                required: ["slug", "confidence", "evidence", "reasoning"],
                additionalProperties: false,
              },
            },
          },
          required: ["case_summary", "detected_themes"],
          additionalProperties: false,
        },
      },
    };

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "sehgal_analysis" } },
      }),
    });

    if (aiResp.status === 429) return json({ error: "Rate limited. Please try again shortly." }, 429);
    if (aiResp.status === 402) return json({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }, 402);
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const ai = await aiResp.json();
    const toolCall = ai.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { case_summary: "", detected_themes: [] };
    const detected: { slug: string; confidence: number; evidence: string[]; reasoning: string }[] = args.detected_themes ?? [];

    // Map slugs back to themes & build remedy scores
    const themeBySlug = new Map(themes.map((t: any) => [t.slug, t]));
    const remedyScores = new Map<string, { score: number; themes: string[]; max_conf: number }>();
    const enriched = detected
      .filter((d) => themeBySlug.has(d.slug))
      .map((d) => {
        const t: any = themeBySlug.get(d.slug);
        const ranked: { remedy: string; score: number }[] = t.likely_remedies_ranked ?? [];
        // Contribute to remedy score: theme_remedy_score × confidence
        for (const r of ranked) {
          const key = r.remedy;
          const contribution = (r.score / 100) * d.confidence;
          const cur = remedyScores.get(key) ?? { score: 0, themes: [], max_conf: 0 };
          cur.score += contribution;
          cur.themes.push(t.emotional_theme);
          cur.max_conf = Math.max(cur.max_conf, d.confidence);
          remedyScores.set(key, cur);
        }
        return {
          theme: t.emotional_theme,
          slug: t.slug,
          short_description: t.short_description,
          confidence: d.confidence,
          evidence: d.evidence,
          reasoning: d.reasoning,
          ranked_remedies: ranked.slice(0, 5),
          differentials: t.differential_remedies ?? [],
          followup_questions: t.followup_questions ?? [],
        };
      })
      .sort((a, b) => b.confidence - a.confidence);

    const ranked_remedies = [...remedyScores.entries()]
      .map(([remedy, v]) => ({
        remedy,
        score: Math.round(v.score),
        themes_supporting: [...new Set(v.themes)],
        max_theme_confidence: v.max_conf,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const similimum = ranked_remedies[0]
      ? {
          remedy: ranked_remedies[0].remedy,
          score: ranked_remedies[0].score,
          rationale: `Top match across ${ranked_remedies[0].themes_supporting.length} detected theme(s): ${ranked_remedies[0].themes_supporting.join(", ")}.`,
        }
      : null;

    // Aggregate follow-up questions (de-duped, top 8)
    const followups = [...new Set(enriched.flatMap((e) => e.followup_questions))].slice(0, 8);

    return json({
      case_summary: args.case_summary || "",
      detected_themes: enriched,
      ranked_remedies,
      suggested_similimum: similimum,
      followup_questions: followups,
    });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
