import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 14 categories × counts = 1200 capacity, we cap at 1000
const CATEGORY_PLAN: Array<{ chapter: string; count: number; subcats: string[] }> = [
  { chapter: "Mind", count: 150, subcats: ["Anxiety","Anger","Grief","Fear","Delusions","Concentration","Memory","Sleeplessness mental"] },
  { chapter: "Head", count: 100, subcats: ["Headache","Vertigo","Scalp","Hair"] },
  { chapter: "EENT", count: 120, subcats: ["Eye","Ear","Nose","Throat"] },
  { chapter: "Digestive", count: 120, subcats: ["Mouth","Stomach","Appetite","Thirst","Nausea","Eructation"] },
  { chapter: "Abdomen", count: 80, subcats: ["Abdomen","Rectum","Stool","Constipation","Diarrhoea"] },
  { chapter: "Urinary", count: 50, subcats: ["Bladder","Urethra","Kidney","Urine"] },
  { chapter: "Female", count: 100, subcats: ["Menses","Leucorrhoea","Pregnancy","Lactation","Menopause"] },
  { chapter: "Male", count: 50, subcats: ["Genitalia","Erection","Prostate"] },
  { chapter: "Respiratory", count: 80, subcats: ["Cough","Larynx","Chest","Asthma","Expectoration"] },
  { chapter: "Musculoskeletal", count: 100, subcats: ["Back","Neck","Upper extremities","Lower extremities","Joints"] },
  { chapter: "Skin", count: 80, subcats: ["Eruptions","Itching","Ulcers","Discoloration"] },
  { chapter: "Sleep", count: 50, subcats: ["Sleeplessness","Dreams","Position","Waking"] },
  { chapter: "Generalities", count: 100, subcats: ["Fever","Chill","Perspiration","Weakness","Time aggravations","Weather"] },
  { chapter: "Pediatrics", count: 20, subcats: ["Dentition","Growth","Behaviour"] },
];

interface RubricRow {
  chapter: string;
  subcategory: string | null;
  rubric: string;
  sub_rubric: string | null;
  body_location: string | null;
  sensation: string | null;
  modalities_better: string[];
  modalities_worse: string[];
  symptom_keywords: string[];
  concomitant_symptoms: string[];
  notes: string | null;
  remedies: Array<{ abbr: string; grade: number }>;
}

async function callAI(authHeader: string, chapter: string, subcats: string[], count: number, knownAbbrs: string[]) {
  const resp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      feature: "homeo-seed-1000",
      prompt: `Generate exactly ${count} classical homeopathy rubrics for chapter "${chapter}".
Use these subcategories (rotate through them): ${subcats.join(", ")}.
Style: Kent / Boericke / Allen / Clarke (public-domain style — DO NOT copy proprietary text).
Each rubric must include 3-8 graded remedies (grade 1-4) using these exact abbreviations only: ${knownAbbrs.slice(0, 80).join(", ")}.
Each rubric: { chapter, subcategory, rubric (3-8 words), sub_rubric (modality/location, optional), body_location, sensation, modalities_better (1-4 short tags), modalities_worse (1-4 short tags), symptom_keywords (3-6 lowercase keywords for search), concomitant_symptoms (0-3 short phrases), notes (optional 1 short clinical line), remedies [{abbr, grade}] }.
Return ONLY via the tool call.`,
      response_schema: {
        name: "emit_rubrics",
        parameters: {
          type: "object",
          properties: {
            rubrics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter: { type: "string" },
                  subcategory: { type: "string" },
                  rubric: { type: "string" },
                  sub_rubric: { type: "string" },
                  body_location: { type: "string" },
                  sensation: { type: "string" },
                  modalities_better: { type: "array", items: { type: "string" } },
                  modalities_worse: { type: "array", items: { type: "string" } },
                  symptom_keywords: { type: "array", items: { type: "string" } },
                  concomitant_symptoms: { type: "array", items: { type: "string" } },
                  notes: { type: "string" },
                  remedies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: { abbr: { type: "string" }, grade: { type: "number" } },
                      required: ["abbr", "grade"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["chapter", "subcategory", "rubric", "symptom_keywords", "remedies"],
                additionalProperties: false,
              },
            },
          },
          required: ["rubrics"],
          additionalProperties: false,
        },
      },
    }),
  });
  if (!resp.ok) throw new Error(`AI ${resp.status}: ${await resp.text()}`);
  const j = await resp.json();
  return (j.result?.rubrics ?? []) as RubricRow[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace("Bearer ", "");
    const { data: ud } = await sb.auth.getUser(token);
    if (!ud.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: ud.user.id, _role: "admin" });
    const { data: isDoctor } = await sb.rpc("has_role", { _user_id: ud.user.id, _role: "doctor" });
    if (!isAdmin && !isDoctor) return new Response(JSON.stringify({ error: "Doctors/admins only" }), { status: 403, headers: corsHeaders });

    

    // Get current remedy abbrs
    const { data: remedies } = await sb.from("homeo_remedies").select("id, abbreviation");
    if (!remedies || remedies.length < 30) {
      return new Response(JSON.stringify({ error: "Run base homeo-seed first to populate remedies." }), { status: 400, headers: corsHeaders });
    }
    const abbrToId = new Map(remedies.map((r: any) => [r.abbreviation.toLowerCase(), r.id]));
    const knownAbbrs = remedies.map((r: any) => r.abbreviation);

    let totalRubrics = 0;
    let totalMappings = 0;
    const perChapter: Record<string, number> = {};

    // Chunk: max 50 rubrics per AI call to stay safe
    for (const cat of CATEGORY_PLAN) {
      let remaining = cat.count;
      perChapter[cat.chapter] = 0;
      while (remaining > 0) {
        const batch = Math.min(50, remaining);
        let rubrics: RubricRow[] = [];
        try {
          rubrics = await callAI(auth, cat.chapter, cat.subcats, batch, knownAbbrs);
        } catch (e) {
          console.error("AI batch failed", cat.chapter, e);
          break;
        }

        const rows = rubrics.map((r) => ({
          chapter: cat.chapter,
          subcategory: r.subcategory ?? null,
          rubric: r.rubric,
          sub_rubric: r.sub_rubric ?? null,
          body_location: r.body_location ?? null,
          sensation: r.sensation ?? null,
          modalities_better: r.modalities_better ?? [],
          modalities_worse: r.modalities_worse ?? [],
          symptom_keywords: r.symptom_keywords ?? [],
          concomitant_symptoms: r.concomitant_symptoms ?? [],
          notes: r.notes ?? null,
        }));

        const { data: inserted, error: insErr } = await sb
          .from("homeo_symptoms")
          .upsert(rows, { onConflict: "chapter,rubric,sub_rubric" })
          .select("id, rubric, sub_rubric");
        if (insErr) { console.error("insert symptoms error", insErr); break; }

        // Map rubric -> id (best effort by rubric+sub_rubric)
        const idByKey = new Map<string, string>();
        for (const row of inserted ?? []) {
          idByKey.set(`${row.rubric}|${row.sub_rubric ?? ""}`, row.id);
        }

        // Build mappings
        const mappings: any[] = [];
        for (let i = 0; i < rubrics.length; i++) {
          const r = rubrics[i];
          const sid = idByKey.get(`${r.rubric}|${r.sub_rubric ?? ""}`);
          if (!sid) continue;
          for (const rem of r.remedies ?? []) {
            const rid = abbrToId.get((rem.abbr || "").toLowerCase());
            if (!rid) continue;
            const grade = Math.max(1, Math.min(4, Math.round(rem.grade)));
            mappings.push({ symptom_id: sid, remedy_id: rid, grade });
          }
        }
        if (mappings.length) {
          for (let i = 0; i < mappings.length; i += 1000) {
            await sb.from("homeo_symptom_remedies").upsert(mappings.slice(i, i + 1000), { onConflict: "symptom_id,remedy_id" });
          }
          totalMappings += mappings.length;
        }
        totalRubrics += inserted?.length ?? 0;
        perChapter[cat.chapter] += inserted?.length ?? 0;
        remaining -= batch;
      }
    }

    // Final count
    const { count: finalCount } = await sb.from("homeo_symptoms").select("*", { count: "exact", head: true });

    return new Response(JSON.stringify({
      ok: true,
      added_rubrics: totalRubrics,
      added_mappings: totalMappings,
      per_chapter: perChapter,
      total_rubrics_in_db: finalCount,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("homeo-seed-1000 error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
