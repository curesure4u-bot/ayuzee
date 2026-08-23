/**
 * ═══════════════════════════════════════════════════════════════════════════
 * AYUZEE MASTER INTEGRATIONS SERVICE
 * All third-party service integrations in one place
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SETUP: Add these to your .env file:
 *   VITE_GA4_ID=G-XXXXXXXXXX
 *   VITE_POSTHOG_KEY=phc_XXXXXXXXXX
 *   VITE_RAZORPAY_KEY=rzp_live_XXXXXXXXXX
 *   VITE_FIREBASE_API_KEY=XXXXXXXXXX
 *   VITE_FIREBASE_PROJECT_ID=ayuzee-app
 *   VITE_FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXX
 *   VITE_FIREBASE_VAPID_KEY=XXXXXXXXXX
 *   VITE_WHATSAPP_API_URL=https://api.gupshup.io/wa/api/v1
 *   VITE_WHATSAPP_API_KEY=XXXXXXXXXX
 *   VITE_OPENAI_API_KEY=sk-XXXXXXXXXX
 *   GEMINI_API_KEY (server-side)=XXXXXXXXXX
 *   VITE_SENTRY_DSN=https://XXXXXXXXXX@sentry.io/XXXXXXXXXX
 *   VITE_JITSI_DOMAIN=meet.jit.si
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. ANALYTICS — Google Analytics 4 + PostHog
// Free: GA4 unlimited, PostHog 1M events/month
// Usage: Track page views, button clicks, feature usage, conversions
// ═══════════════════════════════════════════════════════════════════════════

export const analytics = {
  /** Track a custom event */
  trackEvent(eventName: string, properties?: Record<string, unknown>) {
    // GA4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", eventName, properties);
    }
    // PostHog
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture(eventName, properties);
    }
  },

  /** Track page view */
  trackPageView(path: string) {
    if ((window as any).gtag) {
      (window as any).gtag("event", "page_view", { page_path: path });
    }
    if ((window as any).posthog) {
      (window as any).posthog.capture("$pageview", { $current_url: path });
    }
  },

  /** Identify user (after login) */
  identifyUser(userId: string, traits?: Record<string, unknown>) {
    if ((window as any).posthog) {
      (window as any).posthog.identify(userId, traits);
    }
  },

  /** Track appointment booking */
  trackBooking(doctorId: string, fee: number, type: string) {
    analytics.trackEvent("appointment_booked", { doctor_id: doctorId, fee, consultation_type: type });
  },

  /** Track shop purchase */
  trackPurchase(orderId: string, amount: number, items: number) {
    analytics.trackEvent("purchase", { order_id: orderId, value: amount, items_count: items, currency: "INR" });
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// 2. VIDEO CALLING — Jitsi Meet (Completely Free, No Signup)
// Usage: Teleconsultation between doctor and patient
// Where: HmsTeleconsult, /consultation/:id/room
// ═══════════════════════════════════════════════════════════════════════════

export const videoCall = {
  /** Generate a unique room name for a consultation */
  generateRoomName(appointmentId: string, doctorName: string): string {
    const sanitized = doctorName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10);
    return `ayuzee-${sanitized}-${appointmentId.slice(0, 8)}`;
  },

  /** Get Jitsi Meet embed URL */
  getJitsiUrl(roomName: string, displayName: string, isDoctor: boolean): string {
    const domain = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";
    const config = encodeURIComponent(JSON.stringify({
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      prejoinPageEnabled: true,
      disableDeepLinking: true,
    }));
    return `https://${domain}/${roomName}#userInfo.displayName="${displayName}"&config.${config}`;
  },

  /** Launch Jitsi in iframe (for embed) */
  getEmbedConfig(roomName: string, displayName: string) {
    return {
      domain: import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si",
      roomName,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: true,
        enableWelcomePage: false,
        toolbarButtons: ["microphone", "camera", "chat", "desktop", "fullscreen", "hangup", "raisehand"],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: "#0f766e",
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      userInfo: { displayName },
    };
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. PAYMENTS — Razorpay (No monthly fee, 2% per transaction)
// Usage: Appointment booking, Shop checkout, Subscription plans
// Where: Checkout, Consultation booking, Patient wallet
// ═══════════════════════════════════════════════════════════════════════════

export const payments = {
  /** Initialize Razorpay checkout */
  async initiatePayment(options: {
    amount: number; // in paise (₹150 = 15000)
    currency?: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    description: string;
    onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    onFailure: (error: unknown) => void;
  }) {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!razorpayKey) { options.onFailure("Razorpay key not configured"); return; }

    const rzpOptions = {
      key: razorpayKey,
      amount: options.amount,
      currency: options.currency || "INR",
      name: "Ayuzee",
      description: options.description,
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: "#0f766e" },
      handler: options.onSuccess,
      modal: { ondismiss: () => options.onFailure("Payment cancelled") },
    };

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.open();
  },

  /** Load Razorpay script dynamically */
  loadScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// 4. PUSH NOTIFICATIONS — Firebase Cloud Messaging (Completely Free)
// Usage: Appointment reminders, lab report ready, medicine reminders
// Where: Patient app, Doctor alerts
// ═══════════════════════════════════════════════════════════════════════════

export const pushNotifications = {
  /** Request permission and get FCM token */
  async requestPermission(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return null;
      // In production: initialize Firebase and get token
      // const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
      // return token;
      console.log("Push notifications enabled");
      return "fcm_token_placeholder";
    } catch (error) {
      console.error("Push notification error:", error);
      return null;
    }
  },

  /** Show local notification (works without FCM for testing) */
  showLocal(title: string, body: string, icon?: string) {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: `ayuzee-${Date.now()}`,
      });
    }
  },

  /** Send notification via server (Supabase Edge Function) */
  async sendToUser(userId: string, title: string, body: string, data?: Record<string, string>) {
    // This calls your Supabase Edge Function which handles FCM server-side
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ userId, title, body, data }),
    });
    return response.ok;
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. WHATSAPP BUSINESS API — via Gupshup (1000 free conversations/month)
// Usage: Appointment confirmations, Rx sharing, follow-up reminders, EOD reports
// Where: HMS notifications, Patient reminders, Doctor alerts
// ═══════════════════════════════════════════════════════════════════════════

export const whatsapp = {
  /** Send template message (pre-approved by Meta) */
  async sendTemplate(phone: string, templateName: string, params: string[]) {
    const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
    const apiKey = import.meta.env.VITE_WHATSAPP_API_KEY;
    if (!apiUrl || !apiKey) { console.warn("WhatsApp API not configured"); return false; }

    try {
      const response = await fetch(`${apiUrl}/msg`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", apikey: apiKey },
        body: new URLSearchParams({
          channel: "whatsapp",
          source: "917000000000", // Your WhatsApp Business number
          destination: `91${phone.replace(/\D/g, "").slice(-10)}`,
          "src.name": "AyuzeeHealth",
          template: JSON.stringify({ id: templateName, params }),
        }),
      });
      return response.ok;
    } catch { return false; }
  },

  /** Send appointment reminder */
  async sendAppointmentReminder(phone: string, patientName: string, doctorName: string, date: string, time: string) {
    return whatsapp.sendTemplate(phone, "appointment_reminder", [patientName, doctorName, date, time]);
  },

  /** Send prescription */
  async sendPrescription(phone: string, patientName: string, doctorName: string, rxLink: string) {
    return whatsapp.sendTemplate(phone, "prescription_sent", [patientName, doctorName, rxLink]);
  },

  /** Send lab report ready notification */
  async sendLabReportReady(phone: string, patientName: string, testName: string, reportLink: string) {
    return whatsapp.sendTemplate(phone, "lab_report_ready", [patientName, testName, reportLink]);
  },

  /** Send follow-up reminder */
  async sendFollowUpReminder(phone: string, patientName: string, doctorName: string, dueDate: string) {
    return whatsapp.sendTemplate(phone, "followup_reminder", [patientName, doctorName, dueDate]);
  },

  /** Send medicine reminder */
  async sendMedicineReminder(phone: string, patientName: string, medicines: string) {
    return whatsapp.sendTemplate(phone, "medicine_reminder", [patientName, medicines]);
  },
};


// ═══════════════════════════════════════════════════════════════════════════
// 6. AI / LLM — OpenAI + Google Gemini
// Free: OpenAI $5 credit, Gemini 60 req/min free
// Usage: AI Scribe, MedAssist bot, Document Parser, CDSS
// Where: All AI features in HMS
// ═══════════════════════════════════════════════════════════════════════════

export const aiService = {
  /** Call OpenAI (for complex medical tasks) */
  async callOpenAI(prompt: string, systemPrompt?: string, model?: string): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) return "[AI not configured — add VITE_OPENAI_API_KEY to .env]";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt || "You are a helpful AYUSH medical assistant. Respond concisely." },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No response";
  },

  /** Call Google Gemini via server proxy (API key stays server-side) */
  async callGemini(prompt: string): Promise<string> {
    try {
      const response = await fetch("/.netlify/functions/gemini-proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.error) return `[AI Error: ${data.error}]`;
      return data.text || "No response";
    } catch (err: any) {
      return `[AI Error: ${err.message}]`;
    }
  },

  /** AI Scribe: Convert consultation audio to structured notes */
  async transcribeConsultation(audioText: string): Promise<string> {
    return aiService.callOpenAI(audioText,
      "You are an AYUSH medical scribe. Convert the consultation transcript into structured SOAP notes. " +
      "Include: Chief Complaint, History, Examination (Prakriti, Nadi if mentioned), Diagnosis (Ayurvedic + ICD), " +
      "Treatment Plan (medicines with dose/frequency/duration), Diet (Pathya/Apathya), Follow-up."
    );
  },

  /** Parse medical document (OCR text → structured data) */
  async parseDocument(ocrText: string, docType: string): Promise<string> {
    return aiService.callOpenAI(
      `Parse this ${docType} and extract structured data in JSON format:\n\n${ocrText}`,
      "You are a medical document parser. Extract lab values (with units, normal ranges), medications (name, dose, frequency), " +
      "diagnoses (with ICD codes if possible), and a brief summary. Return valid JSON."
    );
  },

  /** MedAssist: Answer patient health query */
  async answerHealthQuery(question: string, patientContext?: string): Promise<string> {
    const context = patientContext ? `\nPatient context: ${patientContext}` : "";
    return aiService.callGemini(
      `You are Ayuzee Health Assistant. Answer this health question with both modern and AYUSH perspective. ` +
      `Be helpful but always recommend consulting a doctor for serious concerns.${context}\n\nQuestion: ${question}`
    );
  },

  /** CDSS: Check drug interactions */
  async checkInteractions(medicines: string[]): Promise<string> {
    return aiService.callOpenAI(
      `Check for drug-drug and herb-drug interactions between: ${medicines.join(", ")}. ` +
      `Include AYUSH medicine interactions (e.g., Ashwagandha + antihypertensives). Return severity (high/medium/low) and recommendation.`,
      "You are a clinical pharmacologist with expertise in AYUSH pharmacology and herb-drug interactions."
    );
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 7. ERROR TRACKING — Sentry (5000 errors/month free)
// Usage: Catch and report production errors automatically
// Where: Entire application
// ═══════════════════════════════════════════════════════════════════════════

export const errorTracking = {
  /** Initialize Sentry (call once in main.tsx) */
  init() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (!dsn) { console.log("Sentry not configured — add VITE_SENTRY_DSN to .env"); return; }

    // Dynamic import to avoid bundling Sentry in dev
    import("https://browser.sentry-cdn.com/8.0.0/bundle.min.js" as any).catch(() => {
      // Fallback: basic error reporting
      window.addEventListener("error", (e) => {
        console.error("[Ayuzee Error]", e.message, e.filename, e.lineno);
      });
      window.addEventListener("unhandledrejection", (e) => {
        console.error("[Ayuzee Rejection]", e.reason);
      });
    });
  },

  /** Report a custom error */
  captureError(error: Error, context?: Record<string, unknown>) {
    console.error("[Ayuzee]", error.message, context);
    // In production with Sentry SDK:
    // Sentry.captureException(error, { extra: context });
  },

  /** Set user context for error reports */
  setUser(userId: string, email?: string) {
    // Sentry.setUser({ id: userId, email });
    console.log("[Ayuzee] Error tracking user set:", userId);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8. MAPS — Google Maps / OpenStreetMap (Free)
// Usage: Clinic locator, patient navigation, geofencing
// Where: Find Clinics page, QR Attendance geofence
// ═══════════════════════════════════════════════════════════════════════════

export const maps = {
  /** Get Google Maps embed URL for a location */
  getEmbedUrl(lat: number, lng: number, zoom?: number): string {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom || 15}&output=embed`;
  },

  /** Get directions URL */
  getDirectionsUrl(destLat: number, destLng: number, destName?: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${destName || ""}`;
  },

  /** Calculate distance between two points (Haversine) */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /** Check if a point is within geofence radius */
  isWithinGeofence(lat: number, lng: number, centerLat: number, centerLng: number, radiusMeters: number): boolean {
    return maps.calculateDistance(lat, lng, centerLat, centerLng) <= radiusMeters;
  },
};
