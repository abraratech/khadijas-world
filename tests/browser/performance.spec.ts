import { expect, test, type Page } from "@playwright/test";
import {
  collectRuntimeFailures,
  enterExistingWorld,
  seedCompletedWorld,
} from "./helpers";

interface RuntimeDiagnostics {
  activeRoom: string;
  meshes: number;
  materials: number;
  textures: number;
  transformNodes: number;
  animationGroups: number;
  activeMeshes: number;
  hardwareScalingLevel: number;
}

interface PerformanceQaBridge {
  switchRoom(roomId: string): boolean;
  diagnostics(): RuntimeDiagnostics;
}

type QaWindow = Window & {
  __KHADIJAS_WORLD_QA__?: PerformanceQaBridge;
};

const rooms = [
  "home",
  "bedroom",
  "street",
  "cafe",
  "park",
  "grocery",
] as const;

const diagnosticCounts = (
  diagnostics: RuntimeDiagnostics,
): Omit<
  RuntimeDiagnostics,
  "activeRoom" | "activeMeshes" | "hardwareScalingLevel"
> => ({
  meshes: diagnostics.meshes,
  materials: diagnostics.materials,
  textures: diagnostics.textures,
  transformNodes: diagnostics.transformNodes,
  animationGroups: diagnostics.animationGroups,
});

async function readDiagnostics(page: Page): Promise<RuntimeDiagnostics> {
  return page.evaluate(() => {
    const bridge = (window as QaWindow).__KHADIJAS_WORLD_QA__;
    if (!bridge) throw new Error("QA performance bridge is unavailable.");
    return bridge.diagnostics();
  });
}

async function switchRooms(
  page: Page,
  roomIds: readonly string[],
  delayMs = 100,
): Promise<void> {
  await page.evaluate(async ({ requestedRooms, delay }) => {
    const bridge = (window as QaWindow).__KHADIJAS_WORLD_QA__;
    if (!bridge) throw new Error("QA performance bridge is unavailable.");

    for (const roomId of requestedRooms) {
      if (!bridge.switchRoom(roomId)) {
        throw new Error(`QA room switch rejected: ${roomId}`);
      }

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, delay);
      });
    }
  }, {
    requestedRooms: [...roomIds],
    delay: delayMs,
  });
}

async function waitForStableResources(
  page: Page,
): Promise<RuntimeDiagnostics> {
  let previous: RuntimeDiagnostics | null = null;
  let stableSamples = 0;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    await page.waitForTimeout(500);
    const current = await readDiagnostics(page);

    if (
      previous
      && JSON.stringify(diagnosticCounts(current))
        === JSON.stringify(diagnosticCounts(previous))
    ) {
      stableSamples += 1;
    } else {
      stableSamples = 0;
    }

    if (stableSamples >= 3) return current;
    previous = current;
  }

  throw new Error("Babylon resource counts did not stabilize.");
}

test("keeps Babylon resources bounded across repeated room travel", async ({
  page,
}) => {
  await seedCompletedWorld(page);
  const failures = collectRuntimeFailures(page);

  await page.goto("/?qa=1");
  await enterExistingWorld(page);

  await page.waitForFunction(() => {
    const bridge = (window as QaWindow).__KHADIJAS_WORLD_QA__;
    return Boolean(bridge?.diagnostics && bridge?.switchRoom);
  });

  // Warm every location so lazy furniture and character imports are included
  // in the baseline rather than being mistaken for a leak.
  await switchRooms(page, rooms, 160);
  await switchRooms(page, ["home"], 160);

  const baseline = await waitForStableResources(page);
  expect(baseline.activeRoom).toBe("home");

  for (let cycle = 0; cycle < 5; cycle += 1) {
    await switchRooms(page, rooms);
  }

  await switchRooms(page, ["home"], 160);
  const finalState = await waitForStableResources(page);

  expect(finalState.activeRoom).toBe("home");
  expect(diagnosticCounts(finalState)).toEqual(
    diagnosticCounts(baseline),
  );

  expect(finalState.meshes).toBeGreaterThan(0);
  expect(finalState.materials).toBeGreaterThan(0);
  expect(finalState.hardwareScalingLevel).toBeGreaterThanOrEqual(1);
  expect(finalState.hardwareScalingLevel).toBeLessThanOrEqual(2);

  expect(failures).toEqual([]);
});
