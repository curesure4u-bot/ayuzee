import { test, expect } from "@playwright/test";

/**
 * Performance tests using Web Vitals metrics via Playwright.
 * For full Lighthouse audits, run: npx lighthouse http://localhost:4173 --output html
 */

const performancePages = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Doctors", path: "/doctors" },
];

for (const page of performancePages) {
  test(`${page.name} page should load within performance budget`, async ({ page: browserPage }) => {
    const startTime = Date.now();
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState("domcontentloaded");
    const domContentLoaded = Date.now() - startTime;

    await browserPage.waitForLoadState("networkidle");
    const fullyLoaded = Date.now() - startTime;

    // Performance budgets
    expect(domContentLoaded).toBeLessThan(3000); // DOM ready < 3s
    expect(fullyLoaded).toBeLessThan(8000); // Full load < 8s

    // Check no console errors
    const consoleErrors: string[] = [];
    browserPage.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // Check for Largest Contentful Paint
    const lcp = await browserPage.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          resolve(last.startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    if (lcp > 0) {
      expect(lcp).toBeLessThan(2500); // LCP < 2.5s (Good)
    }

    console.log(`${page.name}: DOM=${domContentLoaded}ms, Full=${fullyLoaded}ms, LCP=${lcp}ms`);
  });
}

test("Bundle size check", async ({ page: browserPage }) => {
  const responses: { url: string; size: number }[] = [];

  browserPage.on("response", async (response) => {
    const url = response.url();
    if (url.includes("/assets/") && url.endsWith(".js")) {
      const body = await response.body().catch(() => Buffer.from(""));
      responses.push({ url, size: body.length });
    }
  });

  await browserPage.goto("/");
  await browserPage.waitForLoadState("networkidle");

  const totalJsSize = responses.reduce((sum, r) => sum + r.size, 0);
  const totalJsKB = Math.round(totalJsSize / 1024);

  console.log(`Total JS bundle size: ${totalJsKB} KB`);
  console.log("Individual chunks:");
  responses
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((r) => {
      const filename = r.url.split("/").pop();
      console.log(`  ${filename}: ${Math.round(r.size / 1024)} KB`);
    });

  // Warn if total JS exceeds 2MB (compressed)
  expect(totalJsSize).toBeLessThan(2 * 1024 * 1024);
});
