import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser } from "../_shared/auth.ts";

// Classical Reference Engine — searches across Charaka, Sushruta, Vagbhata
// Supports: full-text search, tag filtering, disease lookup, herb lookup

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

    const { query, text_filter, tag_filter, disease_filter,
            herb_filter, limit = 20, offset = 0 } = await req.json();

    if (!query && !tag_filter && !disease_filter && !herb_filter) {
      return json({ error: "Provide a search query or filter" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let dbQuery = supabase
      .from("classical_references")
      .select(`
        *,
        text:classical_texts(name, name_sanskrit, author, system)
      `)
      .order("relevance_score", { ascending: false })
      .range(offset, offset + limit - 1);

    // Full-text search
    if (query) {
      const tsQuery = query.trim().split(/\s+/).join(" & ");
      dbQuery = dbQuery.textSearch(
        "english_translation",
        tsQuery,
        { config: "english", type: "websearch" }
      );
    }

    // Filter by text (Charaka, Sushruta, etc.)
    if (text_filter) {
      const { data: textRow } = await supabase
        .from("classical_texts")
        .select("id")
        .ilike("name", `%${text_filter}%`)
        .limit(1)
        .maybeSingle();
      if (textRow) dbQuery = dbQuery.eq("text_id", textRow.id);
    }

    // Filter by clinical tags
    if (tag_filter) {
      dbQuery = dbQuery.contains("clinical_tags", [tag_filter]);
    }

    // Filter by disease
    if (disease_filter) {
      dbQuery = dbQuery.contains("diseases_mentioned", [disease_filter]);
    }

    // Filter by herb
    if (herb_filter) {
      dbQuery = dbQuery.contains("herbs_mentioned", [herb_filter]);
    }

    const { data: results, error, count } = await dbQuery;
    if (error) throw error;

    // Log search
    await supabase.from("classical_reference_searches").insert({
      user_id: userId,
      query: query || `tag:${tag_filter} disease:${disease_filter} herb:${herb_filter}`,
      filters: { text_filter, tag_filter, disease_filter, herb_filter },
      results_count: results?.length || 0,
    }).catch(() => {});

    // If no DB results and query provided, fall back to AI
    let aiResults: any[] = [];
    if ((!results || results.length === 0) && query) {
      aiResults = await aiReferenceSearch(req, query);
    }

    return json({
      query,
      filters: { text_filter, tag_filter, disease_filter, herb_filter },
      results: results || [],
      ai_results: aiResults,
      total: (results?.length || 0) + aiResults.length,
      source: (results?.length || 0) > 0 ? "database" : aiResults.length > 0 ? "ai" : "no_results",
    });
  } catch (e) {
    console.error("classical-reference-search error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

async function aiReferenceSearch(req: Request, query: string): Promise<any[]> {
  try {
    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "classical-reference-ai",
        system: `You are a scholar of Ayurvedic classical texts. Given a clinical query, provide relevant references from Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Bhavaprakasha, Madhava Nidana, and other classical texts. Include the Sthana, Adhyaya number, approximate verse range, and a concise English summary of what the text says about the queried topic. Only cite references you are confident about — do NOT fabricate chapter/verse numbers.`,
        prompt: `Find classical Ayurvedic text references for: "${query}"`,
        response_schema: {
          name: "classical_refs",
          description: "Classical text references for the query",
          parameters: {
            type: "object",
            properties: {
              references: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text_name: { type: "string" },
                    sthana: { type: "string" },
                    chapter: { type: "string" },
                    verse_range: { type: "string" },
                    summary: { type: "string" },
                    clinical_relevance: { type: "string" },
                    confidence: { type: "string", enum: ["high", "medium", "low"] },
                  },
                  required: ["text_name", "sthana", "chapter", "summary", "clinical_relevance"],
                },
              },
            },
            required: ["references"],
          },
        },
      }),
    });

    if (!aiResp.ok) return [];
    const data = await aiResp.json();
    return (data?.result?.references || []).map((r: any) => ({ ...r, source: "ai" }));
  } catch {
    return [];
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
