import { requireUser } from "../_shared/auth.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const body = await req.json();
    const { guidance_type, condition, prakriti, vikriti, age, notes } = body || {};
    if (!guidance_type || !["diet", "yoga", "medicine_schedule", "lifestyle"].includes(guidance_type)) {
      return new Response(JSON.stringify({ error: "guidance_type required (diet|yoga|medicine_schedule|lifestyle)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are Ayuzee Vaidya AI, a clinical decision-support assistant for an Ayurvedic doctor.
You generate structured follow-up guidance for review by a qualified doctor.
Always tailor recommendations to the patient's Prakriti, Vikriti, and current condition.
Be specific, practical, and culturally appropriate to Indian/Ayurvedic context.`;

    const userPrompt = `Patient context:
- Condition: ${condition || "general wellness"}
- Prakriti: ${prakriti || "unspecified"}
- Vikriti: ${vikriti || "unspecified"}
- Age: ${age || "unspecified"}
- Doctor notes: ${notes || "none"}

Generate a ${guidance_type.replace("_", " ")} guidance plan using the provided tool.`;

    // Tool schema per guidance type
    const toolByType: Record<string, any> = {
      diet: {
        name: "diet_plan",
        description: "Ayurvedic diet plan",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            do_eat: { type: "array", items: { type: "string" }, description: "Foods to favor" },
            avoid: { type: "array", items: { type: "string" }, description: "Foods to avoid" },
            meal_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  meal: { type: "string", enum: ["breakfast", "mid_morning", "lunch", "evening", "dinner"] },
                  suggestions: { type: "array", items: { type: "string" } },
                },
                required: ["meal", "suggestions"],
                additionalProperties: false,
              },
            },
            notes: { type: "string" },
          },
          required: ["title", "do_eat", "avoid", "meal_plan", "notes"],
          additionalProperties: false,
        },
      },
      yoga: {
        name: "yoga_protocol",
        description: "Yoga protocol with asanas, pranayama and routine",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            asanas: { type: "array", items: { type: "string" } },
            pranayama: { type: "array", items: { type: "string" } },
            duration_minutes: { type: "string" },
            best_time: { type: "string" },
            cautions: { type: "array", items: { type: "string" } },
            notes: { type: "string" },
          },
          required: ["title", "asanas", "pranayama", "duration_minutes", "notes"],
          additionalProperties: false,
        },
      },
      medicine_schedule: {
        name: "medicine_schedule",
        description: "Daily medicine schedule",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  dose: { type: "string" },
                  times: {
                    type: "array",
                    items: { type: "string", enum: ["morning", "afternoon", "evening", "night", "before_food", "after_food"] },
                  },
                  duration: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["name", "dose", "times"],
                additionalProperties: false,
              },
            },
            notes: { type: "string" },
          },
          required: ["title", "items"],
          additionalProperties: false,
        },
      },
      lifestyle: {
        name: "lifestyle_plan",
        description: "Lifestyle / dinacharya plan",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            morning_routine: { type: "array", items: { type: "string" } },
            evening_routine: { type: "array", items: { type: "string" } },
            sleep: { type: "string" },
            exercise: { type: "string" },
            stress_management: { type: "array", items: { type: "string" } },
            notes: { type: "string" },
          },
          required: ["title", "morning_routine", "evening_routine", "notes"],
          additionalProperties: false,
        },
      },
    };

    const tool = toolByType[guidance_type];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: tool }],
        tool_choice: { type: "function", function: { name: tool.name } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const tc = data.choices?.[0]?.message?.tool_calls?.[0];
    const plan = tc ? JSON.parse(tc.function.arguments) : null;
    return new Response(JSON.stringify({ plan, guidance_type }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-guidance-generate error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
