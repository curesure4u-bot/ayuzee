import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser } from "../_shared/auth.ts";

// Drug-Herb Interaction Checker — combines database lookup + AI inference
// 1. Searches known interactions in drug_herb_interactions table
// 2. If not found, uses AI to infer based on Rasa/Guna/Veerya/Vipaka + pharmacology

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const { substances, include_ai = true } = await req.json();

    if (!Array.isArray(substances) || substances.length < 2) {
      return json({ error: "Provide at least 2 substance names to check" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Step 1: Find matching substances in database
    const substanceNames = substances.map((s: string) => s.trim().toLowerCase());
    const { data: matchedSubs } = await supabase
      .from("interaction_substances")
      .select("id, name, name_sanskrit, category, rasa, guna, veerya, vipaka, common_uses")
      .or(substanceNames.map((n: string) => `name.ilike.%${n}%,name_sanskrit.ilike.%${n}%,botanical_name.ilike.%${n}%`).join(","));

    // Step 2: Find known interactions between matched substances
    const dbInteractions: any[] = [];
    if (matchedSubs && matchedSubs.length >= 2) {
      const subIds = matchedSubs.map((s: any) => s.id);
      const { data: interactions } = await supabase
        .from("drug_herb_interactions")
        .select(`
          *,
          substance_1:interaction_substances!substance_1_id(name, name_sanskrit, category),
          substance_2:interaction_substances!substance_2_id(name, name_sanskrit, category)
        `)
        .or(`substance_1_id.in.(${subIds.join(",")}),substance_2_id.in.(${subIds.join(",")})`)
        .or(`substance_1_id.in.(${subIds.join(",")}),substance_2_id.in.(${subIds.join(",")})`);

      if (interactions) {
        // Filter to only interactions between the queried substances
        for (const inter of interactions) {
          if (subIds.includes(inter.substance_1_id) && subIds.includes(inter.substance_2_id)) {
            dbInteractions.push(inter);
          }
        }
      }
    }

    // Step 3: AI inference for novel/unknown combinations
    let aiInteractions: any[] = [];
    if (include_ai && dbInteractions.length === 0) {
      aiInteractions = await inferWithAI(req, substances, matchedSubs || []);
    }

    // Log the search
    await supabase.from("interaction_search_logs").insert({
      user_id: userId,
      query_substances: substances,
      results_count: dbInteractions.length + aiInteractions.length,
      ai_used: aiInteractions.length > 0,
    }).catch(() => {});

    return json({
      query: substances,
      matched_substances: matchedSubs || [],
      database_interactions: dbInteractions.map(formatInteraction),
      ai_interactions: aiInteractions,
      source: dbInteractions.length > 0 ? "database" : aiInteractions.length > 0 ? "ai_inference" : "no_data",
      total_found: dbInteractions.length + aiInteractions.length,
    });
  } catch (e) {
    console.error("drug-interaction-check error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function formatInteraction(inter: any) {
  return {
    substance_1: inter.substance_1?.name || "Unknown",
    substance_2: inter.substance_2?.name || "Unknown",
    system_1: inter.substance_1?.category || "",
    system_2: inter.substance_2?.category || "",
    severity: inter.severity,
    interaction_type: inter.interaction_type,
    mechanism: inter.mechanism,
    clinical_effect: inter.clinical_effect,
    recommendation: inter.recommendation,
    evidence_level: inter.evidence_level,
    classical_reference: inter.classical_reference,
    modern_reference: inter.modern_reference,
    source: "database",
  };
}

async function inferWithAI(req: Request, substances: string[], matchedSubs: any[]): Promise<any[]> {
  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    // Build context from matched substance properties
    const subContext = matchedSubs.map((s: any) =>
      `${s.name} (${s.category}): Rasa=${(s.rasa||[]).join(",")}, Guna=${(s.guna||[]).join(",")}, Veerya=${s.veerya||"?"}, Vipaka=${s.vipaka||"?"}, Uses=${(s.common_uses||[]).join(",")}`
    ).join("\n");

    const prompt = `Analyze potential interactions between these substances: ${substances.join(" + ")}

Known properties from our database:
${subContext || "No database match — infer from known pharmacology."}

Provide interaction analysis considering:
1. Ayurvedic Viruddha Ahara principles (Samyoga/Veerya/Samskara/Krama Viruddha)
2. Rasa-Guna-Veerya-Vipaka compatibility
3. Modern pharmacological interactions (CYP450, absorption, pharmacodynamic)
4. Classical text references if applicable

Return JSON array of interactions found.`;

    // Use ai-gateway internally
    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "drug-interaction-ai",
        system: `You are an AYUSH pharmacology expert specializing in drug-herb interactions across Ayurveda, Homeopathy, Siddha, Unani, and Allopathy. Analyze interactions using both classical Ayurvedic principles (Viruddha Ahara, Rasa/Guna/Veerya/Vipaka analysis) and modern pharmacology (CYP450, absorption, pharmacodynamics). Always cite sources when possible. Be conservative — if unsure, say "insufficient evidence" rather than inventing.`,
        prompt,
        response_schema: {
          name: "interaction_analysis",
          description: "Drug/herb interaction analysis results",
          parameters: {
            type: "object",
            properties: {
              interactions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    substance_1: { type: "string" },
                    substance_2: { type: "string" },
                    severity: { type: "string", enum: ["critical", "high", "moderate", "low", "beneficial", "unknown"] },
                    interaction_type: { type: "string" },
                    mechanism: { type: "string" },
                    clinical_effect: { type: "string" },
                    recommendation: { type: "string" },
                    evidence_level: { type: "string" },
                    reference: { type: "string" },
                  },
                  required: ["substance_1", "substance_2", "severity", "mechanism", "clinical_effect", "recommendation"],
                },
              },
            },
            required: ["interactions"],
          },
        },
      }),
    });

    if (!aiResp.ok) return [];
    const data = await aiResp.json();
    const results = data?.result?.interactions || [];
    return results.map((r: any) => ({ ...r, source: "ai_inference" }));
  } catch (e) {
    console.error("AI inference failed:", e);
    return [];
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
