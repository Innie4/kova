import { expect, test } from "@playwright/test";

test("user can complete the onboarding flow", async ({ page }) => {
  await page.goto("/onboarding/profile");

  await expect(
    page.getByRole("heading", { name: "Set up your operator profile" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to KYC" }).click();

  await expect(
    page.getByRole("heading", { name: "Upload your KYC documents" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Continue to wallet" }).click();

  await expect(
    page.getByRole("heading", { name: "Your Kite wallet is ready" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "I've funded my wallet" }).click();

  await expect(page.getByText("Start with natural language.")).toBeVisible();
});
