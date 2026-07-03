/**
 * Generates public/sitemap.xml (and optionally dist/sitemap.xml) from static + Supabase URLs.
 *
 * Usage: npm run generate:sitemap
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PROJECT_ROOT } from "./load-env.mjs";
import { buildSitemapXml, collectPublicPaths } from "./seo-routes.mjs";

const writeTargets = [path.join(PROJECT_ROOT, "public", "sitemap.xml")];

if (process.argv.includes("--dist")) {
  writeTargets.push(path.join(PROJECT_ROOT, "dist", "sitemap.xml"));
}

const main = async () => {
  const paths = await collectPublicPaths();
  const xml = buildSitemapXml(paths);

  for (const target of writeTargets) {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, xml, "utf8");
    console.log(`[sitemap] wrote ${paths.length} URLs → ${path.relative(PROJECT_ROOT, target)}`);
  }
};

main().catch((error) => {
  console.error("[sitemap] failed:", error);
  process.exit(1);
});
