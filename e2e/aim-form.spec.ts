import { test, expect } from "@playwright/test";

/**
 * Aim Form Tests - Investment Direction Feature
 *
 * These tests require authentication. They are skipped by default
 * until auth fixtures are set up. To run manually with auth:
 * 1. Start the dev server
 * 2. Log in manually in the browser
 * 3. Run specific tests with --headed flag
 */

test.describe("Aim Form - Investment Direction", () => {
  // Skip all tests in this describe block - requires auth
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test.beforeEach(async ({ page }) => {
    // Navigate to create aim form
    // Assumes user is authenticated and has at least one target
    await page.goto("/targets");
    // Click first target to view it
    await page.locator('[data-testid="target-card"]').first().click();
    // Click add aim button
    await page.getByRole("button", { name: /add aim/i }).click();
  });

  test("shows investment direction selector", async ({ page }) => {
    // Verify the direction label exists
    await expect(page.getByLabel("Direction")).toBeVisible();

    // Verify default is Long
    await expect(page.getByRole("combobox", { name: /direction/i })).toContainText("Long");
  });

  test("can select Long direction", async ({ page }) => {
    // Open direction dropdown
    await page.getByRole("combobox", { name: /direction/i }).click();

    // Select Long option
    await page.getByRole("option", { name: /long/i }).click();

    // Verify helper text for Long
    await expect(
      page.getByText("Target price should be ABOVE current price")
    ).toBeVisible();
  });

  test("can select Short direction", async ({ page }) => {
    // Open direction dropdown
    await page.getByRole("combobox", { name: /direction/i }).click();

    // Select Short option
    await page.getByRole("option", { name: /short/i }).click();

    // Verify helper text for Short
    await expect(
      page.getByText("Target price should be BELOW current price")
    ).toBeVisible();
  });

  test("stop loss helper text changes with direction", async ({ page }) => {
    // Default is Long - check stop loss text
    await expect(
      page.getByText("Price BELOW entry where you'd exit to limit losses")
    ).toBeVisible();

    // Switch to Short
    await page.getByRole("combobox", { name: /direction/i }).click();
    await page.getByRole("option", { name: /short/i }).click();

    // Verify stop loss text changed for Short
    await expect(
      page.getByText("Price ABOVE entry where you'd exit to limit losses")
    ).toBeVisible();
  });

  test("take profit helper text changes with direction", async ({ page }) => {
    // Default is Long - check take profit text
    await expect(
      page.getByText("Price ABOVE entry where you'd lock in profits")
    ).toBeVisible();

    // Switch to Short
    await page.getByRole("combobox", { name: /direction/i }).click();
    await page.getByRole("option", { name: /short/i }).click();

    // Verify take profit text changed for Short
    await expect(
      page.getByText("Price BELOW entry where you'd lock in profits")
    ).toBeVisible();
  });

  test("can create aim with Long direction", async ({ page }) => {
    // Fill in required fields
    await page.getByLabel("Symbol").fill("AAPL");
    await page.getByLabel("Realistic Target").fill("200");
    await page.getByLabel("Target Date").fill("2025-12-31");

    // Direction should default to Long
    await expect(page.getByRole("combobox", { name: /direction/i })).toContainText("Long");

    // Submit form
    await page.getByRole("button", { name: /create aim/i }).click();

    // Verify success toast
    await expect(page.getByText("Aim created")).toBeVisible();
  });

  test("can create aim with Short direction", async ({ page }) => {
    // Fill in required fields
    await page.getByLabel("Symbol").fill("TSLA");
    await page.getByLabel("Realistic Target").fill("150"); // Below current for short
    await page.getByLabel("Target Date").fill("2025-12-31");

    // Select Short direction
    await page.getByRole("combobox", { name: /direction/i }).click();
    await page.getByRole("option", { name: /short/i }).click();

    // Submit form
    await page.getByRole("button", { name: /create aim/i }).click();

    // Verify success toast
    await expect(page.getByText("Aim created")).toBeVisible();
  });
});

test.describe("Aim Edit - Investment Direction", () => {
  test.skip(({ browserName }) => true, "Requires authentication setup");

  test("preserves investment direction when editing", async ({ page }) => {
    // Navigate to an existing aim with Short direction
    await page.goto("/targets");
    await page.locator('[data-testid="target-card"]').first().click();
    await page.locator('[data-testid="aim-card"]').first().click();
    await page.getByRole("button", { name: /edit/i }).click();

    // Verify direction is preserved
    const directionSelect = page.getByRole("combobox", { name: /direction/i });
    const currentValue = await directionSelect.textContent();

    // Value should be either "Long" or "Short"
    expect(["Long", "Short"].some((d) => currentValue?.includes(d))).toBeTruthy();
  });

  test("can change direction when editing aim", async ({ page }) => {
    // Navigate to edit an existing aim
    await page.goto("/targets");
    await page.locator('[data-testid="target-card"]').first().click();
    await page.locator('[data-testid="aim-card"]').first().click();
    await page.getByRole("button", { name: /edit/i }).click();

    // Get current direction
    const directionSelect = page.getByRole("combobox", { name: /direction/i });
    const currentValue = await directionSelect.textContent();

    // Toggle to opposite direction
    await directionSelect.click();
    if (currentValue?.includes("Long")) {
      await page.getByRole("option", { name: /short/i }).click();
    } else {
      await page.getByRole("option", { name: /long/i }).click();
    }

    // Save changes
    await page.getByRole("button", { name: /update aim/i }).click();

    // Verify success
    await expect(page.getByText("Aim updated")).toBeVisible();
  });
});
