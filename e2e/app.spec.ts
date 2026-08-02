import { expect, test } from "@playwright/test";

test("loads the MemeTokenHub discovery experience", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/MemeTokenHub/i);
  await expect(page.getByRole("main")).toBeVisible();
});
