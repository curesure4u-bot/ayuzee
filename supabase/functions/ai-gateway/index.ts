// Shared Ayuzee AI gateway — calls Anthropic Claude directly.
// Input:  {
//   feature: string,
//   prompt?: string,            // required unless `messages` is provided
//   messages?: Array<{ role: "user" | "assistant", content: string | any[] }>,
//   context?: object,           // only applied when building from `prompt`
//   system?: string,
//   max_tokens?: number,
//   attachments?: Array<{ mime: string, data_base64: string, filename?: string }>,
//   response_schema?: {         // OpenAI-style function-tool shape
//     name: string,
//     description?: string,
//     parameters: object,       // JSON Schema
//   },
// }
// Output: {
//   response: string,           // concatenated text blocks (may be empty when tool-forced)
//   result?: object,            // parsed tool_use.input when response_schema is set
//   usage: { input_tokens, output_tokens, total_tokens, model },
// }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-5";

type Attachment = { mime: string; data_base64: string; filename?: string };

function buildContentBlocks(prompt: string, attachments: Attachment[]) {
  const blocks: Array<Record<string, unknown>> = [];
  for (const a of attachments) {
    if (!a?.mime || !a?.data_base64) continue;
    if (a.mime.startsWith("image/")) {
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: a.mime, data: a.data_base64 },
      });
    } else if (a.mime === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: a.data_base64 },
      });
    }
    // Other mime types silently ignored — Claude only supports images + PDFs as file input.
  }
  blocks.push({ type: "text", text: prompt });
  return blocks;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.slice(7);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return json({ error: "ANTHROPIC_API_KEY not configured. Add it in Backend → Secrets." }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const feature = String(body?.feature || "").trim();
    const prompt = String(body?.prompt || "").trim();
    const context = body?.context ?? {};
    const system = typeof body?.system === "string" ? body.system : undefined;
    const maxTokens = Number.isFinite(body?.max_tokens) ? body.max_tokens : 1024;
    const model = typeof body?.model === "string" && body.model ? body.model : DEFAULT_MODEL;
    const attachments: Attachment[] = Array.isArray(body?.attachments) ? body.attachments : [];
    const inputMessages = Array.isArray(body?.messages) ? body.messages : null;
    const responseSchema =
      body?.response_schema && typeof body.response_schema === "object" &&
      typeof body.response_schema.name === "string" &&
      body.response_schema.parameters && typeof body.response_schema.parameters === "object"
        ? body.response_schema as { name: string; description?: string; parameters: Record<string, unknown> }
        : null;

    if (!feature) {
      return json({ error: "feature is required" }, 400);
    }
    if (!inputMessages && !prompt) {
      return json({ error: "prompt or messages is required" }, 400);
    }

    let messages: Array<Record<string, unknown>>;
    if (inputMessages) {
      // Pass provided multi-turn conversation through unchanged.
      messages = inputMessages.map((m: any) => ({ role: m.role, content: m.content }));
    } else {
      const userContent = Object.keys(context ?? {}).length
        ? `${prompt}\n\n---\nContext:\n${JSON.stringify(context, null, 2)}`
        : prompt;
      messages = attachments.length
        ? [{ role: "user", content: buildContentBlocks(userContent, attachments) }]
        : [{ role: "user", content: userContent }];
    }

    const requestPayload: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    };

    if (responseSchema) {
      requestPayload.tools = [{
        name: responseSchema.name,
        description: responseSchema.description ?? "",
        input_schema: responseSchema.parameters,
      }];
      requestPayload.tool_choice = { type: "tool", name: responseSchema.name };
    }

    const anthropicResp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!anthropicResp.ok) {
      const errText = await anthropicResp.text();
      console.error("Anthropic error", anthropicResp.status, errText);
      return json({ error: "Anthropic API error", status: anthropicResp.status, detail: errText }, 502);
    }

    const data = await anthropicResp.json();
    const contentBlocks: any[] = Array.isArray(data?.content) ? data.content : [];
    const responseText = contentBlocks
      .filter((b: any) => b?.type === "text")
      .map((b: any) => b.text)
      .join("\n")
      .trim();

    let result: Record<string, unknown> | undefined;
    if (responseSchema) {
      const toolUse = contentBlocks.find(
        (b: any) => b?.type === "tool_use" && b?.name === responseSchema.name,
      );
      if (toolUse && toolUse.input && typeof toolUse.input === "object") {
        result = toolUse.input as Record<string, unknown>;
      }
    }

    const inputTokens = data?.usage?.input_tokens ?? 0;
    const outputTokens = data?.usage?.output_tokens ?? 0;
    const totalTokens = inputTokens + outputTokens;

    // Log usage (best-effort; never block the response)
    try {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await admin.from("ai_usage_logs").insert({
        user_id: userId,
        feature_name: feature,
        tokens_used: totalTokens,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        model,
      });
    } catch (logErr) {
      console.error("ai_usage_logs insert failed", logErr);
    }

    return json({
      response: responseText,
      ...(result !== undefined ? { result } : {}),
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        model,
      },
    });
  } catch (e) {
    console.error("ai-gateway error", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
