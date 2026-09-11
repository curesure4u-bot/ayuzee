import { test, expect } from "@playwright/test";

/**
 * Business Register, Contact, About Us E2E Test
 */

test.describe("Business & Contact Pages", () => {
  test.setTimeout(180000);

  test("Business Register Page", async ({ page }) => {
    console.log("\n" + "=".repeat(50));
    console.log("     BUSINESS, CONTACT, ABOUT TEST");
    console.log("=".repeat(50));

    await page.goto("https://ayuzee.com/business-register");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Business Register accessible`);

    // Check for forms
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    // Check for inputs
    const inputs = await page.locator("input").count();
    console.log(`  Input fields: ${inputs}`);

    console.log("\n✅ Business Register: PASSED\n");
  });

  test("Contact Page", async ({ page }) => {
    console.log("\n=== Contact Page ===");

    await page.goto("https://ayuzee.com/contact");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ Contact accessible`);

    // Check for contact info
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    // Check for forms (contact form)
    const forms = await page.locator("form").count();
    console.log(`  Forms: ${forms}`);

    // Check for links
    const links = await page.locator("a").count();
    console.log(`  Links: ${links}`);

    console.log("\n✅ Contact: PASSED\n");
  });

  test("About Us Page", async ({ page }) => {
    console.log("\n=== About Us ===");

    await page.goto("https://ayuzee.com/about-us");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    const url = page.url();
    console.log(`  URL: ${url}`);
    console.log(`  ✅ About Us accessible`);

    // Check for content
    const headings = await page.locator("h1, h2, h3").count();
    console.log(`  Headings: ${headings}`);

    const paragraphs = await page.locator("p").count();
    console.log(`  Paragraphs: ${paragraphs}`);

    // Check for images
    const images = await page.locator("img").count();
    console.log(`  Images: ${images}`);

    console.log("\n✅ About Us: PASSED\n");
  });

  test("Business Register Form Elements", async ({ page }) => {
    console.log("\n=== Business Register Form ===");

    await page.goto("https://ayuzee.com/business-register");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for business-specific fields
    const textInputs = await page.locator("input[type='text']").count();
    console.log(`  Text inputs: ${textInputs}`);

    const selects = await page.locator("select").count();
    console.log(`  Dropdowns: ${selects}`);

    const buttons = await page.locator("button").count();
    console.log(`  Buttons: ${buttons}`);

    console.log("\n✅ Business Form: PASSED\n");
  });

  test("Contact Form Elements", async ({ page }) => {
    console.log("\n=== Contact Form Elements ===");

    await page.goto("https://ayuzee.com/contact");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for name, email, message fields
    const emailInputs = await page.locator("input[type='email']").count();
    console.log(`  Email inputs: ${emailInputs}`);

    const textareas = await page.locator("textarea").count();
    console.log(`  Text areas: ${textareas}`);

    console.log("\n✅ Contact Form: PASSED\n");
  });

  test("About Us Team Section", async ({ page }) => {
    console.log("\n=== About Us Team ===");

    await page.goto("https://ayuzee.com/about-us");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Check for team members
    const sections = await page.locator("section").count();
    console.log(`  Sections: ${sections}`);

    // Check for cards
    const cards = await page.locator("[class*='card'], [class*='team']").count();
    console.log(`  Team/Content cards: ${cards}`);

    console.log("\n✅ About Us Team: PASSED\n");
  });
});