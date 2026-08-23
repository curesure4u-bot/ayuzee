// ═══════════════════════════════════════════════════════════════════════════════
// Telegram Bot Webhook — Spine AYUSH Daily Check-in Bot
// 
// SETUP STEPS:
// 1. Open Telegram → search @BotFather → send /newbot → follow steps
// 2. Copy the BOT TOKEN (looks like: 7123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw)
// 3. Add to Netlify environment variables: TELEGRAM_BOT_TOKEN=your_token
// 4. After deploy, set webhook by visiting this URL in browser:
//    https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-site.netlify.app/.netlify/functions/telegram-webhook
// 5. Done! Bot is now live.
// ═══════════════════════════════════════════════════════════════════════════════

const { createClient } = require("@supabase/supabase-js");

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { realtime: { transport: null }, auth: { persistSession: false } }
);

// Send message back to user
async function sendMessage(chatId, text, options = {}) {
  const body = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  };

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Send message with inline keyboard buttons
async function sendWithButtons(chatId, text, buttons) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    }),
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    return { statusCode: 200, body: "Spine AYUSH Telegram Bot is active ✅" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const update = JSON.parse(event.body);

    // Handle callback queries (button presses)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const userId = update.callback_query.from.id;

      if (callbackData.startsWith("vas_")) {
        const vasScore = parseInt(callbackData.replace("vas_", ""));
        
        // Save VAS score
        await supabase.from("spine_whatsapp_messages").insert({
          phone_number: `tg_${userId}`,
          message_body: `VAS: ${vasScore}`,
          message_type: "daily_checkin",
          vas_score: vasScore,
          created_at: new Date().toISOString(),
        });

        // Follow up with exercise question
        await sendWithButtons(chatId,
          `✅ Pain score <b>${vasScore}/10</b> recorded!\n\nDid you do your exercises today?`,
          [[
            { text: "✅ Yes, done!", callback_data: `exercise_yes_${vasScore}` },
            { text: "❌ Missed today", callback_data: `exercise_no_${vasScore}` },
          ]]
        );
      }

      if (callbackData.startsWith("exercise_")) {
        const parts = callbackData.split("_");
        const exerciseDone = parts[1] === "yes";
        const vasScore = parseInt(parts[2]);

        // Update the record
        await supabase.from("spine_whatsapp_messages")
          .update({ exercise_done: exerciseDone })
          .eq("phone_number", `tg_${userId}`)
          .order("created_at", { ascending: false })
          .limit(1);

        let response;
        if (exerciseDone && vasScore <= 3) {
          response = "🎉 <b>Amazing!</b> Low pain + exercises done = you're on the recovery fast track! Keep it up! 💪";
        } else if (exerciseDone) {
          response = "👏 <b>Great job!</b> Exercises done! Your pain will keep reducing. Consistency is key! 🔑";
        } else if (vasScore >= 7) {
          response = "🙏 High pain today — that's okay. Rest well, apply warm oil on the area, and try gentle cat-cow stretches. Tomorrow will be better.";
        } else {
          response = "👍 No worries — try to do at least 5 minutes tomorrow. Even a small effort helps your spine heal faster.";
        }

        response += "\n\n📊 Your check-in is saved. See you tomorrow at 8 AM! 🌅";
        await sendMessage(chatId, response);
      }

      // Acknowledge callback to remove loading state
      await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: update.callback_query.id }),
      });

      return { statusCode: 200, body: "OK" };
    }

    // Handle regular messages
    const message = update.message;
    if (!message || !message.text) {
      return { statusCode: 200, body: "OK" };
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();
    const firstName = message.from.first_name || "there";

    // /start command
    if (text === "/start") {
      await sendMessage(chatId,
        `🙏 <b>Welcome to Spine AYUSH Bot!</b>\n\n` +
        `Hi ${firstName}! I'm your daily spine health companion.\n\n` +
        `Every day at 8 AM, I'll ask you:\n` +
        `1️⃣ Your pain level (0-10)\n` +
        `2️⃣ Did you do exercises?\n\n` +
        `This helps your doctor track your recovery.\n\n` +
        `<b>Commands:</b>\n` +
        `/checkin — Submit today's pain score\n` +
        `/progress — See your recovery trend\n` +
        `/exercises — View your exercise list\n` +
        `/help — Show all commands\n\n` +
        `Let's start healing! 🌿`
      );

      // Register this user
      await supabase.from("spine_whatsapp_messages").insert({
        phone_number: `tg_${userId}`,
        message_body: `/start by ${firstName}`,
        message_type: "other",
        created_at: new Date().toISOString(),
      });

      return { statusCode: 200, body: "OK" };
    }

    // /checkin command — show VAS picker
    if (text === "/checkin") {
      await sendWithButtons(chatId,
        `🩺 <b>Daily Check-in</b>\n\nHow is your pain right now? (0 = no pain, 10 = worst)`,
        [
          [
            { text: "0️⃣", callback_data: "vas_0" },
            { text: "1️⃣", callback_data: "vas_1" },
            { text: "2️⃣", callback_data: "vas_2" },
            { text: "3️⃣", callback_data: "vas_3" },
          ],
          [
            { text: "4️⃣", callback_data: "vas_4" },
            { text: "5️⃣", callback_data: "vas_5" },
            { text: "6️⃣", callback_data: "vas_6" },
            { text: "7️⃣", callback_data: "vas_7" },
          ],
          [
            { text: "8️⃣", callback_data: "vas_8" },
            { text: "9️⃣", callback_data: "vas_9" },
            { text: "🔟", callback_data: "vas_10" },
          ],
        ]
      );
      return { statusCode: 200, body: "OK" };
    }

    // /progress command
    if (text === "/progress") {
      const { data: records } = await supabase
        .from("spine_whatsapp_messages")
        .select("vas_score, exercise_done, created_at")
        .eq("phone_number", `tg_${userId}`)
        .eq("message_type", "daily_checkin")
        .order("created_at", { ascending: false })
        .limit(7);

      if (!records || records.length === 0) {
        await sendMessage(chatId, "📊 No check-ins yet! Use /checkin to submit your first pain score.");
        return { statusCode: 200, body: "OK" };
      }

      let progressText = "📊 <b>Your Last 7 Days:</b>\n\n";
      const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "█", "█", "█"];
      
      records.reverse().forEach((r) => {
        const date = new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const vasBar = bars[r.vas_score || 0];
        const exercise = r.exercise_done ? "✅" : "❌";
        progressText += `${date}: ${vasBar} VAS ${r.vas_score}/10 ${exercise}\n`;
      });

      const avgVas = (records.reduce((s, r) => s + (r.vas_score || 0), 0) / records.length).toFixed(1);
      const exerciseDays = records.filter(r => r.exercise_done).length;
      
      progressText += `\n📈 Avg pain: <b>${avgVas}/10</b>`;
      progressText += `\n🏋️ Exercise streak: <b>${exerciseDays}/${records.length} days</b>`;
      
      if (parseFloat(avgVas) <= 3) {
        progressText += "\n\n🎉 You're doing great! Almost pain-free!";
      } else if (parseFloat(avgVas) <= 5) {
        progressText += "\n\n💪 Good progress! Keep going!";
      } else {
        progressText += "\n\n🙏 Hang in there. Consistent effort will show results.";
      }

      await sendMessage(chatId, progressText);
      return { statusCode: 200, body: "OK" };
    }

    // /exercises command
    if (text === "/exercises") {
      await sendMessage(chatId,
        `🏋️ <b>Your Daily Exercises:</b>\n\n` +
        `1️⃣ <b>Cat-Cow Stretch</b> — 10 reps\n` +
        `   Hands & knees, arch up then dip down\n\n` +
        `2️⃣ <b>BL40 Acupressure</b> — 1 min each side\n` +
        `   Behind knee center, press firmly\n\n` +
        `3️⃣ <b>Piriformis Ball Release</b> — 2 min\n` +
        `   Sit on tennis ball on tight buttock\n\n` +
        `4️⃣ <b>Hip Flexor Stretch</b> — 30 sec × 3\n` +
        `   Lunge position, push hips forward\n\n` +
        `5️⃣ <b>Bird-Dog</b> — 8 reps each side\n` +
        `   Opposite arm + leg, hold 5 sec\n\n` +
        `⏱ Total time: <b>10-12 minutes</b>\n` +
        `🔑 Do this EVERY morning before breakfast!\n\n` +
        `After completing, use /checkin to log your score.`
      );
      return { statusCode: 200, body: "OK" };
    }

    // /help command
    if (text === "/help") {
      await sendMessage(chatId,
        `🤖 <b>Spine AYUSH Bot Commands:</b>\n\n` +
        `/checkin — Log today's pain + exercise\n` +
        `/progress — See your 7-day trend\n` +
        `/exercises — View exercise routine\n` +
        `/help — Show this message\n\n` +
        `💡 <b>Quick check-in:</b> Just send a number 0-10 anytime to log pain quickly!\n\n` +
        `🏥 Need to speak to a doctor?\n` +
        `Call: +91 XXXXX XXXXX\n` +
        `Visit: ayuzee.com/spine`
      );
      return { statusCode: 200, body: "OK" };
    }

    // Quick check-in: if user just sends a number 0-10
    const quickVas = parseInt(text);
    if (!isNaN(quickVas) && quickVas >= 0 && quickVas <= 10) {
      await supabase.from("spine_whatsapp_messages").insert({
        phone_number: `tg_${userId}`,
        message_body: `Quick VAS: ${quickVas}`,
        message_type: "daily_checkin",
        vas_score: quickVas,
        created_at: new Date().toISOString(),
      });

      await sendWithButtons(chatId,
        `✅ Pain <b>${quickVas}/10</b> recorded! Did you exercise today?`,
        [[
          { text: "✅ Yes!", callback_data: `exercise_yes_${quickVas}` },
          { text: "❌ No", callback_data: `exercise_no_${quickVas}` },
        ]]
      );
      return { statusCode: 200, body: "OK" };
    }

    // Unknown message — provide guidance
    await sendMessage(chatId,
      `🙏 Hi ${firstName}! I understand health queries, but I'm best at daily tracking.\n\n` +
      `Try: /checkin or just send a number (0-10) for quick pain logging.\n` +
      `Use /help to see all commands.`
    );

    // Log the message for doctor review
    await supabase.from("spine_whatsapp_messages").insert({
      phone_number: `tg_${userId}`,
      message_body: text,
      message_type: "inquiry",
      created_at: new Date().toISOString(),
    });

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return { statusCode: 200, body: "Error handled" };
  }
};
