import { expect, test } from "@playwright/test";

test("attestation viewer renders for a valid hash", async ({ page }) => {
  await page.goto(
    "/attestation/0x4da0b8f714ce5f8d7f39d090be5eefb39f745c3d5cfaafb5878b05f3c0e357ca",
  );

  await expect(
    page.getByRole("heading", { name: /delivered to Mum/i }),
  ).toBeVisible();
  await expect(page.getByText("Transfer attestation")).toBeVisible();
  await expect(page.getByText("Rails queried")).toBeVisible();
});
