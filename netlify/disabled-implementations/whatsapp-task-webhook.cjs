// ═══════════════════════════════════════════════════════════════════════════════
// WhatsApp Quick Add — Task Creation via WhatsApp Messages
//
// HOW IT WORKS:
// 1. User sends a WhatsApp message to the Ayuzee business number
// 2. WhatsApp Business API forwards the message to this webhook
// 3. This function parses the message using natural language
// 4. Creates a task in task_tracker_tasks
// 5. Replies with confirmation
//
// SETUP:
// 1. Create a WhatsApp Business API account (Meta Business Suite)
// 2. Set webhook URL to: https://ayuzee.com/.netlify/functions/whatsapp-task-webhook
// 3. Add env vars: WHATSAPP_VERIFY_TOKEN, WHATSAPP_ACCESS_TOKEN
// 4. Map user phone numbers to user_ids in a mapping table or use phone-based lookup
//
// MESSAGE FORMAT (examples):
// "task: Call pharmacy tomorrow high priority"
// "add task: Submit insurance claim by Friday"
// "todo: Review lab results urgent"
// ═══════════════════════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "ayuzee_task_verify_2025";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { realtime: { transport: null }, auth: { persistSession: false } }
);

// Natural Language Parser (simplified server-side version)
function parseTaskMessage(text) {
  let taskName = text;
  let priority = "Medium";
  let dueDate = null;
  const today = new Date();

  // Remove prefix
  taskName = taskName.replace(/^(task:|add task:|todo:|reminder:|add:)\s*/i, "").trim();

  // Extract priority
  if (/\b(very high|critical)\b/i.test(taskName)) { priority = "Very High"; taskName = taskName.replace(/\b(very high|critical)\b/i, ""); }
  else if (/\b(high priority|high)\b/i.test(taskName)) { priority = "High"; taskName = taskName.replace(/\b(high priority|high)\b/i, ""); }
  else if (/\b(low priority|low)\b/i.test(taskName)) { priority = "Low"; taskName = taskName.replace(/\b(low priority|low)\b/i, ""); }
  else if (/\burgent\b/i.test(taskName)) { priority = "Very High"; taskName = taskName.replace(/\burgent\b/i, ""); }

  // Extract date
  if (/\btomorrow\b/i.test(taskName)) { const d = new Date(today); d.setDate(d.getDate() + 1); dueDate = d.toISOString().split("T")[0]; taskName = taskName.replace(/\btomorrow\b/i, ""); }
  else if (/\bnext week\b/i.test(taskName)) { const d = new Date(today); d.setDate(d.getDate() + 7); dueDate = d.toISOString().split("T")[0]; taskName = taskName.replace(/\bnext week\b/i, ""); }
  else if (/\btoday\b/i.test(taskName)) { dueDate = today.toISOString().split("T")[0]; taskName = taskName.replace(/\btoday\b/i, ""); }
  else if (/\bby friday\b/i.test(taskName)) { const d = new Date(today); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); dueDate = d.toISOString().split("T")[0]; taskName = taskName.replace(/\bby friday\b/i, ""); }

  taskName = taskName.replace(/\s+/g, " ").trim();

  return { task_name: taskName, priority, due_date: dueDate };
}

// Send WhatsApp reply
async function sendWhatsAppReply(to, message) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) return;
  try {
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
  } catch (err) {
    console.error("WhatsApp send error:", err);
  }
}

// Find user by phone number
async function findUserByPhone(phone) {
  // Try to find a doctor or user with this phone
  const { data } = await supabase
    .from("doctors")
    .select("user_id, full_name")
    .eq("phone", phone)
    .maybeSingle();
  if (data) return { user_id: data.user_id, name: data.full_name };

  // Fallback: try user_profiles or other tables
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("phone", phone)
    .maybeSingle();
  if (profile) return { user_id: profile.id, name: profile.full_name };

  return null;
}

exports.handler = async (event) => {
  // Webhook verification (GET request from Meta)
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    if (params["hub.mode"] === "subscribe" && params["hub.verify_token"] === VERIFY_TOKEN) {
      return { statusCode: 200, body: params["hub.challenge"] };
    }
    return { statusCode: 403, body: "Forbidden" };
  }

  // Process incoming message (POST)
  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (!message || message.type !== "text") {
        return { statusCode: 200, body: "OK" };
      }

      const phone = message.from; // sender's phone
      const text = message.text.body;

      // Check if it's a task command
      const isTaskCommand = /^(task:|add task:|todo:|reminder:|add:)/i.test(text);
      if (!isTaskCommand) {
        // Not a task — could be a general query
        await sendWhatsAppReply(phone, "To add a task, start your message with 'task:' or 'add task:'\n\nExample: task: Call pharmacy tomorrow high priority");
        return { statusCode: 200, body: "OK" };
      }

      // Find user
      const user = await findUserByPhone(phone);
      if (!user) {
        await sendWhatsAppReply(phone, "Your phone number is not linked to an Ayuzee account. Please register at ayuzee.com first.");
        return { statusCode: 200, body: "OK" };
      }

      // Parse and create task
      const parsed = parseTaskMessage(text);
      const { error } = await supabase
        .from("task_tracker_tasks")
        .insert({
          user_id: user.user_id,
          role_context: "general",
          task_name: parsed.task_name,
          description: "Created via WhatsApp",
          status: "To do",
          priority: parsed.priority,
          person_in_charge: "Self",
          start_date: new Date().toISOString().split("T")[0],
          due_date: parsed.due_date,
          kanban_category: "To-Do",
          importance: parsed.priority === "Very High" || parsed.priority === "High" ? "Important" : "Not Important",
          urgency: parsed.due_date === new Date().toISOString().split("T")[0] ? "Urgent" : "Not Urgent",
          progress: 0,
          notes: `Via WhatsApp from ${phone}`,
        });

      if (error) {
        await sendWhatsAppReply(phone, `Error creating task: ${error.message}`);
      } else {
        let reply = `✅ Task created!\n\n📋 ${parsed.task_name}`;
        if (parsed.priority !== "Medium") reply += `\n⚡ Priority: ${parsed.priority}`;
        if (parsed.due_date) reply += `\n📅 Due: ${parsed.due_date}`;
        reply += `\n\nView at: ayuzee.com/task-tracker`;
        await sendWhatsAppReply(phone, reply);
      }

      return { statusCode: 200, body: "OK" };
    } catch (err) {
      console.error("Webhook error:", err);
      return { statusCode: 200, body: "OK" };
    }
  }

  return { statusCode: 405, body: "Method not allowed" };
};
