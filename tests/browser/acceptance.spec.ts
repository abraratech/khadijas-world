import { expect, test, type Page } from "@playwright/test";
import {
  collectRuntimeFailures,
  enterExistingWorld,
  expectInsideViewport,
  expectTitleReady,
  readPrimarySave,
  seedCompletedWorld,
} from "./helpers";

test.describe.configure({ mode: "serial" });

async function openQaApp(page: Page): Promise<string[]> {
  const failures = collectRuntimeFailures(page);
  await page.goto("/?qa=1");
  return failures;
}

test("creates a world, persists onboarding dismissal, and enables Continue", async ({ page }) => {
  const failures = await openQaApp(page);
  await expectTitleReady(page);

  await expect(page.locator("#continue-button")).toBeDisabled();
  await expect(page.locator("#new-world-button")).toHaveText("Play");

  await page.locator("#new-world-button").click();
  await expect(page.locator("#first-launch-panel")).toBeVisible();

  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.locator("#start-world-button").click(),
  ]);

  await expectTitleReady(page);
  await expect(page.locator("#continue-button")).toBeEnabled();

  const save = await readPrimarySave(page);
  expect(save.version).toBe(12);
  expect(save.activeRoom).toBe("home");
  expect(save.release).toMatchObject({
    firstLaunchComplete: true,
    onboarding: {
      completedSteps: [],
      dismissed: false,
    },
  });

  await enterExistingWorld(page);
  await expect(page.locator("#onboarding-card")).toBeVisible();
  await page.locator("#onboarding-skip-button").click();
  await expect(page.locator("#onboarding-card")).toBeHidden();

  await page.reload({ waitUntil: "domcontentloaded" });
  await enterExistingWorld(page);
  await expect(page.locator("#onboarding-card")).toBeHidden();

  const dismissedSave = await readPrimarySave(page);
  expect(dismissedSave.release).toMatchObject({
    onboarding: { dismissed: true },
  });
  expect(failures).toEqual([]);
});

test("starts the production build without browser errors", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);

  await expectTitleReady(page);
  await enterExistingWorld(page);

  await expect(page.locator("#game-canvas")).toBeVisible();
  await expect(page.locator("#startup-error")).toBeHidden();
  await expect(page.locator("#display-recovery")).toBeHidden();
  expect(failures).toEqual([]);
});

test("travels, announces the room, saves it, and restores it after reload", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);
  await enterExistingWorld(page);

  const parkButton = page.locator('[data-room="park"]');
  await parkButton.click();
  await expect(parkButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#room-value")).toHaveText("Neighborhood park");
  await expect(page.locator("#screen-reader-status")).toContainText(/neighborhood park/i);

  await expect.poll(async () => {
    const save = await readPrimarySave(page);
    return save.activeRoom;
  }).toBe("park");

  await page.reload({ waitUntil: "domcontentloaded" });
  await enterExistingWorld(page);
  await expect(page.locator('[data-room="park"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#room-value")).toHaveText("Neighborhood park");
  expect(failures).toEqual([]);
});

test("contains modal focus and restores focus after Help, Settings, and Pause", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);
  await expectTitleReady(page);

  const continueButton = page.locator("#continue-button");
  await continueButton.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#title-credits-button")).toBeFocused();

  await continueButton.click();
  await expect(page.locator("#game-canvas")).toBeFocused();

  const helpButton = page.locator("#help-button");
  await helpButton.click();
  await expect(page.locator("#help-card")).toBeVisible();
  await expect(page.locator('#help-card [data-close-popover]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#help-card")).toBeHidden();
  await expect(helpButton).toBeFocused();

  const settingsButton = page.locator("#settings-button");
  await settingsButton.click();
  await expect(page.locator("#settings-panel")).toBeVisible();
  await expect(page.locator('#settings-panel [data-close-popover]')).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#settings-panel")).toBeHidden();
  await expect(settingsButton).toBeFocused();

  await page.locator("#game-canvas").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-panel")).toBeVisible();
  await expect(page.locator("#resume-button")).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(page.locator("#exit-fullscreen-button")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#resume-button")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator("#pause-panel")).toBeHidden();
  await expect(page.locator("#game-canvas")).toBeFocused();
  expect(failures).toEqual([]);
});

test("opens NPC chat through the opt-in QA bridge and keeps typed-message focus", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);
  await enterExistingWorld(page);

  const opened = await page.evaluate(() => {
    const qaWindow = window as Window & {
      __KHADIJAS_WORLD_QA__?: {
        openChat(npcId: string): boolean;
      };
    };
    return qaWindow.__KHADIJAS_WORLD_QA__?.openChat("parent") ?? false;
  });
  expect(opened).toBe(true);

  const chatPanel = page.locator("#chat-panel");
  const chatInput = page.locator("#chat-input");
  await expect(chatPanel).toBeVisible();
  await expect(chatInput).toBeEnabled();
  await expect(chatInput).toBeFocused();

  const bubbleCount = await page.locator("#chat-messages .chat-bubble").count();
  await chatInput.fill("Hello from the browser acceptance test.");
  await chatInput.press("Enter");
  await expect(page.locator("#chat-messages .chat-bubble")).toHaveCount(bubbleCount + 2);
  await expect(chatInput).toBeEnabled();
  await expect(chatInput).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(chatPanel).toBeHidden();
  await expect(page.locator("#game-canvas")).toBeFocused();
  expect(failures).toEqual([]);
});

test("keeps portrait and short-landscape controls inside the viewport", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = collectRuntimeFailures(page);

  const portrait = { width: 390, height: 844 };
  await page.setViewportSize(portrait);
  await page.goto("/?qa=1");
  await enterExistingWorld(page);

  await expectInsideViewport(page.locator(".top-bar"), portrait);
  await expectInsideViewport(page.locator(".location-tray"), portrait);
  await expectInsideViewport(page.locator(".play-tray"), portrait);

  const portraitLocation = await page.locator(".location-tray").boundingBox();
  const portraitPlay = await page.locator(".play-tray").boundingBox();
  expect(portraitLocation).not.toBeNull();
  expect(portraitPlay).not.toBeNull();
  if (portraitLocation && portraitPlay) {
    expect(portraitLocation.y + portraitLocation.height).toBeLessThanOrEqual(portraitPlay.y);
  }

  const landscape = { width: 844, height: 390 };
  await page.setViewportSize(landscape);
  await expect(page.locator(".brand")).toBeHidden();
  await expectInsideViewport(page.locator(".location-tray"), landscape);
  await expectInsideViewport(page.locator(".play-tray"), landscape);

  const landscapeLocation = await page.locator(".location-tray").boundingBox();
  const landscapePlay = await page.locator(".play-tray").boundingBox();
  expect(landscapeLocation).not.toBeNull();
  expect(landscapePlay).not.toBeNull();
  if (landscapeLocation && landscapePlay) {
    expect(landscapeLocation.y + landscapeLocation.height).toBeLessThanOrEqual(landscapePlay.y);
  }

  expect(failures).toEqual([]);
});

test("shows and restores the display-recovery dialog", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);
  await enterExistingWorld(page);

  await page.locator("#game-canvas").evaluate((canvas) => {
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });

  const recovery = page.locator("#display-recovery");
  await expect(recovery).toBeVisible();
  await expect(page.locator("#restore-display-button")).toBeFocused();

  await page.locator("#restore-display-button").click();
  await expect(recovery).toBeHidden();
  await expect(page.locator("#game-canvas")).toBeFocused();
  expect(failures).toEqual([]);
});

test("keeps encrypted cloud-save controls behind the grown-up gate", async ({ page }) => {
  await seedCompletedWorld(page);
  const failures = await openQaApp(page);
  await expectTitleReady(page);

  await page.locator("#grown-ups-button").click();
  await expect(page.locator("#parent-gate-panel")).toBeVisible();
  await page.locator("#parent-gate-answer").fill("7");
  await page.locator("#parent-gate-submit").click();

  await expect(page.locator("#parent-panel")).toBeVisible();
  await expect(page.locator("#cloud-save-create-button")).toBeVisible();
  await expect(page.locator("#cloud-save-code")).toBeVisible();
  await expect(page.locator("#cloud-save-status")).toContainText(/not connected/i);
  await expect(page.locator("#cloud-save-sync-button")).toBeHidden();

  const connection = await page.evaluate(() => (
    localStorage.getItem("khadijas-world:cloud-save:v1")
  ));
  expect(connection).toBeNull();
  expect(failures).toEqual([]);
});
