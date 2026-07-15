// spine-interpret — turns a submitted spine_assessments row into an AI-drafted
// spine_reports row.
//
// Platform rule: red-flag cases skip AI interpretation. Before calling the AI
// gateway we look up the ASTG (Musculoskeletal Disorders) reference disease
// that best matches the patient's inputs (Cervical Spondylosis for neck-led
// presentations, Lumbar Spondylosis for back-led), and check the patient's
// answered symptoms + linked posture screening against that disease's
// red_flag_signs. If any match, we bypass the AI entirely and route straight
// to in-person booking, sourcing the matched sign transparently from the
// DGHS Standard Treatment Guidelines on Musculoskeletal Disorders.
//
// If nothing matches we run the AI as before, but we no longer let the AI
// quote classical shloka verbatim — instead we attach the ASTG disease id to
// the report so the Vaidya can open the reference page during sign-off.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

// Compact inline reference for the AI (used when astg_diseases rows are absent).
const ASTG_REFERENCE = `
Katigraha (classical: Low Back Pain / Lumbar Stiffness)
- Predominant dosha: Vata (often Vata-Kapha in chronic/heavy cases).
- Typical fit when: low-back pain dominates, morning stiffness present, no numbness/weakness, no shooting pain into the leg.

Gridhrasi (classical: Sciatica)
- Predominant dosha: Vata (Vata-Kapha subtype when heaviness + numbness dominate).
- Typical fit when: radicular pain into the leg, numbness/tingling, weakness, or pain that wakes the patient at night.

Selection guidance for the assistant:
- If radicular symptoms (leg radiation, numbness, weakness, night pain) are clearly present → suggest Gridhrasi.
- If pain is localized to the low back with stiffness only → suggest Katigraha.
- If unclear or symptoms don't fit either pattern → return null for likely_astg_pattern.
- Never override red-flag guidance with reassurance.
`.trim();

const RESPONSE_SCHEMA = {
  name: "spine_interpretation",
  description: "Structured spine assessment interpretation for the reviewing Vaidya.",
  parameters: {
    type: "object",
    properties: {
      draft_summary: {
        type: "string",
        description:
          "Warm plain-language summary for the patient (110-180 words). Explain what the answers suggest about spine load, mention posture findings if provided, name the classical pattern in brackets if applicable. Do NOT quote classical Sanskrit shloka text verbatim — a reference link to the ASTG page will be attached programmatically. Do NOT contradict or soften any red flag.",
      },
      likely_astg_pattern: {
        type: ["string", "null"],
        enum: ["Katigraha", "Gridhrasi", null],
        description:
          "Best-fit ASTG classical pattern, or null when the picture doesn't clearly fit either.",
      },
      dosha_note: {
        type: "string",
        description:
          "One or two sentences on the likely dosha involvement (e.g. Vata predominance) and why.",
      },
      recommended_action: {
        type: "string",
        description:
          "Short next-step recommendation for the patient. Home-care advice for mild cases, professional review for moderate/high risk.",
      },
    },
    required: ["draft_summary", "likely_astg_pattern", "dosha_note", "recommended_action"],
    additionalProperties: false,
  },
};

const RED_FLAG_ACTION = "Book an in-person Vaidya consultation now";
const STG_SOURCE = "DGHS Standard Treatment Guidelines on Musculoskeletal Disorders (Ministry of AYUSH, 2024)";

// Spine questionnaire IDs that map to canonical red-flag symptom labels.
// These mirror the ASTG red_flag_signs vocabulary so a fuzzy substring match
// hits reliably. Answers are on a 0–4 scale; anything ≥3 counts as "reported".
const QUESTIONNAIRE_RED_FLAG_MAP: { qid: number; label: string; keywords: string[] }[] = [
  { qid: 3,  label: "Radiating pain into arm or leg", keywords: ["radiat"] },
  { qid: 4,  label: "Numbness or tingling in arms or legs", keywords: ["numb", "tingl"] },
  { qid: 10, label: "Progressive limb weakness", keywords: ["weak"] },
  { qid: 13, label: "Pain that wakes the patient at night", keywords: ["night", "sleep"] },
];

// Decide which spondylosis pattern to check based on where symptoms are worst.
function detectPattern(answers: Record<string, number>): "cervical" | "lumbar" | "both" | null {
  const a = (id: number) => Number(answers[String(id)] ?? answers[id] ?? 0);
  const cervicalLoad = a(1) + a(9);                       // neck pain, forward head posture
  const lumbarLoad   = a(2) + a(11) + a(12) + a(18);      // low back pain, avoid bending/walking, obesity
  const neck = cervicalLoad >= 2;
  const back = lumbarLoad >= 2;
  if (neck && back) return "both";
  if (neck) return "cervical";
  if (back) return "lumbar";
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;
    const { userId } = authResult;

    const { assessment_id } = await req.json().catch(() => ({}));
    if (!assessment_id || typeof assessment_id !== "string") {
      return json({ error: "assessment_id is required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Load the assessment
    const { data: assessment, error: aErr } = await admin
      .from("spine_assessments")
      .select("id, patient_id, doctor_id, status, responses, spine_score, risk_label, has_red_flag, posture_assessment_id")
      .eq("id", assessment_id)
      .maybeSingle();
    if (aErr) throw aErr;
    if (!assessment) return json({ error: "Assessment not found" }, 404);

    // 2. Authorize: patient who owns it, OR any doctor row for this user
    const isOwner = assessment.patient_id === userId;
    let isDoctor = false;
    if (!isOwner) {
      const { data: doc } = await admin
        .from("doctors")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      isDoctor = !!doc?.id;
    }
    if (!isOwner && !isDoctor) return json({ error: "Forbidden" }, 403);

    // 3. Load linked posture (if any)
    let posture: any = null;
    if (assessment.posture_assessment_id) {
      const { data: p } = await admin
        .from("vaidya_posture_assessments")
        .select("id, spine_score, overall_index, risk_level, findings, corrective_plan, assessment_date")
        .eq("id", assessment.posture_assessment_id)
        .maybeSingle();
      posture = p ?? null;
    }

    const answers = assessment.responses?.answers ?? assessment.responses ?? {};

    // 4. ASTG red-flag lookup (Musculoskeletal Disorders — Spondylosis)
    //
    // Pull the two spondylosis reference rows plus their red_flag_signs. We
    // pick which one applies based on where the patient's symptoms cluster,
    // and match the ASTG-listed red flags against the patient's inputs.
    const patternHint = detectPattern(answers);

    const { data: spondyRows } = await admin
      .from("astg_diseases")
      .select("id, name, name_modern, astg_management_principles ( red_flag_signs )")
      .or("name_modern.ilike.%Cervical Spondylosis%,name_modern.ilike.%Lumbar Spondylosis%");

    const cervicalDisease = (spondyRows ?? []).find((r: any) =>
      /cervical spondylosis/i.test(r.name_modern ?? "")
    );
    const lumbarDisease = (spondyRows ?? []).find((r: any) =>
      /lumbar spondylosis/i.test(r.name_modern ?? "")
    );

    const chosenDiseases: any[] = [];
    if (patternHint === "cervical" && cervicalDisease) chosenDiseases.push(cervicalDisease);
    else if (patternHint === "lumbar" && lumbarDisease) chosenDiseases.push(lumbarDisease);
    else if (patternHint === "both") {
      if (cervicalDisease) chosenDiseases.push(cervicalDisease);
      if (lumbarDisease) chosenDiseases.push(lumbarDisease);
    }

    // Collect all red_flag_signs from the chosen diseases.
    const astgSigns: { disease: any; sign: string }[] = [];
    for (const d of chosenDiseases) {
      const mp = Array.isArray(d.astg_management_principles)
        ? d.astg_management_principles[0]
        : d.astg_management_principles;
      const signs: string[] = mp?.red_flag_signs ?? [];
      for (const s of signs) astgSigns.push({ disease: d, sign: s });
    }

    // Build the list of red-flag symptoms the patient actually reported.
    const reportedSymptoms: { label: string; keywords: string[] }[] = [];
    for (const m of QUESTIONNAIRE_RED_FLAG_MAP) {
      if (Number(answers[String(m.qid)] ?? answers[m.qid] ?? 0) >= 3) {
        reportedSymptoms.push({ label: m.label, keywords: m.keywords });
      }
    }
    // High/severe posture risk counts as a generic red-flag input too.
    const postureRisk = String(posture?.risk_level ?? "").toLowerCase();
    if (postureRisk === "high" || postureRisk === "severe") {
      reportedSymptoms.push({
        label: `Posture screening risk level: ${posture.risk_level}`,
        keywords: ["postur"],
      });
    }

    // Match reported symptoms against ASTG-listed red_flag_signs.
    let astgMatch: { disease: any; sign: string; matchedSymptom: string } | null = null;
    outer:
    for (const rs of reportedSymptoms) {
      for (const entry of astgSigns) {
        const signLower = entry.sign.toLowerCase();
        if (rs.keywords.some((k) => signLower.includes(k))) {
          astgMatch = { disease: entry.disease, sign: entry.sign, matchedSymptom: rs.label };
          break outer;
        }
      }
    }

    // Prefer the ASTG match; otherwise fall back to the questionnaire's own
    // has_red_flag boolean so behaviour stays consistent with the existing
    // "red-flag cases skip AI" platform rule.
    const bypassAI = !!astgMatch || !!assessment.has_red_flag;

    // Pick the disease id to link to on the report even in the non-bypass path.
    const referenceDisease =
      astgMatch?.disease ??
      chosenDiseases[0] ??
      lumbarDisease ??
      cervicalDisease ??
      null;
    const referenceDiseaseId: string | null = referenceDisease?.id ?? null;

    // 5. Bypass path — skip AI entirely.
    if (bypassAI) {
      const matchedSign = astgMatch?.sign ?? "Nerve-related or night-pain symptoms";
      const matchedSymptom = astgMatch?.matchedSymptom ?? "Questionnaire safety trigger";
      const flaggedLine = astgMatch
        ? `Flagged: ${matchedSign} — per ${STG_SOURCE}.`
        : `Flagged: ${matchedSign}.`;

      const bypassSummary = [
        `Your spine assessment triggered a red-flag safety rule, so we've skipped the AI-drafted summary and are asking you to see a Vaidya in person first.`,
        `${flaggedLine}${astgMatch ? ` This matches what you reported (${matchedSymptom.toLowerCase()}).` : ""}`,
        `An in-person examination is the safe next step before starting classical management. Please book a consultation now.`,
      ].join("\n\n");

      const draftSummary = `${bypassSummary}\n\nRecommended next step: ${RED_FLAG_ACTION}`;

      // Upsert the report
      const { data: existing } = await admin
        .from("spine_reports")
        .select("id")
        .eq("assessment_id", assessment_id)
        .maybeSingle();

      const reportPayload = {
        assessment_id,
        ai_draft_summary: draftSummary,
        likely_astg_pattern: astgMatch
          ? (/cervical/i.test(astgMatch.disease.name_modern ?? "") ? "Cervical Spondylosis" : "Lumbar Spondylosis")
          : null,
        recommended_action: RED_FLAG_ACTION,
        dosha_note: null as string | null,
        astg_disease_id: referenceDiseaseId,
        astg_red_flag_matched: astgMatch ? matchedSign : null,
        astg_red_flag_source: astgMatch ? STG_SOURCE : null,
        interpretation_bypassed: true,
      };

      let reportId: string | null = null;
      if (existing?.id) {
        const { data: upd, error: uErr } = await admin
          .from("spine_reports")
          .update(reportPayload)
          .eq("id", existing.id)
          .select("id")
          .single();
        if (uErr) throw uErr;
        reportId = upd.id;
      } else {
        const { data: ins, error: iErr } = await admin
          .from("spine_reports")
          .insert(reportPayload)
          .select("id")
          .single();
        if (iErr) throw iErr;
        reportId = ins.id;
      }

      // Mark the assessment so it still surfaces in the Vaidya review queue,
      // and force has_red_flag = true so downstream UI already knows to
      // suppress AI-style suggestions.
      const { error: sErr } = await admin
        .from("spine_assessments")
        .update({ status: "ai_drafted", has_red_flag: true })
        .eq("id", assessment_id);
      if (sErr) throw sErr;

      return json({
        report_id: reportId,
        assessment_id,
        ai_draft_summary: draftSummary,
        likely_astg_pattern: reportPayload.likely_astg_pattern,
        dosha_note: null,
        recommended_action: RED_FLAG_ACTION,
        has_red_flag: true,
        interpretation_bypassed: true,
        astg_disease_id: referenceDiseaseId,
        astg_red_flag_matched: reportPayload.astg_red_flag_matched,
        astg_red_flag_source: reportPayload.astg_red_flag_source,
      });
    }

    // 6. Non-bypass path — proceed with AI as before.
    // Fetch additional ASTG context (Katigraha / Gridhrasi) for the prompt.
    const { data: astgRows } = await admin
      .from("astg_diseases")
      .select("name, name_modern, definition, lakshana, diagnostic_criteria, nidana")
      .or("name.ilike.%katigraha%,name.ilike.%gridhrasi%,name_modern.ilike.%sciatica%,name_modern.ilike.%low back%")
      .limit(4);

    const astgBlock = astgRows && astgRows.length
      ? astgRows.map((r: any) => {
          return `${r.name}${r.name_modern ? " (" + r.name_modern + ")" : ""}
Definition: ${r.definition ?? "—"}
Nidana: ${r.nidana ?? "—"}
Lakshana: ${r.lakshana ?? "—"}
Diagnostic criteria: ${r.diagnostic_criteria ?? "—"}`;
        }).join("\n\n")
      : ASTG_REFERENCE;

    const answersBlock = Object.entries(answers)
      .map(([qid, v]) => `Q${qid}: ${v}/4`)
      .join("\n");

    const postureBlock = posture
      ? `Posture screening on file (date: ${posture.assessment_date ?? "—"}):
- spine_score: ${posture.spine_score ?? "—"}
- overall_index: ${posture.overall_index ?? "—"}
- risk_level: ${posture.risk_level ?? "—"}
- findings: ${JSON.stringify(posture.findings ?? {}, null, 2)}
- corrective_plan: ${JSON.stringify(posture.corrective_plan ?? {}, null, 2)}`
      : "No posture screening on file.";

    const prompt = `
Spine assessment (patient wellness questionnaire, 0-4 scale where 4 = almost always/severe).

Questionnaire answers:
${answersBlock}

Computed spine load score: ${assessment.spine_score ?? "—"} / 80
Risk band: ${assessment.risk_label ?? "—"}
No ASTG red flag matched — safe to draft a summary.

${postureBlock}

ASTG reference (classical patterns to consider):
${astgBlock}

Please interpret this case per the response schema. Write the draft_summary directly to the patient in warm plain language, name the classical pattern in brackets if you choose one, and never soften a red flag. Do NOT quote Sanskrit shloka text verbatim — a link to the ASTG reference page is attached programmatically for the reviewing Vaidya.
    `.trim();

    // Call ai-gateway
    const gwResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "spine-interpret",
        system:
          "You are an Ayurveda clinical assistant helping a licensed Vaidya draft a spine assessment summary. Be clear and cautious. Never contradict or soften a red flag. Prefer classical Ayurveda terminology (Vata, Katigraha, Gridhrasi) alongside plain English, but do NOT quote Sanskrit shloka text verbatim — the platform attaches a link to the ASTG reference page automatically. Only return the structured tool output.",
        prompt,
        response_schema: RESPONSE_SCHEMA,
        max_tokens: 1200,
      }),
    });

    if (gwResp.status === 429)
      return json({ error: "Rate limited, try again shortly." }, 429);
    if (gwResp.status === 402)
      return json({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }, 402);
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

    const draftSummary = String(result.draft_summary ?? "").trim();
    let likelyPattern: string | null = null;
    if (result.likely_astg_pattern === "Katigraha" || result.likely_astg_pattern === "Gridhrasi") {
      likelyPattern = result.likely_astg_pattern;
    }
    const doshaNote = String(result.dosha_note ?? "").trim();
    const recommendedAction = String(result.recommended_action ?? "").trim();

    const finalDraft = doshaNote
      ? `${draftSummary}\n\n${doshaNote}\n\nRecommended next step: ${recommendedAction}`
      : `${draftSummary}\n\nRecommended next step: ${recommendedAction}`;

    // Upsert spine_reports row and update assessment status
    const { data: existing } = await admin
      .from("spine_reports")
      .select("id")
      .eq("assessment_id", assessment_id)
      .maybeSingle();

    const reportPayload = {
      assessment_id,
      ai_draft_summary: finalDraft,
      likely_astg_pattern: likelyPattern,
      dosha_note: doshaNote || null,
      recommended_action: recommendedAction,
      astg_disease_id: referenceDiseaseId,
      astg_red_flag_matched: null as string | null,
      astg_red_flag_source: null as string | null,
      interpretation_bypassed: false,
    };

    let reportId: string | null = null;
    if (existing?.id) {
      const { data: upd, error: uErr } = await admin
        .from("spine_reports")
        .update(reportPayload)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (uErr) throw uErr;
      reportId = upd.id;
    } else {
      const { data: ins, error: iErr } = await admin
        .from("spine_reports")
        .insert(reportPayload)
        .select("id")
        .single();
      if (iErr) throw iErr;
      reportId = ins.id;
    }

    const { error: sErr } = await admin
      .from("spine_assessments")
      .update({ status: "ai_drafted" })
      .eq("id", assessment_id);
    if (sErr) throw sErr;

    return json({
      report_id: reportId,
      assessment_id,
      ai_draft_summary: finalDraft,
      likely_astg_pattern: likelyPattern,
      dosha_note: doshaNote,
      recommended_action: recommendedAction,
      has_red_flag: assessment.has_red_flag,
      interpretation_bypassed: false,
      astg_disease_id: referenceDiseaseId,
    });
  } catch (e) {
    console.error("spine-interpret error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
