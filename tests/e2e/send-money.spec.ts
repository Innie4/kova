import { expect, test } from "@playwright/test";

test("send money flow reaches the success state", async ({ page }) => {
  await page.goto("/send");

  await page.getByRole("button", { name: "Parse intent" }).click();
  await expect(
    page.getByText("Choose who receives the money."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Let Kova compare rails" }).click();
  await expect(
    page.getByText("Agent selected this route because it is the cheapest and fastest"),
  ).toBeVisible({ timeout: 5000 });

  await page.getByRole("button", { name: "Proceed with agent choice" }).click();
  await expect(
    page.getByRole("heading", { name: /delivered to/i }),
  ).toBeVisible({ timeout: 5000 });
});
