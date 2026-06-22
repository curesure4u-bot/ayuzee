import { requireUser } from "../_shared/auth.ts";
// Generates a concise doctor-facing brief from the patient's pre-consultation answers.
// Uses Lovable AI Gateway (Gemini) — no external Anthropic key required.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const form = body?.form ?? {};

    const userPrompt = `You are an Ayurveda/AYUSH clinical assistant.
Below is a patient's pre-consultation intake form. Produce a short, doctor-facing brief
in clean Markdown with these sections:

1. **Snapshot** (1–2 lines: patient context, key complaint, severity)
2. **Chief complaint & timeline**
3. **Aggravating / relieving factors**
4. **Current medicines, allergies, chronic conditions**
5. **Women's health (if applicable)**
6. **Lifestyle highlights** (diet, sleep, stress, exercise)
7. **🚩 Red flags / things to verify on the call**
8. **Suggested questions for the doctor to ask**

Be concise, neutral, and DO NOT diagnose or prescribe. Use bullet points.

PATIENT INTAKE JSON:
${JSON.stringify(form, null, 2)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You write concise, evidence-aware clinical pre-consult briefs for AYUSH doctors. Never diagnose or prescribe." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (res.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable workspace settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await res.text();
      console.error("AI gateway error", res.status, t);
      return new Response(JSON.stringify({ error: "AI summary failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-pre-consult-summary error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
