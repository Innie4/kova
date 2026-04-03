import { expect, test } from "@playwright/test";

test("history page loads transfer data", async ({ page }) => {
  await page.goto("/history");

  await expect(
    page.getByRole("heading", { name: "Every route comparison stays reviewable." }),
  ).toBeVisible();
  await expect(page.getByText("Ama Mensah").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View on Kite" }).first()).toBeVisible();
});
