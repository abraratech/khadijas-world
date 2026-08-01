import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_AVATAR_CUSTOMIZATION } from "./characters/avatarCustomization";
import {
  applyCloudSaveRestore,
  createCloudSaveConnection,
  encryptWorldSave,
  generateCloudSyncCode,
  getCloudSaveStatus,
  prepareCloudSaveRestore,
  syncCloudSaveNow,
} from "./cloudSave";
import { createDefaultWorldSave, loadSave } from "./storage";

const CONNECTION_KEY = "khadijas-world:cloud-save:v1";

class MemoryStorage implements Storage {
  readonly #values = new Map<string, string>();

  get length(): number { return this.#values.size; }
  clear(): void { this.#values.clear(); }
  getItem(key: string): string | null { return this.#values.get(key) ?? null; }
  key(index: number): string | null { return [...this.#values.keys()][index] ?? null; }
  removeItem(key: string): void { this.#values.delete(key); }
  setItem(key: string, value: string): void { this.#values.set(key, value); }
}

function successResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("CLOUD.SAVE.1 browser client", () => {
  let storage: MemoryStorage;
  let online = true;

  beforeEach(() => {
    storage = new MemoryStorage();
    const windowStub = {
      localStorage: storage,
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
      dispatchEvent: vi.fn(() => true),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("CustomEvent", class<T = unknown> extends Event {
      readonly detail: T;
      constructor(type: string, init?: CustomEventInit<T>) {
        super(type);
        this.detail = init?.detail as T;
      }
    });
    vi.stubGlobal("window", windowStub);
    vi.stubGlobal("navigator", {
      get onLine() { return online; },
      clipboard: { writeText: vi.fn(async () => undefined) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("uploads an encrypted world and stores only the sync connection locally", async () => {
    const requests: Record<string, unknown>[] = [];
    vi.stubGlobal("fetch", vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      requests.push(requestBody);
      return successResponse({
        ok: true,
        operation: "push",
        revision: 1,
        updatedAt: "2026-08-01T12:00:00.000Z",
        clientUpdatedAt: "2026-08-01T12:00:00.000Z",
        lastDeviceId: requestBody.deviceId,
      });
    }));

    const result = await createCloudSaveConnection();
    const requestBody = requests[0];
    expect(result.ok).toBe(true);
    expect(getCloudSaveStatus().remoteRevision).toBe(1);
    expect(requestBody.operation).toBe("push");
    expect(JSON.stringify(requestBody.envelope)).not.toContain("activeRoom");
    expect(storage.getItem(CONNECTION_KEY)).not.toBeNull();
  });

  it("restores a verified encrypted cloud world and avatar", async () => {
    const code = generateCloudSyncCode();
    const world = createDefaultWorldSave();
    world.activeRoom = "park";
    world.characters.khadija.room = "park";
    world.release.firstLaunchComplete = true;
    const envelope = await encryptWorldSave(JSON.stringify({
      cloudPackageVersion: 1,
      world,
      avatar: { ...DEFAULT_AVATAR_CUSTOMIZATION, outfitColor: "violet" },
    }), code);

    vi.stubGlobal("fetch", vi.fn(async () => successResponse({
      ok: true,
      operation: "pull",
      envelope,
      revision: 4,
      updatedAt: "2026-08-01T12:05:00.000Z",
      clientUpdatedAt: "2026-08-01T12:04:59.000Z",
      lastDeviceId: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    })));

    const preview = await prepareCloudSaveRestore(code);
    expect(preview.ok).toBe(true);
    expect(applyCloudSaveRestore(preview).ok).toBe(true);
    expect(loadSave().activeRoom).toBe("park");
    expect(getCloudSaveStatus().remoteRevision).toBe(4);
  });

  it("marks a revision conflict instead of overwriting the cloud copy", async () => {
    const code = generateCloudSyncCode();
    storage.setItem(CONNECTION_KEY, JSON.stringify({
      version: 1,
      code,
      remoteRevision: 2,
      conflictRevision: null,
      remoteUpdatedAt: "2026-08-01T12:00:00.000Z",
    }));
    vi.stubGlobal("fetch", vi.fn(async () => successResponse({
      ok: false,
      reason: "conflict",
      metadata: {
        revision: 3,
        updatedAt: "2026-08-01T12:10:00.000Z",
        clientUpdatedAt: "2026-08-01T12:09:59.000Z",
        lastDeviceId: "ffffffff-1111-4222-8333-444444444444",
      },
    }, 409)));

    const result = await syncCloudSaveNow();
    expect(result.ok).toBe(false);
    expect(result.conflict).toBe(true);
    expect(getCloudSaveStatus().conflict).toBe(true);
    expect(loadSave().version).toBe(12);
  });

  it("keeps local saving available while offline", async () => {
    online = false;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await createCloudSaveConnection();
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/connect to the internet/i);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(loadSave().version).toBe(12);
  });
});
