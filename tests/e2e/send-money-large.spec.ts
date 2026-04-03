import { expect, test } from "@playwright/test";

test("large transfers require confirmation before execution", async ({
  page,
}) => {
  await page.goto("/send");

  await page
    .getByPlaceholder("Send $200 to Lagos...")
    .fill("Send $600 to Nigeria");
  await page.getByRole("button", { name: "Parse intent" }).click();
  await page.getByRole("button", { name: "Let Kova compare rails" }).click();
  await expect(
    page.getByText("Agent selected this route because it is the cheapest and fastest"),
  ).toBeVisible({ timeout: 5000 });

  await page.getByRole("button", { name: "Proceed with agent choice" }).click();
  await expect(page.getByText(/Confirmation required/i)).toBeVisible();

  await page.getByRole("button", { name: "Confirm & Send" }).click();
  await expect(page.getByRole("heading", { name: /delivered to/i })).toBeVisible({
    timeout: 5000,
  });
});
