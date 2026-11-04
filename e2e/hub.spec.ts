import { expect, test } from "@playwright/test";

test("networks directory searches lore and offers an application", async ({
  page,
}) => {
  await page.goto("/networks");
  await expect(
    page.getByRole("heading", { name: "Every chain has a story." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search directory" })
    .fill("Moonriver");
  await expect(
    page.getByRole("heading", { name: "Moonriver", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("1 of 73 entries")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search directory" })
    .fill("no-such-chain");
  await expect(page.getByText("No entries match.")).toBeVisible();
  await page.getByRole("link", { name: "Apply to list" }).click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Example Network");
  await page
    .getByRole("textbox", { name: "Official website", exact: true })
    .fill("https://example.com");
  await page
    .getByRole("textbox", { name: "Contact email" })
    .fill("owner@example.com");
  await page
    .getByRole("textbox", { name: "History, lore and details" })
    .fill("An application containing the network origin story.");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Save local application draft" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "It has not been sent to MTH.",
  );
});

test("upcoming example preserves disclosures and an elapsed schedule", async ({
  page,
}) => {
  await page.goto("/upcoming/pepeasteroid");
  await expect(
    page.getByRole("heading", { name: "Meet PEPEASTEROID — $ASTEROID" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "The scheduled date has passed. No launch confirmation has been published.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Set launch reminder" }),
  ).toBeDisabled();
  await expect(page.getByRole("link", { name: "See MTH profile" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Follow project" }).click();
  await expect(
    page.getByRole("button", { name: "Following on this device" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Following on this device" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByText("Revision 1 · Upcoming").click();
  await expect(
    page.getByRole("heading", { name: "Permanent update history" }),
  ).toBeVisible();
});

test("creator can save a local pre-contract profile without pretending it is public", async ({
  page,
}) => {
  await page.goto("/upcoming/new");
  await page.getByRole("textbox", { name: "Project name" }).fill("Orbit Dog");
  await page.getByRole("textbox", { name: "Token symbol" }).fill("ORBIT");
  await page.getByLabel("Scheduled launch (UTC)").fill("2027-01-10T14:00");
  await page
    .getByRole("textbox", { name: "Launchpad", exact: true })
    .fill("Example launchpad");
  await page
    .getByRole("textbox", { name: "Logo URL" })
    .fill("https://example.com/logo.png");
  await page
    .getByRole("textbox", { name: "Story & lore" })
    .fill("A project story before its contract exists.");
  await page
    .getByRole("textbox", { name: "Token distribution, allocation & vesting" })
    .fill("Team 10%, community 90%, subject to review.");
  await page
    .getByRole("textbox", { name: "Safety disclosures & affiliations" })
    .fill("Not affiliated with MTH. Contract pending.");
  await page.getByRole("checkbox", { name: "I am authorized" }).check();
  await page
    .getByRole("button", { name: "Save local project preview" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Meet Orbit Dog — $ORBIT" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Drafts stay in this browser; they are not public submissions.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Not yet published", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Meet Orbit Dog — $ORBIT" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Set launch reminder" }).click();
  expect((await download).suggestedFilename()).toBe("mth-reminder.ics");
});

test("event archive filters by subject and date, and saves an owner-reviewed recap", async ({
  page,
}) => {
  await page.goto("/events");
  await page
    .getByRole("textbox", { name: "Search events" })
    .fill("contract checks");
  await expect(
    page.getByRole("heading", { name: "Before the countdown: launch safety" }),
  ).toBeVisible();
  await page.getByLabel("From (UTC)").fill("2026-08-21");
  await expect(
    page.getByText("No events match this title, subject or date range."),
  ).toBeVisible();
  await page.goto("/events/new");
  await page
    .getByRole("textbox", { name: "Event title" })
    .fill("Orbit developer space");
  await page
    .getByRole("textbox", { name: "Subject / header" })
    .fill("Launch planning");
  await page.getByRole("textbox", { name: "Host / KOL" }).fill("Orbit host");
  await page.getByLabel("Start date & time (UTC)").fill("2027-01-09T14:00");
  await page
    .getByRole("textbox", { name: "Hosted MP3 / recording URL" })
    .fill("https://example.com/space.mp3");
  await page
    .getByRole("textbox", { name: "Meeting summary" })
    .fill("The host discussed launch dates and token allocation.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Save local event preview" }).click();
  await expect(
    page.getByRole("heading", { name: "Orbit developer space" }),
  ).toBeVisible();
  await page.getByText("Owner-reviewed recap").first().click();
  await expect(
    page.getByText("The host discussed launch dates and token allocation."),
  ).toBeVisible();
});

test("Hub navigation and mobile directories fit the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/hub");
  await page
    .getByRole("navigation", { name: "Hub navigation" })
    .getByRole("link", { name: "Exchanges" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Know the venue." }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Hub navigation" })
    .getByRole("link", { name: "Hub activity" })
    .click();
  await expect(
    page.getByRole("heading", { name: "No observed social changes yet." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("an unavailable permanent token never displays another sample token", async ({
  page,
}) => {
  await page.goto("/token/unknown-launch-record");
  await expect(
    page.getByRole("heading", { name: "Token profile unavailable" }),
  ).toBeVisible();
  await expect(
    page.getByText("No sample token is shown in its place.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Mog Coin|Bonk/ }),
  ).toHaveCount(0);
});
