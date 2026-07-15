import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { query, candidates } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidateBlock = (candidates ?? []).slice(0, 60).map((r: any) =>
      `- ${r.name} (${r.abbreviation}): ${r.short_description ?? ""} | Keynotes: ${(r.keynotes ?? []).slice(0, 3).join("; ")}`
    ).join("\n");

    const systemPrompt = `You are a classical homeopathy clinical assistant. Given a doctor's symptom description, you suggest the top 5 most fitting remedies from the provided candidate list. Use Kent, Boericke and classical materia medica reasoning. Never invent remedies not in the list. Be concise and clinical.`;

    const userPrompt = `Doctor's case description:\n${query}\n\nCandidate remedies:\n${candidateBlock}\n\nReturn 5 best-matching remedies with reasoning.`;

    const responseSchema = {
      name: "suggest_remedies",
      description: "Return ranked remedy suggestions with reasoning",
      parameters: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                remedy_name: { type: "string" },
                abbreviation: { type: "string" },
                confidence: { type: "string", enum: ["high", "medium", "low"] },
                reasoning: { type: "string" },
                keynotes_matched: { type: "array", items: { type: "string" } },
              },
              required: ["remedy_name", "abbreviation", "confidence", "reasoning"],
              additionalProperties: false,
            },
          },
        },
        required: ["suggestions"],
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
        feature: "homeo-materia-ai",
        system: systemPrompt,
        prompt: userPrompt,
        response_schema: responseSchema,
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const args = data.result ?? { suggestions: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("homeo-materia-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
