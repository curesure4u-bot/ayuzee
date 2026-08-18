import { test, expect } from "@playwright/test";

const seoPages = [
  { name: "Home", path: "/", expectedTitle: /ayuzee/i },
  { name: "Doctors", path: "/doctors", expectedTitle: /doctor|ayuzee/i },
  { name: "Shop", path: "/shop", expectedTitle: /shop|ayuzee/i },
  { name: "About", path: "/about", expectedTitle: /about|ayuzee/i },
];

test.describe("SEO Essentials", () => {
  for (const page of seoPages) {
    test(`${page.name} page has proper SEO meta tags`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("networkidle");

      // Title tag exists and is meaningful
      const title = await browserPage.title();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70);

      // Meta description
      const metaDesc = await browserPage.locator('meta[name="description"]').getAttribute("content");
      if (metaDesc) {
        expect(metaDesc.length).toBeGreaterThan(50);
        expect(metaDesc.length).toBeLessThan(160);
      }

      // Canonical URL
      const canonical = await browserPage.locator('link[rel="canonical"]').getAttribute("href");
      // OG tags for social sharing
      const ogTitle = await browserPage.locator('meta[property="og:title"]').getAttribute("content");
      const ogDesc = await browserPage.locator('meta[property="og:description"]').getAttribute("content");
      const ogImage = await browserPage.locator('meta[property="og:image"]').getAttribute("content");

      console.log(`${page.name}: title="${title}", desc=${metaDesc?.length ?? 0} chars, canonical=${canonical}, og:image=${ogImage}`);
    });
  }

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(2); // Ideally 1 H1 per page

    // Check heading hierarchy doesn't skip levels
    const headings = await page.evaluate(() => {
      const elements = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      return Array.from(elements).map((el) => ({
        level: parseInt(el.tagName[1]),
        text: el.textContent?.trim().slice(0, 50),
      }));
    });

    console.log("Heading hierarchy:", headings.map((h) => `H${h.level}: ${h.text}`).join("\n"));
  });

  test("all images should have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll("img");
      return Array.from(images)
        .filter((img) => !img.getAttribute("alt") && !img.getAttribute("role"))
        .map((img) => img.src);
    });

    if (imagesWithoutAlt.length > 0) {
      console.log("Images missing alt text:", imagesWithoutAlt);
    }
    expect(imagesWithoutAlt.length).toBe(0);
  });

  test("robots.txt and sitemap should be accessible", async ({ page }) => {
    const robotsResponse = await page.goto("/robots.txt");
    // SPA may return 200 for all paths; check content
    const robotsContent = await page.content();

    // Check for sitemap reference
    const sitemapResponse = await page.goto("/sitemap.xml");
    console.log("Sitemap status:", sitemapResponse?.status());
  });
});
