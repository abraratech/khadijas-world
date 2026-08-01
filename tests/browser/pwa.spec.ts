import { expect, test } from "@playwright/test";
import { expectTitleReady } from "./helpers";

test("publishes an installable manifest with standard and maskable icons", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);

  const manifest = await response.json() as {
    name?: string;
    short_name?: string;
    start_url?: string;
    scope?: string;
    display?: string;
    icons?: Array<{ src?: string; sizes?: string; purpose?: string }>;
  };

  expect(manifest).toMatchObject({
    name: "Khadija's World",
    short_name: "Khadija",
    display: "standalone",
  });
  expect(manifest.start_url).toBeTruthy();
  expect(manifest.scope).toBeTruthy();

  const iconKeys = new Set((manifest.icons ?? []).map((icon) => (
    `${icon.sizes}:${icon.purpose ?? "any"}`
  )));
  expect(iconKeys).toContain("192x192:any");
  expect(iconKeys).toContain("512x512:any");
  expect(iconKeys).toContain("192x192:maskable");
  expect(iconKeys).toContain("512x512:maskable");

  for (const icon of manifest.icons ?? []) {
    if (!icon.src?.endsWith(".png")) continue;
    const iconResponse = await request.get(icon.src.replace(/^\.\//, "/"));
    expect(iconResponse.ok(), icon.src).toBe(true);
  }
});

test("loads the cached game shell while the browser is offline", async ({ context, page }) => {
  await page.goto("/?qa=1&pwa=1");
  await expectTitleReady(page);

  await expect.poll(async () => page.evaluate(() => {
    const qaWindow = window as Window & {
      __KHADIJAS_WORLD_PWA__?: {
        getState(): { registrationReady: boolean };
      };
    };
    return Boolean(
      navigator.serviceWorker.controller
      && qaWindow.__KHADIJAS_WORLD_PWA__?.getState().registrationReady,
    );
  }), { timeout: 30_000 }).toBe(true);

  await page.evaluate(() => {
    const qaWindow = window as Window & {
      __KHADIJAS_WORLD_PWA__?: { warmOfflineCache(): void };
    };
    qaWindow.__KHADIJAS_WORLD_PWA__?.warmOfflineCache();
  });
  await expect.poll(async () => page.evaluate(() => {
    const qaWindow = window as Window & {
      __KHADIJAS_WORLD_PWA__?: {
        getState(): { offlineReady: boolean };
      };
    };
    return qaWindow.__KHADIJAS_WORLD_PWA__?.getState().offlineReady ?? false;
  }), { timeout: 60_000 }).toBe(true);

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectTitleReady(page);
  await expect(page.locator("#network-status")).toBeVisible();
  await expect(page.locator("#network-status")).toHaveText("Offline mode");

  await context.setOffline(false);
  await expect(page.locator("#network-status")).toBeHidden();
});

test("keeps cloud APIs out of the offline asset cache", async ({ page }) => {
  await page.goto("/?qa=1&pwa=1");
  await expectTitleReady(page);

  const workerSource = await page.request.get("/sw.js");
  expect(workerSource.ok()).toBe(true);
  const text = await workerSource.text();
  expect(text).toContain('const API_PATH_PREFIX = "/api/"');
  expect(text).toContain("event.respondWith(fetch(request))");
});
