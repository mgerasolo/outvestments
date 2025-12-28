import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");

    // Should show login/welcome or redirect to login
    // The exact behavior depends on auth state
    await expect(page).toHaveTitle(/Outvestments/);
  });

  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("healthy");
  });
});

test.describe("Authentication Flow", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    // Try to access protected route
    await page.goto("/dashboard");

    // Should redirect to login or show login page
    // Wait for URL to contain either auth path or show login content
    await page.waitForURL(/.*/, { timeout: 5000 });

    // Either redirected to auth or shown login page
    const url = page.url();
    const hasAuthRedirect =
      url.includes("auth") ||
      url.includes("login") ||
      url.includes("signin") ||
      url.includes("authentik");

    // If not redirected, check for login prompt on page
    if (!hasAuthRedirect) {
      // Page should show sign in option
      const signInVisible = await page
        .getByRole("button", { name: /sign in/i })
        .isVisible()
        .catch(() => false);

      expect(hasAuthRedirect || signInVisible).toBeTruthy();
    }
  });
});

test.describe("Navigation", () => {
  // These tests assume authenticated state - will be extended
  // with auth fixtures when auth testing is set up

  test.skip("can navigate to targets page", async ({ page }) => {
    await page.goto("/targets");
    await expect(page.getByRole("heading", { name: /targets/i })).toBeVisible();
  });

  test.skip("can navigate to dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*dashboard.*/);
  });
});
