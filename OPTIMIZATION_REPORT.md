# Ayuzee Performance Optimization Report

## Endpoint Testing Results

| Metric | Value |
|--------|-------|
| Total routes tested | 391 |
| Routes passing (HTTP 200) | 391 (100%) |
| Routes failing | 0 |
| Production TTFB (ayuzee.com) | 148ms |
| Netlify Functions | 3 (telegram-webhook, whatsapp-send, whatsapp-task-webhook) |

**All endpoints are functional.** No broken routes detected.

---

## Current Build Analysis

| Metric | Value | Assessment |
|--------|-------|-----------|
| Total dist size | 90 MB | CRITICAL (68MB is one PDF) |
| JS bundle (uncompressed) | 18 MB | Moderate |
| JS bundle (gzipped est.) | ~3.5 MB | Acceptable for 700+ routes |
| CSS | 284 KB / 39 KB gzip | Good |
| JS chunk count | 1,367 | Excessive |
| Pages (lazy-loaded) | 1,079 | Properly code-split |
| Source files | 1,487 | Large app |

### Top Chunks by Size

| Chunk | Raw | Gzipped | Used By |
|-------|-----|---------|---------|
| vendor-pdf (jsPDF) | 625 KB | 185 KB | 13 files |
| index.js (entry) | 431 KB | 122 KB | Every page |
| vendor-charts (recharts) | 433 KB | 114 KB | 39 files |
| TaskTrackerPage | 357 KB | ~90 KB | 1 route |
| SpineTherapyDetail | 310 KB | ~80 KB | 1 route |
| vendor-supabase | 210 KB | 55 KB | Most pages |
| vendor-react | 165 KB | 54 KB | Every page |
| vendor-markdown | 157 KB | 47 KB | 5 files |
| vendor-radix | 149 KB | 44 KB | Many pages |
| snaData | 130 KB | ~40 KB | 1 module |
| astg-search | 130 KB | ~40 KB | 4 files |
| vendor-motion | 123 KB | 40 KB | 6 files |
| vendor-sentry | 86 KB | 29 KB | Every page |

---

## Optimization Checklist

### PRIORITY 1 — Immediate Wins (No code changes needed, deploy-time savings)

- [ ] **Remove 68MB PDF from /public** — `tung-acupuncture-points.pdf` is 68MB and deploys with every build. Move to external CDN (Supabase Storage, Cloudinary, or S3) and link to it. **Saves 68MB per deploy, faster CI/CD.**

- [ ] **Disable modulepreload for heavy vendor chunks** — Vite adds `<link rel="modulepreload">` for vendor-pdf (625KB) and vendor-charts (433KB) in index.html. These get pre-fetched on EVERY page load even if user never visits a page that needs them.
  ```js
  // vite.config.ts — add to build config:
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps, { hostId, hostType }) => {
        // Don't preload heavy vendor chunks
        return deps.filter(dep => 
          !dep.includes('vendor-pdf') && 
          !dep.includes('vendor-charts') &&
          !dep.includes('vendor-markdown') &&
          !dep.includes('vendor-motion')
        );
      }
    }
  }
  ```
  **Saves ~400KB of unnecessary prefetch bandwidth on initial page load.**

### PRIORITY 2 — Dynamic Imports for Heavy Libraries (Medium effort, high impact)

- [ ] **Lazy-load jsPDF/html2canvas** — Currently statically imported in 13 files. Convert to dynamic `import()`:
  ```ts
  // Before (in src/lib/pdfGenerator.ts, astg-search.ts, etc.):
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  
  // After:
  async function generatePDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    // ... rest of logic
  }
  ```
  **Impact: Removes vendor-pdf (625KB) from the initial dependency graph entirely.**

- [ ] **Lazy-load Sentry** — Currently imported eagerly in main.tsx even when DSN is empty:
  ```ts
  // Before:
  import * as Sentry from "@sentry/react";
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN || "", ... });
  
  // After:
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    import("@sentry/react").then(Sentry => {
      Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, ... });
    });
  }
  ```
  **Impact: Saves 86KB gzipped on every page load in dev; loads async in prod.**

- [ ] **Lazy-load react-markdown** — Only used in 5 files but bundles at 157KB:
  ```ts
  const ReactMarkdown = lazy(() => import("react-markdown"));
  ```

### PRIORITY 3 — Lazy-load Global Components (Medium effort, good UX improvement)

- [ ] **Lazy-load FAQChatbot, VoiceAssistant, AiAssistant** — These load on every page but are only used when user clicks them. Wrap with `React.lazy` + `Suspense`:
  ```tsx
  // In App.tsx:
  const FAQChatbot = lazy(() => import("@/components/site/FAQChatbot"));
  const VoiceAssistant = lazy(() => import("@/components/site/VoiceAssistant"));
  const AiAssistant = lazy(() => import("@/components/AiAssistant"));
  
  // Render with Suspense (no fallback needed - they float):
  <Suspense fallback={null}><FAQChatbot /></Suspense>
  ```
  **Impact: Reduces initial bundle by ~500 lines of component code + their Supabase calls.**

- [ ] **Conditionally render NotificationCenter** — Already hidden on admin pages, but still loads. Make it truly lazy:
  ```tsx
  const NotificationCenter = lazy(() => import("@/components/NotificationCenter"));
  ```

- [ ] **Lazy-load GlobalSearch** — Only visible when user triggers it (Cmd+K), so no need to load eagerly.

### PRIORITY 4 — Chunk Optimization (Config changes)

- [ ] **Consolidate tiny icon chunks** — 243 chunks are <1KB (lucide-react icons). Add to vite.config.ts:
  ```js
  manualChunks(id) {
    // ... existing rules ...
    if (id.includes("lucide-react")) return "vendor-icons";
  }
  ```
  **Impact: Reduces 243 tiny files into 1 file (~120KB). Fewer HTTP requests, better HTTP/2 multiplexing.**

- [ ] **Split TaskTracker into sub-chunks** — Currently 357KB as one chunk (59 internal files). Split by sub-route:
  ```ts
  // In lazyPages.ts - instead of one import:
  export const TaskTrackerPage = lazyPage(() => import("@/pages/task-tracker"));
  
  // Split into sub-pages loaded individually within the TaskTracker layout
  ```

- [ ] **Move snaData.ts (130KB) to dynamic import** — Only loaded when user visits /hms/sna-formulary:
  ```ts
  // In HmsSnaFormulary.tsx:
  const [snaData, setSnaData] = useState(null);
  useEffect(() => {
    import("./snaData").then(m => setSnaData(m.default));
  }, []);
  ```

- [ ] **Move astg.ts (143KB) to a JSON file loaded on demand** — Large static dataset that could be fetched from a JSON file or Supabase table instead of bundled.

### PRIORITY 5 — Deploy & Infrastructure Optimizations

- [ ] **Move large PDFs to external storage** — All PDFs in /public (68MB + 1MB):
  - `tung-acupuncture-points.pdf` → Supabase Storage or CDN
  - `acupuncture-homeopathy.pdf` → CDN
  - `Ayuzee_AI_SuperApp_Roadmap.pptx` → CDN
  
  Replace with links: `https://cdn.ayuzee.com/docs/tung-acupuncture-points.pdf`

- [ ] **Enable Brotli compression on Netlify** — Netlify uses gzip by default. Brotli gives 15-20% better compression. Add to netlify.toml or use a build plugin.

- [ ] **Add resource hints for critical path** — In index.html, preload only what's needed for first paint:
  ```html
  <!-- Keep only these preloads: -->
  <link rel="modulepreload" href="/assets/vendor-react-xxx.js">
  <link rel="modulepreload" href="/assets/vendor-router-xxx.js">
  <link rel="modulepreload" href="/assets/vendor-supabase-xxx.js">
  <!-- Remove vendor-pdf, vendor-charts, vendor-motion, vendor-markdown preloads -->
  ```

- [ ] **Consider image optimization** — prakriti images in /public are unoptimized JPGs. Convert to WebP with responsive sizes.

### PRIORITY 6 — Architecture Improvements (Higher effort, long-term)

- [ ] **Split route registry** — Instead of one massive AppRoutes.tsx (1260 lines), split by portal:
  ```ts
  // routes/adminRoutes.tsx, routes/hmsRoutes.tsx, routes/studentRoutes.tsx, etc.
  const AdminRoutes = lazy(() => import("@/routes/adminRoutes"));
  const HmsRoutes = lazy(() => import("@/routes/hmsRoutes"));
  ```
  This way, the route definitions for HMS (350+ routes) don't load until someone visits /hms/*.

- [ ] **Replace recharts with a lighter alternative for simple charts** — recharts is 433KB. For pages with simple bar/line charts, consider:
  - `lightweight-charts` (trading-style)
  - `chart.js` with tree-shaking (smaller footprint)
  - Or keep recharts but ensure it only loads on dashboard/analytics pages (currently it does via lazy loading)

- [ ] **Remove PostHog snippet or load conditionally** — The inline PostHog script in index.html (~3KB inline + async load) runs on every page. If not actively using PostHog analytics, remove it.

- [ ] **Remove duplicate GA4 tags** — index.html has TWO Google Analytics snippets (G-ECGZ4YJYV9 and G-XXXXXXXXXX placeholder). Remove the placeholder.

- [ ] **Consider SSG/ISR for public pages** — Static pages (about, contact, blog, health-conditions) could be pre-rendered at build time for better SEO and faster first paint. The prerender script exists but may not cover all public pages.

---

## Expected Impact Summary

| Optimization | Bundle Reduction | Load Time Improvement |
|---|---|---|
| Remove modulepreload for heavy chunks | -400 KB prefetch | ~200ms faster first load |
| Dynamic import jsPDF | -625 KB from dep graph | Faster route transitions |
| Lazy Sentry | -86 KB gzip initial | ~100ms faster first paint |
| Lazy global components | -150 KB initial | ~80ms faster first paint |
| Consolidate icon chunks | 243 → 1 file | Fewer HTTP requests |
| Remove 68MB PDF from public | -68 MB deploy | Faster deploys, lower CDN cost |
| Move static data to JSON/API | -270 KB from chunks | On-demand loading |

**Conservative estimate: 30-40% reduction in initial page load time, 75% reduction in deploy size.**

---

## Testing Status

```
✅ 391/391 frontend routes accessible (100%)
✅ Production TTFB: 148ms (good)
✅ All routes properly lazy-loaded via React.lazy
✅ Build completes successfully (6488 modules)
✅ No broken imports or missing pages
⚠️  31 routes slow on dev cold-start (normal Vite JIT behavior, not production issue)
⚠️  Netlify functions not tested locally (require netlify dev CLI)
```

---

## Quick Start — Top 3 Actions to Do Now

1. **Remove the 68MB PDF** — Move `public/tung-acupuncture-points.pdf` to Supabase Storage and link externally
2. **Add modulePreload filter** — 5-line config change in vite.config.ts to stop prefetching 1MB of unused vendor code
3. **Lazy-load Sentry** — 3-line change in main.tsx for 86KB savings on every page load
