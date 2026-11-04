/**
 * Gemini AI Proxy — Secure Server-Side Function
 *
 * Keeps the Gemini API key server-side only.
 * Client calls this function instead of Google API directly.
 *
 * Endpoint: /.netlify/functions/gemini-proxy
 * Method: POST
 * Body: { prompt, systemInstruction?, maxTokens?, temperature? }
 *
 * Requires env var: GEMINI_API_KEY (NOT VITE_ prefixed)
 *
 * Rate limiting: Max 30 requests per minute per IP (basic protection)
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Simple in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        text: "",
        error: "Gemini API not configured on server. Add GEMINI_API_KEY environment variable.",
      }),
    };
  }

  // Rate limiting
  const clientIp = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown";
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ text: "", error: "Rate limit exceeded. Please wait a moment." }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { prompt, systemInstruction, maxTokens = 2048, temperature = 0.7 } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "prompt is required" }) };
  }

  // Limit prompt size to prevent abuse
  if (prompt.length > 10000) {
    return { statusCode: 400, body: JSON.stringify({ error: "Prompt too long (max 10000 chars)" }) };
  }

  try {
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: Math.min(maxTokens, 4096),
        temperature: Math.min(Math.max(temperature, 0), 1),
      },
    };

    if (systemInstruction) {
      requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: 200,
        body: JSON.stringify({ text: "", error: `Gemini API error: ${response.status}` }),
      };
    }

    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, error: null }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ text: "", error: err.message || "AI generation failed" }),
    };
  }
};
