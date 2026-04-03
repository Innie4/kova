import { expect, test } from "@playwright/test";

test("wallet page shows balance and activity", async ({ page }) => {
  await page.goto("/wallet");

  await expect(page.getByText("USDC balance")).toBeVisible();
  await expect(page.getByText("USDC deposit from Base")).toBeVisible();
  await expect(page.getByText("Reputation and throughput")).toBeVisible();
});
