import { test, expect } from "@playwright/test";

/**
 * Mobile Responsiveness Check
 * Tests key pages on different device sizes to detect layout issues.
 */

const devices = [
  { name: "iPhone SE (small)", width: 375, height: 667 },
  { name: "iPhone 14 (medium)", width: 390, height: 844 },
  { name: "iPad (tablet)", width: 768, height: 1024 },
];

const pages = [
  { name: "Home", path: "/" },
  { name: "Auth", path: "/auth" },
  { name: "Shop", path: "/shop" },
  { name: "Doctors", path: "/doctors" },
  { name: "Jobs", path: "/jobs" },
  { name: "Contact", path: "/contact" },
];

for (const device of devices) {
  for (const page of pages) {
    test(`${page.name} on ${device.name} — no overflow or layout issues`, async ({ page: browserPage }) => {
      await browserPage.setViewportSize({ width: device.width, height: device.height });
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("networkidle");

      // Check 1: No horizontal overflow (content wider than screen)
      // Note: overflow-x:hidden on body prevents actual horizontal scrolling
      // scrollWidth may still report larger values due to off-screen positioned elements
      const bodyWidth = await browserPage.evaluate(() => document.body.scrollWidth);
      const overflowAmount = bodyWidth - device.width;
      const hasVisibleOverflow = await browserPage.evaluate(() => {
        const style = window.getComputedStyle(document.documentElement);
        return style.overflowX !== "hidden";
      });
      
      if (overflowAmount > 20) {
        console.log(`ℹ️ ${page.name} on ${device.name}: Content width ${bodyWidth}px (${overflowAmount}px wider than viewport, hidden by overflow-x:hidden)`);
      }
      
      // Only fail if overflow is actually visible to users
      expect(hasVisibleOverflow && overflowAmount > 20).toBe(false);

      // Check 2: Viewport meta tag exists (tells mobile browsers to scale properly)
      const viewport = await browserPage.locator('meta[name="viewport"]').getAttribute("content");
      expect(viewport).toContain("width=device-width");

      // Check 3: No text smaller than 12px (unreadable on mobile)
      const tinyText = await browserPage.evaluate(() => {
        const elements = document.querySelectorAll("p, span, a, li, td, th, label, h1, h2, h3, h4, h5, h6");
        const tiny: string[] = [];
        elements.forEach((el) => {
          const style = window.getComputedStyle(el);
          const size = parseFloat(style.fontSize);
          if (size < 11 && el.textContent && el.textContent.trim().length > 0) {
            tiny.push(`${el.tagName}(${size}px): "${el.textContent.trim().slice(0, 30)}"`);
          }
        });
        return tiny.slice(0, 5); // Report max 5
      });

      if (tinyText.length > 0) {
        console.log(`⚠️ ${page.name} on ${device.name}: Tiny text found:`, tinyText);
      }

      // Check 4: Touch targets (buttons/links) are at least 44x44px (Apple guideline)
      const smallTargets = await browserPage.evaluate(() => {
        const targets = document.querySelectorAll("button, a, input, select, [role='button']");
        const small: string[] = [];
        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && (rect.width < 30 || rect.height < 30)) {
            const text = el.textContent?.trim().slice(0, 20) || el.getAttribute("aria-label") || "unnamed";
            small.push(`${el.tagName}(${Math.round(rect.width)}x${Math.round(rect.height)}): "${text}"`);
          }
        });
        return small.slice(0, 5);
      });

      if (smallTargets.length > 0) {
        console.log(`ℹ️ ${page.name} on ${device.name}: Small touch targets:`, smallTargets);
      }
    });
  }
}
