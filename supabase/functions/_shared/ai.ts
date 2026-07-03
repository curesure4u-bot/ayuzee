/**
 * Provider-agnostic AI chat completions for edge functions.
 * Prefers OPENAI_API_KEY when set; falls back to Lovable gateway for migration.
 */
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatCompletionOptions = {
  model?: string;
  messages: ChatMessage[];
  tools?: unknown[];
  tool_choice?: unknown;
  temperature?: number;
};

export async function chatCompletion(options: ChatCompletionOptions): Promise<Response> {
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  const body = JSON.stringify({
    model: options.model ?? (openAiKey ? "gpt-4o-mini" : "google/gemini-2.5-flash"),
    messages: options.messages,
    ...(options.tools ? { tools: options.tools } : {}),
    ...(options.tool_choice ? { tool_choice: options.tool_choice } : {}),
    ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
  });

  if (openAiKey) {
    return fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
  }

  if (lovableKey) {
    return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body,
    });
  }

  throw new Error("No AI provider configured (set OPENAI_API_KEY or LOVABLE_API_KEY)");
}

export const getAiProviderName = () =>
  Deno.env.get("OPENAI_API_KEY") ? "openai" : Deno.env.get("LOVABLE_API_KEY") ? "lovable" : "none";
