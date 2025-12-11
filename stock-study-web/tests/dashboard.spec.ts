import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  // Since we are mocking AuthContext to always return a user, we test the authenticated state.
  test("should display dashboard content", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Expect to see the dashboard content
    await expect(page.getByText("Welcome back, Mock User")).toBeVisible();
    await expect(page.getByText("Study Overview")).toBeVisible();
    await expect(page.getByText("January Stock Study")).toBeVisible();
  });

  test("should have working interaction elements", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify "Start Assignment" button is present
    const startButton = page.getByRole("button", { name: "Start Assignment" });
    await expect(startButton).toBeVisible();
  });
});
