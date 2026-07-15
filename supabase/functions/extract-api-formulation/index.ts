import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an expert extracting data from the Ayurvedic Pharmacopoeia of India (API)
Part II — the official Government of India quality standard for Ayurvedic compound formulations.

STRUCTURE OF EACH MONOGRAPH:
- Name in CAPS at top
- AFI cross-reference line: "AFI, Part-I, 3:11"
- Definition line
- Formulation composition: numbered list — Sanskrit name | Botanical name | (API-Vol:X/Y) | (Part) | quantity
- Method of preparation
- Description: colour, texture, odour, taste
- Identification (Microscopy + TLC) — SKIP these sections, too technical
- Physico-chemical parameters: Loss on drying, Total ash, Acid-insoluble ash, Alcohol extractive, Water extractive, pH
- Storage conditions
- Therapeutic uses
- Dose
- Anupana (vehicle/adjuvant)

RULES:
1. If page has NO formulation monograph, return {"skip": true}.
2. Appendix pages (Tests, Determinations, Reagents), TOC, general descriptions — return {"skip": true}.
3. Quantities can be "1 part", "2 parts", "Q.S." (quantum sufficit), or actual weights.
4. Part codes: Rt.=Root, St.Bk.=Stem Bark, Fr.=Fruit, Fl.=Flower, Rz.=Rhizome,
   Sd.=Seed, Lf.=Leaf, Pl.=Whole Plant, Ht.Wd.=Heartwood, Gl.=Gall, P.=Pericarp.
5. Formulation type codes: AVALEHA, ASAVA_ARISHTA, CHURNA, GHRITA, GUGGULU, TAILA, VATI_GUTIKA.
6. For physicochemical: extract only numeric limits, not Appendix references.
7. Devanagari Sanskrit text — SKIP.

Return ONLY valid JSON (no markdown fences, no preamble). Format:
{
  "name": "Astangavaleha",
  "name_original": "AṢṬĀṄGĀVALEHA",
  "api_afi_crossref": "AFI, Part-II, 3:1",
  "formulation_type": "AVALEHA",
  "definition": "...",
  "description_colour": "blackish brown coloured",
  "description_texture": "semisolid sticky paste",
  "description_odour": "odour pleasant",
  "description_taste": "taste bitter, astringent and spicy",
  "storage_conditions": "Store in a cool place ...",
  "therapeutic_uses": "Vatakaphajvara (Fever), Kasa (Cough)",
  "indications": ["Vatakaphajvara","Kasa"],
  "indications_modern": ["Fever","Cough"],
  "dose": "3 to 5 g daily in divided doses",
  "dose_min": "3",
  "dose_max": "5",
  "dose_unit": "g",
  "anupana": "Water",
  "ph_min": 6.3, "ph_max": 6.6, "ph_solution_concentration": "1%",
  "loss_on_drying_max": 32.0,
  "total_ash_max": 2.70,
  "acid_insoluble_ash_max": 0.50,
  "alcohol_extractive_min": 51.0,
  "water_extractive_min": 47.0,
  "has_physicochemical_standards": true,
  "ingredients": [
    {"serial_number":1,"sanskrit_name":"Katphala","botanical_name":"Myrica esculenta Buch-Ham. Ex. D.Don.","common_name":null,"api_vol_ref":"API-Vol:3/92","part_used":"St.Bk.","part_used_full":"Stem Bark","quantity":"1","quantity_unit":"part","is_prakshepa":false}
  ]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc("is_admin_or_super", { _user_id: userData.user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { page_text, api_volume, page_number } = await req.json();
    if (!page_text || typeof page_text !== "string") {
      return new Response(JSON.stringify({ error: "page_text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiRes = await fetch(`${SUPABASE_URL}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "extract-api-formulation",
        system: SYSTEM_PROMPT,
        prompt: `Volume: ${api_volume}, Page: ${page_number}\n\nPAGE TEXT:\n${page_text}`,
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: txt }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const rawContent: string = aiJson.response ?? "";

    let extracted: any;
    try {
      extracted = JSON.parse(rawContent.replace(/```json|```/g, "").trim());
    } catch {
      return new Response(JSON.stringify({ error: "Parse failed", raw: rawContent, page: page_number }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (extracted.skip || !extracted.name) {
      return new Response(JSON.stringify({ status: "skipped", page: page_number }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let typeId: string | null = null;
    if (extracted.formulation_type) {
      const { data: typeRow } = await admin
        .from("afi_formulation_types")
        .select("id")
        .eq("code", extracted.formulation_type)
        .maybeSingle();
      typeId = typeRow?.id ?? null;
    }

    // Check if formulation already exists (by case-insensitive name) — API enriches AFI
    const { data: existing } = await admin
      .from("afi_formulations")
      .select("id")
      .ilike("name", extracted.name)
      .maybeSingle();

    const apiPayload: Record<string, unknown> = {
      name: extracted.name,
      name_original: extracted.name_original ?? null,
      formulation_type_id: typeId,
      api_volume: api_volume ?? null,
      api_afi_crossref: extracted.api_afi_crossref ?? null,
      description_colour: extracted.description_colour ?? null,
      description_texture: extracted.description_texture ?? null,
      description_odour: extracted.description_odour ?? null,
      description_taste: extracted.description_taste ?? null,
      dose: extracted.dose ?? null,
      dose_min: extracted.dose_min ?? null,
      dose_max: extracted.dose_max ?? null,
      dose_unit: extracted.dose_unit ?? null,
      anupana: extracted.anupana ?? null,
      indications: extracted.indications ?? null,
      indications_modern: extracted.indications_modern ?? null,
      storage_conditions: extracted.storage_conditions ?? null,
      ph_min: extracted.ph_min ?? null,
      ph_max: extracted.ph_max ?? null,
      ph_solution_concentration: extracted.ph_solution_concentration ?? null,
      loss_on_drying_max: extracted.loss_on_drying_max ?? null,
      total_ash_max: extracted.total_ash_max ?? null,
      acid_insoluble_ash_max: extracted.acid_insoluble_ash_max ?? null,
      alcohol_extractive_min: extracted.alcohol_extractive_min ?? null,
      water_extractive_min: extracted.water_extractive_min ?? null,
      has_physicochemical_standards: !!extracted.has_physicochemical_standards,
      raw_text: page_text,
      extraction_status: "extracted",
      data_source: "API",
    };

    let formulationId: string;
    if (existing?.id) {
      // Enrich existing record — only set API fields, don't overwrite AFI fields with null
      const enrich: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(apiPayload)) {
        if (v !== null && v !== undefined) enrich[k] = v;
      }
      const { error: updErr } = await admin
        .from("afi_formulations")
        .update(enrich)
        .eq("id", existing.id);
      if (updErr) {
        return new Response(JSON.stringify({ error: updErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      formulationId = existing.id;
    } else {
      const { data: ins, error: insErr } = await admin
        .from("afi_formulations")
        .insert(apiPayload)
        .select("id")
        .single();
      if (insErr || !ins) {
        return new Response(JSON.stringify({ error: insErr?.message ?? "Insert failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      formulationId = ins.id;
    }

    // Replace botanical names for this formulation (idempotent re-runs)
    if (Array.isArray(extracted.ingredients) && extracted.ingredients.length > 0) {
      await admin.from("api_botanical_names").delete().eq("formulation_id", formulationId);
      const botanicals = extracted.ingredients.map((ing: any) => ({
        formulation_id: formulationId,
        ingredient_serial: ing.serial_number ?? null,
        sanskrit_name: ing.sanskrit_name ?? null,
        botanical_name: ing.botanical_name ?? null,
        common_name: ing.common_name ?? null,
        api_part_vol_ref: ing.api_vol_ref ?? null,
        part_used: ing.part_used ?? null,
        part_used_full: ing.part_used_full ?? null,
        quantity_ratio: ing.quantity != null
          ? `${ing.quantity}${ing.quantity_unit ? " " + ing.quantity_unit : ""}`
          : null,
        is_prakshepa: !!ing.is_prakshepa,
      }));
      await admin.from("api_botanical_names").insert(botanicals);
    }

    await admin.from("afi_extraction_log").insert({
      formulation_id: formulationId,
      action: existing?.id ? "api_enriched" : "extracted",
      performed_by: userData.user.id,
      notes: `Page ${page_number} of ${api_volume}`,
    });

    return new Response(JSON.stringify({
      status: "success",
      formulation_id: formulationId,
      name: extracted.name,
      page: page_number,
      has_standards: !!extracted.has_physicochemical_standards,
      ingredients_count: extracted.ingredients?.length ?? 0,
      enriched: !!existing?.id,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
