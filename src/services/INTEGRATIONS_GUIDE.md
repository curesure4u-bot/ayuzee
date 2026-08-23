# Ayuzee Third-Party Integrations Guide

## Overview
All integrations are in `src/services/integrations.ts`. Import and use:
```ts
import { analytics, videoCall, payments, pushNotifications, whatsapp, aiService, errorTracking, maps } from "@/services/integrations";
```

---

## 1. Google Analytics 4 + PostHog
**Free tier**: GA4 unlimited | PostHog 1M events/month
**Setup**:
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Create PostHog account at https://posthog.com
4. Get Project API Key
5. Replace placeholders in `index.html`

**Usage in code**:
```ts
analytics.trackEvent("button_clicked", { button: "book_appointment" });
analytics.trackBooking("doc_001", 500, "ayurveda");
analytics.trackPurchase("ORD-001", 1200, 3);
analytics.identifyUser(userId, { role: "doctor", city: "Kadayanallur" });
```

**Where used**: Every page (auto page views), Booking flow, Shop checkout, HMS actions

---

## 2. Jitsi Meet (Video Calling)
**Free tier**: Completely free, no signup needed
**Setup**: No setup required! Works out of the box with meet.jit.si

**Usage in code**:
```ts
const roomName = videoCall.generateRoomName(appointmentId, "DrSaleem");
const url = videoCall.getJitsiUrl(roomName, "Dr. Saleem", true);
// Open in new tab or embed in iframe
window.open(url, "_blank");
```

**Where used**: HmsTeleconsult, Consultation Room (/consultation/:id/room)

---

## 3. Razorpay (Payments)
**Free tier**: No monthly fee, 2% per transaction
**Setup**:
1. Create account at https://razorpay.com
2. Get API Key (Test + Live)
3. Add `VITE_RAZORPAY_KEY` to .env

**Usage in code**:
```ts
await payments.loadScript();
payments.initiatePayment({
  amount: 15000, // ₹150 in paise
  orderId: "order_xxx",
  customerName: "Rajesh",
  customerEmail: "rajesh@email.com",
  customerPhone: "9876543210",
  description: "Consultation with Dr. Saleem",
  onSuccess: (res) => { /* save payment */ },
  onFailure: (err) => { /* handle error */ },
});
```

**Where used**: Appointment booking, Shop checkout, Subscription plans, Patient wallet top-up

---

## 4. Firebase Cloud Messaging (Push Notifications)
**Free tier**: Completely free, unlimited
**Setup**:
1. Create Firebase project at https://console.firebase.google.com
2. Enable Cloud Messaging
3. Get config values + VAPID key
4. Add firebase config to .env

**Usage in code**:
```ts
const token = await pushNotifications.requestPermission();
// Save token to user's profile in Supabase
// Server sends notifications via Supabase Edge Function

// For testing locally:
pushNotifications.showLocal("Appointment Reminder", "Your appointment is in 30 minutes");
```

**Where used**: Appointment reminders, Lab report ready, Medicine reminders, Doctor alerts

---

## 5. WhatsApp Business API (via Gupshup)
**Free tier**: 1000 conversations/month
**Setup**:
1. Create account at https://www.gupshup.io or https://www.twilio.com/whatsapp
2. Register WhatsApp Business number
3. Create message templates (need Meta approval)
4. Add API credentials to .env

**Usage in code**:
```ts
await whatsapp.sendAppointmentReminder("9876543210", "Rajesh", "Dr. Saleem", "Jul 31", "10:30 AM");
await whatsapp.sendPrescription("9876543210", "Rajesh", "Dr. Saleem", "https://ayuzee.com/rx/xxx");
await whatsapp.sendLabReportReady("9876543210", "Rajesh", "CBC", "https://ayuzee.com/lab/xxx");
```

**Where used**: All HMS notifications, EOD reports, Follow-up reminders, Prescription sharing

---

## 6. AI / LLM (OpenAI + Gemini)
**Free tier**: OpenAI $5 credit | Gemini 60 req/min free
**Setup**:
1. Get OpenAI key at https://platform.openai.com
2. Get Gemini key at https://makersuite.google.com/app/apikey
3. Add to .env

**Usage in code**:
```ts
// AI Scribe
const notes = await aiService.transcribeConsultation("Patient says headache for 3 days...");

// Document Parser
const structured = await aiService.parseDocument(ocrText, "lab_report");

// MedAssist Bot
const answer = await aiService.answerHealthQuery("What's good for joint pain in Ayurveda?");

// Drug Interactions
const interactions = await aiService.checkInteractions(["Ashwagandha", "Amlodipine", "Metformin"]);
```

**Where used**: HmsAiScribe, HmsDocumentParser, HmsMedAssist, HmsCdss, DoctorDrugAlert

---

## 7. Sentry (Error Tracking)
**Free tier**: 5000 errors/month
**Setup**:
1. Create account at https://sentry.io
2. Create React project
3. Get DSN URL
4. Add to .env

**Usage in code**:
```ts
// Initialize in main.tsx:
errorTracking.init();

// Report custom errors:
errorTracking.captureError(new Error("Payment failed"), { orderId: "xxx", amount: 500 });
errorTracking.setUser(userId, userEmail);
```

**Where used**: Automatically catches all unhandled errors across the app

---

## 8. Maps (Google Maps)
**Free tier**: $200/month credit (effectively free for normal usage)
**Setup**: No setup needed for basic embed URLs

**Usage in code**:
```ts
// Embed map
const mapUrl = maps.getEmbedUrl(9.1732, 77.3844); // Kadayanallur coords
// <iframe src={mapUrl} />

// Get directions for patient
const dirUrl = maps.getDirectionsUrl(9.1732, 77.3844, "Al Shifa AYUSH Hospital");

// Geofence check (for QR attendance)
const isInside = maps.isWithinGeofence(staffLat, staffLng, clinicLat, clinicLng, 100);
```

**Where used**: Clinic locator, Doctor profiles, QR Attendance geofence, Patient navigation

---

## .env Template

```env
# Analytics
VITE_GA4_ID=G-XXXXXXXXXX
VITE_POSTHOG_KEY=phc_XXXXXXXXXX

# Video
VITE_JITSI_DOMAIN=meet.jit.si

# Payments
VITE_RAZORPAY_KEY=rzp_test_XXXXXXXXXX

# Push Notifications (Firebase)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=ayuzee-app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_VAPID_KEY=

# WhatsApp
VITE_WHATSAPP_API_URL=https://api.gupshup.io/wa/api/v1
VITE_WHATSAPP_API_KEY=

# AI
VITE_OPENAI_API_KEY=sk-
GEMINI_API_KEY (server-side)=

# Error Tracking
VITE_SENTRY_DSN=

# Supabase (already configured)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Cost Summary (Monthly)

| Service | Free Tier | When You'll Need Paid |
|---|---|---|
| GA4 | Unlimited | Never |
| PostHog | 1M events | After 100K+ monthly users |
| Jitsi | Unlimited | Never (or self-host for branding) |
| Razorpay | No fee (2%/txn) | Never (transaction fee only) |
| Firebase Push | Unlimited | Never |
| WhatsApp (Gupshup) | 1000 convos | After ~300 daily appointments |
| OpenAI | $5 credit | After ~2000 AI scribe sessions |
| Gemini | 60 req/min | After heavy MedAssist usage |
| Sentry | 5000 errors | After significant traffic |
| Google Maps | $200 credit | Never for normal usage |

**Total cost at launch: ₹0/month** (all on free tiers)
**At scale (1000 appointments/day): ~₹5000-10000/month** (mainly WhatsApp + AI)
