import { expect, test, type Page } from "@playwright/test";
import { collectRuntimeFailures, expectInsideViewport, expectTitleReady } from "./helpers";

async function assertTitleTouchTargets(page: Page): Promise<void> {
  const buttons = page.locator(".title-actions button, .title-product-links button");
  const count = await buttons.count();
  expect(count).toBeGreaterThanOrEqual(7);
  for (let index = 0; index < count; index += 1) {
    const box = await buttons.nth(index).boundingBox();
    expect(box).not.toBeNull();
    if (!box) continue;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
}

test("keeps production controls reachable on a portrait phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const failures = collectRuntimeFailures(page);
  await page.goto("/?qa=1");
  await expectTitleReady(page);
  await expectInsideViewport(page.locator(".title-card"), { width: 390, height: 844 });
  await assertTitleTouchTargets(page);
  await page.locator("#title-privacy-button").click();
  await expect(page.locator("#privacy-panel")).toBeVisible();
  await expect(page.locator("#privacy-panel a[href='./privacy.html']")).toBeVisible();
  expect(failures).toEqual([]);
});

test("keeps production controls reachable in compact landscape", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const failures = collectRuntimeFailures(page);
  await page.goto("/?qa=1");
  await expectTitleReady(page);
  await expectInsideViewport(page.locator(".title-card"), { width: 844, height: 390 });
  await assertTitleTouchTargets(page);
  await page.locator("#title-accessibility-button").click();
  await expect(page.locator("#accessibility-panel")).toBeVisible();
  expect(failures).toEqual([]);
});

test("supports keyboard access to public policy information", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?qa=1");
  await expectTitleReady(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.locator("#title-accessibility-button").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#accessibility-panel")).toBeVisible();
  await expect(page.locator("#accessibility-panel a[href='./accessibility.html']")).toBeFocused();
});
