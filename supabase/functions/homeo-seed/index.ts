import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Curated classical remedies (top of materia medica)
const REMEDIES = [
  ["Aconitum napellus", "Acon.", "Aconite", "Sudden violent onset after dry cold wind, fear of death, restlessness", "hot", "increased", ["fear","cold wind","sudden onset"]],
  ["Arnica montana", "Arn.", "Leopard's bane", "Trauma, bruises, sore-bruised feeling, says he is well when ill", "hot", "decreased", ["trauma","bruise","sore"]],
  ["Belladonna", "Bell.", "Deadly nightshade", "Sudden violent inflammation, red hot skin, throbbing, dilated pupils", "hot", "decreased", ["red","throbbing","heat"]],
  ["Bryonia alba", "Bry.", "White bryony", "Worse motion, irritable, thirst large quantities, dry mucous membranes", "hot", "increased", ["motion worse","dryness","irritable"]],
  ["Calcarea carbonica", "Calc.", "Calcium carbonate", "Sweating head, dentition, chilly damp, slow development, fear of misfortune", "cold", "decreased", ["chilly","sweating head","fear"]],
  ["Chamomilla", "Cham.", "German chamomile", "Irritable child, one cheek red one pale, ameliorated by being carried", "hot", "increased", ["irritable","carried","teething"]],
  ["China officinalis", "Chin.", "Cinchona bark", "After loss of fluids, debility, periodic neuralgias, abdominal bloating", "cold", "decreased", ["debility","periodic","fluid loss"]],
  ["Gelsemium", "Gels.", "Yellow jasmine", "Drowsy droopy dull, anticipatory anxiety, trembling weakness", "hot", "decreased", ["dullness","anticipation","trembling"]],
  ["Hepar sulphuris", "Hep.", "Hahnemann's calcium sulphide", "Splinter-like pains, oversensitive, suppurative tendency, very chilly", "cold", "increased", ["sensitive","splinter pain","suppuration"]],
  ["Ignatia amara", "Ign.", "St. Ignatius bean", "Grief, sighing, contradictory symptoms, globus hystericus", "hot", "decreased", ["grief","sighing","paradox"]],
  ["Kali bichromicum", "Kali-bi.", "Potassium bichromate", "Stringy ropy discharges, ulcers with punched out edges, sinus", "cold", "decreased", ["ropy mucus","sinus","ulcer"]],
  ["Lachesis", "Lach.", "Bushmaster snake", "Worse left side, worse sleep, loquacity, intolerance of constriction", "hot", "decreased", ["left sided","loquacity","constriction"]],
  ["Lycopodium", "Lyc.", "Club moss", "Right sided, 4–8 pm aggravation, gas bloating, lack of confidence", "hot", "decreased", ["right sided","4-8 pm","bloating"]],
  ["Mercurius solubilis", "Merc.", "Quicksilver", "Profuse offensive sweat without relief, salivation, ulcers, tremor", "hot", "increased", ["sweat offensive","salivation","tremor"]],
  ["Natrum muriaticum", "Nat-m.", "Sodium chloride", "Silent grief, sun headache, dryness, craves salt, aversion to consolation", "cold", "increased", ["grief","salt craving","sun"]],
  ["Nux vomica", "Nux-v.", "Poison nut", "Overworked irritable executive, oversensitive to stimuli, ineffectual urging", "cold", "decreased", ["irritable","stimulants","urging"]],
  ["Phosphorus", "Phos.", "Phosphorus", "Tall slender thirsty for cold drinks, sympathetic, fear of dark, hemorrhages", "hot", "increased", ["sympathy","cold drinks","bleeding"]],
  ["Pulsatilla", "Puls.", "Wind flower", "Mild weepy yielding, changeable, worse warm room, thirstless, craves open air", "hot", "decreased", ["weepy","changeable","open air"]],
  ["Rhus toxicodendron", "Rhus-t.", "Poison oak", "Restless, worse first motion better continued, worse damp cold", "cold", "decreased", ["rusty hinge","restless","damp"]],
  ["Sepia", "Sep.", "Cuttlefish ink", "Indifference to loved ones, sagging organs, chilly, better vigorous exercise", "cold", "decreased", ["indifference","prolapse","exercise"]],
  ["Silicea", "Sil.", "Pure flint", "Lack of grit physically and mentally, chilly, suppuration, foot sweat", "cold", "decreased", ["timid","chilly","suppuration"]],
  ["Sulphur", "Sulph.", "Sublimated sulphur", "Ragged philosopher, hot, burning, worse warmth of bed, skin issues", "hot", "increased", ["burning","untidy","warmth bed"]],
  ["Thuja occidentalis", "Thuj.", "Arbor vitae", "Sycotic miasm, warts, fixed ideas, oily skin, vaccination ailments", "cold", "decreased", ["warts","vaccination","fixed ideas"]],
  ["Veratrum album", "Verat.", "White hellebore", "Cold sweat on forehead, cholera-like, religious mania, collapse", "cold", "increased", ["cold sweat","collapse","cholera"]],
  ["Apis mellifica", "Apis", "Honey bee", "Stinging burning oedema, worse heat, thirstless, jealous busy", "hot", "decreased", ["sting","oedema","heat worse"]],
  ["Argentum nitricum", "Arg-n.", "Silver nitrate", "Anticipatory diarrhoea, hurry, claustrophobia, sweet craving", "hot", "increased", ["hurry","sweets","anticipation"]],
  ["Arsenicum album", "Ars.", "White arsenic", "Anxious restless meticulous, midnight aggravation, burning better heat", "cold", "decreased", ["fastidious","midnight","burning"]],
  ["Carbo vegetabilis", "Carb-v.", "Vegetable charcoal", "Air hunger wants to be fanned, cold breath, post-collapse states", "cold", "decreased", ["fanning","collapse","gas"]],
  ["Causticum", "Caust.", "Hahnemann's potassium hydrate", "Paralysis, burning, sympathy for suffering, hoarseness, contractures", "cold", "decreased", ["paralysis","sympathy","hoarseness"]],
  ["Conium maculatum", "Con.", "Poison hemlock", "Ascending paralysis, induration of glands, vertigo on lying", "cold", "decreased", ["induration","vertigo","ascending"]],
];

// Symptom rubrics — Kent style chapters
const CHAPTERS = ["Mind","Vertigo","Head","Eye","Ear","Nose","Face","Mouth","Throat","Stomach","Abdomen","Rectum","Stool","Urinary","Genitalia","Larynx","Respiration","Cough","Chest","Back","Extremities","Sleep","Chill","Fever","Perspiration","Skin","Generalities"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);

    // Auth: only admins or doctors
    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace("Bearer ", "");
    const { data: ud } = await sb.auth.getUser(token);
    if (!ud.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: ud.user.id, _role: "admin" });
    const { data: isDoctor } = await sb.rpc("has_role", { _user_id: ud.user.id, _role: "doctor" });
    if (!isAdmin && !isDoctor) {
      return new Response(JSON.stringify({ error: "Doctors/admins only" }), { status: 403, headers: corsHeaders });
    }

    // 1) Insert curated remedies
    const remedyRows = REMEDIES.map(([name, abbr, latin, desc, thermal, thirst, keynotes]) => ({
      name, abbreviation: abbr, latin_name: latin, short_description: desc,
      thermal, thirst, keynotes, full_text: `${name} (${abbr}) — ${desc}`,
    }));
    const { data: insertedRemedies, error: remErr } = await sb
      .from("homeo_remedies")
      .upsert(remedyRows as any, { onConflict: "abbreviation" })
      .select("id, abbreviation");
    if (remErr) throw remErr;
    const abbrToId = new Map(insertedRemedies!.map((r: any) => [r.abbreviation, r.id]));

    // 2) Ask ai-gateway to expand to ~200 more remedies + generate symptom rubrics
    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "homeo-seed",
        prompt: `Generate a JSON object with two arrays for a classical homeopathy seed database.
"remedies": 170 additional classical homeopathic remedies (NOT including these already present: ${REMEDIES.map(r=>r[1]).join(", ")}). Each: { name, abbreviation, latin_name, short_description (1 line), thermal ('hot'|'cold'|'neutral'), thirst ('increased'|'decreased'|'normal'), keynotes (3 short keywords) }.
"symptoms": 500 rubrics across Kent chapters (${CHAPTERS.join(", ")}). Each: { chapter, rubric (short 2-6 words), sub_rubric (optional location/modality) }.
Return ONLY valid JSON, no prose.`,
        response_schema: {
          name: "seed_homeo",
          parameters: {
            type: "object",
            properties: {
              remedies: { type: "array", items: { type: "object", properties: {
                name: {type:"string"}, abbreviation:{type:"string"}, latin_name:{type:"string"},
                short_description:{type:"string"}, thermal:{type:"string"}, thirst:{type:"string"},
                keynotes:{type:"array", items:{type:"string"}},
              }, required:["name","abbreviation","latin_name","short_description","thermal","thirst","keynotes"], additionalProperties:false } },
              symptoms: { type: "array", items: { type: "object", properties: {
                chapter:{type:"string"}, rubric:{type:"string"}, sub_rubric:{type:"string"},
              }, required:["chapter","rubric"], additionalProperties:false } },
            }, required:["remedies","symptoms"], additionalProperties:false,
          },
        },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI seed error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI seed failed", detail: t }), { status: 500, headers: corsHeaders });
    }
    const aiJson = await aiResp.json();
    const args = aiJson.result ?? { remedies: [], symptoms: [] };

    // 3) Insert AI remedies
    const aiRemedyRows = (args.remedies ?? []).map((r: any) => ({
      name: r.name, abbreviation: r.abbreviation, latin_name: r.latin_name,
      short_description: r.short_description, thermal: r.thermal, thirst: r.thirst,
      keynotes: r.keynotes, full_text: `${r.name} (${r.abbreviation}) — ${r.short_description}`,
    }));
    const { data: aiInserted } = await sb
      .from("homeo_remedies")
      .upsert(aiRemedyRows, { onConflict: "abbreviation" })
      .select("id, abbreviation");
    aiInserted?.forEach((r: any) => abbrToId.set(r.abbreviation, r.id));

    // 4) Insert symptoms
    const symptomRows = (args.symptoms ?? []).slice(0, 500).map((s: any) => ({
      chapter: s.chapter, rubric: s.rubric, sub_rubric: s.sub_rubric ?? null,
    }));
    const { data: insertedSymptoms } = await sb
      .from("homeo_symptoms")
      .upsert(symptomRows, { onConflict: "chapter,rubric,sub_rubric" })
      .select("id");

    // 5) Random graded mappings symptom→remedy (avg 6 remedies per symptom)
    const allRemedyIds = Array.from(abbrToId.values());
    const mappings: any[] = [];
    for (const s of insertedSymptoms ?? []) {
      const n = 4 + Math.floor(Math.random() * 6);
      const picks = new Set<string>();
      while (picks.size < n) picks.add(allRemedyIds[Math.floor(Math.random() * allRemedyIds.length)]);
      picks.forEach((rid) => mappings.push({
        symptom_id: s.id, remedy_id: rid, grade: 1 + Math.floor(Math.random() * 4),
      }));
    }
    // Insert in chunks
    for (let i = 0; i < mappings.length; i += 1000) {
      await sb.from("homeo_symptom_remedies").upsert(mappings.slice(i, i + 1000), { onConflict: "symptom_id,remedy_id" });
    }

    return new Response(JSON.stringify({
      ok: true,
      remedies_total: abbrToId.size,
      symptoms_total: insertedSymptoms?.length ?? 0,
      mappings_total: mappings.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("homeo-seed error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
