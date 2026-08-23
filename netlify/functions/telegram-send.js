/**
 * Telegram Send Proxy — Secure Server-Side Function
 * 
 * Keeps the Telegram bot token server-side only.
 * Client calls this function instead of Telegram API directly.
 *
 * Endpoint: /.netlify/functions/telegram-send
 * Method: POST
 * Body: { action, chatId, text, parseMode?, document?, caption?, buttons?, webhookUrl? }
 *
 * Requires env var: TELEGRAM_BOT_TOKEN (NOT VITE_ prefixed)
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Validate token is configured
  if (!TELEGRAM_TOKEN) {
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: false, error: "Telegram bot not configured on server" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { action = "sendMessage", chatId, text, parseMode = "HTML", document, caption, buttons, webhookUrl } = body;

  // Validate required fields
  if (action === "sendMessage" && (!chatId || !text)) {
    return { statusCode: 400, body: JSON.stringify({ error: "chatId and text are required" }) };
  }

  const API_BASE = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  try {
    let response;

    switch (action) {
      case "sendMessage": {
        const payload = {
          chat_id: chatId,
          text,
          parse_mode: parseMode,
          disable_web_page_preview: false,
        };
        if (buttons) {
          payload.reply_markup = { inline_keyboard: buttons };
        }
        response = await fetch(`${API_BASE}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        break;
      }

      case "sendDocument": {
        if (!chatId || !document) {
          return { statusCode: 400, body: JSON.stringify({ error: "chatId and document are required" }) };
        }
        response = await fetch(`${API_BASE}/sendDocument`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            document,
            caption: caption || "",
            parse_mode: parseMode,
          }),
        });
        break;
      }

      case "setWebhook": {
        if (!webhookUrl) {
          return { statusCode: 400, body: JSON.stringify({ error: "webhookUrl is required" }) };
        }
        response = await fetch(`${API_BASE}/setWebhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: webhookUrl }),
        });
        break;
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    const result = await response.json();
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message || "Telegram API error" }),
    };
  }
};
