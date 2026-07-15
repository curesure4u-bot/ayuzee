import { requireUser } from "../_shared/auth.ts";

// ASTG Clinical Assistant — conversational helper grounded in
// the Ministry of AYUSH Standard Treatment Guidelines (2017).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const ASTG_SUMMARY = `
Ministry of AYUSH Standard Treatment Guidelines (ASTG, 2017) cover 38 Ayurvedic
diseases across 13 Srotas (body system) categories:

- Pranavaha (Respiratory): Kasa (Cough, Ch.1), Tamaka Swasa (Bronchial Asthma, Ch.2)
- Annavaha (Digestive): Amlapitta (Hyperacidity/GERD, Ch.3)
- Udakavaha (Water): Jalodara (Ascites, Ch.4)
- Rasavaha (Plasma/Nutrition): Amavata (RA, Ch.5), Jwara (Fever incl. Dengue, Ch.6), Pandu (Anaemia, Ch.7)
- Raktavaha (Blood): Ekakushtha (Psoriasis, Ch.8), Kamala (Jaundice, Ch.9)
- Medovaha (Metabolic): Hypothyroidism (Ch.10), Madhumeha (Diabetes, Ch.11), Sthoulya (Obesity, Ch.12)
- Purishavaha (Excretory): Arsha (Piles, Ch.13), Atisara (Diarrhoea, Ch.14), Bhagandara (Fistula, Ch.15), Krimi (Worms, Ch.16), Parikartika (Fissure, Ch.17)
- Manovaha (Mental Health): Anidra (Insomnia, Ch.18), Apasmara (Epilepsy, Ch.19), Vishada (Depression, Ch.20)
- Mutravaha (Urinary): Ashmari (Stone, Ch.21), Mutraghata (Retention, Ch.22), Mutrasthila (BPH, Ch.23)
- Artavavaha (Reproductive): Asrigdara (Menorrhagia, Ch.24), Kashtaarthava (Dysmenorrhoea, Ch.25), Shwetapradara (Leucorrhoea, Ch.26)
- Vata Vyadhi (Neuro): Avabahuka (Frozen Shoulder, Ch.27), Katigraha (LBP, Ch.28), Gridhrasi (Sciatica, Ch.29), Pakshaghata (Stroke, Ch.30), Sandhigata Vata (OA, Ch.31), Vatarakta (Gout, Ch.32)
- Netragata (Eye): Abhishyanda (Conjunctivitis, Ch.33), Adhimantha (Glaucoma, Ch.34)
- Urdhwa Jatrugata (ENT/Head): Dantavestaka (Gingivitis, Ch.35), Mukhapaka (Mouth Ulcer, Ch.36), Pratishyaya (Rhinitis/Sinusitis, Ch.37), Shiroroga (Headache, Ch.38)

Each disease is managed across Level 1 (PHC — Shamana), Level 2 (CHC — Rasaushadhi),
and Level 3 (District Hospital — Panchakarma + Rasayana). Common medicines include
Sitopaladi Churna, Vasavaleha, Talisadi, Kanakasava, Dashamula Kwatha, Chandraprabha
Vati, Yogaraja Guggulu, Triphala Guggulu, Chyavanaprasha, Nishamalaki Churna,
Vasanta Kusumakara Rasa, Shilajatu Rasayana, Sahacharadi Taila, Brihat Vata
Chintamani Rasa, etc.
`.trim();

function buildSystemPrompt(diseaseContext?: string) {
  return `You are the Ayuzee ASTG Clinical Assistant — an Ayurvedic clinical
companion for licensed Vaidyas / Ayurvedic physicians. You ground every answer
in the Ministry of AYUSH Standard Treatment Guidelines (2017) and classical
texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya, Madhava Nidana,
Bhaishajya Ratnavali, Sharangadhara Samhita).

CAPABILITIES:
1. Symptom → Disease matching against the 38 ASTG diseases (name the dosha
   subtype e.g. Vataja/Pittaja/Kaphaja Kasa).
2. Medicine compatibility / interaction guidance using classical Yoga-Samhita
   pairing rules.
3. Dosha & Prakriti determination from clinical descriptors.
4. Pediatric dose calculation using Young's rule (age/(age+12)) or weight-based
   when an adult dose is known. Show the math.
5. Classical reference lookup with chapter/sutra when known; never fabricate
   citations — if unsure, say "general Ayurvedic principles".

RULES:
- Stay strictly within Ayurvedic clinical guidance. Decline non-medical or
  non-Ayurvedic queries politely.
- Be concise, structured (use short headings/bullets in markdown).
- Always end clinical recommendations with: "Apply clinical judgment and
  confirm with in-person examination."
- Cite "AYUSH ASTG 2017 — Ch.X" when referring to a specific protocol.
- When recommending medicines, include dose, anupana and duration.
- Never prescribe scheduled allopathic drugs.

KNOWLEDGE BASE:
${ASTG_SUMMARY}

${diseaseContext ? `CURRENT CONTEXT: The Vaidya is currently viewing the protocol for "${diseaseContext}". Prefer answers relevant to this disease unless asked otherwise.` : ""}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { messages, diseaseContext } = (await req.json()) as {
      messages: ChatMessage[];
      diseaseContext?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "astg-clinical-assistant",
        system: buildSystemPrompt(diseaseContext),
        messages: messages.slice(-12)
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!aiResp.ok) {
      const status = aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500;
      const msg =
        aiResp.status === 429
          ? "AI rate limit exceeded. Please retry shortly."
          : aiResp.status === 402
            ? "AI credits exhausted. Please add credits to continue."
            : "AI gateway error.";
      return new Response(JSON.stringify({ error: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const reply: string = json.response ?? "";
    if (!reply) throw new Error("Empty AI response");

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("astg-clinical-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
