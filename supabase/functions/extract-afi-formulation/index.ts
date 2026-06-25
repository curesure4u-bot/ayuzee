import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an expert in Ayurvedic pharmacology extracting structured data from the
Ayurvedic Formulary of India (AFI), a Government of India official publication.

IMPORTANT RULES:
1. Each formulation starts with a pattern like "1 : 1 ABHAYARISHTA" (section:number NAME).
2. Classical reference appears in parentheses below the name (e.g. "Bhaishajyaratnavali, Arshorogadhikara: 105-110").
3. Ingredients are numbered lists: Name (Common name) | (Part code) | quantity unit.
4. "Dose" and "Important Therapeutic Uses" appear at the end.
5. Devanagari Sanskrit text (looks like "+¦ÉªÉÉªÉÉºiÉÖ...") — SKIP, do not include.
6. Part codes: P.=Pericarp, Dr.Fr.=Dried Fruit, Fr.=Fruit, Fl.=Flower, Rt.=Root,
   St.Bk.=Stem Bark, Rz.=Rhizome, Sd.=Seed, Lf.=Leaf, Pl.=Whole Plant,
   Ht.Wd.=Heartwood, Exd.=Exudate, Res.Enc.=Resinous Encrustation.
7. If the page has NO formulation (table of contents, intro, glossary), return {"skip": true}.
8. Formulation type codes: ASAVA_ARISHTA, ARKA, AVALEHA, KVATHA_CHURNA, GUGGULU, GHRITA,
   CHURNA, TAILA, VATI_GUTIKA, VARTI_NETRA, KUPIPAKVA, PARPATI, PISHTI, BHASMA, MANDURA,
   RASAYOGA, LAUHA.

Return ONLY valid JSON (no markdown fences, no preamble). Format:
{
  "afi_number": "1:1",
  "name": "Abhayarishta",
  "name_original": "ABHAYĀRIṢṬA",
  "classical_reference": "Bhaishajyaratnavali, Arshorogadhikara: 105-110",
  "classical_text": "Bhaishajyaratnavali",
  "chapter_reference": "Arshorogadhikara",
  "verse_numbers": "105-110",
  "formulation_type": "ASAVA_ARISHTA",
  "dose": "12 to 24 ml",
  "dose_min": "12",
  "dose_max": "24",
  "dose_unit": "ml",
  "indications": ["Arsha","Udara","Mutra Vibandha"],
  "indications_modern": ["Haemorrhoids","Diseases of abdomen","Retention of urine"],
  "special_notes": null,
  "ingredients": [
    {"serial_number":1,"name":"Abhaya (Haritaki)","name_sanskrit":"Abhaya","common_name":"Haritaki","part_used":"P.","part_used_full":"Pericarp","quantity":4.800,"unit":"kg","is_prakshepa":false}
  ]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth: only admins may invoke
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

    const { page_text, afi_part, page_number } = await req.json();
    if (!page_text || typeof page_text !== "string") {
      return new Response(JSON.stringify({ error: "page_text required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Call Lovable AI Gateway
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `AFI Part ${afi_part}, Page ${page_number}\n\nPAGE TEXT:\n${page_text}` },
        ],
        response_format: { type: "json_object" },
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
    const rawContent: string = aiJson.choices?.[0]?.message?.content ?? "";

    let extracted: any;
    try {
      extracted = JSON.parse(rawContent.replace(/```json|```/g, "").trim());
    } catch {
      return new Response(JSON.stringify({ error: "Parse failed", raw: rawContent, page: page_number }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (extracted.skip) {
      return new Response(JSON.stringify({ status: "skipped", page: page_number }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Lookup formulation type id
    let typeId: string | null = null;
    if (extracted.formulation_type) {
      const { data: typeRow } = await admin
        .from("afi_formulation_types")
        .select("id")
        .eq("code", extracted.formulation_type)
        .maybeSingle();
      typeId = typeRow?.id ?? null;
    }

    const { data: formulation, error: formError } = await admin
      .from("afi_formulations")
      .insert({
        afi_number: extracted.afi_number ?? null,
        afi_part: afi_part ?? null,
        name: extracted.name ?? "Unknown",
        name_original: extracted.name_original ?? null,
        formulation_type_id: typeId,
        classical_reference: extracted.classical_reference ?? null,
        classical_text: extracted.classical_text ?? null,
        chapter_reference: extracted.chapter_reference ?? null,
        verse_numbers: extracted.verse_numbers ?? null,
        dose: extracted.dose ?? null,
        dose_min: extracted.dose_min ?? null,
        dose_max: extracted.dose_max ?? null,
        dose_unit: extracted.dose_unit ?? null,
        indications: extracted.indications ?? null,
        indications_modern: extracted.indications_modern ?? null,
        special_notes: extracted.special_notes ?? null,
        raw_text: page_text,
        extraction_status: "extracted",
      })
      .select("id")
      .single();

    if (formError || !formulation) {
      return new Response(JSON.stringify({ error: formError?.message ?? "Insert failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (Array.isArray(extracted.ingredients) && extracted.ingredients.length > 0) {
      const ingredients = extracted.ingredients.map((ing: any) => ({
        formulation_id: formulation.id,
        serial_number: ing.serial_number ?? null,
        name: ing.name ?? "Unknown",
        name_sanskrit: ing.name_sanskrit ?? null,
        common_name: ing.common_name ?? null,
        part_used: ing.part_used ?? null,
        part_used_full: ing.part_used_full ?? null,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        is_prakshepa: ing.is_prakshepa ?? false,
        notes: ing.notes ?? null,
      }));
      await admin.from("afi_ingredients").insert(ingredients);
    }

    await admin.from("afi_extraction_log").insert({
      formulation_id: formulation.id,
      action: "extracted",
      performed_by: userData.user.id,
      notes: `Page ${page_number} of AFI Part ${afi_part}`,
    });

    return new Response(JSON.stringify({
      status: "success",
      formulation_id: formulation.id,
      name: extracted.name,
      page: page_number,
      ingredients_count: extracted.ingredients?.length ?? 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
