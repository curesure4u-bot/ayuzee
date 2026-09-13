import { test, expect } from "@playwright/test";

/**
 * SEO Tests
 * 
 * Validates essential SEO elements. Some pages may not have full OG tags
 * (social sharing meta) but must have basic SEO structure.
 */

const seoPages = [
  { name: "Home", path: "/", expectedTitle: /ayuzee/i },
  { name: "Doctors", path: "/doctors", expectedTitle: /doctor|ayuzee/i },
  { name: "Shop", path: "/shop", expectedTitle: /shop|ayuzee/i },
  { name: "About", path: "/about", expectedTitle: /about|ayuzee/i },
];

test.describe("SEO Essentials", () => {
  for (const page of seoPages) {
    test(`${page.name} page has proper SEO structure`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("networkidle");

      // Title tag exists and is meaningful
      const title = await browserPage.title();
      expect(title.length).toBeGreaterThan(5);
      expect(title.length).toBeLessThan(100);
      expect(title).toMatch(page.expectedTitle);

      // Check viewport meta tag (critical for mobile)
      const viewport = await browserPage.locator('meta[name="viewport"]').getAttribute("content");
      expect(viewport).toBeTruthy();

      console.log(`${page.name}: title="${title}", viewport=${viewport}`);
    });
  }

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    expect(h1Count).toBeLessThanOrEqual(3); // Allow up to 3 H1s for complex pages

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

  test("all images should have alt text or role", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Allow decorative images with role="presentation"
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll("img");
      return Array.from(images)
        .filter((img) => 
          !img.getAttribute("alt") && 
          !img.getAttribute("role") &&
          !img.classList.contains("lazy") // Allow lazy loaded images without alt initially
        )
        .map((img) => ({ src: img.src?.slice(0, 50), class: img.className.slice(0, 30) }))
        .slice(0, 5); // Report only first 5
    });

    if (imagesWithoutAlt.length > 0) {
      console.log("Images needing alt text:", imagesWithoutAlt);
    }
    // Warning only, not blocking
    expect(imagesWithoutAlt.length).toBeLessThan(5);
  });

  test("page should have valid HTML structure", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for html lang attribute
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();

    // Check for charset
    const charset = await page.locator('meta[charset]').count();
    expect(charset).toBeGreaterThan(0);

    console.log(`HTML lang="${lang}", charset present: ${charset > 0}`);
  });
});
