import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  collectRuntimeFailures,
  enterExistingWorld,
  expectInsideViewport,
  seedCompletedWorld,
} from "./helpers";

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

const rectangleRight = (rectangle: Rectangle): number => (
  rectangle.x + rectangle.width
);

const rectangleBottom = (rectangle: Rectangle): number => (
  rectangle.y + rectangle.height
);

async function requiredBox(locator: Locator): Promise<Rectangle> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  if (!box) {
    throw new Error("Expected a visible HUD element.");
  }

  return box;
}

async function verifyDesktopLeftRail(
  page: Page,
  viewport: { width: number; height: number },
): Promise<void> {
  await page.setViewportSize(viewport);

  await page.waitForFunction(() => (
    document.querySelector("#app")?.classList.contains("has-detached-hud")
  ));

  const canvas = page.locator("#game-canvas");
  const brand = page.locator(".brand");
  const utilities = page.locator(".top-actions");
  const navigation = page.locator(".location-tray");
  const characterSelector = page.locator(".character-selector");
  const playTray = page.locator(".play-tray");

  await expect(characterSelector).toBeHidden();

  for (const element of [
    canvas,
    brand,
    utilities,
    navigation,
    playTray,
  ]) {
    await expectInsideViewport(element, viewport);
  }

  const canvasBox = await requiredBox(canvas);
  const brandBox = await requiredBox(brand);
  const utilityBox = await requiredBox(utilities);
  const navigationBox = await requiredBox(navigation);
  const playTrayBox = await requiredBox(playTray);

  // Every persistent desktop control belongs completely left of the room.
  for (const railElement of [
    brandBox,
    utilityBox,
    navigationBox,
  ]) {
    expect(rectangleRight(railElement)).toBeLessThanOrEqual(
      canvasBox.x - 4,
    );
  }

  // Reading order: logo, global controls, then destinations.
  expect(rectangleBottom(brandBox)).toBeLessThanOrEqual(
    utilityBox.y + 1,
  );
  expect(rectangleBottom(utilityBox)).toBeLessThanOrEqual(
    navigationBox.y + 1,
  );

  expect(brandBox.width).toBeLessThanOrEqual(112);
  expect(utilityBox.width).toBeLessThanOrEqual(112);
  expect(navigationBox.width).toBeLessThanOrEqual(112);

  const utilityButtons = utilities.locator(".round-button");
  await expect(utilityButtons).toHaveCount(3);

  let previousUtility: Rectangle | null = null;

  for (let index = 0; index < 3; index += 1) {
    const current = await requiredBox(utilityButtons.nth(index));

    if (previousUtility) {
      expect(current.y).toBeGreaterThanOrEqual(
        rectangleBottom(previousUtility) + 2,
      );
    }

    previousUtility = current;
  }

  const locationButtons = navigation.locator(".location-button");
  await expect(locationButtons).toHaveCount(6);

  let previousLocation: Rectangle | null = null;

  for (let index = 0; index < 6; index += 1) {
    const current = await requiredBox(locationButtons.nth(index));

    if (previousLocation) {
      expect(current.y).toBeGreaterThanOrEqual(
        rectangleBottom(previousLocation) + 2,
      );
    }

    previousLocation = current;
  }

  // The bottom dock is centered only beneath the playable room.
  expect(playTrayBox.y).toBeGreaterThanOrEqual(
    rectangleBottom(canvasBox) - 1,
  );
  expect(playTrayBox.x).toBeGreaterThanOrEqual(canvasBox.x - 1);
  expect(rectangleRight(playTrayBox)).toBeLessThanOrEqual(
    rectangleRight(canvasBox) + 1,
  );

  expect(canvasBox.width).toBeGreaterThan(viewport.width * .86);
  expect(canvasBox.height).toBeGreaterThan(viewport.height * .72);
}

test("uses a vertical desktop rail outside the playable room", async ({
  page,
}) => {
  await seedCompletedWorld(page);
  const failures = collectRuntimeFailures(page);

  await page.setViewportSize({ width: 1280, height: 614 });
  await page.goto("/?qa=1");
  await enterExistingWorld(page);

  await verifyDesktopLeftRail(page, {
    width: 1280,
    height: 614,
  });
  await verifyDesktopLeftRail(page, {
    width: 1366,
    height: 768,
  });
  await verifyDesktopLeftRail(page, {
    width: 1707,
    height: 960,
  });

  expect(failures).toEqual([]);
});
