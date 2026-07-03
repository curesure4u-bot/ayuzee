import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser, getCorsHeaders } from "../_shared/auth.ts";

// AI natural-language → list of likely rubric IDs from the DB.
// Strategy: keyword extract via AI → trigram search rubrics → return matches.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query required" }), { status: 400, headers: getCorsHeaders(req) });
    }

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    // Step 1: extract symptom phrases via AI
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Patient says: "${query}"
Extract 4-10 short homeopathic rubric-style phrases (2-5 words each) capturing distinct symptoms, modalities (better/worse X), mental state, location, sensation. Lowercase, no punctuation. Examples: "sadness closed room", "better open air", "anger from contradiction", "headache worse sunlight".`,
        }],
        tools: [{
          type: "function",
          function: {
            name: "extract_phrases",
            parameters: {
              type: "object",
              properties: { phrases: { type: "array", items: { type: "string" } } },
              required: ["phrases"], additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_phrases" } },
      }),
    });
    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again shortly." }), { status: 429, headers: getCorsHeaders(req) });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Lovable AI credits exhausted." }), { status: 402, headers: getCorsHeaders(req) });
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: getCorsHeaders(req) });
    }
    const aiJson = await aiResp.json();
    const phrases: string[] = JSON.parse(aiJson.choices[0].message.tool_calls[0].function.arguments).phrases ?? [];

    // Step 2: for each phrase, find best matching rubrics via ilike on search_text
    const seen = new Set<string>();
    const matches: any[] = [];
    for (const p of phrases) {
      const term = p.replace(/[%_]/g, " ").trim();
      if (!term) continue;
      const { data } = await sb
        .from("homeo_symptoms")
        .select("id, chapter, subcategory, rubric, sub_rubric, body_location")
        .ilike("search_text", `%${term}%`)
        .limit(5);
      for (const row of data ?? []) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        matches.push({ ...row, matched_phrase: p });
        if (matches.length >= 30) break;
      }
      if (matches.length >= 30) break;
    }

    // Step 3: rank remedies on the union of matched rubrics
    let ranked: any[] = [];
    if (matches.length) {
      const ids = matches.map((m) => m.id);
      const { data: r } = await sb.rpc("homeo_repertorize", { _symptom_ids: ids });
      ranked = (r ?? []).slice(0, 10);
    }

    return new Response(JSON.stringify({ phrases, rubrics: matches, ranked }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("homeo-rubric-finder error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), { status: 500, headers: getCorsHeaders(req) });
  }
});
