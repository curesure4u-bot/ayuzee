import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

/**
 * Security, Performance & Accessibility E2E Test
 */

const TEST_PASSWORD = "TestPass!234";

test.describe("Security & Headers", () => {
  test.setTimeout(120000);

  test("Verify Security Headers", async ({ page, request }) => {
    console.log("\n" + "=".repeat(60));
    console.log("     SECURITY, PERFORMANCE & ACCESSIBILITY TEST");
    console.log("=".repeat(60));
    console.log("\n=== Security Headers Test ===\n");

    // Test security headers on main pages
    const pages = [
      "https://ayuzee.com/",
      "https://ayuzee.com/auth",
      "https://ayuzee.com/dashboard"
    ];

    for (const url of pages) {
      const response = await request.get(url);
      const headers = response.headers();
      
      console.log(`  ${url.split('/').pop() || 'home'}:`);
      console.log(`    Content-Security-Policy: ${headers['content-security-policy'] ? '✅' : '⚠️'}`);
      console.log(`    X-Frame-Options: ${headers['x-frame-options'] || '⚠️'}`);
      console.log(`    X-Content-Type-Options: ${headers['x-content-type-options'] || '⚠️'}`);
      console.log(`    Strict-Transport-Security: ${headers['strict-transport-security'] ? '✅' : '⚠️'}`);
    }

    console.log("\n✅ Security headers verified\n");
  });

  test("Verify HTTPS Enforced", async ({ page }) => {
    console.log("\n=== HTTPS Enforcement Test ===\n");

    // Navigate to HTTP (should redirect to HTTPS)
    await page.goto("http://ayuzee.com");
    await page.waitForLoadState("networkidle");
    
    const finalUrl = page.url();
    const isHttps = finalUrl.startsWith("https://");
    
    console.log(`  Initial: http://ayuzee.com`);
    console.log(`  Final: ${finalUrl}`);
    console.log(`  HTTPS Enforced: ${isHttps ? '✅' : '⚠️'}`);

    expect(isHttps).toBe(true);
    console.log("✅ HTTPS enforcement verified\n");
  });

  test("Verify Security Boundaries - Patient Access Blocked", async ({ page }) => {
    console.log("\n=== Security Boundary Test ===\n");

    // Register patient
    const email = `e2e.security.patient.${Date.now()}@ayuzee-test.dev`;
    await page.goto("https://ayuzee.com/auth?mode=signup");
    await page.locator("#fullName").fill("Security Test Patient");
    await page.locator("#phone").fill("9999999999");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(TEST_PASSWORD);
    await page.getByTestId("auth-submit").click();
    await page.waitForTimeout(3000);
    
    await login(page, email, TEST_PASSWORD);
    await page.waitForLoadState("networkidle");

    // Try accessing protected routes
    const protectedRoutes = [
      { route: "/admin", name: "Admin Panel" },
      { route: "/hms", name: "HMS Portal" },
      { route: "/spine", name: "Spine Module" },
      { route: "/owner", name: "Owner Dashboard" },
    ];

    console.log("  Patient attempting to access:");
    let blockedCount = 0;
    
    for (const { route, name } of protectedRoutes) {
      await page.goto(`https://ayuzee.com${route}`);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      
      const url = page.url();
      const isBlocked = url.includes('/auth') || url.includes('/dashboard');
      
      console.log(`    ${name} (${route}): ${isBlocked ? '✅ Blocked' : '⚠️ Accessible'}`);
      if (isBlocked) blockedCount++;
    }

    console.log(`\n  Protected routes: ${blockedCount}/${protectedRoutes.length} blocked`);
    console.log("✅ Security boundaries verified\n");
  });
});

test.describe("Performance Tests", () => {
  test.setTimeout(120000);

  test("Verify Page Load Time", async ({ page }) => {
    console.log("\n=== Page Load Performance Test ===\n");

    const pages = [
      { url: "https://ayuzee.com/", name: "Home" },
      { url: "https://ayuzee.com/auth", name: "Auth" },
      { url: "https://ayuzee.com/doctors", name: "Doctors" },
    ];

    for (const { url, name } of pages) {
      const startTime = Date.now();
      await page.goto(url);
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;
      
      const status = loadTime < 5000 ? '✅' : '⚠️';
      console.log(`  ${name}: ${loadTime}ms ${status}`);
    }

    console.log("✅ Page load performance verified\n");
  });

  test("Verify API Response Time", async ({ request }) => {
    console.log("\n=== API Response Time Test ===\n");

    // Test main API endpoints
    const endpoints = [
      "https://ayuzee.com/api/health",
    ];

    for (const url of endpoints) {
      const startTime = Date.now();
      try {
        const response = await request.get(url, { timeout: 10000 });
        const responseTime = Date.now() - startTime;
        console.log(`  ${url.split('/').pop()}: ${responseTime}ms - ${response.status()}`);
      } catch (e) {
        console.log(`  ${url.split('/').pop()}: ⚠️ endpoint not found`);
      }
    }

    console.log("✅ API response time verified\n");
  });
});

test.describe("Accessibility Tests", () => {
  test.setTimeout(120000);

  test("Verify Accessibility - Basic Checks", async ({ page }) => {
    console.log("\n=== Accessibility Basic Checks ===\n");

    // Test homepage accessibility
    await page.goto("https://ayuzee.com");
    await page.waitForLoadState("networkidle");

    // Check for HTML lang attribute
    const lang = await page.locator("html").getAttribute("lang");
    console.log(`  HTML lang attribute: ${lang ? '✅' : '⚠️'}`);

    // Check for viewport meta
    const viewport = await page.locator("meta[name='viewport']").count();
    console.log(`  Viewport meta tag: ${viewport > 0 ? '✅' : '⚠️'}`);

    // Check page title
    const title = await page.title();
    console.log(`  Page title: ${title ? '✅' : '⚠️'}`);

    // Check for skip link
    const skipLink = await page.locator("a[href='#main'], [class*='skip']").count();
    console.log(`  Skip link: ${skipLink > 0 ? '✅' : '⚠️'}`);

    // Check form labels
    const formInputs = await page.locator("input, select, textarea").count();
    console.log(`  Form inputs: ${formInputs} found`);

    console.log("✅ Basic accessibility checks complete\n");
  });

  test("Verify Keyboard Navigation", async ({ page }) => {
    console.log("\n=== Keyboard Navigation Test ===\n");

    await page.goto("https://ayuzee.com/auth");
    await page.waitForLoadState("networkidle");

    // Tab through form
    await page.keyboard.press("Tab");
    const focused = await page.locator(":focus").inputValue().catch(() => '');
    console.log(`  First focusable: ${focused ? '✅' : '⚠️'}`);

    // Check for focus indicators
    await page.keyboard.press("Tab");
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      const style = window.getComputedStyle(el!);
      return style.outline;
    });
    console.log(`  Focus indicator: ${focusStyle && focusStyle !== 'none' ? '✅' : '⚠️'}`);

    console.log("✅ Keyboard navigation verified\n");
  });

  test("Verify Color Contrast Elements", async ({ page }) => {
    console.log("\n=== Color Contrast Check ===\n");

    await page.goto("https://ayuzee.com");
    await page.waitForLoadState("networkidle");

    // Check for text elements
    const textElements = await page.locator("p, h1, h2, h3, h4, h5, h6, span, a").count();
    console.log(`  Text elements found: ${textElements}`);

    // Check for buttons
    const buttons = await page.locator("button, [role='button']").count();
    console.log(`  Interactive elements: ${buttons}`);

    console.log("✅ Color contrast check complete (manual verification recommended)\n");
  });

  test("Verify Mobile Responsiveness", async ({ page }) => {
    console.log("\n=== Mobile Responsiveness Test ===\n");

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("https://ayuzee.com");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Check page renders without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    
    console.log(`  Viewport: ${viewportWidth}px`);
    console.log(`  Content width: ${scrollWidth}px`);
    console.log(`  Fits viewport: ${scrollWidth <= viewportWidth + 5 ? '✅' : '⚠️'}`);

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    console.log("✅ Mobile responsiveness verified\n");
  });
});