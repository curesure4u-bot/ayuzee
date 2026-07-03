import { requireUser, getCorsHeaders } from "../_shared/auth.ts";
// AI Scribe — converts audio or raw text into a structured Ayurveda EMR (SOAP + Rx)
// Multi-language: Hindi, Tamil, Telugu, Marathi, English
import { getAiProviderName } from "../_shared/ai.ts";

const LANG_MAP: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authResult = await requireUser(req);
    if (authResult instanceof Response) return authResult;

    const { mode, text, audioBase64, language = "en" } = await req.json();
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!lovableKey && !openAiKey) throw new Error("No AI provider configured");

    const langName = LANG_MAP[language] ?? "English";
    let userContent: any;
    let transcript = text ?? "";

    const systemPrompt = `You are an expert Ayurveda clinical scribe. The doctor's input may be in ${langName} or mixed languages.
ALWAYS produce the structured EMR in clear English medical terminology, but preserve any Sanskrit/Ayurveda terms (e.g. Vata, Pitta, Kapha, Triphala, Ashwagandha) as-is.
Extract: chief complaint, history of present illness, examination findings, vitals (if mentioned: bp, pulse, temp, weight, spo2), assessment/diagnosis (allopathic + Ayurvedic dosha imbalance), treatment plan, prescription with dosage/anupana/duration, lifestyle advice, follow-up date.
Be concise, factual, never invent details not present in the input. If a field is absent, leave it as an empty string.`;

    if (mode === "audio" && audioBase64) {
      // Multimodal: send audio inline to Gemini for transcription + extraction in one shot
      userContent = [
        {
          type: "input_audio",
          input_audio: { data: audioBase64, format: "webm" },
        },
        {
          type: "text",
          text: `Transcribe this consultation audio (likely ${langName}) and extract the structured EMR. Also return the raw transcript.`,
        },
      ];
    } else {
      userContent = `Doctor's notes (language: ${langName}):\n\n${text}\n\nExtract the structured EMR.`;
    }

    const tools = [
      {
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
                properties: {
                  bp: { type: "string" },
                  pulse: { type: "string" },
                  temperature: { type: "string" },
                  weight: { type: "string" },
                  spo2: { type: "string" },
                },
              },
              assessment: { type: "string", description: "Diagnosis incl. dosha imbalance" },
              plan: { type: "string" },
              prescription: { type: "string", description: "Each medicine on a new line with dose, anupana, frequency, duration" },
              advice: { type: "string", description: "Pathya/apathya, lifestyle, diet" },
              follow_up_date: { type: "string", description: "ISO date YYYY-MM-DD or empty" },
            },
            required: [
              "transcript", "chief_complaint", "history", "examination",
              "vitals", "assessment", "plan", "prescription", "advice", "follow_up_date",
            ],
            additionalProperties: false,
          },
        },
      },
    ];

    const model = mode === "audio" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";
    const aiUrl = openAiKey && mode !== "audio"
      ? "https://api.openai.com/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const aiKey = openAiKey && mode !== "audio" ? openAiKey : lovableKey!;

    const aiResp = await fetch(aiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openAiKey && mode !== "audio" ? "gpt-4o-mini" : model,
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
          status: 429, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        });
      const t = await aiResp.text();
      console.error("AI provider error:", aiResp.status, t, "provider=", getAiProviderName());
      return new Response(JSON.stringify({ error: "AI provider error" }), {
        status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const json = await aiResp.json();
    const toolCall = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI did not return structured EMR");
    const emr = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ emr, model, provider: getAiProviderName() }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-scribe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
