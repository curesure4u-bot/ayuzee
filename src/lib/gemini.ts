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
 * SECURITY: API key is stored server-side only.
 * All calls route through /.netlify/functions/gemini-proxy
 */

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

// ─── Core API Call (via server proxy) ────────────────────────────────────────

export async function callGemini(
  userMessage: string,
  systemPrompt?: string,
  history?: GeminiMessage[],
): Promise<GeminiResponse> {
  try {
    // Build the full prompt with history context
    let fullPrompt = "";

    if (systemPrompt) {
      fullPrompt += `System instruction: ${systemPrompt}\n\n`;
    }

    if (history && history.length > 0) {
      for (const msg of history) {
        const role = msg.role === "user" ? "User" : "Assistant";
        fullPrompt += `${role}: ${msg.parts[0]?.text || ""}\n\n`;
      }
    }

    fullPrompt += `User: ${userMessage}`;

    const response = await fetch("/.netlify/functions/gemini-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: fullPrompt,
        systemInstruction: systemPrompt,
        maxTokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { text: "", error: "Rate limit exceeded. Please wait a moment and try again." };
      }
      return { text: "", error: `Server error: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
      return { text: "", error: data.error };
    }

    return { text: data.text || "" };
  } catch (err: any) {
    return { text: "", error: err.message || "Failed to connect to AI service" };
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
// Now always returns true since configuration is server-side
export function isGeminiConfigured(): boolean {
  return true;
}
