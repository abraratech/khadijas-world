import { describe, expect, it } from "vitest";
import {
  decryptWorldSave,
  encryptWorldSave,
  generateCloudSyncCode,
} from "./cloudSave";
import {
  CLOUD_SYNC_CODE_LENGTH,
  cloudSaveConflictMessage,
  formatCloudSyncCode,
  isEncryptedWorldSaveEnvelope,
  isValidCloudSyncCode,
  normalizeCloudSyncCode,
} from "./cloudSaveContract";

describe("CLOUD.SAVE.1 encrypted cross-device saves", () => {
  it("creates readable high-entropy five-part sync codes", () => {
    const code = generateCloudSyncCode();
    expect(code).toHaveLength(CLOUD_SYNC_CODE_LENGTH);
    expect(isValidCloudSyncCode(code)).toBe(true);
    expect(formatCloudSyncCode(code).split("-")).toHaveLength(5);
    expect(normalizeCloudSyncCode(formatCloudSyncCode(code))).toBe(code);
  });

  it("encrypts and decrypts without placing world JSON in the envelope", async () => {
    const code = generateCloudSyncCode();
    const raw = JSON.stringify({ version: 12, activeRoom: "park", secretMarker: "not-plaintext" });
    const envelope = await encryptWorldSave(raw, code);

    expect(isEncryptedWorldSaveEnvelope(envelope)).toBe(true);
    expect(JSON.stringify(envelope)).not.toContain("not-plaintext");
    await expect(decryptWorldSave(envelope, code)).resolves.toBe(raw);
  });

  it("rejects a different sync code", async () => {
    const envelope = await encryptWorldSave("{\"version\":12}", generateCloudSyncCode());
    await expect(decryptWorldSave(envelope, generateCloudSyncCode())).rejects.toThrow();
  });

  it("explains revision conflicts without silently overwriting", () => {
    expect(cloudSaveConflictMessage()).toMatch(/another device/i);
    expect(cloudSaveConflictMessage()).toMatch(/restore/i);
    expect(cloudSaveConflictMessage()).toMatch(/replace/i);
  });
});
