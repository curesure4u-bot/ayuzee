// Seed Top 200 Homeopathy Materia Medica.
// 20 remedies are richly detailed via Gemini Flash (Lovable AI Gateway).
// Remaining 180 remedies are inserted as structured placeholders for later expansion.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOP_200: { name: string; abbr: string }[] = [
  ["Aconitum napellus","Acon"],["Allium cepa","All-c"],["Aloe socotrina","Aloe"],["Alumina","Alum"],["Ambra grisea","Ambr"],
  ["Anacardium orientale","Anac"],["Antimonium crudum","Ant-c"],["Antimonium tartaricum","Ant-t"],["Apis mellifica","Apis"],["Argentum nitricum","Arg-n"],
  ["Arnica montana","Arn"],["Arsenicum album","Ars"],["Aurum metallicum","Aur"],["Baryta carbonica","Bar-c"],["Belladonna","Bell"],
  ["Berberis vulgaris","Berb"],["Borax","Bor"],["Bovista","Bov"],["Bryonia alba","Bry"],["Calcarea carbonica","Calc"],
  ["Calcarea fluorica","Calc-f"],["Calcarea phosphorica","Calc-p"],["Calendula officinalis","Calen"],["Camphora","Camph"],["Cantharis","Canth"],
  ["Capsicum annuum","Caps"],["Carbo vegetabilis","Carb-v"],["Causticum","Caust"],["Chamomilla","Cham"],["Chelidonium majus","Chel"],
  ["China officinalis","Chin"],["Cicuta virosa","Cic"],["Cimicifuga racemosa","Cimic"],["Cina","Cina"],["Cocculus indicus","Cocc"],
  ["Coffea cruda","Coff"],["Colchicum autumnale","Colch"],["Colocynthis","Coloc"],["Conium maculatum","Con"],["Crataegus oxyacantha","Crat"],
  ["Crocus sativus","Croc"],["Crotalus horridus","Crot-h"],["Cuprum metallicum","Cupr"],["Digitalis purpurea","Dig"],["Drosera rotundifolia","Dros"],
  ["Dulcamara","Dulc"],["Eupatorium perfoliatum","Eup-per"],["Euphrasia officinalis","Euphr"],["Ferrum metallicum","Ferr"],["Ferrum phosphoricum","Ferr-p"],
  ["Fluoricum acidum","Fl-ac"],["Gelsemium sempervirens","Gels"],["Glonoine","Glon"],["Graphites","Graph"],["Hamamelis virginiana","Ham"],
  ["Hepar sulphuris calcareum","Hep"],["Hyoscyamus niger","Hyos"],["Hypericum perforatum","Hyper"],["Ignatia amara","Ign"],["Ipecacuanha","Ip"],
  ["Kali bichromicum","Kali-bi"],["Kali carbonicum","Kali-c"],["Kali phosphoricum","Kali-p"],["Kali sulphuricum","Kali-s"],["Kreosotum","Kreos"],
  ["Lachesis mutus","Lach"],["Ledum palustre","Led"],["Lycopodium clavatum","Lyc"],["Magnesia carbonica","Mag-c"],["Magnesia phosphorica","Mag-p"],
  ["Medorrhinum","Med"],["Mercurius solubilis","Merc"],["Mezereum","Mez"],["Millefolium","Mill"],["Natrum carbonicum","Nat-c"],
  ["Natrum muriaticum","Nat-m"],["Natrum phosphoricum","Nat-p"],["Natrum sulphuricum","Nat-s"],["Nitricum acidum","Nit-ac"],["Nux moschata","Nux-m"],
  ["Nux vomica","Nux-v"],["Opium","Op"],["Petroleum","Petr"],["Phosphoricum acidum","Ph-ac"],["Phosphorus","Phos"],
  ["Phytolacca decandra","Phyt"],["Plantago major","Plan"],["Platina","Plat"],["Podophyllum peltatum","Podo"],["Psorinum","Psor"],
  ["Pulsatilla nigricans","Puls"],["Pyrogenium","Pyrog"],["Rhododendron","Rhod"],["Rhus toxicodendron","Rhus-t"],["Ruta graveolens","Ruta"],
  ["Sabadilla","Sabad"],["Sabina","Sabin"],["Sambucus nigra","Samb"],["Sanguinaria canadensis","Sang"],["Sepia officinalis","Sep"],
  ["Silicea","Sil"],["Spigelia anthelmia","Spig"],["Spongia tosta","Spong"],["Staphysagria","Staph"],["Sulphur","Sulph"],
  ["Symphytum officinale","Symph"],["Tarentula hispanica","Tarent"],["Thuja occidentalis","Thuj"],["Tuberculinum","Tub"],["Veratrum album","Verat"],
  ["Zincum metallicum","Zinc"],["Abrotanum","Abrot"],["Aesculus hippocastanum","Aesc"],["Agaricus muscarius","Agar"],["Agnus castus","Agn"],
  ["Ammonium carbonicum","Am-c"],["Ammonium muriaticum","Am-m"],["Baptisia tinctoria","Bapt"],["Bellis perennis","Bell-p"],["Benzoicum acidum","Benz-ac"],
  ["Bromium","Brom"],["Cactus grandiflorus","Cact"],["Calcarea sulphurica","Calc-s"],["Cannabis indica","Cann-i"],["Cannabis sativa","Cann-s"],
  ["Carcinosinum","Carc"],["Cedron","Cedr"],["Chininum sulphuricum","Chin-s"],["Clematis erecta","Clem"],["Condurango","Cund"],
  ["Copaiva","Copa"],["Croton tiglium","Croto"],["Dioscorea villosa","Dios"],["Echinacea angustifolia","Echi"],["Elaps corallinus","Elaps"],
  ["Ferrum picricum","Ferr-pic"],["Hydrastis canadensis","Hydr"],["Hydrocotyle asiatica","Hydrc"],["Kali iodatum","Kali-i"],["Kalmia latifolia","Kalm"],
  ["Lac caninum","Lac-c"],["Lac defloratum","Lac-d"],["Lilium tigrinum","Lil-t"],["Lithium carbonicum","Lith"],["Lobelia inflata","Lob"],
  ["Magnesia muriatica","Mag-m"],["Mancinella","Manc"],["Mercurius corrosivus","Merc-c"],["Mercurius iodatus flavus","Merc-i-f"],["Mercurius iodatus ruber","Merc-i-r"],
  ["Moschus","Mosch"],["Muriaticum acidum","Mur-ac"],["Myristica sebifera","Myris"],["Naja tripudians","Naja"],["Oleander","Olnd"],
  ["Onosmodium","Onos"],["Oxalicum acidum","Ox-ac"],["Paeonia officinalis","Paeon"],["Pareira brava","Pareir"],["Picricum acidum","Pic-ac"],
  ["Plumbum metallicum","Plb"],["Psoralea corylifolia","Psoral"],["Ranunculus bulbosus","Ran-b"],["Ratanhia","Rat"],["Rumex crispus","Rumx"],
  ["Sarsaparilla","Sars"],["Secale cornutum","Sec"],["Selenium metallicum","Sel"],["Senega","Seneg"],["Squilla maritima","Squil"],
  ["Stramonium","Stram"],["Sulphuricum acidum","Sul-ac"],["Syphilinum","Syph"],["Tabacum","Tab"],["Tellurium metallicum","Tell"],
  ["Teucrium marum verum","Teucr"],["Thlaspi bursa pastoris","Thlas"],["Urtica urens","Urt-u"],["Vaccininum","Vacc"],["Valeriana officinalis","Valer"],
  ["Variolinum","Variol"],["Verbascum thapsus","Verb"],["Viburnum opulus","Vib"],["Viola odorata","Viol-o"],["Wyethia helenioides","Wye"],
  ["Xanthoxylum fraxineum","Xan"],["Yucca filamentosa","Yuc"],["Equisetum hyemale","Equis"],["Solidago virgaurea","Solid"],["Terebinthina","Ter"],
  ["Ocimum canum","Ocim"],["Passiflora incarnata","Passi"],["Ficus religiosa","Fic-r"],["Justicia adhatoda","Just"],["Carduus marianus","Card-m"],
  ["Ceanothus americanus","Cean"],["Berberis aquifolium","Berb-a"],["Mahonia aquifolium","Mah-a"],["Juglans regia","Jug-r"],["Hydrangea arborescens","Hydrang"],
  ["Gymnema sylvestre","Gymn"],
].map(([n,a]) => ({ name: n, abbr: a }));

// 20 remedies that get rich AI-generated detail
const DETAILED_NAMES = new Set([
  "Aconitum napellus","Belladonna","Bryonia alba","Nux vomica","Pulsatilla nigricans",
  "Arsenicum album","Rhus toxicodendron","Sulphur","Calcarea carbonica","Lycopodium clavatum",
  "Natrum muriaticum","Sepia officinalis","Phosphorus","Gelsemium sempervirens","Arnica montana",
  "Hypericum perforatum","Ignatia amara","Chamomilla","Hepar sulphuris calcareum","Silicea",
]);

interface DetailedRemedy {
  common_name: string;
  source: string;
  kingdom: string;
  key_personality: string;
  mental_emotional_picture: string;
  general_symptoms: string;
  thermal: string;
  thirst: string;
  food_cravings: string[];
  food_aversions: string[];
  sleep_pattern: string;
  dreams: string;
  sweat: string;
  digestive_symptoms: string;
  respiratory_symptoms: string;
  skin_symptoms: string;
  female_symptoms: string;
  male_symptoms: string;
  children_indications: string;
  modalities_better: string[];
  modalities_worse: string[];
  keynote_symptoms: string[];
  common_clinical_uses: string[];
  complementary_remedies: string[];
  antidotes: string[];
  compare_with: string[];
  usual_potencies: string[];
  safety_notes: string;
}

async function aiGenerate(name: string, abbr: string, apiKey: string): Promise<DetailedRemedy | null> {
  const sys = `You are a classical homeopathy reference. Produce concise, public-domain-style structured Materia Medica notes (Boericke / Allen / Clarke style). Be clinical, original prose — do not copy proprietary text.`;
  const usr = `Generate a complete structured Materia Medica entry for "${name}" (abbreviation ${abbr}). Use plain English, ~1-3 sentences per text field, 3-6 items per array field.`;
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: usr }],
      tools: [{
        type: "function",
        function: {
          name: "remedy_profile",
          parameters: {
            type: "object",
            properties: {
              common_name: { type: "string" }, source: { type: "string" }, kingdom: { type: "string" },
              key_personality: { type: "string" }, mental_emotional_picture: { type: "string" },
              general_symptoms: { type: "string" }, thermal: { type: "string" }, thirst: { type: "string" },
              food_cravings: { type: "array", items: { type: "string" } },
              food_aversions: { type: "array", items: { type: "string" } },
              sleep_pattern: { type: "string" }, dreams: { type: "string" }, sweat: { type: "string" },
              digestive_symptoms: { type: "string" }, respiratory_symptoms: { type: "string" },
              skin_symptoms: { type: "string" }, female_symptoms: { type: "string" },
              male_symptoms: { type: "string" }, children_indications: { type: "string" },
              modalities_better: { type: "array", items: { type: "string" } },
              modalities_worse: { type: "array", items: { type: "string" } },
              keynote_symptoms: { type: "array", items: { type: "string" } },
              common_clinical_uses: { type: "array", items: { type: "string" } },
              complementary_remedies: { type: "array", items: { type: "string" } },
              antidotes: { type: "array", items: { type: "string" } },
              compare_with: { type: "array", items: { type: "string" } },
              usual_potencies: { type: "array", items: { type: "string" } },
              safety_notes: { type: "string" },
            },
            required: ["common_name","source","kingdom","key_personality","mental_emotional_picture","general_symptoms","thermal","thirst","keynote_symptoms","modalities_better","modalities_worse","common_clinical_uses","usual_potencies","safety_notes"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "remedy_profile" } },
    }),
  });
  if (!resp.ok) {
    console.warn(`AI failed for ${name}: ${resp.status}`);
    return null;
  }
  const data = await resp.json();
  const tc = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!tc) return null;
  try { return JSON.parse(tc.function.arguments); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let detailed = 0, placeholders = 0, failed = 0;

    for (const r of TOP_200) {
      const { data: existing } = await sb
        .from("homeo_remedies")
        .select("id, detail_level")
        .eq("name", r.name)
        .maybeSingle();

      if (existing && existing.detail_level === "full") continue;

      if (DETAILED_NAMES.has(r.name)) {
        const detail = await aiGenerate(r.name, r.abbr, apiKey);
        if (!detail) { failed++; continue; }
        const row = {
          name: r.name, abbreviation: r.abbr, latin_name: r.name,
          common_name: detail.common_name, source: detail.source, kingdom: detail.kingdom,
          key_personality: detail.key_personality,
          mental_emotional_picture: detail.mental_emotional_picture,
          general_symptoms: detail.general_symptoms,
          thermal: detail.thermal, thirst: detail.thirst,
          food_cravings: detail.food_cravings ?? [],
          food_aversions: detail.food_aversions ?? [],
          cravings: detail.food_cravings ?? [], aversions: detail.food_aversions ?? [],
          sleep_pattern: detail.sleep_pattern ?? "",
          dreams: detail.dreams ?? "", sweat: detail.sweat ?? "",
          digestive_symptoms: detail.digestive_symptoms ?? "",
          respiratory_symptoms: detail.respiratory_symptoms ?? "",
          skin_symptoms: detail.skin_symptoms ?? "",
          female_symptoms: detail.female_symptoms ?? "",
          male_symptoms: detail.male_symptoms ?? "",
          children_indications: detail.children_indications ?? "",
          modalities_better: detail.modalities_better ?? [],
          modalities_worse: detail.modalities_worse ?? [],
          keynote_symptoms: detail.keynote_symptoms ?? [],
          keynotes: detail.keynote_symptoms ?? [],
          common_clinical_uses: detail.common_clinical_uses ?? [],
          complementary_remedies: detail.complementary_remedies ?? [],
          antidotes: detail.antidotes ?? [],
          compare_with: detail.compare_with ?? [],
          usual_potencies: detail.usual_potencies ?? [],
          common_potencies: detail.usual_potencies ?? [],
          safety_notes: detail.safety_notes ?? "",
          short_description: detail.key_personality?.slice(0, 240) ?? "",
          mind_sphere: detail.mental_emotional_picture ?? "",
          detail_level: "full",
        };
        const { error } = existing
          ? await sb.from("homeo_remedies").update(row).eq("id", existing.id)
          : await sb.from("homeo_remedies").insert(row);
        if (error) { console.error(error); failed++; } else { detailed++; }
        await new Promise((res) => setTimeout(res, 600)); // gentle pacing
      } else {
        if (existing) continue;
        const { error } = await sb.from("homeo_remedies").insert({
          name: r.name, abbreviation: r.abbr, latin_name: r.name,
          detail_level: "placeholder",
          short_description: `${r.name} — profile pending. Edit to add full Materia Medica.`,
        });
        if (error) { console.error(error); failed++; } else { placeholders++; }
      }
    }

    return new Response(JSON.stringify({ ok: true, detailed, placeholders, failed, total: TOP_200.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
