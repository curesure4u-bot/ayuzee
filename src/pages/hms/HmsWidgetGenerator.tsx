import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Code, Copy, Globe, Smartphone, FlaskConical, CalendarClock,
  Users, MessageSquare, Stethoscope, FileText, BarChart3, Zap,
  Brain, Sparkles, Monitor, Activity, Heart, RefreshCw, Check,
  ExternalLink, Eye, Palette, Settings,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type WidgetConfig = {
  hospitalId: string;
  branchId: string;
  primaryColor: string;
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  language: string;
  theme: "light" | "dark" | "auto";
  lazyLoad: boolean;
  cacheEnabled: boolean;
  preconnect: boolean;
};

type WidgetDef = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: "core" | "clinical" | "engagement" | "performance" | "ai";
  badge?: string;
};

const WIDGETS: WidgetDef[] = [
  // Core
  { id: "web-widget", label: "Web Widget", description: "Embeddable booking & chat widget for your hospital website", icon: Globe, category: "core" },
  { id: "online-booking", label: "Online Appointment Booking", description: "Let patients book appointments directly from your website", icon: CalendarClock, category: "core" },
  { id: "doctor-list", label: "Doctor Directory", description: "Show available doctors with specialities and booking links", icon: Stethoscope, category: "core" },
  { id: "queue-display", label: "Queue Status Display", description: "Live queue status widget for waiting rooms or website", icon: Monitor, category: "core" },
  // Clinical
  { id: "teleconsultation", label: "Teleconsultation", description: "Video consultation widget with appointment integration", icon: Smartphone, category: "clinical" },
  { id: "lab-report", label: "Lab Report Viewer", description: "Patients can view/download lab reports from your website", icon: FlaskConical, category: "clinical" },
  { id: "prescription-viewer", label: "Prescription Viewer", description: "Digital prescription access for patients via website", icon: FileText, category: "clinical" },
  { id: "patient-portal", label: "Patient Portal", description: "Mini patient portal for health records, bills & history", icon: Users, category: "clinical" },
  // Engagement
  { id: "feedback-nps", label: "Feedback & NPS", description: "Collect patient satisfaction scores and reviews", icon: Heart, category: "engagement" },
  { id: "whatsapp-chat", label: "WhatsApp Chat Button", description: "One-click WhatsApp chat with front desk", icon: MessageSquare, category: "engagement" },
  { id: "health-tips", label: "Health Tips Feed", description: "Dynamic Ayurveda/wellness tips carousel for your website", icon: Sparkles, category: "engagement" },
  { id: "referral-program", label: "Referral Program", description: "Patient referral link generator widget", icon: Users, category: "engagement" },
  // Performance
  { id: "prefetch-optimizer", label: "Prefetch Optimizer", description: "AI-driven resource prefetching for faster page loads", icon: Zap, category: "performance", badge: "AI" },
  { id: "lazy-load-images", label: "Image Lazy Loader", description: "Intersection Observer based image lazy loading", icon: Eye, category: "performance" },
  { id: "cache-manager", label: "Service Worker Cache", description: "Offline-first caching for repeat visitors", icon: RefreshCw, category: "performance" },
  { id: "analytics-beacon", label: "Performance Analytics", description: "Core Web Vitals & real user metrics collector", icon: BarChart3, category: "performance" },
  { id: "cdn-optimizer", label: "CDN Asset Optimizer", description: "Auto-serve assets from nearest CDN edge node", icon: Globe, category: "performance" },
  // AI
  { id: "ai-symptom-checker", label: "AI Symptom Checker", description: "Conversational AI for preliminary symptom triage", icon: Brain, category: "ai", badge: "AI" },
  { id: "ai-chatbot", label: "AI Assistant Chatbot", description: "24/7 AI-powered chat for FAQs, booking & navigation", icon: Brain, category: "ai", badge: "AI" },
  { id: "ai-diet-advisor", label: "AI Diet Advisor", description: "Prakriti-based personalized diet recommendation widget", icon: Sparkles, category: "ai", badge: "AI" },
  { id: "smart-form-filler", label: "AI Smart Form", description: "AI auto-fills patient registration from voice/photo", icon: Brain, category: "ai", badge: "AI" },
];

const CATEGORIES = [
  { id: "all", label: "All Widgets" },
  { id: "core", label: "Core" },
  { id: "clinical", label: "Clinical" },
  { id: "engagement", label: "Engagement" },
  { id: "performance", label: "Performance" },
  { id: "ai", label: "AI-Powered" },
];

// ─── Code Generation (AI-enhanced) ───────────────────────────────────────────

function generateWidgetCode(widgetId: string, config: WidgetConfig): string {
  const baseUrl = "https://widgets.ayuzee.com";
  const { hospitalId, branchId, primaryColor, position, language, theme, lazyLoad, cacheEnabled, preconnect } = config;

  const preconnectTag = preconnect
    ? `\n  <link rel="preconnect" href="${baseUrl}" crossorigin>`
    : "";
  const deferAttr = lazyLoad ? ' defer loading="lazy"' : "";

  switch (widgetId) {
    case "web-widget":
      return `<!-- Ayuzee Web Widget -->
<script type="text/javascript"${deferAttr}>
  (function() {
    var iframe = document.createElement("iframe");
    iframe.src = "${baseUrl}/embed/${hospitalId}/${branchId}?theme=${theme}&lang=${language}";
    iframe.style.position = "fixed";
    iframe.style.${position.includes("bottom") ? "bottom" : "top"} = "20px";
    iframe.style.${position.includes("right") ? "right" : "left"} = "20px";
    iframe.style.width = "380px";
    iframe.style.height = "520px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "16px";
    iframe.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
    iframe.style.zIndex = "99999";
    iframe.style.display = "none";
    iframe.id = "ayuzee-widget-frame";
    document.body.appendChild(iframe);

    var btn = document.createElement("div");
    btn.innerHTML = '<svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
    btn.style.cssText = "position:fixed;${position.includes("bottom") ? "bottom" : "top"}:20px;${position.includes("right") ? "right" : "left"}:20px;width:56px;height:56px;border-radius:50%;background:${primaryColor};display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:100000;";
    btn.onclick = function() {
      var f = document.getElementById("ayuzee-widget-frame");
      f.style.display = f.style.display === "none" ? "block" : "none";
    };
    document.body.appendChild(btn);
  })();
</script>`;

    case "online-booking":
      return `<!-- Ayuzee Online Booking Widget -->
<div id="ayuzee-booking-widget"></div>
<script src="${baseUrl}/sdk/booking.min.js"${deferAttr}></script>
<script>
  window.addEventListener("load", function() {
    AyuzeeBooking.init({
      container: "#ayuzee-booking-widget",
      hospitalId: "${hospitalId}",
      branchId: "${branchId}",
      theme: "${theme}",
      primaryColor: "${primaryColor}",
      language: "${language}",
      features: {
        doctorFilter: true,
        departmentFilter: true,
        timeSlotView: "calendar",
        instantConfirmation: true,
        paymentIntegration: true,
        smsReminder: true,
        whatsappReminder: true
      },
      performance: {
        lazyLoad: ${lazyLoad},
        cacheSlots: ${cacheEnabled},
        prefetchDoctors: true
      }
    });
  });
</script>`;

    case "teleconsultation":
      return `<!-- Ayuzee Teleconsultation Widget -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">${preconnectTag}
  <script src="${baseUrl}/sdk/teleconsult.min.js"${deferAttr}></script>
</head>
<body>
  <div id="ayuzee-teleconsult"></div>
  <script>
    AyuzeeTeleconsult.init({
      container: "#ayuzee-teleconsult",
      hospitalId: "${hospitalId}",
      branchId: "${branchId}",
      features: {
        videoCall: true,
        audioCall: true,
        chatMessaging: true,
        screenShare: true,
        prescriptionDuring: true,
        recordingConsent: true,
        waitingRoom: true,
        aiTranscription: true
      },
      ui: { theme: "${theme}", primaryColor: "${primaryColor}" }
    });
  </script>
</body>
</html>`;

    case "lab-report":
      return `<!-- Ayuzee Lab Report Widget -->
<div id="ayuzee-lab-reports"></div>
<script src="${baseUrl}/sdk/lab-reports.min.js"${deferAttr}></script>
<script>
  window.addEventListener("load", function() {
    AyuzeeLab("#ayuzee-lab-reports").initWidget({
      hospitalId: "${hospitalId}",
      branchId: "${branchId}",
      allowDownload: true,
      allowShare: true,
      showTrends: true,
      aiInterpretation: true,
      theme: "${theme}",
      language: "${language}"
    });
  });
</script>`;

    case "doctor-list":
      return `<!-- Ayuzee Doctor Directory Widget -->
<div id="ayuzee-doctors"></div>
<script src="${baseUrl}/sdk/doctors.min.js"${deferAttr}></script>
<script>
  AyuzeeDoctors.render({
    container: "#ayuzee-doctors",
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    layout: "grid",
    showAvailability: true,
    showRating: true,
    bookingEnabled: true,
    filters: ["department", "speciality", "language", "gender"],
    theme: "${theme}",
    primaryColor: "${primaryColor}"
  });
</script>`;

    case "queue-display":
      return `<!-- Ayuzee Queue Display Widget -->
<div id="ayuzee-queue" style="width:100%;min-height:400px;"></div>
<script src="${baseUrl}/sdk/queue-display.min.js"${deferAttr}></script>
<script>
  AyuzeeQueue.init({
    container: "#ayuzee-queue",
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    refreshInterval: 5000,
    showEstimatedWait: true,
    showDoctorStatus: true,
    announceVoice: true,
    layout: "tv-landscape",
    theme: "${theme}"
  });
</script>`;

    case "prescription-viewer":
      return `<!-- Ayuzee Prescription Viewer Widget -->
<div id="ayuzee-rx"></div>
<script src="${baseUrl}/sdk/prescription.min.js"${deferAttr}></script>
<script>
  AyuzeeRx.init({
    container: "#ayuzee-rx",
    hospitalId: "${hospitalId}",
    authMode: "otp",
    features: {
      download: true,
      share: true,
      refillRequest: true,
      drugInfo: true,
      interactionCheck: true,
      ayushAlternatives: true
    },
    theme: "${theme}",
    language: "${language}"
  });
</script>`;

    case "patient-portal":
      return `<!-- Ayuzee Patient Portal Widget -->
<div id="ayuzee-portal" style="min-height:600px;"></div>
<script src="${baseUrl}/sdk/patient-portal.min.js"${deferAttr}></script>
<script>
  AyuzeePortal.init({
    container: "#ayuzee-portal",
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    modules: [
      "appointments", "prescriptions", "lab-reports",
      "bills", "health-records", "vitals-tracker",
      "diet-plan", "medication-reminders"
    ],
    auth: { method: "otp", phonePrefix: "+91" },
    theme: "${theme}",
    primaryColor: "${primaryColor}"
  });
</script>`;

    case "feedback-nps":
      return `<!-- Ayuzee Feedback & NPS Widget -->
<div id="ayuzee-feedback"></div>
<script src="${baseUrl}/sdk/feedback.min.js"${deferAttr}></script>
<script>
  AyuzeeFeedback.init({
    container: "#ayuzee-feedback",
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    type: "nps",
    triggerAfter: "checkout",
    showOnPages: ["billing", "discharge"],
    collectFields: ["rating", "comment", "department", "doctor"],
    googleReviewLink: true,
    aiSentimentAnalysis: true,
    theme: "${theme}"
  });
</script>`;

    case "whatsapp-chat":
      return `<!-- Ayuzee WhatsApp Chat Button -->
<script>
  (function() {
    var btn = document.createElement("a");
    btn.href = "https://wa.me/${hospitalId}?text=Hi, I need help with...";
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.innerHTML = '<svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>';
    btn.style.cssText = "position:fixed;${position.includes("bottom") ? "bottom" : "top"}:90px;${position.includes("right") ? "right" : "left"}:20px;width:56px;height:56px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.2);z-index:99998;text-decoration:none;";
    document.body.appendChild(btn);
  })();
</script>`;

    case "health-tips":
      return `<!-- Ayuzee Health Tips Feed Widget -->
<div id="ayuzee-health-tips"></div>
<script src="${baseUrl}/sdk/health-tips.min.js"${deferAttr}></script>
<script>
  AyuzeeHealthTips.init({
    container: "#ayuzee-health-tips",
    hospitalId: "${hospitalId}",
    categories: ["ayurveda", "yoga", "nutrition", "seasonal", "prakriti-based"],
    layout: "carousel",
    autoRotate: true,
    rotateInterval: 8000,
    aiPersonalized: true,
    theme: "${theme}",
    primaryColor: "${primaryColor}"
  });
</script>`;

    case "referral-program":
      return `<!-- Ayuzee Referral Program Widget -->
<div id="ayuzee-referral"></div>
<script src="${baseUrl}/sdk/referral.min.js"${deferAttr}></script>
<script>
  AyuzeeReferral.init({
    container: "#ayuzee-referral",
    hospitalId: "${hospitalId}",
    rewards: { referrer: "10% discount", referee: "Free consultation" },
    channels: ["whatsapp", "sms", "email", "link"],
    trackConversion: true,
    theme: "${theme}"
  });
</script>`;

    case "prefetch-optimizer":
      return `<!-- Ayuzee AI Prefetch Optimizer -->
<script>
  (function() {
    // AI-driven predictive prefetching based on user navigation patterns
    var AyuzeePrefetch = {
      observed: [],
      init: function() {
        if (!("IntersectionObserver" in window)) return;
        this.prefetchCriticalAssets();
        this.observeLinks();
        this.predictiveLoad();
      },
      prefetchCriticalAssets: function() {
        var critical = [
          "${baseUrl}/api/${hospitalId}/doctors",
          "${baseUrl}/api/${hospitalId}/slots/today",
          "${baseUrl}/api/${hospitalId}/departments"
        ];
        critical.forEach(function(url) {
          var link = document.createElement("link");
          link.rel = "prefetch";
          link.href = url;
          link.as = "fetch";
          link.crossOrigin = "anonymous";
          document.head.appendChild(link);
        });
      },
      observeLinks: function() {
        var observer = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var href = entry.target.getAttribute("href");
              if (href && !AyuzeePrefetch.observed.includes(href)) {
                AyuzeePrefetch.observed.push(href);
                var link = document.createElement("link");
                link.rel = "prefetch";
                link.href = href;
                document.head.appendChild(link);
              }
            }
          });
        }, { rootMargin: "200px" });
        document.querySelectorAll("a[href]").forEach(function(a) { observer.observe(a); });
      },
      predictiveLoad: function() {
        // ML-based prediction using navigation history
        var history = JSON.parse(sessionStorage.getItem("ayuzee_nav") || "[]");
        var predictions = this.analyzePaths(history);
        predictions.slice(0, 3).forEach(function(path) {
          var link = document.createElement("link");
          link.rel = "prerender";
          link.href = path;
          document.head.appendChild(link);
        });
      },
      analyzePaths: function(history) {
        // Simple Markov chain prediction
        var transitions = {};
        for (var i = 0; i < history.length - 1; i++) {
          if (!transitions[history[i]]) transitions[history[i]] = {};
          transitions[history[i]][history[i + 1]] = (transitions[history[i]][history[i + 1]] || 0) + 1;
        }
        var current = window.location.pathname;
        if (!transitions[current]) return [];
        return Object.keys(transitions[current]).sort(function(a, b) {
          return transitions[current][b] - transitions[current][a];
        });
      }
    };
    AyuzeePrefetch.init();
  })();
</script>`;

    case "lazy-load-images":
      return `<!-- Ayuzee Image Lazy Loader with Blur-up -->
<script>
  (function() {
    if (!("IntersectionObserver" in window)) return;

    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          // Swap data-src to src
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute("data-srcset");
          }
          img.classList.add("ayuzee-loaded");
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: "100px 0px",
      threshold: 0.01
    });

    // Observe all lazy images
    document.querySelectorAll("img[data-src]").forEach(function(img) {
      imageObserver.observe(img);
    });

    // MutationObserver for dynamically added images
    new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.tagName === "IMG" && node.dataset.src) imageObserver.observe(node);
            node.querySelectorAll && node.querySelectorAll("img[data-src]").forEach(function(img) {
              imageObserver.observe(img);
            });
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  })();
</script>
<style>
  img[data-src] { filter: blur(5px); transition: filter 0.3s ease; }
  img.ayuzee-loaded { filter: none; }
</style>`;

    case "cache-manager":
      return `<!-- Ayuzee Service Worker Cache Manager -->
<script>
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/ayuzee-sw.js").then(function(reg) {
      console.log("[Ayuzee] Service Worker registered:", reg.scope);
    });
  }
</script>

<!-- Save as /ayuzee-sw.js -->
<script>
// ayuzee-sw.js - Service Worker for offline-first HMS caching
var CACHE_NAME = "ayuzee-hms-v1";
var CRITICAL_ASSETS = [
  "/",
  "/hms",
  "/hms/opd",
  "${baseUrl}/sdk/booking.min.js",
  "${baseUrl}/sdk/queue-display.min.js"
];

self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CRITICAL_ASSETS);
    })
  );
});

self.addEventListener("fetch", function(e) {
  // Stale-while-revalidate for API calls
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          var fetched = fetch(e.request).then(function(response) {
            cache.put(e.request, response.clone());
            return response;
          });
          return cached || fetched;
        });
      })
    );
  } else {
    // Cache-first for static assets
    e.respondWith(
      caches.match(e.request).then(function(r) { return r || fetch(e.request); })
    );
  }
});
</script>`;

    case "analytics-beacon":
      return `<!-- Ayuzee Performance Analytics Beacon -->
<script>
  (function() {
    var AyuzeePerf = {
      hospitalId: "${hospitalId}",
      endpoint: "${baseUrl}/analytics/perf",
      init: function() {
        this.collectWebVitals();
        this.collectResourceTiming();
        this.trackUserFlow();
      },
      collectWebVitals: function() {
        var metrics = {};
        // LCP (Largest Contentful Paint)
        new PerformanceObserver(function(list) {
          var entries = list.getEntries();
          metrics.lcp = entries[entries.length - 1].startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });

        // FID (First Input Delay)
        new PerformanceObserver(function(list) {
          metrics.fid = list.getEntries()[0].processingStart - list.getEntries()[0].startTime;
        }).observe({ type: "first-input", buffered: true });

        // CLS (Cumulative Layout Shift)
        var cls = 0;
        new PerformanceObserver(function(list) {
          list.getEntries().forEach(function(entry) {
            if (!entry.hadRecentInput) cls += entry.value;
          });
          metrics.cls = cls;
        }).observe({ type: "layout-shift", buffered: true });

        // Send on page unload
        window.addEventListener("visibilitychange", function() {
          if (document.visibilityState === "hidden") {
            navigator.sendBeacon(AyuzeePerf.endpoint, JSON.stringify({
              hospitalId: AyuzeePerf.hospitalId,
              url: location.href,
              metrics: metrics,
              timestamp: Date.now()
            }));
          }
        });
      },
      collectResourceTiming: function() {
        window.addEventListener("load", function() {
          var resources = performance.getEntriesByType("resource");
          var slow = resources.filter(function(r) { return r.duration > 1000; });
          if (slow.length > 0) {
            navigator.sendBeacon(AyuzeePerf.endpoint + "/slow", JSON.stringify({
              hospitalId: AyuzeePerf.hospitalId,
              slowResources: slow.map(function(r) {
                return { name: r.name, duration: r.duration, type: r.initiatorType };
              })
            }));
          }
        });
      },
      trackUserFlow: function() {
        var nav = JSON.parse(sessionStorage.getItem("ayuzee_nav") || "[]");
        nav.push(location.pathname);
        sessionStorage.setItem("ayuzee_nav", JSON.stringify(nav.slice(-20)));
      }
    };
    AyuzeePerf.init();
  })();
</script>`;

    case "cdn-optimizer":
      return `<!-- Ayuzee CDN Asset Optimizer -->
<script>
  (function() {
    var CDN_NODES = {
      "ap-south-1": "https://cdn-in.ayuzee.com",
      "ap-southeast-1": "https://cdn-sg.ayuzee.com",
      "us-east-1": "https://cdn-us.ayuzee.com",
      "eu-west-1": "https://cdn-eu.ayuzee.com"
    };

    function detectNearestCDN() {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Asia/Kolkata") || tz.includes("Asia/Colombo")) return CDN_NODES["ap-south-1"];
      if (tz.includes("Asia/")) return CDN_NODES["ap-southeast-1"];
      if (tz.includes("America/")) return CDN_NODES["us-east-1"];
      return CDN_NODES["eu-west-1"];
    }

    var cdn = detectNearestCDN();
    window.AYUZEE_CDN = cdn;

    // Preconnect to nearest CDN
    var link = document.createElement("link");
    link.rel = "preconnect";
    link.href = cdn;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);

    // DNS prefetch
    var dns = document.createElement("link");
    dns.rel = "dns-prefetch";
    dns.href = cdn;
    document.head.appendChild(dns);

    // Rewrite asset URLs
    document.querySelectorAll("[data-cdn-src]").forEach(function(el) {
      el.src = cdn + el.dataset.cdnSrc;
    });

    console.log("[Ayuzee CDN] Nearest node:", cdn);
  })();
</script>`;

    case "ai-symptom-checker":
      return `<!-- Ayuzee AI Symptom Checker Widget -->
<div id="ayuzee-symptom-checker"></div>
<script src="${baseUrl}/sdk/ai-symptom.min.js"${deferAttr}></script>
<script>
  AyuzeeSymptomChecker.init({
    container: "#ayuzee-symptom-checker",
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    mode: "conversational",
    systems: ["ayurveda", "allopathy", "siddha", "homeopathy"],
    features: {
      voiceInput: true,
      imageUpload: true,
      prakritiAware: true,
      triageLevel: true,
      doctorSuggestion: true,
      bookAppointment: true,
      emergencyAlert: true
    },
    ai: {
      model: "ayuzee-clinical-v2",
      confidenceThreshold: 0.7,
      maxQuestions: 10
    },
    disclaimer: "This is an AI-assisted preliminary assessment. Always consult a qualified doctor for diagnosis.",
    theme: "${theme}",
    primaryColor: "${primaryColor}"
  });
</script>`;

    case "ai-chatbot":
      return `<!-- Ayuzee AI Assistant Chatbot -->
<script src="${baseUrl}/sdk/ai-chat.min.js"${deferAttr}></script>
<script>
  AyuzeeAIChat.init({
    hospitalId: "${hospitalId}",
    branchId: "${branchId}",
    position: "${position}",
    greeting: "Namaste! How can I help you today?",
    capabilities: [
      "appointment_booking",
      "doctor_info",
      "department_inquiry",
      "bill_inquiry",
      "lab_report_status",
      "pharmacy_availability",
      "visiting_hours",
      "directions",
      "insurance_info",
      "emergency_guidance"
    ],
    ai: {
      model: "ayuzee-assistant-v3",
      language: "${language}",
      contextAware: true,
      handoffToHuman: true,
      sentimentDetection: true
    },
    ui: {
      theme: "${theme}",
      primaryColor: "${primaryColor}",
      avatar: "${baseUrl}/assets/ai-avatar.png",
      bubbleIcon: "chat"
    }
  });
</script>`;

    case "ai-diet-advisor":
      return `<!-- Ayuzee AI Diet Advisor Widget -->
<div id="ayuzee-diet"></div>
<script src="${baseUrl}/sdk/ai-diet.min.js"${deferAttr}></script>
<script>
  AyuzeeDietAdvisor.init({
    container: "#ayuzee-diet",
    hospitalId: "${hospitalId}",
    features: {
      prakritiBasedDiet: true,
      seasonalRecommendations: true,
      doshaBalance: true,
      mealPlanner: true,
      groceryList: true,
      recipeDatabase: true,
      foodIncompatibility: true,
      calorieTracker: true
    },
    ai: {
      model: "ayuzee-nutrition-v2",
      personalized: true,
      medicalHistoryAware: true
    },
    theme: "${theme}",
    language: "${language}"
  });
</script>`;

    case "smart-form-filler":
      return `<!-- Ayuzee AI Smart Form Filler -->
<div id="ayuzee-smart-form"></div>
<script src="${baseUrl}/sdk/smart-form.min.js"${deferAttr}></script>
<script>
  AyuzeeSmartForm.init({
    container: "#ayuzee-smart-form",
    hospitalId: "${hospitalId}",
    formType: "patient-registration",
    ai: {
      voiceToForm: true,
      idCardScan: true,
      insuranceCardScan: true,
      autoSuggest: true,
      duplicateDetection: true,
      addressAutocomplete: true
    },
    fields: [
      "name", "age", "gender", "phone", "email",
      "address", "blood_group", "emergency_contact",
      "insurance", "allergies", "medical_history"
    ],
    validation: {
      aadhaarVerify: true,
      phoneOtp: true,
      duplicateCheck: true
    },
    theme: "${theme}"
  });
</script>`;

    default:
      return `<!-- Widget: ${widgetId} -->\n<!-- Configuration not available -->`;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

const HmsWidgetGenerator = () => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [config, setConfig] = useState<WidgetConfig>({
    hospitalId: "ALSHIFA-HMS",
    branchId: "kadayanallur-01",
    primaryColor: "#f97316",
    position: "bottom-right",
    language: "en",
    theme: "light",
    lazyLoad: true,
    cacheEnabled: true,
    preconnect: true,
  });

  const filteredWidgets = WIDGETS.filter(
    (w) => categoryFilter === "all" || w.category === categoryFilter
  );

  const selectedWidgetDef = WIDGETS.find((w) => w.id === selectedWidget);
  const generatedCode = selectedWidget ? generateWidgetCode(selectedWidget, config) : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiOptimize = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      toast.success("AI optimized the widget code for better performance!");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-orange-500" /> Widget Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate AI-powered embeddable widgets for your hospital website and patient apps
          </p>
        </div>
        <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200">
          <Sparkles className="h-3 w-3" /> AI-Enhanced
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Widget Selection */}
        <div className="lg:col-span-1 space-y-4">
          {/* Category Filter */}
          <Card>
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={categoryFilter === cat.id ? "default" : "outline"}
                    size="sm"
                    className={`text-xs h-7 ${categoryFilter === cat.id ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                    onClick={() => setCategoryFilter(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Widget List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredWidgets.map((widget) => {
              const Icon = widget.icon;
              const isSelected = selectedWidget === widget.id;
              return (
                <Card
                  key={widget.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-orange-500 bg-orange-50/50" : ""}`}
                  onClick={() => setSelectedWidget(widget.id)}
                >
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-orange-500 text-white" : "bg-muted"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm truncate">{widget.label}</p>
                        {widget.badge && (
                          <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">{widget.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{widget.description}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-orange-500 shrink-0 mt-1" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Code Output & Config */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedWidget ? (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center p-8">
                <Code className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select a Widget</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Choose a widget from the left panel to generate embeddable code.
                  AI will optimize it for performance and compatibility.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Widget Configuration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" /> Widget Configuration
                    <Badge variant="outline" className="ml-auto text-xs">
                      {selectedWidgetDef?.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="general">
                    <TabsList className="mb-3">
                      <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
                      <TabsTrigger value="appearance" className="text-xs">Appearance</TabsTrigger>
                      <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Hospital ID</Label>
                          <Input className="h-8 text-xs" value={config.hospitalId} onChange={(e) => setConfig({ ...config, hospitalId: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-xs">Branch ID</Label>
                          <Input className="h-8 text-xs" value={config.branchId} onChange={(e) => setConfig({ ...config, branchId: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-xs">Language</Label>
                          <Select value={config.language} onValueChange={(v) => setConfig({ ...config, language: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="hi">Hindi</SelectItem>
                              <SelectItem value="ta">Tamil</SelectItem>
                              <SelectItem value="te">Telugu</SelectItem>
                              <SelectItem value="kn">Kannada</SelectItem>
                              <SelectItem value="ml">Malayalam</SelectItem>
                              <SelectItem value="mr">Marathi</SelectItem>
                              <SelectItem value="bn">Bengali</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Position</Label>
                          <Select value={config.position} onValueChange={(v: WidgetConfig["position"]) => setConfig({ ...config, position: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="top-left">Top Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Primary Color</Label>
                          <div className="flex gap-2">
                            <Input type="color" className="h-8 w-12 p-1" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} />
                            <Input className="h-8 text-xs flex-1" value={config.primaryColor} onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Theme</Label>
                          <Select value={config.theme} onValueChange={(v: WidgetConfig["theme"]) => setConfig({ ...config, theme: v })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="auto">Auto (System)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-3">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-xs font-medium">Lazy Load</p>
                            <p className="text-[10px] text-muted-foreground">Defer loading until needed</p>
                          </div>
                          <Switch checked={config.lazyLoad} onCheckedChange={(c) => setConfig({ ...config, lazyLoad: c })} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-xs font-medium">Enable Cache</p>
                            <p className="text-[10px] text-muted-foreground">Cache API responses locally</p>
                          </div>
                          <Switch checked={config.cacheEnabled} onCheckedChange={(c) => setConfig({ ...config, cacheEnabled: c })} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="text-xs font-medium">Preconnect</p>
                            <p className="text-[10px] text-muted-foreground">DNS prefetch for faster initial load</p>
                          </div>
                          <Switch checked={config.preconnect} onCheckedChange={(c) => setConfig({ ...config, preconnect: c })} />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Generated Code Output */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="h-4 w-4" /> Generated Code
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={handleAiOptimize}
                        disabled={aiGenerating}
                      >
                        {aiGenerating ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Brain className="h-3 w-3" />
                        )}
                        AI Optimize
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1"
                        onClick={handleCopy}
                      >
                        {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Copy and paste this code wherever needed on your website
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={generatedCode}
                      className="font-mono text-xs min-h-[350px] bg-slate-950 text-green-400 border-slate-700 resize-y"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Tips */}
              <Card className="border-orange-200 bg-orange-50/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Performance Tips</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                        <li>Place widget scripts before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag</li>
                        <li>Enable lazy loading to reduce initial page load time by ~40%</li>
                        <li>Use the Service Worker Cache widget for offline-first experience</li>
                        <li>Combine with CDN Optimizer for fastest asset delivery</li>
                        <li>Analytics Beacon monitors Core Web Vitals automatically</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HmsWidgetGenerator;
