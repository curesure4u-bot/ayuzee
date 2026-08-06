/**
 * MedAssist AI Agent Service — REAL AI implementation
 * Patient-facing conversational health bot powered by Gemini/Claude
 * Handles symptom triage, appointment booking, medicine info, AYUSH guidance
 * Persists conversations to medassist_sessions / medassist_messages tables
 */
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  content_type: "text" | "quick_reply" | "card" | "action_button";
  quick_replies?: string[];
  action_data?: Record<string, unknown>;
  timestamp: string;
  triage_level?: string;
}

export interface MedAssistContext {
  patient_name?: string;
  language: string;
  session_type: string;
  symptoms_collected: string[];
  severity_level?: string;
  session_id?: string;
}

const SYSTEM_PROMPT = `You are Ayuzee MedAssist — a compassionate, knowledgeable AI health assistant for patients in India. You support Ayurveda, Homeopathy, Siddha, Unani, Yoga & modern medicine.

RULES:
1. NEVER diagnose. You TRIAGE and GUIDE.
2. For emergencies (chest pain, breathing difficulty, unconsciousness, severe bleeding), immediately respond with triage_level "emergency" and direct to call 108.
3. For urgent symptoms, set triage_level "urgent" and recommend seeing a doctor within 24 hours.
4. For routine issues, set triage_level "routine" and provide general AYUSH guidance + suggest booking.
5. For minor/self-care issues, set triage_level "self_care" and provide home remedy suggestions.
6. Ask follow-up questions to assess severity (duration, intensity 1-10, associated symptoms).
7. When providing AYUSH guidance, cite which system (Ayurveda/Homeopathy/Yoga) and general principles.
8. Always end with actionable next steps.
9. Be culturally sensitive — use Namaste, understand Indian diet/lifestyle context.
10. If language is not English, respond in that language but keep medical terms clear.

RESPONSE FORMAT — Return strict JSON:
{
  "content": "Your response text (markdown OK)",
  "quick_replies": ["Option 1", "Option 2", "Option 3"],
  "triage_level": "emergency|urgent|routine|self_care|null",
  "should_book": false
}`;

/**
 * Process user message via real AI backend
 */
export async function processMessage(
  userMessage: string,
  context: MedAssistContext,
  history: ChatMessage[]
): Promise<ChatMessage> {
  try {
    // Build conversation history for context
    const messages = history.slice(-10).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    messages.push({ role: "user", content: userMessage });

    const prompt = `Patient: ${context.patient_name || "Unknown"}
Language: ${context.language}
Symptoms collected so far: ${context.symptoms_collected.join(", ") || "none yet"}
Current severity assessment: ${context.severity_level || "not assessed"}

Patient says: "${userMessage}"

Respond as MedAssist. Return JSON with content, quick_replies, triage_level, should_book.`;

    const { data, error } = await supabase.functions.invoke("ai-gateway", {
      body: {
        feature: "medassist-triage",
        system: SYSTEM_PROMPT,
        prompt,
        messages: messages.length > 1 ? messages : undefined,
        max_tokens: 800,
        response_schema: {
          name: "medassist_response",
          description: "MedAssist AI triage response",
          parameters: {
            type: "object",
            properties: {
              content: { type: "string", description: "Response to patient" },
              quick_replies: { type: "array", items: { type: "string" }, description: "2-4 quick reply options" },
              triage_level: { type: "string", enum: ["emergency", "urgent", "routine", "self_care"], description: "Triage severity" },
              should_book: { type: "boolean", description: "Whether to suggest booking" },
            },
            required: ["content", "quick_replies", "triage_level"],
          },
        },
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const result = data?.result;
    if (!result?.content) {
      // Fallback to text response
      return createAssistantMessage(
        data?.response || "I'm having trouble processing that. Could you rephrase?",
        ["Check symptoms", "Book appointment", "Ask about medicine"]
      );
    }

    // Persist message to DB (best-effort)
    if (context.session_id) {
      persistMessage(context.session_id, "assistant", result.content).catch(() => {});
    }

    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.content,
      content_type: result.quick_replies?.length ? "quick_reply" : "text",
      quick_replies: result.quick_replies || [],
      triage_level: result.triage_level || undefined,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    console.error("MedAssist AI error:", e);
    // Graceful fallback
    return createAssistantMessage(
      "I'm having a moment of difficulty connecting. Please try again, or if this is urgent, call 108 for emergency services.",
      ["Try again", "Call 108", "Book appointment"]
    );
  }
}

/**
 * Create or get session
 */
export async function getOrCreateSession(
  language: string,
  sessionType: string = "general"
): Promise<string | null> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return null;

    const { data, error } = await (supabase as any)
      .from("medassist_sessions")
      .insert({
        patient_id: session.session.user.id,
        session_type: sessionType,
        language,
        status: "active",
      })
      .select("id")
      .single();

    return error ? null : data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Persist message to DB
 */
async function persistMessage(sessionId: string, role: string, content: string) {
  await (supabase as any).from("medassist_messages").insert({
    session_id: sessionId,
    role,
    content,
    content_type: "text",
  });
}

/**
 * Persist user message
 */
export async function persistUserMessage(sessionId: string, content: string) {
  await persistMessage(sessionId, "user", content).catch(() => {});
}

function createAssistantMessage(content: string, quickReplies?: string[]): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content,
    content_type: quickReplies ? "quick_reply" : "text",
    quick_replies: quickReplies,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get initial greeting based on language
 */
export function getGreeting(language: string, patientName?: string): ChatMessage {
  const name = patientName || "";
  const greetings: Record<string, string> = {
    en: `Namaste ${name}! 🙏 I'm your Ayuzee Health Assistant. I can help with:\n\n🩺 **Symptom Check** — Describe what you're feeling\n📅 **Book Appointment** — Find a doctor\n💊 **Medicine Info** — Dosage, side effects\n🌿 **AYUSH Guidance** — Ayurveda, Yoga, Prakriti\n📋 **Reports** — Understand lab results\n\nHow can I help you today?`,
    hi: `नमस्ते ${name}! 🙏 मैं आपका आयुज़ी स्वास्थ्य सहायक हूँ। मैं इनमें मदद कर सकता हूँ:\n\n🩺 लक्षण जांच\n📅 अपॉइंटमेंट बुक करें\n💊 दवाई की जानकारी\n🌿 आयुष मार्गदर्शन\n\nआज मैं आपकी कैसे मदद करूं?`,
    ta: `வணக்கம் ${name}! 🙏 நான் உங்கள் ஆயுஸி சுகாதார உதவியாளர்.\n\nஇன்று உங்களுக்கு எப்படி உதவ முடியும்?`,
  };
  return createAssistantMessage(
    greetings[language] || greetings.en,
    ["Check symptoms", "Book appointment", "Medicine info", "AYUSH guidance"]
  );
}
