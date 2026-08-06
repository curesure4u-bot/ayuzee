import { requireUser } from "../_shared/auth.ts";
// AI Scribe — converts audio or raw text into a structured Ayurveda EMR (SOAP + Rx)
// Multi-language: Hindi, Tamil, Telugu, Marathi, English, Kannada, Malayalam, Bengali, Gujarati
// Uses Google Gemini API directly (GEMINI_API_KEY) — no Lovable gateway dependency.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LANG_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  kn: "Kannada",
  ml: "Malayalam",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  or: "Odia",
  ur: "Urdu",
  sa: "Sanskrit",
  as: "Assamese",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { mode, text, audioBase64, language = "en" } = await req.json();

    // Try GEMINI_API_KEY first (direct Google API), fall back to LOVABLE_API_KEY (legacy)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      throw new Error("GEMINI_API_KEY (or LOVABLE_API_KEY) not configured. Add it in Supabase Edge Function Secrets.");
    }

    const langName = LANG_MAP[language] ?? "English";

    const systemPrompt = `You are an expert Ayurveda clinical scribe. The doctor's input may be in ${langName} or mixed languages.
ALWAYS produce the structured EMR in clear English medical terminology, but preserve any Sanskrit/Ayurveda terms (e.g. Vata, Pitta, Kapha, Triphala, Ashwagandha) as-is.
Extract: chief complaint, history of present illness, examination findings, vitals (if mentioned: bp, pulse, temp, weight, spo2), assessment/diagnosis (allopathic + Ayurvedic dosha imbalance), treatment plan, prescription with dosage/anupana/duration, lifestyle advice, follow-up date.
Be concise, factual, never invent details not present in the input. If a field is absent, leave it as an empty string.`;

    // --- Route: Use Gemini API directly if GEMINI_API_KEY is available ---
    if (GEMINI_API_KEY) {
      return await callGeminiDirect(GEMINI_API_KEY, mode, text, audioBase64, langName, systemPrompt);
    }

    // --- Fallback: Lovable gateway (legacy) ---
    return await callLovableGateway(LOVABLE_API_KEY!, mode, text, audioBase64, langName, systemPrompt);

  } catch (e) {
    console.error("ai-scribe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Gemini Direct API (uses GEMINI_API_KEY) — no Lovable dependency
// ═══════════════════════════════════════════════════════════════════════════
async function callGeminiDirect(
  apiKey: string,
  mode: string,
  text: string | undefined,
  audioBase64: string | undefined,
  langName: string,
  systemPrompt: string,
): Promise<Response> {
  const model = mode === "audio" ? "gemini-2.5-pro-preview-06-05" : "gemini-2.5-flash-preview-05-20";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Build parts array
  const parts: any[] = [];

  if (mode === "audio" && audioBase64) {
    parts.push({
      inlineData: { mimeType: "audio/webm", data: audioBase64 },
    });
    parts.push({
      text: `Transcribe this consultation audio (likely ${langName}) and extract the structured EMR. Also return the raw transcript.`,
    });
  } else {
    parts.push({
      text: `Doctor's notes (language: ${langName}):\n\n${text}\n\nExtract the structured EMR.`,
    });
  }

  // Function declaration for structured output
  const functionDeclarations = [{
    name: "build_emr",
    description: "Return a structured Ayurveda EMR record from the consultation",
    parameters: {
      type: "object",
      properties: {
        transcript: { type: "string", description: "Raw transcript if audio was provided, else echo input" },
        chief_complaint: { type: "string", description: "Primary presenting complaint" },
        history: { type: "string", description: "History of present illness" },
        examination: { type: "string", description: "Physical/Ayurvedic examination findings (Nadi, Jihva, etc.)" },
        vitals: {
          type: "object",
          properties: {
            bp: { type: "string" },
            pulse: { type: "string" },
            temperature: { type: "string" },
            weight: { type: "string" },
            spo2: { type: "string" },
          },
        },
        assessment: { type: "string", description: "Diagnosis including dosha imbalance" },
        plan: { type: "string", description: "Treatment plan summary" },
        prescription: { type: "string", description: "Each medicine on a new line with dose, anupana, frequency, duration" },
        advice: { type: "string", description: "Pathya/apathya, lifestyle, diet recommendations" },
        follow_up_date: { type: "string", description: "ISO date YYYY-MM-DD or empty string" },
      },
      required: [
        "transcript", "chief_complaint", "history", "examination",
        "vitals", "assessment", "plan", "prescription", "advice", "follow_up_date",
      ],
    },
  }];

  const requestBody = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    tools: [{ functionDeclarations }],
    toolConfig: { functionCallingConfig: { mode: "ANY", allowedFunctionNames: ["build_emr"] } },
  };

  const aiResp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!aiResp.ok) {
    const errText = await aiResp.text();
    console.error("Gemini API error:", aiResp.status, errText);
    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "AI rate limit exceeded. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Gemini API error", detail: errText }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const json = await aiResp.json();

  // Extract function call from Gemini response
  const candidate = json.candidates?.[0];
  const fnCall = candidate?.content?.parts?.find((p: any) => p.functionCall);

  if (!fnCall?.functionCall?.args) {
    // Fallback: try to parse text response as JSON
    const textPart = candidate?.content?.parts?.find((p: any) => p.text);
    if (textPart?.text) {
      try {
        const emr = JSON.parse(textPart.text.replace(/```json\n?/g, "").replace(/```/g, "").trim());
        return new Response(
          JSON.stringify({ emr, model }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      } catch { /* fall through */ }
    }
    throw new Error("AI did not return structured EMR");
  }

  const emr = fnCall.functionCall.args;

  return new Response(
    JSON.stringify({ emr, model }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Lovable Gateway (legacy fallback — OpenAI-compatible API format)
// ═══════════════════════════════════════════════════════════════════════════
async function callLovableGateway(
  apiKey: string,
  mode: string,
  text: string | undefined,
  audioBase64: string | undefined,
  langName: string,
  systemPrompt: string,
): Promise<Response> {
  let userContent: any;

  if (mode === "audio" && audioBase64) {
    userContent = [
      { type: "input_audio", input_audio: { data: audioBase64, format: "webm" } },
      { type: "text", text: `Transcribe this consultation audio (likely ${langName}) and extract the structured EMR. Also return the raw transcript.` },
    ];
  } else {
    userContent = `Doctor's notes (language: ${langName}):\n\n${text}\n\nExtract the structured EMR.`;
  }

  const tools = [{
    type: "function",
    function: {
      name: "build_emr",
      description: "Return a structured Ayurveda EMR record",
      parameters: {
        type: "object",
        properties: {
          transcript: { type: "string", description: "Raw transcript if audio was provided, else echo input" },
          chief_complaint: { type: "string" },
          history: { type: "string" },
          examination: { type: "string" },
          vitals: {
            type: "object",
            properties: { bp: { type: "string" }, pulse: { type: "string" }, temperature: { type: "string" }, weight: { type: "string" }, spo2: { type: "string" } },
          },
          assessment: { type: "string", description: "Diagnosis incl. dosha imbalance" },
          plan: { type: "string" },
          prescription: { type: "string", description: "Each medicine on a new line with dose, anupana, frequency, duration" },
          advice: { type: "string", description: "Pathya/apathya, lifestyle, diet" },
          follow_up_date: { type: "string", description: "ISO date YYYY-MM-DD or empty" },
        },
        required: ["transcript", "chief_complaint", "history", "examination", "vitals", "assessment", "plan", "prescription", "advice", "follow_up_date"],
        additionalProperties: false,
      },
    },
  }];

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: mode === "audio" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "build_emr" } },
    }),
  });

  if (!aiResp.ok) {
    if (aiResp.status === 429)
      return new Response(JSON.stringify({ error: "AI rate limit exceeded. Try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (aiResp.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    const t = await aiResp.text();
    console.error("Lovable gateway error:", aiResp.status, t);
    return new Response(JSON.stringify({ error: "AI gateway error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const json = await aiResp.json();
  const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("AI did not return structured EMR");
  const emr = JSON.parse(toolCall.function.arguments);

  return new Response(
    JSON.stringify({ emr, model: mode === "audio" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
