import { expect, type Locator, type Page } from "@playwright/test";

export const PRIMARY_SAVE_KEY = "khadijas-world:world-2";

const completedSteps = ["move", "interact", "travel", "help"];

export const completedWorldSeed = {
  version: 12,
  activeRoom: "home",
  selectedCharacter: "khadija",
  characters: {
    khadija: {
      id: "khadija",
      room: "home",
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      outfit: "pink",
      expression: "happy",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
    sister: {
      id: "sister",
      room: "home",
      position: { x: -2, y: 0, z: 1 },
      rotationY: 0,
      outfit: "yellow",
      expression: "happy",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
    brother: {
      id: "brother",
      room: "home",
      position: { x: 2, y: 0, z: 1 },
      rotationY: 0,
      outfit: "teal",
      expression: "happy",
      heldItem: null,
      activity: "standing",
      interaction: "idle",
      seatId: null,
      sleeping: false,
    },
  },
  release: {
    firstLaunchComplete: true,
    chatPrivacyAcknowledged: true,
    onboarding: {
      completedSteps,
      dismissed: false,
    },
  },
};

export async function seedCompletedWorld(page: Page): Promise<void> {
  await page.addInitScript(({ key, save }) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(save));
    }
  }, {
    key: PRIMARY_SAVE_KEY,
    save: completedWorldSeed,
  });
}

export function collectRuntimeFailures(page: Page): string[] {
  const failures: string[] = [];
  page.on("pageerror", (error) => {
    failures.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console: ${message.text()}`);
    }
  });
  return failures;
}

export async function expectTitleReady(page: Page): Promise<void> {
  await expect(page.locator("#loading-screen")).toBeHidden({ timeout: 50_000 });
  await expect(page.locator("#title-screen")).toBeVisible();
  await expect(page.locator("#startup-error")).toBeHidden();
}

export async function enterExistingWorld(page: Page): Promise<void> {
  await expectTitleReady(page);
  const continueButton = page.locator("#continue-button");
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.locator("#title-screen")).toBeHidden();
  await expect(page.locator("#game-canvas")).toBeFocused();
}

export async function expectInsideViewport(
  locator: Locator,
  viewport: { width: number; height: number },
): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, "Expected an element bounding box").not.toBeNull();
  if (!box) return;
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.y).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
}

export async function readPrimarySave(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error(`Missing ${key}`);
    return JSON.parse(raw) as Record<string, unknown>;
  }, PRIMARY_SAVE_KEY);
}
