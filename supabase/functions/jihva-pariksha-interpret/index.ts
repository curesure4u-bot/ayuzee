// jihva-pariksha-interpret — AI interpretation of a submitted Jihva (tongue) photo.
// Callable by doctors only. Results stored on jihva_pariksha_observations.ayurvedic_interpretation_ai
// for the Vaidya review queue. Patient-facing UI must NOT expose this field.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

const DISCLAIMER =
  "This is an AI-assisted pattern reading, not a diagnosis. Vaidya review required.";

const COLORS = ["pale", "normal_pink", "red", "purplish", "bluish", "yellowish", "unclear"] as const;
const COATING_PRESENCE = ["none", "light", "thick", "unclear"] as const;
const COATING_COLORS = ["white", "yellow", "grey", "black", "brown", "none", "unclear"] as const;
const TEXTURES = ["smooth", "rough", "cracked", "unclear"] as const;
const MOISTURE = ["dry", "normal", "excessively_moist", "unclear"] as const;
const PRESENCE = ["present", "absent", "unclear"] as const;
const DOSHAS = [
  "Vata-predominant pattern",
  "Pitta-predominant pattern",
  "Kapha-predominant pattern",
  "Inconclusive",
] as const;

const RESPONSE_SCHEMA = {
  name: "jihva_pariksha_interpretation",
  description:
    "Structured Ayurvedic Jihva Pariksha (tongue diagnosis) reading for the reviewing Vaidya.",
  parameters: {
    type: "object",
    properties: {
      color: {
        type: "string",
        enum: [...COLORS],
        description: "Overall tongue body color.",
      },
      coating_presence: {
        type: "string",
        enum: [...COATING_PRESENCE],
        description: "Ama indication via coating thickness.",
      },
      coating_color: {
        type: "string",
        enum: [...COATING_COLORS],
        description: "Coating color if any; 'none' when no coating; 'unclear' when the image doesn't allow judgment.",
      },
      texture: {
        type: "string",
        enum: [...TEXTURES],
        description: "Surface texture of the tongue.",
      },
      moisture_level: {
        type: "string",
        enum: [...MOISTURE],
        description: "Moisture on the tongue surface.",
      },
      cracks_fissures: {
        type: "string",
        enum: [...PRESENCE],
        description: "Presence of cracks or fissures.",
      },
      cracks_location: {
        type: "string",
        description:
          "Free-text location of cracks/fissures if present (e.g., 'midline', 'tip', 'lateral'). Empty string when absent or unclear.",
      },
      tooth_marks: {
        type: "string",
        enum: [...PRESENCE],
        description: "Scalloping / tooth-mark impressions along the lateral edges.",
      },
      dosha_suggestion: {
        type: "string",
        enum: [...DOSHAS],
        description:
          "Classical dosha correlation based on the above features, or 'Inconclusive' when the image doesn't support a call.",
      },
      confidence_note: {
        type: "string",
        description:
          "One or two short sentences flagging any image-quality issues (lighting, focus, framing, glare, colour cast, tongue not fully visible) that affect reliability. If quality is good, say so briefly.",
      },
    },
    required: [
      "color",
      "coating_presence",
      "coating_color",
      "texture",
      "moisture_level",
      "cracks_fissures",
      "cracks_location",
      "tooth_marks",
      "dosha_suggestion",
      "confidence_note",
    ],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT = `
You are an Ayurveda clinical assistant helping a licensed Vaidya review a Jihva Pariksha (tongue diagnosis) photograph submitted by a patient.

Classical Ayurvedic correlations (guidance only, never diagnostic):
- Vata pattern: pale/bluish/dark color, dry surface, rough or cracked texture, prominent fissures, thin coating or none.
- Pitta pattern: red/purplish color, moist, smooth surface, yellowish or greyish coating, possible burning-tip indications, few fissures.
- Kapha pattern: pale-to-normal pink, thick white coating, excessively moist/slimy surface, swollen with scalloped edges (tooth-marks).
- Ama (undigested toxins) is indicated primarily by a thick coating; light coating is usually normal, none is unremarkable.

Rules:
- Only return the structured tool output.
- If image quality is poor, prefer 'unclear' for the affected fields and 'Inconclusive' for dosha_suggestion, and explain in confidence_note.
- Restrict outputs strictly to the listed enums. Use cracks_location free-text only when cracks_fissures = 'present'; otherwise return an empty string.
- Never claim a diagnosis. This is a pattern-recognition aid for the Vaidya.
`.trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const { observation_id } = await req.json().catch(() => ({}));
    if (!observation_id || typeof observation_id !== "string") {
      return json({ error: "observation_id is required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Restrict to doctors — AI fields are Vaidya-only.
    const { data: doc } = await admin
      .from("doctors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!doc?.id) return json({ error: "Forbidden — Vaidya only" }, 403);

    // Load the observation
    const { data: obs, error: oErr } = await admin
      .from("jihva_pariksha_observations")
      .select("id, patient_id, patient_notes, photo_url, status")
      .eq("id", observation_id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!obs) return json({ error: "Observation not found" }, 404);

    // Fetch the private photo via service-role download → base64
    const { data: fileBlob, error: dlErr } = await admin.storage
      .from("jihva-pariksha-photos")
      .download(obs.photo_url);
    if (dlErr || !fileBlob) {
      console.error("photo download failed", dlErr);
      return json({ error: "Could not read submitted photo" }, 500);
    }
    const mime = fileBlob.type || "image/jpeg";
    if (!mime.startsWith("image/")) {
      return json({ error: "Photo is not an image" }, 400);
    }
    const buf = new Uint8Array(await fileBlob.arrayBuffer());
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      bin += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    const dataB64 = btoa(bin);

    const prompt = `
Jihva Pariksha (tongue) photo submitted by the patient.
Patient notes: ${obs.patient_notes ? JSON.stringify(obs.patient_notes) : "(none)"}

Examine the attached image and produce a strict Ayurvedic tongue reading per the response schema. If the image is not clear enough for any field, use 'unclear' for that field and 'Inconclusive' for dosha_suggestion; describe the quality issue in confidence_note.
`.trim();

    // Call shared ai-gateway
    const gwResp = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`,
      {
        method: "POST",
        headers: {
          Authorization: req.headers.get("Authorization")!,
          apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feature: "jihva-pariksha-interpret",
          system: SYSTEM_PROMPT,
          prompt,
          attachments: [{ mime, data_base64: dataB64, filename: "jihva.jpg" }],
          response_schema: RESPONSE_SCHEMA,
          max_tokens: 900,
        }),
      },
    );

    if (gwResp.status === 429)
      return json({ error: "Rate limited, try again shortly." }, 429);
    if (gwResp.status === 402)
      return json({ error: "AI credits exhausted." }, 402);
    if (!gwResp.ok) {
      const t = await gwResp.text();
      console.error("ai-gateway error", gwResp.status, t);
      return json({ error: "AI gateway error" }, 500);
    }

    const gwData = await gwResp.json();
    const result = gwData?.result;
    if (!result || typeof result !== "object") {
      console.error("ai-gateway missing result", gwData);
      return json({ error: "AI did not return structured result" }, 502);
    }

    const pick = <T extends readonly string[]>(v: unknown, allow: T, fallback: T[number]) =>
      (allow as readonly string[]).includes(v as string) ? (v as T[number]) : fallback;

    const interpretation = {
      color: pick(result.color, COLORS, "unclear"),
      coating_presence: pick(result.coating_presence, COATING_PRESENCE, "unclear"),
      coating_color: pick(result.coating_color, COATING_COLORS, "unclear"),
      texture: pick(result.texture, TEXTURES, "unclear"),
      moisture_level: pick(result.moisture_level, MOISTURE, "unclear"),
      cracks_fissures: pick(result.cracks_fissures, PRESENCE, "unclear"),
      cracks_location: String(result.cracks_location ?? "").trim().slice(0, 200),
      tooth_marks: pick(result.tooth_marks, PRESENCE, "unclear"),
      dosha_suggestion: pick(result.dosha_suggestion, DOSHAS, "Inconclusive"),
    };
    const confidence_note = String(result.confidence_note ?? "").trim().slice(0, 500);

    // Persist AI fields — Vaidya-only. Patient UI must not surface until vaidya_reviewed = true.
    const { error: uErr } = await admin
      .from("jihva_pariksha_observations")
      .update({
        ayurvedic_interpretation_ai: { ...interpretation, confidence_note },
        status: "ai_processed",
      })
      .eq("id", observation_id);
    if (uErr) throw uErr;

    return json({
      observation_id,
      ...interpretation,
      confidence_note,
      disclaimer: DISCLAIMER,
    });
  } catch (e) {
    console.error("jihva-pariksha-interpret error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
