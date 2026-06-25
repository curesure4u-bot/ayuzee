// Seeds the 13 ASTG categories + 38 diseases (with empty Level 1/2/3 scaffolding).
// Idempotent: re-runnable. Admin-only via JWT verification in code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Disease = { ch: number; name: string; modern: string };
type Cat = { key: string; icon: string; name: string; sanskrit: string; modern: string; diseases: Disease[] };

const CATEGORIES: Cat[] = [
  { key: "annavaha", icon: "🍽️", name: "Annavaha Srotas", sanskrit: "Annavaha Srotas", modern: "Digestive", diseases: [
    { ch: 1, name: "Amlapitta", modern: "Acid Peptic Disease" },
    { ch: 2, name: "Grahani", modern: "IBS / Malabsorption" },
    { ch: 3, name: "Atisara", modern: "Diarrhea" },
    { ch: 4, name: "Vibandha", modern: "Constipation" },
    { ch: 5, name: "Arsha", modern: "Hemorrhoids" },
  ]},
  { key: "pranavaha", icon: "🌬️", name: "Pranavaha Srotas", sanskrit: "Pranavaha Srotas", modern: "Respiratory", diseases: [
    { ch: 6, name: "Tamaka Swasa", modern: "Bronchial Asthma" },
    { ch: 7, name: "Kasa", modern: "Cough" },
    { ch: 8, name: "Pratishyaya (Acute)", modern: "Acute Rhinitis" },
  ]},
  { key: "rasavaha", icon: "💧", name: "Rasavaha Srotas", sanskrit: "Rasavaha Srotas", modern: "Circulatory", diseases: [
    { ch: 9, name: "Jvara", modern: "Fever / PUO" },
    { ch: 10, name: "Pandu", modern: "Anaemia" },
  ]},
  { key: "raktavaha", icon: "🩸", name: "Raktavaha Srotas", sanskrit: "Raktavaha Srotas", modern: "Hematological", diseases: [
    { ch: 11, name: "Raktapitta", modern: "Bleeding Disorders" },
    { ch: 12, name: "Kushtha", modern: "Skin Diseases" },
  ]},
  { key: "mamsavaha", icon: "💪", name: "Mamsavaha Srotas", sanskrit: "Mamsavaha Srotas", modern: "Musculo-skeletal", diseases: [
    { ch: 13, name: "Granthi", modern: "Lipoma / Cyst" },
    { ch: 14, name: "Arbuda", modern: "Tumor" },
  ]},
  { key: "medovaha", icon: "⚖️", name: "Medovaha Srotas", sanskrit: "Medovaha Srotas", modern: "Metabolic", diseases: [
    { ch: 15, name: "Sthaulya", modern: "Obesity" },
    { ch: 16, name: "Madhumeha", modern: "Diabetes Mellitus" },
    { ch: 17, name: "Medoroga", modern: "Dyslipidemia" },
  ]},
  { key: "asthivaha", icon: "🦴", name: "Asthivaha Srotas", sanskrit: "Asthivaha Srotas", modern: "Bone / Joint", diseases: [
    { ch: 18, name: "Amavata", modern: "Rheumatoid Arthritis" },
    { ch: 19, name: "Asthi Kshaya", modern: "Osteoporosis" },
  ]},
  { key: "majjavaha", icon: "🧠", name: "Majjavaha Srotas", sanskrit: "Majjavaha Srotas", modern: "Neurological", diseases: [
    { ch: 20, name: "Apasmara", modern: "Epilepsy" },
    { ch: 21, name: "Unmada", modern: "Psychosis" },
  ]},
  { key: "mutravaha", icon: "🚰", name: "Mutravaha Srotas", sanskrit: "Mutravaha Srotas", modern: "Urinary", diseases: [
    { ch: 22, name: "Mutrakrichra", modern: "Dysuria / UTI" },
    { ch: 23, name: "Ashmari", modern: "Urolithiasis" },
  ]},
  { key: "artavavaha", icon: "🌸", name: "Artavavaha Srotas", sanskrit: "Artavavaha Srotas", modern: "Gynaecological", diseases: [
    { ch: 24, name: "Kashtartava", modern: "Dysmenorrhea" },
    { ch: 25, name: "Shweta Pradara", modern: "Leucorrhoea" },
    { ch: 26, name: "Anartava", modern: "Amenorrhea" },
  ]},
  { key: "vata-vyadhi", icon: "⚡", name: "Vata Vyadhi", sanskrit: "Vata Vyadhi", modern: "Neurological", diseases: [
    { ch: 27, name: "Avabahuka", modern: "Frozen Shoulder" },
    { ch: 28, name: "Katigraha", modern: "Low Back Pain" },
    { ch: 29, name: "Gridhrasi", modern: "Sciatica" },
    { ch: 30, name: "Pakshaghata", modern: "Hemiplegia / Stroke" },
    { ch: 31, name: "Sandhigata Vata", modern: "Osteoarthritis" },
    { ch: 32, name: "Vatarakta", modern: "Gout" },
  ]},
  { key: "netragata", icon: "👁️", name: "Netragata Roga", sanskrit: "Netragata Roga", modern: "Eye", diseases: [
    { ch: 33, name: "Abhishyanda", modern: "Conjunctivitis" },
    { ch: 34, name: "Adhimantha", modern: "Glaucoma" },
  ]},
  { key: "urdhwa-jatrugata", icon: "🦷", name: "Urdhwa Jatrugata", sanskrit: "Urdhwa Jatrugata", modern: "ENT / Head", diseases: [
    { ch: 35, name: "Dantavestaka", modern: "Gingivitis" },
    { ch: 36, name: "Mukhapaka", modern: "Stomatitis / Mouth Ulcer" },
    { ch: 37, name: "Pratishyaya", modern: "Rhinitis / Sinusitis" },
    { ch: 38, name: "Shiroroga", modern: "Headache / Migraine" },
  ]},
];

const LEVELS = [
  { level_number: 1, level_label: "Level 1", facility_type: "PHC", description: "Primary Health Centre — basic oral medicines, lifestyle counselling." },
  { level_number: 2, level_label: "Level 2", facility_type: "CHC", description: "Community Health Centre — Panchakarma support, IPD where feasible." },
  { level_number: 3, level_label: "Level 3", facility_type: "District Hospital", description: "Full Panchakarma, multi-disciplinary referral, specialist Ayurveda care." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: authHeader } } });
    const { data: userRes } = await userClient.auth.getUser();
    if (!userRes?.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: isAdmin } = await admin.rpc("is_admin_or_super", { _user_id: userRes.user.id });
    if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let catCount = 0, dxCount = 0, lvlCount = 0;

    for (let i = 0; i < CATEGORIES.length; i++) {
      const c = CATEGORIES[i];
      // upsert category by name
      const { data: existingCat } = await admin.from("astg_categories").select("id").eq("name", c.name).maybeSingle();
      let categoryId = existingCat?.id;
      if (!categoryId) {
        const { data: ins, error } = await admin.from("astg_categories").insert({
          name: c.name, name_sanskrit: c.sanskrit, modern_equivalent: c.modern, icon: c.icon, sort_order: i,
        }).select("id").single();
        if (error) throw error;
        categoryId = ins.id;
        catCount++;
      } else {
        await admin.from("astg_categories").update({ name_sanskrit: c.sanskrit, modern_equivalent: c.modern, icon: c.icon, sort_order: i }).eq("id", categoryId);
      }

      for (let j = 0; j < c.diseases.length; j++) {
        const dx = c.diseases[j];
        const { data: existingDx } = await admin.from("astg_diseases").select("id").eq("chapter_number", dx.ch).maybeSingle();
        let diseaseId = existingDx?.id;
        if (!diseaseId) {
          const { data: ins, error } = await admin.from("astg_diseases").insert({
            category_id: categoryId, chapter_number: dx.ch, name: dx.name, name_modern: dx.modern,
            is_published: true, sort_order: j,
          }).select("id").single();
          if (error) throw error;
          diseaseId = ins.id;
          dxCount++;
        } else {
          await admin.from("astg_diseases").update({ category_id: categoryId, name: dx.name, name_modern: dx.modern, sort_order: j }).eq("id", diseaseId);
        }

        for (const lvl of LEVELS) {
          const { data: ex } = await admin.from("astg_treatment_levels")
            .select("id").eq("disease_id", diseaseId).eq("level_number", lvl.level_number).maybeSingle();
          if (!ex) {
            await admin.from("astg_treatment_levels").insert({
              disease_id: diseaseId, level_number: lvl.level_number, level_label: lvl.level_label,
              facility_type: lvl.facility_type, description: lvl.description, sort_order: lvl.level_number,
            });
            lvlCount++;
          }
        }
      }
    }

    await admin.from("astg_audit_log").insert({
      actor_id: userRes.user.id, action: "seed_run",
      details: { categories_added: catCount, diseases_added: dxCount, levels_added: lvlCount },
    });

    return new Response(JSON.stringify({ ok: true, categories_added: catCount, diseases_added: dxCount, levels_added: lvlCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
