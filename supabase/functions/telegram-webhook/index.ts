import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── Telegram API helper ───────────────────────────────────────────────────

async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: false,
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendTelegramDocument(chatId: number | string, documentUrl: string, caption: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, document: documentUrl, caption, parse_mode: "HTML" }),
  });
  return res.json();
}

// ─── Command handlers ──────────────────────────────────────────────────────

function handleStart(firstName: string): string {
  return `🙏 <b>Namaste ${firstName}!</b>\n\nWelcome to <b>Ayuzee Health Bot</b> — your complete AYUSH health companion.\n\nI can help you with:\n\n📅 /book — Book an appointment\n💊 /medicines — Medicine reminders\n🧪 /reports — Lab reports\n👨‍⚕️ /doctors — Find AYUSH doctors\n🩺 /symptoms — Symptom check (AI)\n🌿 /prakriti — Know your body type\n📞 /support — Contact support\n❓ /help — All commands\n\n🌐 Visit: <a href="https://ayuzee.com">ayuzee.com</a>\n\n<i>Tip: Just type your health question naturally and I'll guide you!</i>`;
}

function handleBook(): { text: string; markup: any } {
  return {
    text: `📅 <b>Book an Appointment</b>\n\nChoose your preferred system of medicine:`,
    markup: {
      inline_keyboard: [
        [
          { text: "🌿 Ayurveda", url: "https://ayuzee.com/doctors?specialty=Ayurveda" },
          { text: "💧 Homeopathy", url: "https://ayuzee.com/doctors?specialty=Homeopathy" },
        ],
        [
          { text: "🔥 Siddha", url: "https://ayuzee.com/doctors?specialty=Siddha" },
          { text: "🧘 Yoga", url: "https://ayuzee.com/doctors?specialty=Yoga" },
        ],
        [
          { text: "🏥 All Doctors", url: "https://ayuzee.com/doctors" },
        ],
      ],
    },
  };
}

function handleMedicines(): string {
  return `💊 <b>Medicine Reminders</b>\n\nI'll remind you to take your medicines on time!\n\n<b>How to set up:</b>\n1. Your doctor prescribes on Ayuzee\n2. I automatically send reminders at dose times\n3. Reply ✅ when you've taken it\n\n<b>Your schedule:</b>\n⏰ 8:00 AM — Morning dose\n⏰ 1:00 PM — Afternoon dose\n⏰ 9:00 PM — Night dose\n\n📋 Manage at: <a href="https://ayuzee.com/dashboard/medicine-diary">Medicine Diary</a>`;
}

function handleReports(): { text: string; markup: any } {
  return {
    text: `🧪 <b>My Health Records</b>\n\nAccess all your medical records:`,
    markup: {
      inline_keyboard: [
        [{ text: "📂 Open Health Locker", url: "https://ayuzee.com/dashboard/health-locker" }],
        [{ text: "🧪 Latest Lab Reports", url: "https://ayuzee.com/dashboard/ashtavidha-reports" }],
        [{ text: "📄 My Prescriptions", url: "https://ayuzee.com/dashboard/saved-medicines" }],
      ],
    },
  };
}

function handleDoctors(): { text: string; markup: any } {
  return {
    text: `👨‍⚕️ <b>Find AYUSH Doctors</b>\n\nBrowse verified doctors near you:`,
    markup: {
      inline_keyboard: [
        [{ text: "🔍 Search All Doctors", url: "https://ayuzee.com/doctors" }],
        [
          { text: "🌿 Ayurveda", url: "https://ayuzee.com/doctors?specialty=Ayurveda" },
          { text: "💧 Homeopathy", url: "https://ayuzee.com/doctors?specialty=Homeopathy" },
        ],
        [
          { text: "📍 Near Me", url: "https://ayuzee.com/doctors?sort=near_me" },
          { text: "💰 Low Fee", url: "https://ayuzee.com/doctors?sort=fee_low" },
        ],
      ],
    },
  };
}

function handleSymptoms(): string {
  return `🩺 <b>Symptom Check</b>\n\nTell me what you're experiencing and I'll help guide you.\n\n<b>Examples:</b>\n• "I have a headache for 3 days"\n• "Joint pain in knees"\n• "Skin rash with itching"\n• "Feeling anxious and can't sleep"\n\nOr use our full AI assistant:\n🤖 <a href="https://ayuzee.com/hms/medassist">Ayuzee MedAssist</a>\n\n⚠️ <b>Emergency?</b> Call <b>108</b> immediately.`;
}

function handlePrakriti(): { text: string; markup: any } {
  return {
    text: `🌿 <b>Know Your Prakriti (Body Constitution)</b>\n\nIn Ayurveda, every person has a unique Prakriti — a combination of Vata, Pitta, and Kapha doshas.\n\nKnowing your Prakriti helps in:\n• Personalized diet planning\n• Choosing right therapies\n• Preventing diseases\n• Lifestyle optimization\n\nTake the assessment now:`,
    markup: {
      inline_keyboard: [
        [{ text: "🧬 Start Prakriti Assessment", url: "https://ayuzee.com/diagnosis/prakriti" }],
      ],
    },
  };
}

function handleHelp(): string {
  return `❓ <b>Ayuzee Bot — All Commands</b>\n\n📅 /book — Book appointment with AYUSH doctor\n💊 /medicines — Set up medicine reminders\n🧪 /reports — View my lab reports & records\n👨‍⚕️ /doctors — Find verified AYUSH doctors\n🩺 /symptoms — AI symptom checker\n🌿 /prakriti — Know my body constitution\n🛒 /shop — Buy authentic AYUSH medicines\n📞 /support — Contact Ayuzee team\n\n💡 <b>Tip:</b> You can also type any health question naturally!\n\n🌐 <a href="https://ayuzee.com">ayuzee.com</a> | 📱 <a href="https://ayuzee.com/dashboard">My Dashboard</a>`;
}

function handleShop(): { text: string; markup: any } {
  return {
    text: `🛒 <b>Ayuzee Medicine Shop</b>\n\nBuy authentic AYUSH medicines online:`,
    markup: {
      inline_keyboard: [
        [{ text: "🛒 Browse Shop", url: "https://ayuzee.com/shop" }],
        [{ text: "🌿 Ayurveda", url: "https://ayuzee.com/shop?category=ayurveda" },
         { text: "💧 Homeopathy", url: "https://ayuzee.com/shop?category=homeopathy" }],
        [{ text: "📦 My Orders", url: "https://ayuzee.com/dashboard/orders" }],
      ],
    },
  };
}

function handleSupport(): string {
  return `📞 <b>Contact Ayuzee Support</b>\n\n📧 Email: support@ayuzee.com\n🌐 Website: <a href="https://ayuzee.com/contact">ayuzee.com/contact</a>\n📱 WhatsApp: +91 98765 43210\n\n⏰ Support hours: Mon-Sat, 9 AM - 6 PM IST\n\nFor medical emergencies, call <b>108</b>.`;
}

function handleGeneralMessage(text: string, firstName: string): string {
  const lower = text.toLowerCase();

  if (lower.includes("headache") || lower.includes("pain") || lower.includes("fever") || lower.includes("sick")) {
    return `🩺 I understand you're not feeling well, ${firstName}.\n\n<b>Based on what you described:</b>\n• Stay hydrated and rest\n• For immediate guidance, consult a doctor\n\n📅 <a href="https://ayuzee.com/doctors">Book a consultation</a>\n🤖 <a href="https://ayuzee.com/hms/medassist">Talk to AI MedAssist</a>\n\n⚠️ If symptoms are severe, visit your nearest clinic or call 108.`;
  }

  if (lower.includes("medicine") || lower.includes("tablet") || lower.includes("dose")) {
    return `💊 For medicine information, I recommend:\n\n1. Check your prescription at <a href="https://ayuzee.com/dashboard/saved-medicines">Saved Medicines</a>\n2. Or search on <a href="https://ayuzee.com/shop">Ayuzee Shop</a>\n\nAlways follow your doctor's dosage instructions.`;
  }

  if (lower.includes("thank") || lower.includes("thanks")) {
    return `🙏 You're welcome, ${firstName}! Stay healthy. Type /help anytime you need assistance.\n\n🌿 Ayuzee - Your AYUSH Health Partner`;
  }

  return `Hi ${firstName}! I can help you with health queries.\n\nTry:\n• /book — Book appointment\n• /doctors — Find doctors\n• /symptoms — Check symptoms\n• /help — All commands\n\nOr describe your health concern and I'll guide you! 🌿`;
}

// ─── Main webhook handler ──────────────────────────────────────────────────

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("OK", { status: 200 });
  }

  try {
    const update = await req.json();
    const message = update.message;
    if (!message) return new Response("OK", { status: 200 });

    const chatId = message.chat.id;
    const text = message.text || "";
    const firstName = message.from?.first_name || "there";
    const userId = message.from?.id;

    // Save/update user in DB (for sending notifications later)
    await supabase.from("telegram_bot_users").upsert({
      telegram_id: String(userId),
      chat_id: String(chatId),
      first_name: firstName,
      username: message.from?.username || null,
      last_message_at: new Date().toISOString(),
    }, { onConflict: "telegram_id" }).select();

    // Route commands
    const command = text.split(" ")[0].toLowerCase();
    let response: string;
    let markup: any = undefined;

    switch (command) {
      case "/start":
        response = handleStart(firstName);
        break;
      case "/book":
        const bookResult = handleBook();
        response = bookResult.text;
        markup = bookResult.markup;
        break;
      case "/medicines":
        response = handleMedicines();
        break;
      case "/reports": {
        const reportsResult = handleReports();
        response = reportsResult.text;
        markup = reportsResult.markup;
        break;
      }
      case "/doctors": {
        const doctorsResult = handleDoctors();
        response = doctorsResult.text;
        markup = doctorsResult.markup;
        break;
      }
      case "/symptoms":
        response = handleSymptoms();
        break;
      case "/prakriti": {
        const prakritiResult = handlePrakriti();
        response = prakritiResult.text;
        markup = prakritiResult.markup;
        break;
      }
      case "/shop": {
        const shopResult = handleShop();
        response = shopResult.text;
        markup = shopResult.markup;
        break;
      }
      case "/support":
        response = handleSupport();
        break;
      case "/help":
        response = handleHelp();
        break;
      default:
        response = handleGeneralMessage(text, firstName);
    }

    await sendTelegramMessage(chatId, response, markup);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return new Response("Error", { status: 500 });
  }
});
