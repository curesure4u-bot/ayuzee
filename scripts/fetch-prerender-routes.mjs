/**
 * Fetches public doctor and product IDs for post-build prerendering.
 * Falls back to static marketing routes when Supabase is unavailable.
 */

const STATIC_ROUTES = [
  "/",
  "/doctors",
  "/shop",
  "/therapies",
  "/diagnosis",
  "/learning",
  "/health-conditions",
  "/about-us",
  "/contact",
  "/blog",
];

const MAX_DYNAMIC_ROUTES = 50;

export async function fetchPrerenderRoutes() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn("[prerender] Supabase env missing — using static routes only");
    return STATIC_ROUTES;
  }

  try {
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
    };

    const [doctorsRes, productsRes] = await Promise.all([
      fetch(`${url}/rest/v1/doctors_public?select=id&limit=${MAX_DYNAMIC_ROUTES}`, { headers }),
      fetch(`${url}/rest/v1/products?select=id&limit=${MAX_DYNAMIC_ROUTES}`, { headers }),
    ]);

    const doctors = doctorsRes.ok ? await doctorsRes.json() : [];
    const products = productsRes.ok ? await productsRes.json() : [];

    const dynamic = [
      ...doctors.map((d) => `/doctors/${d.id}`),
      ...products.map((p) => `/shop/${p.id}`),
    ];

    const routes = [...new Set([...STATIC_ROUTES, ...dynamic])];
    console.log(`[prerender] ${routes.length} routes (${dynamic.length} dynamic)`);
    return routes;
  } catch (error) {
    console.warn("[prerender] Failed to fetch dynamic routes:", error);
    return STATIC_ROUTES;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const routes = await fetchPrerenderRoutes();
  console.log(routes.join("\n"));
}
