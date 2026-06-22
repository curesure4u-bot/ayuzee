import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { requireUser } from "../_shared/auth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const c = body.caseData || {};
    const ctx = `
Patient: ${c.patient_name ?? "—"}, ${c.patient_age ?? "?"}y, ${c.patient_gender ?? "—"}
Chief complaint: ${c.chief_complaint ?? "—"} (onset: ${c.complaint_onset ?? "—"}, duration: ${c.complaint_duration ?? "—"})
History of present illness: ${c.history_present_illness ?? "—"}
Mental state: ${c.mental_state ?? "—"}
Intellectual: ${c.intellectual_state ?? "—"}
Emotional themes: ${(c.emotional_themes || []).join(", ") || "—"}
Fears: ${(c.fears || []).join(", ") || "—"}
Aversions (mind): ${(c.aversions_mind || []).join(", ") || "—"}
Life situation: ${c.life_situation ?? "—"}
Significant events: ${c.significant_events ?? "—"}
Thermal: ${c.thermal_state ?? "—"} | Thirst: ${c.thirst ?? "—"} | Appetite: ${c.appetite ?? "—"}
Food cravings: ${(c.food_cravings || []).join(", ") || "—"}
Food aversions: ${(c.food_aversions || []).join(", ") || "—"}
Desires: ${(c.desires || []).join(", ") || "—"}
Perspiration: ${c.perspiration ?? "—"} | Sleep: ${c.sleep ?? "—"} (${c.sleep_position ?? "—"}) | Dreams: ${c.dreams ?? "—"}
Menses: ${c.menses ?? "—"} | Sexual: ${c.sexual_history ?? "—"}
Modalities better: ${(c.modalities_better || []).join(", ") || "—"}
Modalities worse: ${(c.modalities_worse || []).join(", ") || "—"}
Past medical history: ${c.past_medical_history ?? "—"}
Family history: ${c.family_history ?? "—"}
Miasm assessment: ${c.miasm_assessment ?? "—"} (${c.miasm_evidence ?? "—"})
Doctor notes: ${c.doctor_notes ?? "—"}
`.trim();

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a classical homeopathy clinical assistant. Synthesize a constitutional portrait in ONE flowing paragraph (120–180 words). Integrate the patient's mental/emotional core, physical generals (thermal, thirst, cravings, sleep), striking modalities, miasmatic tendency, and the totality leading to a likely constitutional direction. Mention 1–3 candidate constitutional remedies with brief justification. End with: 'Final remedy selection rests with the prescribing physician.' Do not use lists or markdown — pure prose.",
          },
          { role: "user", content: ctx },
        ],
      }),
    });

    if (resp.status === 429)
      return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (resp.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const summary = data.choices?.[0]?.message?.content?.trim() ?? "";
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
