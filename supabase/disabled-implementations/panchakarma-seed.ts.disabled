// Seeds classical Panchakarma course templates and stages.
// Idempotent: skips templates whose `name` already exists.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Stage = {
  stage_name: string;
  day_offset: number;
  duration_minutes: number;
  requires_room_type: string;
  pre_procedure_instructions: string;
  post_procedure_instructions: string;
  sort_order: number;
};

type Template = {
  name: string;
  therapy_type: string;
  total_days: number;
  description: string;
  stages: Stage[];
};

// ---- Reusable patient-friendly wording (paraphrased from Ministry of AYUSH
// Panchakarma standard treatment guidelines; no third-party app text). ----
const DIET_LIGHT =
  "Eat only warm, freshly cooked, easily digestible food (rice gruel, moong dal soup, steamed vegetables). Avoid curd, cold drinks, deep-fried food, non-veg, alcohol and heavy sweets.";
const DIET_LIQUID =
  "Take only warm liquids and thin rice gruel (peya) on the day of the main procedure. Do not eat solid food unless your Vaidya says so.";
const REST_INSTR =
  "Rest at home in a warm, draft-free room. No strenuous work, gym, long travel, sun exposure, swimming, or sexual activity during this phase.";
const WARN_STD =
  "Contact your Vaidya immediately if you notice: high fever, severe giddiness, persistent vomiting, blood in stool/urine, severe abdominal pain, fainting or breathing difficulty.";
const SNEHA_PRE =
  "Come on empty stomach in the morning. Bring loose warm clothing. Inform your Vaidya about any diabetes, high BP, heart condition, or medicines you take daily.";
const SNEHA_POST =
  "You may feel oily, drowsy or slightly nauseous — this is normal. Drink sips of warm water only. Do not sleep during the day. Avoid cold breeze, cold water bath, and screens for 2 hours.";
const SWEDANA_PRE =
  "Empty bladder before the session. Remove jewellery, contact lenses and metal accessories. Tell staff if you feel dizzy at any point.";
const SWEDANA_POST =
  "Rest for 30 minutes wrapped in a warm cloth. Sip warm water. Do not take a cold shower for at least 2 hours. Light warm meal after 1 hour.";

// ---------- Templates ----------
const TEMPLATES: Template[] = [
  {
    name: "Vamana - Classical 7 Day",
    therapy_type: "Vamana",
    total_days: 7,
    description:
      "Therapeutic emesis for Kapha disorders — 3 days Purva Karma (Snehapana + Swedana), 1 day Pradhana Karma (Vamana), 3 days Paschat Karma (Samsarjana Krama diet).",
    stages: [
      { stage_name: "Purva Karma - Snehapana Day 1", day_offset: 0, duration_minutes: 45, requires_room_type: "consultation room",
        pre_procedure_instructions: `${SNEHA_PRE} You will drink medicated ghee in a measured dose.`,
        post_procedure_instructions: `${SNEHA_POST} Note the time of first bowel motion and report it tomorrow.`,
        sort_order: 1 },
      { stage_name: "Purva Karma - Snehapana Day 2", day_offset: 1, duration_minutes: 45, requires_room_type: "consultation room",
        pre_procedure_instructions: `${SNEHA_PRE} Dose of ghee will be increased today.`,
        post_procedure_instructions: `${SNEHA_POST} ${DIET_LIGHT}`,
        sort_order: 2 },
      { stage_name: "Purva Karma - Snehapana Day 3 + Abhyanga & Swedana", day_offset: 2, duration_minutes: 90, requires_room_type: "steam room",
        pre_procedure_instructions: `${SNEHA_PRE} Full body oil massage and steam will follow.`,
        post_procedure_instructions: `${SWEDANA_POST} Eat only warm khichdi for dinner. Sleep early.`,
        sort_order: 3 },
      { stage_name: "Pradhana Karma - Vamana (Therapeutic Emesis)", day_offset: 3, duration_minutes: 180, requires_room_type: "procedure room",
        pre_procedure_instructions: `Come strictly on empty stomach by 7 AM. Wear old comfortable clothes. Bring a change of clothes and a towel. ${DIET_LIQUID.replace("on the day of the main procedure", "the previous night")} Do not attempt this at home.`,
        post_procedure_instructions: `Expect tiredness for the rest of the day. Only sips of warm water for 3 hours. Complete voice rest, no talking loudly, no cold air. ${WARN_STD}`,
        sort_order: 4 },
      { stage_name: "Paschat Karma - Samsarjana Day 1 (Peya)", day_offset: 4, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Review only — no procedure today.",
        post_procedure_instructions: "Diet: warm thin rice gruel (peya) 3 times only. No solid food, no milk, no salt-heavy items. Rest the whole day.",
        sort_order: 5 },
      { stage_name: "Paschat Karma - Samsarjana Day 2 (Vilepi)", day_offset: 5, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Report any bloating, weakness or loose motions before starting today's diet.",
        post_procedure_instructions: "Diet: thicker rice gruel (vilepi) with a little rock salt and ghee, twice. Short walk indoors only.",
        sort_order: 6 },
      { stage_name: "Paschat Karma - Samsarjana Day 3 (Krita Yusha)", day_offset: 6, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Final review. Bring notes of any symptoms you noticed during recovery.",
        post_procedure_instructions: "Diet: soft rice with moong dal soup (yusha). You can slowly return to normal food from tomorrow. Continue to avoid cold, oily and fermented foods for 2 weeks.",
        sort_order: 7 },
    ],
  },
  {
    name: "Virechana - Standard 7 Day",
    therapy_type: "Virechana",
    total_days: 7,
    description:
      "Therapeutic purgation for Pitta disorders — 3 days Snehapana + Swedana, 1 day Virechana, 3 days Samsarjana Krama.",
    stages: [
      { stage_name: "Purva Karma - Snehapana Day 1", day_offset: 0, duration_minutes: 45, requires_room_type: "consultation room",
        pre_procedure_instructions: SNEHA_PRE, post_procedure_instructions: SNEHA_POST, sort_order: 1 },
      { stage_name: "Purva Karma - Snehapana Day 2", day_offset: 1, duration_minutes: 45, requires_room_type: "consultation room",
        pre_procedure_instructions: `${SNEHA_PRE} Ghee dose will be increased.`,
        post_procedure_instructions: `${SNEHA_POST} ${DIET_LIGHT}`, sort_order: 2 },
      { stage_name: "Purva Karma - Snehapana Day 3 + Abhyanga & Swedana", day_offset: 2, duration_minutes: 90, requires_room_type: "steam room",
        pre_procedure_instructions: `${SNEHA_PRE} Full body oil massage and steam will follow.`,
        post_procedure_instructions: `${SWEDANA_POST} Only warm khichdi for dinner. Sleep by 9 PM.`, sort_order: 3 },
      { stage_name: "Pradhana Karma - Virechana (Therapeutic Purgation)", day_offset: 3, duration_minutes: 300, requires_room_type: "procedure room",
        pre_procedure_instructions: `Come on empty stomach by 8 AM. Stay in the clinic for the whole day — you will pass several loose motions. Carry water bottle and reading material. ${DIET_LIQUID}`,
        post_procedure_instructions: `You may feel weak and thirsty — sip warm water frequently. ${REST_INSTR} ${WARN_STD}`,
        sort_order: 4 },
      { stage_name: "Paschat Karma - Samsarjana Day 1 (Peya)", day_offset: 4, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Review of motions and general condition.",
        post_procedure_instructions: "Diet: thin warm rice gruel only, 3 times. No milk, no salt-heavy food, no travel.",
        sort_order: 5 },
      { stage_name: "Paschat Karma - Samsarjana Day 2 (Vilepi)", day_offset: 5, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Report bloating, weakness or giddiness.",
        post_procedure_instructions: "Diet: thicker rice gruel with a pinch of rock salt and ghee. Short indoor walk only.",
        sort_order: 6 },
      { stage_name: "Paschat Karma - Samsarjana Day 3 (Krita Yusha)", day_offset: 6, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Final review.",
        post_procedure_instructions: "Diet: soft rice with moong dal soup. Return to normal diet gradually. Avoid cold, oily and spicy food for 2 weeks.",
        sort_order: 7 },
    ],
  },
  {
    name: "Basti - Kala Basti (8 Day Short Protocol)",
    therapy_type: "Basti",
    total_days: 8,
    description:
      "Short Kala Basti course — alternating Anuvasana (oil) and Niruha/Kashaya (decoction) enemas over 8 days for Vata disorders.",
    stages: buildBastiStages(8),
  },
  {
    name: "Basti - Karma Basti (16 Day Full Protocol)",
    therapy_type: "Basti",
    total_days: 16,
    description:
      "Classical Karma Basti — 16 day alternating Anuvasana and Niruha Basti sequence for chronic Vata disorders such as sciatica, arthritis and paralysis.",
    stages: buildBastiStages(16),
  },
  {
    name: "Nasya - Standard 7 Day",
    therapy_type: "Nasya",
    total_days: 7,
    description:
      "Medicated nasal instillation for head, neck, ENT and neurological disorders — 7 consecutive daily sessions with local Snehana + Swedana.",
    stages: Array.from({ length: 7 }, (_, i) => ({
      stage_name: `Nasya Session Day ${i + 1}`,
      day_offset: i,
      duration_minutes: 45,
      requires_room_type: "procedure room",
      pre_procedure_instructions:
        `Come on empty stomach or at least 2 hours after a light meal. Blow the nose gently before arriving. Inform your Vaidya if you have a cold, fever, sinus infection, recent nose surgery, or are pregnant. ${SNEHA_PRE}`,
      post_procedure_instructions:
        `Do not blow the nose forcefully for the next 30 minutes — just wipe. Warm salt-water gargle after 15 minutes. Avoid cold breeze, cold water, dust, smoke and screens for 3 hours. Light warm food only. ${WARN_STD}`,
      sort_order: i + 1,
    })),
  },
  {
    name: "Raktamokshana - Single Session (1 Day)",
    therapy_type: "Raktamokshana",
    total_days: 1,
    description: "Single-session bloodletting (Jalaukavacharana / Siravyadha) for localised Pitta-Rakta disorders such as vein disease, gout flare or localised skin lesion.",
    stages: [
      { stage_name: "Raktamokshana Procedure", day_offset: 0, duration_minutes: 60, requires_room_type: "procedure room",
        pre_procedure_instructions: `Eat a normal light breakfast 2 hours before — do not come on empty stomach. Inform your Vaidya if you are on blood thinners, have diabetes, low BP, anaemia, or any bleeding disorder. Wear clothing that exposes the treatment area easily.`,
        post_procedure_instructions: `Keep the treated area clean and dry for 24 hours. Mild soreness and slight swelling is normal. Avoid strenuous work, hot showers and alcohol for 48 hours. ${WARN_STD}`,
        sort_order: 1 },
    ],
  },
  {
    name: "Raktamokshana - 3 Day Course",
    therapy_type: "Raktamokshana",
    total_days: 3,
    description: "Three-session bloodletting course for chronic skin diseases and localised Rakta-dushti — with pre-procedure Snehana and post-procedure recovery day.",
    stages: [
      { stage_name: "Day 1 - Local Snehana & Swedana (Prep)", day_offset: 0, duration_minutes: 45, requires_room_type: "steam room",
        pre_procedure_instructions: `${SNEHA_PRE} Local oil application and steam will be done today.`,
        post_procedure_instructions: `${SWEDANA_POST}`, sort_order: 1 },
      { stage_name: "Day 2 - Raktamokshana Procedure", day_offset: 1, duration_minutes: 60, requires_room_type: "procedure room",
        pre_procedure_instructions: `Eat a normal light breakfast 2 hours before. Inform your Vaidya about blood thinners, low BP, anaemia or bleeding disorders.`,
        post_procedure_instructions: `Keep the area clean and dry. Rest for the day. Avoid alcohol and hot showers for 48 hours. ${WARN_STD}`, sort_order: 2 },
      { stage_name: "Day 3 - Post-procedure Review", day_offset: 2, duration_minutes: 20, requires_room_type: "consultation room",
        pre_procedure_instructions: "Come with the treated area uncovered for inspection.",
        post_procedure_instructions: `Continue prescribed oral medicines. ${DIET_LIGHT} Avoid sun exposure on the treated area for 1 week.`, sort_order: 3 },
    ],
  },
];

function buildBastiStages(totalDays: number): Stage[] {
  // Classical alternation: Day 1 Anuvasana, then alternating Niruha / Anuvasana.
  const stages: Stage[] = [];
  for (let i = 0; i < totalDays; i++) {
    const isAnuvasana = i === 0 || i % 2 === 0;
    const name = isAnuvasana ? "Anuvasana Basti (Oil Enema)" : "Niruha / Kashaya Basti (Decoction Enema)";
    stages.push({
      stage_name: `Day ${i + 1} - ${name}`,
      day_offset: i,
      duration_minutes: isAnuvasana ? 45 : 75,
      requires_room_type: "procedure room",
      pre_procedure_instructions: isAnuvasana
        ? `Come after a light warm meal (Anuvasana is given on a full stomach). Empty the bladder before the procedure. Wear loose clothing. Inform your Vaidya about piles, fissure, diarrhoea or pregnancy.`
        : `Come strictly on empty stomach in the morning (Niruha is given on empty stomach). Empty bladder and bowel before arriving. ${SNEHA_PRE}`,
      post_procedure_instructions: isAnuvasana
        ? `Lie down on your back for 30 minutes. The oil should be retained as long as comfortable — do not force it. Warm water sip only for 1 hour. Avoid cold breeze and daytime sleep. ${WARN_STD}`
        : `You will pass several motions over the next 1-2 hours — stay near a washroom. After motions stop, take warm rice gruel. ${REST_INSTR} ${WARN_STD}`,
      sort_order: i + 1,
    });
  }
  return stages;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: { name: string; status: string; stages?: number }[] = [];

    for (const t of TEMPLATES) {
      const { data: existing } = await supabase
        .from("panchakarma_course_templates")
        .select("id")
        .eq("name", t.name)
        .maybeSingle();

      if (existing) { results.push({ name: t.name, status: "skipped (exists)" }); continue; }

      const { data: inserted, error: tplErr } = await supabase
        .from("panchakarma_course_templates")
        .insert({
          name: t.name,
          therapy_type: t.therapy_type,
          total_days: t.total_days,
          description: t.description,
          is_active: true,
        })
        .select("id")
        .single();

      if (tplErr || !inserted) {
        results.push({ name: t.name, status: `error: ${tplErr?.message}` });
        continue;
      }

      const stageRows = t.stages.map((s) => ({ ...s, template_id: inserted.id }));
      const { error: stageErr } = await supabase.from("panchakarma_template_stages").insert(stageRows);
      if (stageErr) {
        results.push({ name: t.name, status: `stages error: ${stageErr.message}` });
      } else {
        results.push({ name: t.name, status: "inserted", stages: stageRows.length });
      }
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message ?? String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
