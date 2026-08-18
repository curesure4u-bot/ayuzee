import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const criticalPages = [
  { name: "Home", path: "/" },
  { name: "Auth", path: "/auth" },
  { name: "Shop", path: "/shop" },
  { name: "Doctors", path: "/doctors" },
  { name: "Therapies", path: "/therapies" },
  { name: "Jobs", path: "/jobs" },
  { name: "Contact", path: "/contact" },
  { name: "About", path: "/about" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Terms of Use", path: "/terms-of-use" },
];

for (const page of criticalPages) {
  test(`${page.name} page should have no critical accessibility violations`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path);
    await browserPage.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page: browserPage })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      console.log(`\n--- Accessibility issues on ${page.name} ---`);
      critical.forEach((v) => {
        console.log(`[${v.impact}] ${v.id}: ${v.description}`);
        console.log(`  Help: ${v.helpUrl}`);
        v.nodes.forEach((n) => console.log(`  Element: ${n.html.slice(0, 100)}`));
      });
    }

    expect(critical).toHaveLength(0);
  });
}
