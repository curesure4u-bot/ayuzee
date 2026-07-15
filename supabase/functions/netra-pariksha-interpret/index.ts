// netra-pariksha-interpret — AI interpretation of a submitted Netra (eye) photo.
// Callable by doctors only. Results stored on netra_pariksha_observations.ayurvedic_interpretation_ai
// for the Vaidya review queue. Patient-facing UI must NOT expose this field.
// Strictly classical Ayurvedic Netra Pariksha parameters — NOT iridology / iris-mapping.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

const DISCLAIMER =
  "This is an AI-assisted pattern reading, not a diagnosis. Vaidya review required.";

const COLOR_TINGE = ["normal_white", "yellowish", "reddish", "pale", "unclear"] as const;
const DISCHARGE = ["none", "mild", "excessive", "unclear"] as const;
const DRYNESS_MOISTURE = ["dry", "normal", "excessively_watery", "unclear"] as const;
const SWELLING = ["present", "absent", "unclear"] as const;
const SCLERA = ["normal", "yellow_tinged", "red_bloodshot", "unclear"] as const;
const PRESENCE = ["present", "absent", "unclear"] as const;
const DOSHAS = [
  "Vata-predominant pattern",
  "Pitta-predominant pattern",
  "Kapha-predominant pattern",
  "Inconclusive",
] as const;

const RESPONSE_SCHEMA = {
  name: "netra_pariksha_interpretation",
  description:
    "Structured classical Ayurvedic Netra Pariksha (eye examination) reading for the reviewing Vaidya. Not iridology.",
  parameters: {
    type: "object",
    properties: {
      color_tinge: {
        type: "string",
        enum: [...COLOR_TINGE],
        description: "Overall color tinge of the visible eye.",
      },
      discharge: {
        type: "string",
        enum: [...DISCHARGE],
        description: "Srava — presence/amount of ocular discharge visible.",
      },
      discharge_type: {
        type: "string",
        description:
          "Free-text describing type of discharge if visible (e.g., 'watery', 'mucoid', 'sticky yellow'). Empty string when none/unclear.",
      },
      dryness_moisture: {
        type: "string",
        enum: [...DRYNESS_MOISTURE],
        description: "Ocular surface moisture level.",
      },
      swelling: {
        type: "string",
        enum: [...SWELLING],
        description: "Shopha — visible swelling of lids or periocular area.",
      },
      swelling_location: {
        type: "string",
        description:
          "Free-text location of swelling if present (e.g., 'upper lid', 'lower lid', 'periorbital'). Empty string when absent/unclear.",
      },
      sclera_color: {
        type: "string",
        enum: [...SCLERA],
        description: "Color of the sclera.",
      },
      under_eye_discoloration: {
        type: "string",
        enum: [...PRESENCE],
        description: "Visible dark/discolored under-eye area.",
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
          "One or two short sentences flagging any image-quality issues (lighting, focus, framing, glare, eye not fully open) that affect reliability. If quality is good, say so briefly.",
      },
    },
    required: [
      "color_tinge",
      "discharge",
      "discharge_type",
      "dryness_moisture",
      "swelling",
      "swelling_location",
      "sclera_color",
      "under_eye_discoloration",
      "dosha_suggestion",
      "confidence_note",
    ],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT = `
You are an Ayurveda clinical assistant helping a licensed Vaidya review a Netra Pariksha (eye examination) photograph submitted by a patient.

Scope — STRICTLY classical Ayurvedic Netra Pariksha only. DO NOT perform iridology or iris-mapping. Do not infer organ status from iris zones. Only report the gross visible parameters listed in the schema.

Classical Ayurvedic correlations (guidance only, never diagnostic):
- Vata pattern: dry surface, dull/pale tinge, sunken appearance, under-eye discoloration, minimal discharge.
- Pitta pattern: reddish/bloodshot sclera, yellow tinge, burning appearance, mild watery or yellow discharge.
- Kapha pattern: excessively watery, swollen/heavy lids, sticky mucoid discharge, pale-white with puffiness.

Rules:
- Only return the structured tool output.
- If image quality is poor, prefer 'unclear' for the affected fields and 'Inconclusive' for dosha_suggestion, and explain in confidence_note.
- Restrict outputs strictly to the listed enums. Use free-text fields (discharge_type, swelling_location) only when the corresponding enum is 'present'/'mild'/'excessive'; otherwise return an empty string.
- Never claim a diagnosis, never reference iridology. This is a pattern-recognition aid for the Vaidya.
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
      .from("netra_pariksha_observations")
      .select("id, patient_id, patient_notes, photo_url, status")
      .eq("id", observation_id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!obs) return json({ error: "Observation not found" }, 404);

    // Fetch the private photo via service-role download → base64
    const { data: fileBlob, error: dlErr } = await admin.storage
      .from("netra-pariksha-photos")
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
Netra Pariksha (eye) photo submitted by the patient.
Patient notes: ${obs.patient_notes ? JSON.stringify(obs.patient_notes) : "(none)"}

Examine the attached image and produce a strict classical Ayurvedic eye reading per the response schema. Do NOT do iridology / iris-mapping. If the image is not clear enough for any field, use 'unclear' for that field and 'Inconclusive' for dosha_suggestion; describe the quality issue in confidence_note.
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
          feature: "netra-pariksha-interpret",
          system: SYSTEM_PROMPT,
          prompt,
          attachments: [{ mime, data_base64: dataB64, filename: "netra.jpg" }],
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
      color_tinge: pick(result.color_tinge, COLOR_TINGE, "unclear"),
      discharge: pick(result.discharge, DISCHARGE, "unclear"),
      discharge_type: String(result.discharge_type ?? "").trim().slice(0, 200),
      dryness_moisture: pick(result.dryness_moisture, DRYNESS_MOISTURE, "unclear"),
      swelling: pick(result.swelling, SWELLING, "unclear"),
      swelling_location: String(result.swelling_location ?? "").trim().slice(0, 200),
      sclera_color: pick(result.sclera_color, SCLERA, "unclear"),
      under_eye_discoloration: pick(result.under_eye_discoloration, PRESENCE, "unclear"),
      dosha_suggestion: pick(result.dosha_suggestion, DOSHAS, "Inconclusive"),
    };
    const confidence_note = String(result.confidence_note ?? "").trim().slice(0, 500);

    // Persist AI fields — Vaidya-only. Patient UI must not surface until vaidya_reviewed = true.
    const { error: uErr } = await admin
      .from("netra_pariksha_observations")
      .update({
        ayurvedic_interpretation_ai: { ...interpretation, confidence_note, disclaimer: DISCLAIMER },
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
    console.error("netra-pariksha-interpret error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
