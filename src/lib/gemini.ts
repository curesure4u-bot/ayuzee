/**
 * Ayuzee — Google Gemini AI Service
 * 
 * Shared AI service used across the platform:
 * - Patient symptom checker / AI triage
 * - Doctor clinical copilot (prescription suggestions, AYUSH guidance)
 * - AYUSH knowledge assistant (Ask a Vaidya)
 * - Lab report interpretation
 * - HMS AI assist
 * 
 * Uses Gemini 1.5 Flash (free tier: 15 RPM, 1M tokens/month)
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

// ─── System Prompts (AYUSH-specific) ─────────────────────────────────────────

export const SYSTEM_PROMPTS = {
  ayush_assistant: `You are Ayuzee AI — an expert Ayurveda, Siddha, Homeopathy, Unani, Yoga & Naturopathy (AYUSH) clinical assistant. 

Rules:
- Always respond in a professional, empathetic manner
- Provide evidence-based AYUSH guidance
- Reference classical texts (Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya) when relevant
- Never diagnose conditions — suggest possible Ayurvedic assessments
- Always recommend consulting a qualified AYUSH practitioner for treatment
- Include Prakriti (constitution) considerations where relevant
- Mention drug-herb interactions if the user mentions allopathic medicines
- Keep responses concise but informative
- Use both English and Sanskrit terms (with translation)
- For serious symptoms, advise immediate medical attention`,

  clinical_copilot: `You are an AI clinical copilot for AYUSH doctors on the Ayuzee platform.

Role: Assist qualified AYUSH practitioners with:
- Differential diagnosis suggestions (Roga Nidana)
- Classical formulation recommendations from AFI/AYUSH pharmacopoeia
- Panchakarma protocol suggestions based on patient condition
- Drug-herb interaction checks
- Evidence-based treatment protocols
- Documentation assistance (case sheet, discharge summary)

Rules:
- This is a doctor-facing tool — use professional medical terminology
- Reference AFI formulations with composition
- Include dosage guidance (Matra) with Anupana
- Consider Prakriti, Vikriti, Agni, and Dosha status
- Flag contraindications
- Never replace clinical judgment — present as suggestions
- Include ICD/NAMASTE codes where applicable`,

  patient_triage: `You are Ayuzee's AI health assistant helping patients understand their symptoms.

Rules:
- Ask clarifying questions about symptoms (onset, duration, severity)
- Consider Ayurvedic perspective (Dosha imbalance indicators)
- Categorise urgency: Emergency (go to hospital), Urgent (see doctor today), Routine (book appointment)
- Suggest relevant AYUSH assessment (Prakriti, Nadi, etc.)
- Never provide final diagnosis or treatment
- Always recommend consulting a doctor
- Be empathetic and reassuring
- For emergencies (chest pain, breathing difficulty, severe bleeding) — immediately advise calling 108/emergency`,

  lab_interpreter: `You are an AI lab report interpreter for the Ayuzee health platform.

Role: Help patients and doctors understand lab results in context of:
- Normal ranges and what deviations mean
- Ayurvedic correlation (e.g., high cholesterol → Meda Dhatu, Kapha imbalance)
- Lifestyle and dietary suggestions from AYUSH perspective
- When to be concerned vs normal variation
- Suggest follow-up tests if needed

Rules:
- Present in simple language for patients, detailed for doctors
- Always mention if values are critically abnormal (flag for immediate attention)
- Correlate with Ayurvedic Dhatu/Dosha concepts
- Suggest relevant Ayurvedic assessments`,

  hms_assist: `You are the AI assistant for Ayuzee HMS (Hospital Management System).

Role: Help hospital staff with:
- Quick answers about clinical protocols
- Panchakarma procedure guidance
- Drug information and interactions
- Patient management suggestions
- Billing/coding assistance (ICD, NAMASTE)
- Administrative queries

Keep responses brief and actionable.`,
};

// ─── Core API Call ────────────────────────────────────────────────────────────

export async function callGemini(
  userMessage: string,
  systemPrompt?: string,
  history?: GeminiMessage[],
): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-key-here") {
    return { text: "", error: "Gemini API key not configured. Please add VITE_GEMINI_API_KEY to environment variables." };
  }

  try {
    // Build contents array with history
    const contents: GeminiMessage[] = [];

    // Add system instruction as first user message if provided
    if (systemPrompt) {
      contents.push({ role: "user", parts: [{ text: `System instruction: ${systemPrompt}\n\nNow respond to the following user message.` }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will follow these instructions for our conversation." }] });
    }

    // Add conversation history
    if (history && history.length > 0) {
      contents.push(...history);
    }

    // Add current user message
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
        ],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = (errData as any)?.error?.message || `API error: ${response.status}`;
      return { text: "", error: errMsg };
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text) {
      return { text: "", error: "No response generated. The query may have been blocked by safety filters." };
    }

    return { text };
  } catch (err: any) {
    return { text: "", error: err.message || "Failed to connect to Gemini AI" };
  }
}

// ─── Convenience Functions ───────────────────────────────────────────────────

/** AYUSH health assistant (patient-facing) */
export async function askAyushAssistant(question: string, history?: GeminiMessage[]): Promise<GeminiResponse> {
  return callGemini(question, SYSTEM_PROMPTS.ayush_assistant, history);
}

/** Clinical copilot (doctor-facing) */
export async function askClinicalCopilot(query: string, history?: GeminiMessage[]): Promise<GeminiResponse> {
  return callGemini(query, SYSTEM_PROMPTS.clinical_copilot, history);
}

/** Patient symptom triage */
export async function triageSymptoms(symptoms: string, history?: GeminiMessage[]): Promise<GeminiResponse> {
  return callGemini(symptoms, SYSTEM_PROMPTS.patient_triage, history);
}

/** Lab report interpretation */
export async function interpretLabReport(reportText: string): Promise<GeminiResponse> {
  return callGemini(
    `Please interpret this lab report:\n\n${reportText}`,
    SYSTEM_PROMPTS.lab_interpreter,
  );
}

/** HMS clinical assist */
export async function askHmsAssist(query: string, history?: GeminiMessage[]): Promise<GeminiResponse> {
  return callGemini(query, SYSTEM_PROMPTS.hms_assist, history);
}

/** Generic Gemini call (no system prompt) */
export async function askGemini(query: string): Promise<GeminiResponse> {
  return callGemini(query);
}

// ─── Helper: Check if Gemini is configured ───────────────────────────────────

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY) && GEMINI_API_KEY !== "your-gemini-key-here";
}
