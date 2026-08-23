/**
 * Flag 38: WhatsApp Business API Sender (Netlify Function)
 *
 * Endpoint: /.netlify/functions/whatsapp-send
 * Method: POST
 * Body: { phone, message, templateName?, patientName? }
 *
 * Requires env vars:
 *   WHATSAPP_API_URL - WhatsApp Business API endpoint
 *   WHATSAPP_TOKEN   - Bearer token for authentication
 *   WHATSAPP_PHONE_ID - Business phone number ID
 */

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { phone, message, templateName, patientName } = JSON.parse(event.body || "{}");

  if (!phone || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: "phone and message are required" }) };
  }

  const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

  // If WhatsApp API not configured, log and return success (dev mode)
  if (!WHATSAPP_API_URL || !WHATSAPP_TOKEN) {
    console.log(`[WhatsApp-Dev] Would send to ${phone}: ${message}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        mode: "dev",
        message: "WhatsApp API not configured — message logged only",
        phone,
        messagePreview: message.slice(0, 100),
      }),
    };
  }

  try {
    // Format phone for WhatsApp API (must include country code)
    const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;

    const payload = templateName
      ? {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: patientName
              ? [{ type: "body", parameters: [{ type: "text", text: patientName }] }]
              : [],
          },
        }
      : {
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: message },
        };

    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, error: result.error?.message || "WhatsApp API error", details: result }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: result.messages?.[0]?.id,
        phone: formattedPhone,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
