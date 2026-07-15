// mutra-bindu-interpret — AI interpretation of a submitted Mutra Bindu photo.
// Callable by doctors only. Results stored on mutra_bindu_observations for the
// Vaidya review queue. Patient-facing UI must NOT expose these fields.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

const DISCLAIMER =
  "This is an AI-assisted pattern reading, not a diagnosis. Vaidya review required.";

const SPREAD_PATTERNS = [
  "quick_spread",
  "ring_bubble",
  "slow_sink",
  "unclear_image",
] as const;

const DOSHA_INDICATIONS = [
  "Vata-predominant pattern",
  "Pitta-predominant pattern",
  "Kapha-predominant pattern",
  "Inconclusive",
] as const;

const RESPONSE_SCHEMA = {
  name: "mutra_bindu_interpretation",
  description:
    "Structured Mutra Bindu (urine-drop) pattern reading for the reviewing Vaidya.",
  parameters: {
    type: "object",
    properties: {
      spread_pattern: {
        type: "string",
        enum: [...SPREAD_PATTERNS],
        description:
          "Observed spread pattern of the urine drop. Use 'unclear_image' when the photo is blurry, too dark, cropped, or the drop is not distinguishable.",
      },
      dosha_indication: {
        type: "string",
        enum: [...DOSHA_INDICATIONS],
        description:
          "Classical dosha correlation of the observed pattern, or 'Inconclusive' when the image doesn't support a call.",
      },
      confidence_note: {
        type: "string",
        description:
          "One or two short sentences flagging any image-quality issues (lighting, focus, framing, glare, small sample, obscured drop) that affect reliability. If quality is good, say so briefly.",
      },
    },
    required: ["spread_pattern", "dosha_indication", "confidence_note"],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT = `
You are an Ayurveda clinical assistant helping a licensed Vaidya review a Mutra Bindu Pariksha (traditional urine-drop) photograph submitted by a patient.

Classical spread-pattern correlations (guidance only, never diagnostic):
- quick_spread → often correlates with Vata-predominant pattern (thin, quickly-spreading, rapidly disappearing drop).
- ring_bubble → often correlates with Pitta-predominant pattern (drop that spreads with a coloured ring, bubbles, or oily halo).
- slow_sink → often correlates with Kapha-predominant pattern (heavy, sticky, slow-spreading or sinking drop).
- unclear_image → poor lighting, blur, glare, cropping, no visible drop, or a busy background.

Rules:
- Only return the structured tool output.
- If image quality is poor, prefer 'unclear_image' + 'Inconclusive' and explain in confidence_note.
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
      .from("mutra_bindu_observations")
      .select("id, patient_id, sample_time, patient_notes, photo_url, status")
      .eq("id", observation_id)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!obs) return json({ error: "Observation not found" }, 404);

    // Fetch the private photo via service-role download → base64
    const { data: fileBlob, error: dlErr } = await admin.storage
      .from("mutra-bindu-photos")
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
    // Base64 in chunks to avoid stack overflow on large photos
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) {
      bin += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    const dataB64 = btoa(bin);

    const prompt = `
Mutra Bindu photo submitted by the patient.
Sample time (ISO): ${obs.sample_time}
Patient notes: ${obs.patient_notes ? JSON.stringify(obs.patient_notes) : "(none)"}

Examine the attached image, classify the spread pattern, and correlate to a dosha per the response schema. If the image is not clear enough to judge, return 'unclear_image' + 'Inconclusive' and describe the quality issue in confidence_note.
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
          feature: "mutra-bindu-interpret",
          system: SYSTEM_PROMPT,
          prompt,
          attachments: [{ mime, data_base64: dataB64, filename: "mutra-bindu.jpg" }],
          response_schema: RESPONSE_SCHEMA,
          max_tokens: 700,
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

    const spread_pattern =
      (SPREAD_PATTERNS as readonly string[]).includes(result.spread_pattern)
        ? (result.spread_pattern as string)
        : "unclear_image";
    const dosha_indication =
      (DOSHA_INDICATIONS as readonly string[]).includes(result.dosha_indication)
        ? (result.dosha_indication as string)
        : "Inconclusive";
    const confidence_note = String(result.confidence_note ?? "").trim().slice(0, 500);

    // Persist AI fields — Vaidya-only. Patient RLS SELECT policy applies but the
    // patient UI must not surface these columns until vaidya_reviewed = true.
    const { error: uErr } = await admin
      .from("mutra_bindu_observations")
      .update({
        spread_pattern_ai: spread_pattern,
        dosha_suggestion_ai: dosha_indication,
        status: "ai_processed",
      })
      .eq("id", observation_id);
    if (uErr) throw uErr;

    return json({
      observation_id,
      spread_pattern,
      dosha_indication,
      confidence_note,
      disclaimer: DISCLAIMER,
    });
  } catch (e) {
    console.error("mutra-bindu-interpret error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
