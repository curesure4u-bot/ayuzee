/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AYUZEE UNIFIED MESSAGING SERVICE
 * WhatsApp Business + Telegram Bot — Patient chooses their preferred channel
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SETUP:
 *   WhatsApp: VITE_WHATSAPP_API_URL, VITE_WHATSAPP_API_KEY, VITE_WHATSAPP_BUSINESS_NUMBER
 *   Telegram: VITE_TELEGRAM_BOT_TOKEN (get from @BotFather on Telegram)
 *
 * HOW TO GET TELEGRAM BOT:
 *   1. Open Telegram → search @BotFather
 *   2. Send /newbot → name it "Ayuzee Health Bot"
 *   3. Copy the token → add to .env as VITE_TELEGRAM_BOT_TOKEN
 *   4. Patients find your bot at t.me/AyuzeeHealthBot and press Start
 *   5. Their Telegram chat_id is saved in your DB → you can send them messages
 */

export type MessageChannel = "whatsapp" | "telegram" | "sms" | "app";

export interface MessagePayload {
  recipientPhone?: string;       // For WhatsApp/SMS
  recipientTelegramId?: string;  // For Telegram (chat_id)
  recipientName: string;
  channel: MessageChannel;
  messageType: string;
  templateData: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIFIED MESSAGING — Send via patient's preferred channel
// ═══════════════════════════════════════════════════════════════════════════

export const messaging = {
  /**
   * Send a message via patient's preferred channel
   * The system checks patient preference and routes accordingly
   */
  async send(payload: MessagePayload): Promise<boolean> {
    switch (payload.channel) {
      case "whatsapp":
        return whatsappService.sendMessage(payload);
      case "telegram":
        return telegramService.sendMessage(payload);
      case "sms":
        return smsService.sendMessage(payload);
      default:
        console.warn(`Channel ${payload.channel} not supported, falling back to WhatsApp`);
        return whatsappService.sendMessage(payload);
    }
  },

  /** Send appointment reminder via preferred channel */
  async sendAppointmentReminder(
    channel: MessageChannel,
    recipientId: string, // phone for WA, chat_id for Telegram
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    clinicName: string
  ): Promise<boolean> {
    const payload: MessagePayload = {
      recipientPhone: channel === "whatsapp" || channel === "sms" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "appointment_reminder",
      templateData: { patientName, doctorName, date, time, clinicName },
    };
    return messaging.send(payload);
  },

  /** Send prescription via preferred channel */
  async sendPrescription(
    channel: MessageChannel,
    recipientId: string,
    patientName: string,
    doctorName: string,
    medicines: string,
    rxLink: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "prescription_sent",
      templateData: { patientName, doctorName, medicines, rxLink },
    });
  },

  /** Send lab report ready notification */
  async sendLabReport(
    channel: MessageChannel,
    recipientId: string,
    patientName: string,
    testName: string,
    reportLink: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "lab_report_ready",
      templateData: { patientName, testName, reportLink },
    });
  },

  /** Send medicine reminder */
  async sendMedicineReminder(
    channel: MessageChannel,
    recipientId: string,
    patientName: string,
    medicines: string,
    timeSlot: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "medicine_reminder",
      templateData: { patientName, medicines, timeSlot },
    });
  },

  /** Send follow-up reminder */
  async sendFollowUp(
    channel: MessageChannel,
    recipientId: string,
    patientName: string,
    doctorName: string,
    dueDate: string,
    bookingLink: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "followup_reminder",
      templateData: { patientName, doctorName, dueDate, bookingLink },
    });
  },

  /** Send EOD report to clinic owner */
  async sendEodReport(
    channel: MessageChannel,
    recipientId: string,
    ownerName: string,
    revenue: string,
    patients: string,
    pendingBills: string,
    noShows: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: ownerName,
      channel,
      messageType: "eod_report",
      templateData: { ownerName, revenue, patients, pendingBills, noShows, date: new Date().toLocaleDateString("en-IN") },
    });
  },

  /** Send feedback request after visit */
  async sendFeedbackRequest(
    channel: MessageChannel,
    recipientId: string,
    patientName: string,
    doctorName: string,
    feedbackLink: string
  ): Promise<boolean> {
    return messaging.send({
      recipientPhone: channel !== "telegram" ? recipientId : undefined,
      recipientTelegramId: channel === "telegram" ? recipientId : undefined,
      recipientName: patientName,
      channel,
      messageType: "feedback_request",
      templateData: { patientName, doctorName, feedbackLink },
    });
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP BUSINESS SERVICE
// Provider: Gupshup / Twilio / Meta Direct
// Free: 1000 business-initiated conversations/month (Gupshup)
// Cost after free: ~₹0.50 per message
// ═══════════════════════════════════════════════════════════════════════════

const whatsappService = {
  async sendMessage(payload: MessagePayload): Promise<boolean> {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
    const businessNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || "917000000000";

    if (!apiUrl || !apiKey) {
      console.warn("[WhatsApp] Not configured. Add VITE_WHATSAPP_API_URL and VITE_WHATSAPP_API_KEY to .env");
      return false;
    }

    const phone = payload.recipientPhone?.replace(/\D/g, "").slice(-10);
    if (!phone) { console.error("[WhatsApp] No phone number"); return false; }

    const message = whatsappService.formatMessage(payload.messageType, payload.templateData);

    try {
      const response = await fetch(`${apiUrl}/msg`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", apikey: apiKey },
        body: new URLSearchParams({
          channel: "whatsapp",
          source: businessNumber,
          destination: `91${phone}`,
          "src.name": "AyuzeeHealth",
          message: JSON.stringify({ type: "text", text: message }),
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("[WhatsApp] Send failed:", error);
      return false;
    }
  },

  formatMessage(type: string, data: Record<string, string>): string {
    const templates: Record<string, string> = {
      appointment_reminder:
        `🙏 Namaste ${data.patientName}!\n\nYour appointment is confirmed:\n👨‍⚕️ ${data.doctorName}\n📅 ${data.date}\n⏰ ${data.time}\n🏥 ${data.clinicName}\n\nPlease arrive 15 mins early.\n\n🌿 Ayuzee - Your AYUSH Health Partner`,
      prescription_sent:
        `💊 ${data.patientName},\n\nYour prescription from ${data.doctorName}:\n\n${data.medicines}\n\n📋 View full Rx: ${data.rxLink}\n\nOrder medicines on Ayuzee Shop for delivery.\n\n🌿 Get well soon!`,
      lab_report_ready:
        `🧪 ${data.patientName},\n\nYour ${data.testName} report is ready!\n\n📊 View: ${data.reportLink}\n\nConsult your doctor for interpretation.\n\n🌿 Ayuzee Health`,
      medicine_reminder:
        `💊 Medicine Time!\n\nDear ${data.patientName},\n⏰ ${data.timeSlot} dose:\n${data.medicines}\n\nStay healthy! 🌿 Ayuzee`,
      followup_reminder:
        `🔔 ${data.patientName},\n\nYour follow-up with ${data.doctorName} is due on ${data.dueDate}.\n\n📅 Book now: ${data.bookingLink}\n\n🌿 Ayuzee`,
      eod_report:
        `📊 EOD Report — ${data.date}\n\nHi ${data.ownerName},\n\n💰 Revenue: ₹${data.revenue}\n👥 Patients: ${data.patients}\n📋 Pending Bills: ${data.pendingBills}\n❌ No-Shows: ${data.noShows}\n\n🌿 Ayuzee HMS`,
      feedback_request:
        `🙏 ${data.patientName},\n\nHow was your visit with ${data.doctorName}?\n\n⭐ Rate now: ${data.feedbackLink}\n\nYour feedback helps us serve you better!\n\n🌿 Ayuzee`,
    };
    return templates[type] || `Hi ${data.patientName}, you have a notification from Ayuzee. Visit ayuzee.com for details.`;
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// TELEGRAM BOT SERVICE
// Completely FREE — No message limits, no per-message cost
// Setup: Get token from @BotFather → add to .env
// Patients: Find bot at t.me/YourBotName → press Start → linked
// ═══════════════════════════════════════════════════════════════════════════

const telegramService = {
  async sendMessage(payload: MessagePayload): Promise<boolean> {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[Telegram] Not configured. Add VITE_TELEGRAM_BOT_TOKEN to .env");
      return false;
    }

    const chatId = payload.recipientTelegramId;
    if (!chatId) { console.error("[Telegram] No chat_id"); return false; }

    const message = telegramService.formatMessage(payload.messageType, payload.templateData);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: false,
        }),
      });
      const result = await response.json();
      return result.ok === true;
    } catch (error) {
      console.error("[Telegram] Send failed:", error);
      return false;
    }
  },

  /** Send a document/PDF via Telegram */
  async sendDocument(chatId: string, fileUrl: string, caption: string): Promise<boolean> {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) return false;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          document: fileUrl,
          caption,
          parse_mode: "HTML",
        }),
      });
      const result = await response.json();
      return result.ok === true;
    } catch { return false; }
  },

  /** Send a message with inline keyboard buttons */
  async sendWithButtons(chatId: string, text: string, buttons: { text: string; url?: string; callback_data?: string }[][]): Promise<boolean> {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) return false;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: buttons },
        }),
      });
      const result = await response.json();
      return result.ok === true;
    } catch { return false; }
  },

  /** Set webhook for incoming messages (call once during setup) */
  async setWebhook(webhookUrl: string): Promise<boolean> {
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    if (!botToken) return false;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const result = await response.json();
    return result.ok === true;
  },

  formatMessage(type: string, data: Record<string, string>): string {
    const templates: Record<string, string> = {
      appointment_reminder:
        `🙏 <b>Appointment Confirmed</b>\n\nHi ${data.patientName}!\n\n👨‍⚕️ <b>${data.doctorName}</b>\n📅 ${data.date}\n⏰ ${data.time}\n🏥 ${data.clinicName}\n\nPlease arrive 15 mins early with previous records.\n\n🌿 <i>Ayuzee - Your AYUSH Health Partner</i>`,
      prescription_sent:
        `💊 <b>Prescription Ready</b>\n\nHi ${data.patientName},\n\nDr. ${data.doctorName} has shared your prescription:\n\n${data.medicines}\n\n📋 <a href="${data.rxLink}">View Full Prescription</a>\n\n🛒 Order medicines on Ayuzee for home delivery.\n\n🌿 <i>Get well soon!</i>`,
      lab_report_ready:
        `🧪 <b>Lab Report Ready</b>\n\nHi ${data.patientName},\n\nYour <b>${data.testName}</b> report is ready!\n\n📊 <a href="${data.reportLink}">View Report</a>\n\nConsult your doctor for interpretation.\n\n🌿 <i>Ayuzee Health</i>`,
      medicine_reminder:
        `💊 <b>Medicine Time!</b>\n\nDear ${data.patientName},\n⏰ <b>${data.timeSlot}</b> dose:\n\n${data.medicines}\n\n✅ Take with water after food (unless specified otherwise)\n\n🌿 <i>Stay healthy! — Ayuzee</i>`,
      followup_reminder:
        `🔔 <b>Follow-up Due</b>\n\nHi ${data.patientName},\n\nYour follow-up with <b>${data.doctorName}</b> is due on <b>${data.dueDate}</b>.\n\n📅 <a href="${data.bookingLink}">Book Appointment</a>\n\n🌿 <i>Ayuzee</i>`,
      eod_report:
        `📊 <b>EOD Report — ${data.date}</b>\n\nHi ${data.ownerName},\n\n💰 Revenue: <b>₹${data.revenue}</b>\n👥 Patients: <b>${data.patients}</b>\n📋 Pending Bills: <b>${data.pendingBills}</b>\n❌ No-Shows: <b>${data.noShows}</b>\n\n🌿 <i>Ayuzee HMS</i>`,
      feedback_request:
        `🙏 <b>How was your visit?</b>\n\nHi ${data.patientName},\n\nHow was your experience with <b>${data.doctorName}</b>?\n\n⭐ <a href="${data.feedbackLink}">Rate Your Visit</a>\n\nYour feedback helps us improve!\n\n🌿 <i>Ayuzee</i>`,
    };
    return templates[type] || `Hi ${data.patientName}, you have a notification from Ayuzee. Visit <a href="https://ayuzee.com">ayuzee.com</a> for details.`;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SMS SERVICE (Fallback — for patients without WhatsApp/Telegram)
// Provider: Twilio / MSG91 / TextLocal
// Cost: ~₹0.20 per SMS
// ═══════════════════════════════════════════════════════════════════════════

const smsService = {
  async sendMessage(payload: MessagePayload): Promise<boolean> {
    // SMS is the fallback channel — simpler messages, no rich formatting
    const phone = payload.recipientPhone?.replace(/\D/g, "").slice(-10);
    if (!phone) return false;

    const message = smsService.formatMessage(payload.messageType, payload.templateData);
    console.log(`[SMS] Would send to ${phone}: ${message}`);
    // In production: call Twilio/MSG91 API
    return true;
  },

  formatMessage(type: string, data: Record<string, string>): string {
    const templates: Record<string, string> = {
      appointment_reminder: `Ayuzee: Hi ${data.patientName}, apt with ${data.doctorName} on ${data.date} at ${data.time}. Arrive 15min early.`,
      prescription_sent: `Ayuzee: Rx from ${data.doctorName} ready. View: ${data.rxLink}`,
      lab_report_ready: `Ayuzee: Your ${data.testName} report is ready. View: ${data.reportLink}`,
      medicine_reminder: `Ayuzee: Time for ${data.timeSlot} medicines: ${data.medicines}`,
      followup_reminder: `Ayuzee: Follow-up with ${data.doctorName} due ${data.dueDate}. Book: ${data.bookingLink}`,
    };
    return templates[type] || `Ayuzee: You have a notification. Visit ayuzee.com`;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// TELEGRAM BOT COMMANDS (for handling incoming patient messages)
// Deploy as Supabase Edge Function with webhook
// ═══════════════════════════════════════════════════════════════════════════

export const telegramBotCommands = {
  /** Process incoming Telegram message (called from webhook) */
  processIncoming(update: any): { response: string; action?: string } {
    const text = update?.message?.text || "";
    const chatId = update?.message?.chat?.id;
    const firstName = update?.message?.from?.first_name || "there";

    // Command handling
    if (text === "/start") {
      return {
        response: `🙏 Namaste ${firstName}!\n\nWelcome to <b>Ayuzee Health Bot</b>!\n\nI can help you with:\n\n📅 /book — Book an appointment\n💊 /medicines — My medicine reminders\n🧪 /reports — My lab reports\n👨‍⚕️ /doctors — Find a doctor\n🩺 /symptoms — Check symptoms\n❓ /help — All commands\n\n🌿 Your complete AYUSH health companion!`,
        action: "register_user",
      };
    }

    if (text === "/book" || text.includes("appointment") || text.includes("book")) {
      return {
        response: `📅 <b>Book Appointment</b>\n\nChoose a specialty:\n\n1️⃣ Ayurveda\n2️⃣ Homeopathy\n3️⃣ Siddha\n4️⃣ Yoga & Naturopathy\n5️⃣ Unani\n\nOr visit: <a href="https://ayuzee.com/doctors">ayuzee.com/doctors</a>`,
        action: "booking_flow",
      };
    }

    if (text === "/medicines" || text.includes("medicine") || text.includes("reminder")) {
      return {
        response: `💊 <b>Your Medicines</b>\n\nI'll send you daily reminders for your active prescriptions.\n\n✅ Morning dose: 8:00 AM\n✅ Afternoon dose: 1:00 PM\n✅ Night dose: 9:00 PM\n\nSay "done" after taking each dose!\n\nManage at: <a href="https://ayuzee.com/dashboard/medicine-diary">Medicine Diary</a>`,
        action: "medicine_flow",
      };
    }

    if (text === "/reports" || text.includes("report") || text.includes("lab")) {
      return {
        response: `🧪 <b>Your Health Records</b>\n\nView all your reports at:\n<a href="https://ayuzee.com/dashboard/health-locker">Health Locker</a>\n\nI'll notify you when new reports are ready!`,
        action: "reports_flow",
      };
    }

    if (text === "/doctors" || text.includes("doctor") || text.includes("find")) {
      return {
        response: `👨‍⚕️ <b>Find a Doctor</b>\n\nBrowse verified AYUSH doctors:\n<a href="https://ayuzee.com/doctors">ayuzee.com/doctors</a>\n\n🔍 Search by specialty, city, or condition.`,
        action: "doctor_search",
      };
    }

    if (text === "/symptoms" || text.includes("symptom") || text.includes("sick") || text.includes("pain")) {
      return {
        response: `🩺 <b>Symptom Check</b>\n\nTell me what you're experiencing and I'll guide you.\n\nOr use our AI health assistant:\n<a href="https://ayuzee.com/hms/medassist">Ayuzee MedAssist</a>\n\n⚠️ For emergencies, call 108 immediately.`,
        action: "symptom_check",
      };
    }

    if (text === "/help") {
      return {
        response: `❓ <b>Ayuzee Bot Commands</b>\n\n📅 /book — Book appointment\n💊 /medicines — Medicine reminders\n🧪 /reports — Lab reports\n👨‍⚕️ /doctors — Find doctor\n🩺 /symptoms — Symptom check\n🌿 /prakriti — Know your body type\n📞 /support — Contact support\n\n🌐 Website: <a href="https://ayuzee.com">ayuzee.com</a>`,
      };
    }

    // Default: forward to MedAssist AI
    return {
      response: `I understand you're asking about "${text.slice(0, 30)}..."\n\nFor detailed health guidance, try our AI assistant:\n<a href="https://ayuzee.com/hms/medassist">Ayuzee MedAssist</a>\n\nOr type /help for commands.`,
      action: "forward_to_medassist",
    };
  },
};
