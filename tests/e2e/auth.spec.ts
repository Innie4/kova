import { expect, test } from "@playwright/test";

test("user can request a magic link and land on verify state", async ({
  page,
}) => {
  await page.goto("/auth/login");

  await page.getByRole("textbox", { name: "Email" }).fill("judge@kova.app");
  await Promise.all([
    page.waitForURL(/\/auth\/verify\?email=judge%40kova\.app/, {
      timeout: 30000,
      waitUntil: "domcontentloaded",
    }),
    page.getByRole("button", { name: "Send Magic Link" }).click({
      noWaitAfter: true,
    }),
  ]);

  await expect(
    page.getByRole("heading", { name: "Your sign-in link is on the way." }),
  ).toBeVisible();
  await expect(page.getByText("Sending to judge@kova.app")).toBeVisible();
  await expect(page.getByRole("button", { name: /Resend in 60s/i })).toBeVisible();
});
