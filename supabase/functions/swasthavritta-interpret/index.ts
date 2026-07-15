// swasthavritta-interpret — turns a submitted swasthavritta_assessments row
// into an AI-drafted swasthavritta_plans row. Callable by the assigned Vaidya
// (or any admin/super_admin). Uses the shared ai-gateway function (Claude).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, requireUser } from "../_shared/auth.ts";

const RESPONSE_SCHEMA = {
  name: "swasthavritta_plan_draft",
  description: "Structured Ayurvedic Swasthavritta plan drafted for Vaidya review.",
  parameters: {
    type: "object",
    properties: {
      ahara_advice: {
        type: "string",
        description:
          "Dietary (Ahara) guidance: rasas to favour/avoid, meal composition, meal timings, hydration, Ahara-doshas to correct. 120-220 words, plain language, patient-facing.",
      },
      vihara_advice: {
        type: "string",
        description:
          "Lifestyle (Vihara) guidance: activity, exercise dose, screen habits, occupational adjustments, addiction reduction, Vega management. 100-180 words.",
      },
      nidra_advice: {
        type: "string",
        description:
          "Sleep (Nidra) guidance addressing sleep/wake times, sleep quality, day sleep (Divaswapna), pre-sleep routine. 80-140 words.",
      },
      dinacharya_measures: {
        type: "string",
        description:
          "Recommended daily regimen practices. Choose from: Abhyanga (oil massage), Udvartana (herbal powder rub), Nasya (nasal drops), Anjana (collyrium), Gandusha/Kavala (oil pulling), Jihva-nirlekhana (tongue scraping), Vyayama (exercise), Snana (bathing). List each with brief how/when, patient-appropriate. 100-180 words.",
      },
      mental_health_advice: {
        type: "string",
        description:
          "Sattvavajaya / mental well-being guidance based ONLY on what the patient reported (no diagnosis). Suggest Dhyana, Pranayama, Sadvritta practices, boundary-setting, when to seek professional support. 80-140 words.",
      },
    },
    required: [
      "ahara_advice",
      "vihara_advice",
      "nidra_advice",
      "dinacharya_measures",
      "mental_health_advice",
    ],
    additionalProperties: false,
  },
};

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
    const { data: a, error: aErr } = await admin
      .from("swasthavritta_assessments")
      .select("*")
      .eq("id", assessment_id)
      .maybeSingle();
    if (aErr) throw aErr;
    if (!a) return json({ error: "Assessment not found" }, 404);

    // 2. Authorize: assigned vaidya or admin
    const isVaidya = a.vaidya_id === userId;
    let isAdmin = false;
    if (!isVaidya) {
      const { data: roles } = await admin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["admin", "super_admin"]);
      isAdmin = !!(roles && roles.length > 0);
    }
    if (!isVaidya && !isAdmin) return json({ error: "Forbidden" }, 403);

    // 3. Build a compact assessment summary for the model
    const foodFaults = Object.entries(a.food_faults ?? {})
      .filter(([, v]) => v).map(([k]) => k).join(", ") || "none";
    const vegas = Object.entries(a.vega_suppression ?? {})
      .filter(([, v]) => v).map(([k]) => k).join(", ") || "none";
    const meals = a.meal_timings ?? {};

    const prompt = `
Swasthavritta assessment (patient reported):

- Anthropometry: height ${a.height_cm ?? "—"} cm, weight ${a.weight_kg ?? "—"} kg, BMI ${a.bmi ?? "—"}.
- Prakriti: ${a.prakriti ?? "—"}.
- Ashtavidha: Agni ${a.agni ?? "—"}, Koshtha ${a.koshtha ?? "—"}, Sara ${a.sara ?? "—"}, Samhanan ${a.samhanan ?? "—"}.
- Nidra: sleeps at ${a.sleep_time ?? "—"}, wakes at ${a.wake_time ?? "—"}, quality ${a.sleep_quality ?? "—"}, Divaswapna: ${a.day_sleep ? "yes" : "no"}.
- Vyayama: ${a.exercise_type ?? "—"} for ${a.exercise_minutes ?? 0} min/day; Yoga ${a.yoga_practice ? "yes" : "no"}; Pranayama ${a.pranayama_practice ? "yes" : "no"}.
- Ahara: type ${a.food_type ?? "—"}; meal timings breakfast ${meals.breakfast ?? "—"}, lunch ${meals.lunch ?? "—"}, evening ${meals.evening ?? "—"}, dinner ${meals.dinner ?? "—"}; Ahara-doshas present: ${foodFaults}; water ${a.water_intake_litres ?? "—"} L/day; Upavasa: ${a.fasting_practice ? "yes" : "no"}.
- Vihara: occupation ${a.occupation_type ?? "—"}; screen ${a.screen_time_hours ?? "—"} h/day; addictions: ${a.addictions ?? "none"}.
- Vega dharana (suppressed urges): ${vegas}.
- Manasika: stress ${a.mental_stress ? "yes" : "no"}${a.mental_stress ? `; reported source: ${a.mental_stress_source ?? "—"}` : ""}.
- Current medications: ${a.current_medications ?? "none"}.

Draft a Swasthavritta plan per the response schema. Ground every recommendation in classical Swasthavritta principles (Charaka Sutrasthana Ch. 5-8, Ashtanga Hridaya Sutrasthana Ch. 2-3): Dinacharya, Ritucharya, Ahara-vidhi-visheshayatana, Vega-adharaneeya, Sadvritta. Use classical terms alongside plain English. Address the specific Ahara-doshas, Vega dharana and Divaswapna if flagged. Do not diagnose mental illness — only offer Sattvavajaya-style guidance based on what the patient reported. This draft is for a licensed Vaidya to review and edit before sign-off.
    `.trim();

    // 4. Call ai-gateway
    const gwResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-gateway`, {
      method: "POST",
      headers: {
        Authorization: req.headers.get("Authorization")!,
        apikey: Deno.env.get("SUPABASE_ANON_KEY")!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature: "swasthavritta-interpret",
        system:
          "You are an Ayurveda clinical assistant helping a licensed Vaidya draft a Swasthavritta (lifestyle & diet) plan. Ground every recommendation in classical texts and the patient's actual assessment data. Be specific and practical. Prefer classical Sanskrit terms alongside plain English. Do NOT diagnose disease or mental illness. Only return the structured tool output.",
        prompt,
        response_schema: RESPONSE_SCHEMA,
        max_tokens: 2000,
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

    const draft = {
      ahara_advice: String(result.ahara_advice ?? "").trim(),
      vihara_advice: String(result.vihara_advice ?? "").trim(),
      nidra_advice: String(result.nidra_advice ?? "").trim(),
      dinacharya_measures: String(result.dinacharya_measures ?? "").trim(),
      mental_health_advice: String(result.mental_health_advice ?? "").trim(),
    };

    // 5. Upsert plan for this assessment
    const { data: existing } = await admin
      .from("swasthavritta_plans")
      .select("id")
      .eq("assessment_id", assessment_id)
      .maybeSingle();

    const planPayload = {
      assessment_id,
      ai_generated_draft: draft,
      ahara_advice: draft.ahara_advice,
      vihara_advice: draft.vihara_advice,
      nidra_advice: draft.nidra_advice,
      dinacharya_measures: draft.dinacharya_measures,
      mental_health_advice: draft.mental_health_advice,
      vaidya_edited: false,
      signed_off: false,
    };

    let planId: string;
    if (existing?.id) {
      const { data: upd, error: uErr } = await admin
        .from("swasthavritta_plans")
        .update(planPayload)
        .eq("id", existing.id)
        .select("id")
        .single();
      if (uErr) throw uErr;
      planId = upd.id;
    } else {
      const { data: ins, error: iErr } = await admin
        .from("swasthavritta_plans")
        .insert(planPayload)
        .select("id")
        .single();
      if (iErr) throw iErr;
      planId = ins.id;
    }

    // 6. Update assessment status
    await admin
      .from("swasthavritta_assessments")
      .update({ status: "reviewed" })
      .eq("id", assessment_id);

    return json({ plan_id: planId, assessment_id, draft });
  } catch (e) {
    console.error("swasthavritta-interpret error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
