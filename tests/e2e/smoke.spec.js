import { expect, test } from "@playwright/test";

test("app loads without console errors", async ({ page }) => {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");
  await expect(page.locator("#overlay-title")).toContainText("Backyard Defense");
  expect(errors).toEqual([]);
});

test("deterministic autoplay reaches win state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.__PVZ_TEST_API__.runWinSmoke());
  await expect
    .poll(
      async () => page.evaluate(() => window.__PVZ_TEST_API__.getState()?.status),
      { timeout: 25000 }
    )
    .toBe("won");
  await expect(page.locator("#overlay-title")).toContainText("Victory");
});

test("forced fail scenario reaches lose state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.__PVZ_TEST_API__.runForcedLose());
  await expect
    .poll(
      async () => page.evaluate(() => window.__PVZ_TEST_API__.getState()?.status),
      { timeout: 12000 }
    )
    .toBe("lost");
  await expect(page.locator("#overlay-title")).toContainText("Defeat");
});

test("restart returns to clean running state", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.__PVZ_TEST_API__.runForcedLose());
  await expect
    .poll(
      async () => page.evaluate(() => window.__PVZ_TEST_API__.getState()?.status),
      { timeout: 12000 }
    )
    .toBe("lost");

  await page.click("#restart-button");
  await expect
    .poll(
      async () => page.evaluate(() => window.__PVZ_TEST_API__.getState()?.status),
      { timeout: 5000 }
    )
    .toBe("running");

  const snapshot = await page.evaluate(() => window.__PVZ_TEST_API__.getState());
  expect(snapshot.plants).toBe(0);
  expect(snapshot.sun).toBeGreaterThan(0);
});

test("difficulty + muted placeholder settings persist across reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.__PVZ_TEST_API__.setDifficulty("hard"));
  await page.reload();

  await expect(page.locator("#difficulty-select")).toHaveValue("hard");
  const settingsKey = await page.evaluate(() => window.__PVZ_TEST_API__.settingsKey());
  const persisted = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, settingsKey);
  expect(persisted).not.toBeNull();
  expect(persisted.difficulty).toBe("hard");
  expect(persisted.muted).toBe(true);
});
