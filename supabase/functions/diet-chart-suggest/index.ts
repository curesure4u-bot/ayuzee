// diet-chart-suggest — takes patient prakriti/vikriti/goals/restrictions,
// pulls matching foods from food_items, then asks Claude via ai-gateway to
// build a one-day meal plan using ONLY those foods. Returns a draft, does
// NOT persist to diet_chart_items — Vaidya must review and approve.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESPONSE_SCHEMA = {
  name: "diet_chart_suggestion",
  description: "Suggested one-day meal plan drawn from a shortlist of real foods.",
  parameters: {
    type: "object",
    properties: {
      meals: {
        type: "array",
        items: {
          type: "object",
          properties: {
            meal_type: { type: "string", enum: ["breakfast", "lunch", "dinner", "snack"] },
            food_item_id: { type: "string", description: "Must be one of the provided shortlist IDs." },
            food_name: { type: "string" },
            quantity: { type: "number" },
            unit: { type: "string" },
            reason: { type: "string", description: "One-line Ayurvedic reason." },
          },
          required: ["meal_type", "food_item_id", "food_name", "quantity", "unit", "reason"],
        },
      },
      summary: { type: "string", description: "1-2 line rationale for the whole day." },
    },
    required: ["meals", "summary"],
    additionalProperties: false,
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const prakriti = String(body?.prakriti ?? "").trim();
    const vikriti = String(body?.vikriti_notes ?? "").trim();
    const goals = String(body?.health_goals ?? "").trim();
    const restrictions = String(body?.dietary_restrictions ?? "").trim();

    if (!prakriti) return json({ error: "prakriti is required" }, 400);

    // Determine aggravated dosha priorities from vikriti_notes, else from prakriti weakness
    const focus: Record<string, boolean> = {
      vata: /vata/i.test(vikriti || prakriti),
      pitta: /pitta/i.test(vikriti || prakriti),
      kapha: /kapha/i.test(vikriti || prakriti),
    };

    // Build query: foods that PACIFY the flagged doshas (negative dosha_effect)
    let query = supabase.from("food_items").select(
      "id,name,category,rasa,virya,dosha_effect_vata,dosha_effect_pitta,dosha_effect_kapha,calories_per_100g,protein_g",
    ).limit(60);

    const orClauses: string[] = [];
    if (focus.vata) orClauses.push("dosha_effect_vata.lte.0");
    if (focus.pitta) orClauses.push("dosha_effect_pitta.lte.0");
    if (focus.kapha) orClauses.push("dosha_effect_kapha.lte.0");
    if (orClauses.length) query = query.or(orClauses.join(","));

    const { data: foods, error: fErr } = await query;
    if (fErr) throw fErr;
    if (!foods || foods.length === 0) {
      return json({ error: "No matching foods in database. Ask admin to seed food_items first." }, 400);
    }

    const shortlist = foods.map((f: any) =>
      `- [${f.id}] ${f.name} (${f.category ?? "—"}) · rasa:${(f.rasa ?? []).join("/")} · virya:${f.virya} · V/P/K:${f.dosha_effect_vata}/${f.dosha_effect_pitta}/${f.dosha_effect_kapha}${f.calories_per_100g ? ` · ${f.calories_per_100g}kcal/100g` : ""}`
    ).join("\n");

    const prompt = `
Patient profile:
- Prakriti: ${prakriti}
- Vikriti / current imbalance: ${vikriti || "—"}
- Health goals: ${goals || "—"}
- Dietary restrictions: ${restrictions || "—"}

Available foods (use ONLY these; the food_item_id MUST match one of the bracketed IDs):
${shortlist}

Build a balanced one-day meal plan (breakfast, lunch, dinner, and one snack) using only foods from the shortlist. For each meal item give a realistic quantity + unit (g, ml, katori, piece) and a one-line Ayurvedic reason (e.g. "cooling to pacify pitta", "grounding for vata"). Follow classical Ahara-vidhi: warm cooked meals, largest at midday, light dinner. Respect dietary restrictions strictly. Return ONLY the structured tool output.
    `.trim();

    const gwResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "diet-chart-suggest",
        system: "You are an Ayurveda diet assistant helping a licensed Vaidya draft a one-day meal plan. Use ONLY foods provided in the shortlist. Never invent foods. The Vaidya reviews before it reaches the patient.",
        prompt,
        response_schema: RESPONSE_SCHEMA,
        max_tokens: 1800,
      }),
    });

    if (gwResp.status === 429) return json({ error: "Rate limited, try again shortly." }, 429);
    if (gwResp.status === 402) return json({ error: "AI credits exhausted." }, 402);
    if (!gwResp.ok) {
      const t = await gwResp.text();
      console.error("ai-gateway error", gwResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const gwData = await gwResp.json();
    const result = gwData?.result;
    if (!result || typeof result !== "object") {
      return json({ error: "AI did not return structured suggestion" }, 502);
    }

    // Filter meals whose food_item_id isn't in the shortlist (guard against hallucination)
    const allowed = new Set(foods.map((f: any) => f.id));
    const meals = (Array.isArray(result.meals) ? result.meals : []).filter((m: any) => allowed.has(m.food_item_id));

    return json({
      summary: result.summary ?? "",
      meals,
      shortlist_count: foods.length,
      draft: true,
    });
  } catch (e) {
    console.error("diet-chart-suggest error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
