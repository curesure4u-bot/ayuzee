/**
 * Shared public SEO routes for sitemap generation and post-build prerendering.
 */
import { loadEnvFile } from "./load-env.mjs";

loadEnvFile();

export const SITE_URL = "https://ayuzee.com";

/** Paths excluded from sitemap (noindex / placeholder / private). */
export const NOINDEX_PATHS = new Set([
  "/diagnosis/symptoms",
  "/auth",
  "/login",
  "/cart",
  "/checkout",
]);

/** Static marketing & content pages (canonical paths only). */
export const STATIC_PUBLIC_PATHS = [
  "/",
  "/about-us",
  "/contact",
  "/press",
  "/careers",
  "/blog",
  "/privacy-policy",
  "/terms-of-use",
  "/refund-policy",
  "/doctors",
  "/shop",
  "/shop/conditions",
  "/shop/panchakarma",
  "/shop/surgicals",
  "/shop/treatment-kits",
  "/shop/prescription",
  "/shop/track",
  "/offers",
  "/clinics",
  "/therapies",
  "/therapists",
  "/therapist/browse",
  "/venue/browse",
  "/health-conditions",
  "/homeopathy",
  "/homeopathy/repertory",
  "/homeopathy/materia-medica",
  "/treatments/acupuncture",
  "/treatments/tung-points",
  "/treatments/acupuncture-300-diseases",
  "/treatments/acupuncture-50-diseases",
  "/treatments/acupuncture-homeopathy",
  "/treatments/acupoints-uses",
  "/diagnosis",
  "/diagnosis/prakriti",
  "/learning",
  "/learning/courses",
  "/learning/webinars",
  "/learning/blogs",
  "/learning/library",
  "/library",
  "/feed",
  "/jobs",
  "/colleges",
  "/partner",
  "/partner/apply",
  "/bulk",
  "/referral",
  "/atmri-help",
  "/atmri-help/cases",
  "/atmri-help/apply",
  "/atmri-help/hospitals",
  "/food-as-medicine",
  "/essential-drugs",
  "/essential-siddha-drugs",
  "/essential-unani-drugs",
  "/essential-homeopathy-drugs",
];

const PAGE_PRIORITY = {
  "/": "1.0",
  "/doctors": "0.9",
  "/shop": "0.9",
};

const PAGE_CHANGEFREQ = {
  "/": "weekly",
  "/doctors": "daily",
  "/shop": "daily",
  "/feed": "daily",
  "/jobs": "daily",
  "/learning/blogs": "daily",
};

const MAX_PER_TABLE = 200;

const supabaseHeaders = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
});

const fetchAllRows = async (url, key, table, select, filter = "") => {
  const rows = [];
  const pageSize = 100;
  let offset = 0;

  while (rows.length < MAX_PER_TABLE) {
    const limit = Math.min(pageSize, MAX_PER_TABLE - rows.length);
    const query = `${url}/rest/v1/${table}?select=${encodeURIComponent(select)}${filter}&limit=${limit}&offset=${offset}`;
    const res = await fetch(query, { headers: supabaseHeaders(key) });
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    rows.push(...batch);
    if (batch.length < limit) break;
    offset += batch.length;
  }

  return rows;
};

export const fetchDynamicPublicPaths = async () => {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn("[seo-routes] Supabase env missing — static paths only");
    return [];
  }

  try {
    const [doctors, products, conditions, blogs, systems, courses] = await Promise.all([
      fetchAllRows(url, key, "doctors_public", "id"),
      fetchAllRows(url, key, "products", "id"),
      fetchAllRows(url, key, "health_conditions", "slug", "&is_published=eq.true"),
      fetchAllRows(url, key, "health_blogs", "slug", "&status=eq.published"),
      fetchAllRows(url, key, "treatment_systems", "slug"),
      fetchAllRows(url, key, "lms_courses", "slug", "&is_published=eq.true"),
    ]);

    return [
      ...doctors.map((d) => `/doctors/${d.id}`),
      ...products.map((p) => `/shop/${p.id}`),
      ...conditions.map((c) => `/health-conditions/${c.slug}`),
      ...blogs.map((b) => `/learning/blogs/${b.slug}`),
      ...systems.map((s) => `/treatments/${s.slug}`),
      ...courses.map((c) => `/learning/courses/${c.slug}`),
    ];
  } catch (error) {
    console.warn("[seo-routes] Failed to fetch dynamic paths:", error);
    return [];
  }
};

export const collectPublicPaths = async () => {
  const dynamic = await fetchDynamicPublicPaths();
  const paths = [...new Set([...STATIC_PUBLIC_PATHS, ...dynamic])].filter(
    (path) => !NOINDEX_PATHS.has(path),
  );
  return paths.sort((a, b) => a.localeCompare(b));
};

export const pathToSitemapEntry = (pathname) => {
  const depth = pathname.split("/").filter(Boolean).length;
  const priority =
    PAGE_PRIORITY[pathname] ??
    (depth === 0 ? "1.0" : depth === 1 ? "0.7" : "0.5");
  const changefreq =
    PAGE_CHANGEFREQ[pathname] ??
    (pathname.startsWith("/doctors/") || pathname.startsWith("/shop/") ? "weekly" : "monthly");

  return {
    loc: `${SITE_URL}${pathname === "/" ? "/" : pathname}`,
    changefreq,
    priority,
  };
};

export const buildSitemapXml = (paths) => {
  const entries = paths.map(pathToSitemapEntry);
  const body = entries
    .map(
      (e) =>
        `  <url><loc>${e.loc}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};
