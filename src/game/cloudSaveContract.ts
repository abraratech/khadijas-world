export const CLOUD_SAVE_ENDPOINT = "/api/world-save";
export const CLOUD_SYNC_CODE_LENGTH = 20;
export const CLOUD_SYNC_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const CLOUD_SAVE_MAX_JSON_CHARS = 1_000_000;
export const CLOUD_SAVE_MAX_ENVELOPE_CHARS = 1_450_000;
export const CLOUD_SAVE_PBKDF2_ITERATIONS = 150_000;

export type CloudSaveOperation = "status" | "pull" | "push" | "delete";

export interface EncryptedWorldSaveEnvelope {
  version: 1;
  algorithm: "AES-GCM";
  kdf: "PBKDF2-SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface CloudSaveRequestBody {
  operation: CloudSaveOperation;
  slotId: string;
  accessToken: string;
  deviceId: string;
  baseRevision?: number;
  clientUpdatedAt?: string;
  envelope?: EncryptedWorldSaveEnvelope;
}

export interface CloudSaveMetadata {
  revision: number;
  updatedAt: string;
  clientUpdatedAt: string | null;
  lastDeviceId: string;
}

export type CloudSaveResponseBody =
  | ({ ok: true; operation: "status" | "push" | "delete" } & Partial<CloudSaveMetadata>)
  | ({ ok: true; operation: "pull"; envelope: EncryptedWorldSaveEnvelope } & CloudSaveMetadata)
  | {
      ok: false;
      reason: "not-found" | "conflict" | "rate-limited" | "invalid" | "unavailable";
      metadata?: CloudSaveMetadata;
    };

export function normalizeCloudSyncCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCloudSyncCode(value: string): string {
  const normalized = normalizeCloudSyncCode(value).slice(0, CLOUD_SYNC_CODE_LENGTH);
  return normalized.match(/.{1,4}/g)?.join("-") ?? "";
}

export function isValidCloudSyncCode(value: string): boolean {
  const normalized = normalizeCloudSyncCode(value);
  return normalized.length === CLOUD_SYNC_CODE_LENGTH
    && [...normalized].every((character) => CLOUD_SYNC_CODE_ALPHABET.includes(character));
}

function isBase64Url(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string"
    && value.length >= minimum
    && value.length <= maximum
    && /^[A-Za-z0-9_-]+$/.test(value);
}

export function isEncryptedWorldSaveEnvelope(
  value: unknown,
): value is EncryptedWorldSaveEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<EncryptedWorldSaveEnvelope>;
  return candidate.version === 1
    && candidate.algorithm === "AES-GCM"
    && candidate.kdf === "PBKDF2-SHA-256"
    && candidate.iterations === CLOUD_SAVE_PBKDF2_ITERATIONS
    && isBase64Url(candidate.salt, 16, 64)
    && isBase64Url(candidate.iv, 12, 48)
    && isBase64Url(candidate.ciphertext, 24, CLOUD_SAVE_MAX_ENVELOPE_CHARS);
}

export function isCloudSaveMetadata(value: unknown): value is CloudSaveMetadata {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CloudSaveMetadata>;
  return typeof candidate.revision === "number"
    && Number.isInteger(candidate.revision)
    && candidate.revision >= 1
    && typeof candidate.updatedAt === "string"
    && candidate.updatedAt.length >= 20
    && candidate.updatedAt.length <= 40
    && (candidate.clientUpdatedAt === null || typeof candidate.clientUpdatedAt === "string")
    && typeof candidate.lastDeviceId === "string"
    && candidate.lastDeviceId.length >= 16
    && candidate.lastDeviceId.length <= 80;
}

export function cloudSaveConflictMessage(metadata?: CloudSaveMetadata): string {
  if (!metadata) {
    return "Another device saved newer progress. Restore the cloud copy or replace it with this device.";
  }
  const date = new Date(metadata.updatedAt);
  const readable = Number.isNaN(date.valueOf()) ? "recently" : date.toLocaleString();
  return `Another device saved newer progress ${readable}. Restore it or replace it with this device.`;
}
