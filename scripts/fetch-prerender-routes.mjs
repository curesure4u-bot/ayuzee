/**
 * Public routes for post-build prerendering (static + Supabase dynamic URLs).
 */
import { collectPublicPaths } from "./seo-routes.mjs";

export async function fetchPrerenderRoutes() {
  const routes = await collectPublicPaths();
  console.log(`[prerender] ${routes.length} routes queued`);
  return routes;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const routes = await fetchPrerenderRoutes();
  console.log(routes.join("\n"));
}
