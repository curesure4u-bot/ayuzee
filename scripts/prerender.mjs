/**
 * Post-build prerender for public SEO pages.
 * Snapshots fully rendered HTML (with client-side meta tags) for crawlers.
 *
 * Usage: npm run build && npm run prerender
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { fetchPrerenderRoutes } from "./fetch-prerender-routes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

const routeToFile = (route) => {
  if (route === "/") return path.join(DIST, "index.html");
  const clean = route.replace(/^\//, "").replace(/\/$/, "");
  return path.join(DIST, clean, "index.html");
};

const waitForPreview = (url, timeoutMs = 60_000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // preview not ready yet
      }
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Preview server did not start within ${timeoutMs}ms`));
      }
      setTimeout(tick, 500);
    };
    tick();
  });

const startPreview = () => {
  const child = spawn("npm", ["run", "preview", "--", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT)], {
    cwd: ROOT,
    stdio: "pipe",
    env: { ...process.env, BROWSER: "none" },
  });

  child.stdout?.on("data", (d) => process.stdout.write(d));
  child.stderr?.on("data", (d) => process.stderr.write(d));

  return child;
};

const prerenderRoute = async (page, route) => {
  const url = `${PREVIEW_URL}${route}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForSelector("#root", { timeout: 15_000 });
  await page.waitForTimeout(1500);
  const html = await page.content();
  const out = routeToFile(route);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html, "utf8");
  console.log(`[prerender] ${route} → ${path.relative(ROOT, out)}`);
};

const main = async () => {
  const routes = await fetchPrerenderRoutes();
  const preview = startPreview();

  try {
    await waitForPreview(PREVIEW_URL);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    for (const route of routes) {
      try {
        await prerenderRoute(page, route);
      } catch (error) {
        console.warn(`[prerender] skipped ${route}:`, error instanceof Error ? error.message : error);
      }
    }

    await browser.close();
    console.log(`[prerender] Done — ${routes.length} routes processed`);
  } finally {
    preview.kill("SIGTERM");
  }
};

main().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exit(1);
});
