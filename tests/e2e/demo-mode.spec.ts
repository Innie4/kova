import { expect, test } from "@playwright/test";

test.setTimeout(45_000);

test("demo mode walkthrough runs from dashboard to proof and history", async ({
  page,
}) => {
  await page.goto("/dashboard?demo=1");

  await expect(page.getByText("The 90-second judge walkthrough is ready.")).toBeVisible();
  await expect(page.getByText("$1,000.00").first()).toBeVisible();
  await expect(page.getByText("$47.30").first()).toBeVisible();

  await page
    .getByRole("link", { name: "Start guided demo" })
    .click({ noWaitAfter: true });
  await page.waitForURL(/\/send\?demo=1/, { timeout: 30000 });
  await expect(page.getByText("Guided demo")).toBeVisible();

  await expect(
    page.getByRole("heading", { name: /delivered to Mum/i }),
  ).toBeVisible({ timeout: 35000 });

  await page.getByRole("link", { name: "View proof on Kite" }).click();
  await expect(page).toHaveURL(/\/attestation\//);
  await expect(page.getByText("Transfer attestation")).toBeVisible();

  await page.goto("/history");
  await expect(page.getByText("Mum").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "View on Kite" }).first()).toBeVisible();
});
