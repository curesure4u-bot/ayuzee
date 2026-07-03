import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser, getCorsHeaders } from "../_shared/auth.ts";
import { chatCompletion, getAiProviderName } from "../_shared/ai.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { query, candidates } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const candidateBlock = (candidates ?? []).slice(0, 60).map((r: any) =>
      `- ${r.name} (${r.abbreviation}): ${r.short_description ?? ""} | Keynotes: ${(r.keynotes ?? []).slice(0, 3).join("; ")}`
    ).join("\n");

    const systemPrompt = `You are a classical homeopathy clinical assistant. Given a doctor's symptom description, you suggest the top 5 most fitting remedies from the provided candidate list. Use Kent, Boericke and classical materia medica reasoning. Never invent remedies not in the list. Be concise and clinical.`;
    const userPrompt = `Doctor's case description:\n${query}\n\nCandidate remedies:\n${candidateBlock}\n\nReturn 5 best-matching remedies with reasoning.`;

    const tools = [{
      type: "function",
      function: {
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
      },
    }];

    const resp = await chatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "suggest_remedies" } },
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
        status: 429,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI provider error", resp.status, t, "provider=", getAiProviderName());
      return new Response(JSON.stringify({ error: "AI provider error" }), {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { suggestions: [] };

    return new Response(JSON.stringify(args), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("homeo-materia-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
