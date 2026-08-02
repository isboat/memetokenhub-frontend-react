import { expect, test } from "@playwright/test";

const screenshotDirectory = "artifacts/screenshots";

test("@screenshots captures the desktop discovery experience", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();

  await page.screenshot({
    path: `${screenshotDirectory}/discover-desktop.png`,
    fullPage: true,
  });
});

test("@screenshots captures the mobile discovery experience", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();

  await page.screenshot({
    path: `${screenshotDirectory}/discover-mobile.png`,
    fullPage: true,
  });
});

test("@screenshots captures the desktop about page", async ({ page }) => {
  await page.goto("/about");
  await expect(
    page.getByRole("heading", {
      name: "Built for culture. Designed for context.",
    }),
  ).toBeVisible();

  await page.screenshot({
    path: `${screenshotDirectory}/about-desktop.png`,
    fullPage: true,
  });
});
