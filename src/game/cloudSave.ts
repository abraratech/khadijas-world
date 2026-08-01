import {
  CLOUD_SAVE_ENDPOINT,
  CLOUD_SAVE_MAX_JSON_CHARS,
  CLOUD_SAVE_PBKDF2_ITERATIONS,
  CLOUD_SYNC_CODE_ALPHABET,
  CLOUD_SYNC_CODE_LENGTH,
  cloudSaveConflictMessage,
  formatCloudSyncCode,
  isCloudSaveMetadata,
  isEncryptedWorldSaveEnvelope,
  isValidCloudSyncCode,
  normalizeCloudSyncCode,
  type CloudSaveMetadata,
  type CloudSaveRequestBody,
  type CloudSaveResponseBody,
  type EncryptedWorldSaveEnvelope,
} from "./cloudSaveContract";
import {
  exportWorldSave,
  importWorldSave,
  previewWorldSaveImport,
} from "./storage";
import {
  loadAvatarCustomization,
  sanitizeAvatarCustomization,
  saveAvatarCustomization,
  type AvatarCustomization,
} from "./characters/avatarCustomization";

const CONNECTION_STORAGE_KEY = "khadijas-world:cloud-save:v1";
const DEVICE_STORAGE_KEY = "khadijas-world:cloud-save-device:v1";
const REQUEST_TIMEOUT_MS = 12_000;
const AUTO_SYNC_DELAY_MS = 8_000;

interface StoredCloudSaveConnection {
  version: 1;
  code: string;
  remoteRevision: number;
  conflictRevision: number | null;
  remoteUpdatedAt: string | null;
}

export interface CloudSaveStatus {
  connected: boolean;
  code: string | null;
  formattedCode: string | null;
  remoteRevision: number;
  conflict: boolean;
  remoteUpdatedAt: string | null;
}

export interface CloudSaveActionResult {
  ok: boolean;
  message: string;
  conflict?: boolean;
}

export interface CloudSaveRestorePreview extends CloudSaveActionResult {
  raw?: string;
  code?: string;
  metadata?: CloudSaveMetadata;
  avatar?: AvatarCustomization;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function digestText(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

async function deriveAesKey(code: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt as BufferSource,
      iterations: CLOUD_SAVE_PBKDF2_ITERATIONS,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptWorldSave(
  raw: string,
  code: string,
): Promise<EncryptedWorldSaveEnvelope> {
  if (raw.length > CLOUD_SAVE_MAX_JSON_CHARS) throw new Error("save-too-large");
  const normalizedCode = normalizeCloudSyncCode(code);
  if (!isValidCloudSyncCode(normalizedCode)) throw new Error("invalid-code");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(normalizedCode, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(raw),
  );

  return {
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: CLOUD_SAVE_PBKDF2_ITERATIONS,
    salt: bytesToBase64Url(salt),
    iv: bytesToBase64Url(iv),
    ciphertext: bytesToBase64Url(new Uint8Array(encrypted)),
  };
}

export async function decryptWorldSave(
  envelope: EncryptedWorldSaveEnvelope,
  code: string,
): Promise<string> {
  if (!isEncryptedWorldSaveEnvelope(envelope)) throw new Error("invalid-envelope");
  const normalizedCode = normalizeCloudSyncCode(code);
  if (!isValidCloudSyncCode(normalizedCode)) throw new Error("invalid-code");

  const salt = base64UrlToBytes(envelope.salt);
  const iv = base64UrlToBytes(envelope.iv);
  const ciphertext = base64UrlToBytes(envelope.ciphertext);
  const key = await deriveAesKey(normalizedCode, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  );
  const raw = new TextDecoder().decode(decrypted);
  if (raw.length > CLOUD_SAVE_MAX_JSON_CHARS) throw new Error("save-too-large");
  return raw;
}

export function generateCloudSyncCode(): string {
  const random = crypto.getRandomValues(new Uint8Array(CLOUD_SYNC_CODE_LENGTH));
  return [...random]
    .map((value) => CLOUD_SYNC_CODE_ALPHABET[value % CLOUD_SYNC_CODE_ALPHABET.length])
    .join("");
}

async function deriveCredentials(code: string): Promise<{ slotId: string; accessToken: string }> {
  const normalized = normalizeCloudSyncCode(code);
  if (!isValidCloudSyncCode(normalized)) throw new Error("invalid-code");
  return {
    slotId: await digestText(`khadijas-world:slot:${normalized}`),
    accessToken: await digestText(`khadijas-world:access:${normalized}`),
  };
}

function readConnection(): StoredCloudSaveConnection | null {
  try {
    const raw = localStorage.getItem(CONNECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCloudSaveConnection>;
    if (
      parsed.version !== 1
      || typeof parsed.code !== "string"
      || !isValidCloudSyncCode(parsed.code)
      || typeof parsed.remoteRevision !== "number"
      || !Number.isInteger(parsed.remoteRevision)
      || parsed.remoteRevision < 0
    ) return null;
    return {
      version: 1,
      code: normalizeCloudSyncCode(parsed.code),
      remoteRevision: parsed.remoteRevision,
      conflictRevision: typeof parsed.conflictRevision === "number"
        && Number.isInteger(parsed.conflictRevision)
        && parsed.conflictRevision >= 1
        ? parsed.conflictRevision
        : null,
      remoteUpdatedAt: typeof parsed.remoteUpdatedAt === "string" ? parsed.remoteUpdatedAt : null,
    };
  } catch {
    return null;
  }
}

function writeConnection(connection: StoredCloudSaveConnection): void {
  localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
  dispatchCloudStatus();
}

function removeConnection(): void {
  localStorage.removeItem(CONNECTION_STORAGE_KEY);
  dispatchCloudStatus();
}

function readDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing && /^[a-f0-9-]{16,80}$/i.test(existing)) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(DEVICE_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function dispatchCloudStatus(): void {
  window.dispatchEvent(new CustomEvent("khadijas-world:cloud-save-status", {
    detail: getCloudSaveStatus(),
  }));
}

export function getCloudSaveStatus(): CloudSaveStatus {
  const connection = readConnection();
  return connection
    ? {
        connected: true,
        code: connection.code,
        formattedCode: formatCloudSyncCode(connection.code),
        remoteRevision: connection.remoteRevision,
        conflict: connection.conflictRevision !== null,
        remoteUpdatedAt: connection.remoteUpdatedAt,
      }
    : {
        connected: false,
        code: null,
        formattedCode: null,
        remoteRevision: 0,
        conflict: false,
        remoteUpdatedAt: null,
      };
}

async function requestCloudSave(
  body: CloudSaveRequestBody,
): Promise<CloudSaveResponseBody | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(CLOUD_SAVE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (
      !response.ok
      && response.status !== 409
      && response.status !== 404
      && response.status !== 429
    ) return null;
    return await response.json() as CloudSaveResponseBody;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function authenticatedBody(
  operation: CloudSaveRequestBody["operation"],
  code: string,
): Promise<CloudSaveRequestBody> {
  const credentials = await deriveCredentials(code);
  return {
    operation,
    ...credentials,
    deviceId: readDeviceId(),
  };
}

function metadataFromResponse(response: CloudSaveResponseBody): CloudSaveMetadata | null {
  if (!response.ok || response.operation === "delete") return null;
  return isCloudSaveMetadata(response) ? response : null;
}

function updateConnectionFromMetadata(
  connection: StoredCloudSaveConnection,
  metadata: CloudSaveMetadata,
): void {
  writeConnection({
    ...connection,
    remoteRevision: metadata.revision,
    conflictRevision: null,
    remoteUpdatedAt: metadata.updatedAt,
  });
}

interface CloudSavePackageV1 {
  cloudPackageVersion: 1;
  world: unknown;
  avatar: AvatarCustomization;
}

function buildCloudSavePayload(): string {
  const world = JSON.parse(exportWorldSave()) as unknown;
  const payload: CloudSavePackageV1 = {
    cloudPackageVersion: 1,
    world,
    avatar: loadAvatarCustomization("khadija"),
  };
  return JSON.stringify(payload);
}

function parseCloudSavePayload(raw: string): {
  worldRaw: string;
  avatar?: AvatarCustomization;
} {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed
      && typeof parsed === "object"
      && (parsed as { cloudPackageVersion?: unknown }).cloudPackageVersion === 1
      && "world" in parsed
    ) {
      const payload = parsed as Partial<CloudSavePackageV1>;
      const worldRaw = JSON.stringify(payload.world);
      if (typeof worldRaw !== "string") return { worldRaw: raw };
      return {
        worldRaw,
        avatar: sanitizeAvatarCustomization(payload.avatar),
      };
    }
  } catch {
    // The normal import preview below reports malformed legacy payloads.
  }
  return { worldRaw: raw };
}

async function pushConnection(
  connection: StoredCloudSaveConnection,
  baseRevision: number,
): Promise<CloudSaveActionResult> {
  const raw = buildCloudSavePayload();
  const parsedPayload = parseCloudSavePayload(raw);
  const preview = previewWorldSaveImport(parsedPayload.worldRaw);
  if (!preview.accepted) return { ok: false, message: preview.message };

  let envelope: EncryptedWorldSaveEnvelope;
  try {
    envelope = await encryptWorldSave(raw, connection.code);
  } catch {
    return { ok: false, message: "This save could not be encrypted for cloud sync." };
  }

  const body = await authenticatedBody("push", connection.code);
  body.baseRevision = baseRevision;
  body.clientUpdatedAt = new Date().toISOString();
  body.envelope = envelope;
  const response = await requestCloudSave(body);

  if (!response) {
    return { ok: false, message: "Cloud save is unavailable. Local saving still works." };
  }
  if (!response.ok) {
    if (response.reason === "conflict") {
      const metadata = response.metadata;
      writeConnection({
        ...connection,
        conflictRevision: metadata?.revision ?? Math.max(1, baseRevision + 1),
        remoteUpdatedAt: metadata?.updatedAt ?? connection.remoteUpdatedAt,
      });
      return {
        ok: false,
        conflict: true,
        message: cloudSaveConflictMessage(metadata),
      };
    }
    if (response.reason === "rate-limited") {
      return { ok: false, message: "Cloud save is resting after several requests. Try again in a few minutes." };
    }
    return { ok: false, message: "Cloud save could not verify this sync code." };
  }

  const metadata = metadataFromResponse(response);
  if (!metadata) return { ok: false, message: "Cloud save returned an incomplete response." };
  updateConnectionFromMetadata(connection, metadata);
  return { ok: true, message: `Cloud save synced — revision ${metadata.revision}.` };
}

export async function createCloudSaveConnection(): Promise<CloudSaveActionResult> {
  if (!navigator.onLine) {
    return { ok: false, message: "Connect to the internet before creating a sync code." };
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const connection: StoredCloudSaveConnection = {
      version: 1,
      code: generateCloudSyncCode(),
      remoteRevision: 0,
      conflictRevision: null,
      remoteUpdatedAt: null,
    };
    const result = await pushConnection(connection, 0);
    if (result.ok) return {
      ...result,
      message: `Sync code created: ${formatCloudSyncCode(connection.code)}. Keep it somewhere safe.`,
    };
    if (!result.conflict) return result;
    removeConnection();
  }
  return { ok: false, message: "A unique sync code could not be created. Please try again." };
}

export async function syncCloudSaveNow(): Promise<CloudSaveActionResult> {
  const connection = readConnection();
  if (!connection) return { ok: false, message: "Create or enter a sync code first." };
  if (connection.conflictRevision !== null) {
    return {
      ok: false,
      conflict: true,
      message: cloudSaveConflictMessage(
        connection.remoteUpdatedAt
          ? {
              revision: connection.conflictRevision,
              updatedAt: connection.remoteUpdatedAt,
              clientUpdatedAt: null,
              lastDeviceId: readDeviceId(),
            }
          : undefined,
      ),
    };
  }
  return pushConnection(connection, connection.remoteRevision);
}

export async function replaceCloudSaveWithLocal(): Promise<CloudSaveActionResult> {
  const connection = readConnection();
  if (!connection) return { ok: false, message: "Create or enter a sync code first." };
  const baseRevision = connection.conflictRevision ?? connection.remoteRevision;
  return pushConnection(connection, baseRevision);
}

export async function prepareCloudSaveRestore(
  suppliedCode?: string,
): Promise<CloudSaveRestorePreview> {
  const stored = readConnection();
  const code = normalizeCloudSyncCode(suppliedCode ?? stored?.code ?? "");
  if (!isValidCloudSyncCode(code)) {
    return { ok: false, message: "Enter the complete five-part sync code." };
  }
  if (!navigator.onLine) {
    return { ok: false, message: "Connect to the internet before restoring a cloud save." };
  }

  const response = await requestCloudSave(await authenticatedBody("pull", code));
  if (!response) {
    return { ok: false, message: "Cloud save is unavailable. Your local world is unchanged." };
  }
  if (!response.ok) {
    if (response.reason === "not-found") {
      return { ok: false, message: "No cloud save matched that code." };
    }
    if (response.reason === "rate-limited") {
      return { ok: false, message: "Too many attempts. Wait a few minutes, then try again." };
    }
    return { ok: false, message: "That sync code could not be verified." };
  }
  if (response.operation !== "pull" || !isEncryptedWorldSaveEnvelope(response.envelope)) {
    return { ok: false, message: "The cloud save response was incomplete." };
  }

  try {
    const raw = await decryptWorldSave(response.envelope, code);
    const payload = parseCloudSavePayload(raw);
    const preview = previewWorldSaveImport(payload.worldRaw);
    if (!preview.accepted) {
      return { ok: false, message: `The cloud copy was not safe to restore: ${preview.message}` };
    }
    const metadata: CloudSaveMetadata = {
      revision: response.revision,
      updatedAt: response.updatedAt,
      clientUpdatedAt: response.clientUpdatedAt,
      lastDeviceId: response.lastDeviceId,
    };
    return {
      ok: true,
      message: `Cloud revision ${metadata.revision} is ready to restore.`,
      raw: payload.worldRaw,
      code,
      metadata,
      avatar: payload.avatar,
    };
  } catch {
    return { ok: false, message: "That code could not decrypt this cloud save." };
  }
}

export function applyCloudSaveRestore(
  preview: CloudSaveRestorePreview,
): CloudSaveActionResult {
  if (!preview.ok || !preview.raw || !preview.code || !preview.metadata) {
    return { ok: false, message: "No verified cloud save is ready to restore." };
  }
  const result = importWorldSave(preview.raw);
  if (!result.accepted) return { ok: false, message: result.message };
  if (preview.avatar) saveAvatarCustomization(preview.avatar, "khadija");
  writeConnection({
    version: 1,
    code: preview.code,
    remoteRevision: preview.metadata.revision,
    conflictRevision: null,
    remoteUpdatedAt: preview.metadata.updatedAt,
  });
  return { ok: true, message: "Cloud save restored. Reloading your world…" };
}

export async function refreshCloudSaveStatus(): Promise<CloudSaveActionResult> {
  const connection = readConnection();
  if (!connection) return { ok: true, message: "Cloud save is not connected." };
  if (!navigator.onLine) return { ok: false, message: "Offline — local saving is still active." };

  const response = await requestCloudSave(await authenticatedBody("status", connection.code));
  if (!response) return { ok: false, message: "Cloud save status is unavailable." };
  if (!response.ok) {
    if (response.reason === "not-found") {
      return { ok: false, message: "The cloud copy no longer exists. This device remains local." };
    }
    return { ok: false, message: "Cloud save status could not be checked." };
  }
  const metadata = metadataFromResponse(response);
  if (!metadata) return { ok: false, message: "Cloud save returned an incomplete status." };
  if (metadata.revision > connection.remoteRevision) {
    writeConnection({
      ...connection,
      conflictRevision: metadata.revision,
      remoteUpdatedAt: metadata.updatedAt,
    });
    return { ok: false, conflict: true, message: cloudSaveConflictMessage(metadata) };
  }
  updateConnectionFromMetadata(connection, metadata);
  return { ok: true, message: `Cloud save is current — revision ${metadata.revision}.` };
}

export function disconnectCloudSave(): CloudSaveActionResult {
  removeConnection();
  return { ok: true, message: "This device was disconnected. Its local save was kept." };
}

export async function deleteCloudSave(): Promise<CloudSaveActionResult> {
  const connection = readConnection();
  if (!connection) return { ok: false, message: "This device is not connected to a cloud save." };
  const response = await requestCloudSave(await authenticatedBody("delete", connection.code));
  if (!response) return { ok: false, message: "Cloud save could not be deleted. Nothing changed locally." };
  if (!response.ok && response.reason !== "not-found") {
    return { ok: false, message: "Cloud save could not be deleted." };
  }
  removeConnection();
  return { ok: true, message: "Cloud copy deleted. This device's local save was kept." };
}

export function startCloudSaveAutosync(): () => void {
  let timer = 0;
  let running = false;

  const schedule = (delay = AUTO_SYNC_DELAY_MS): void => {
    if (!readConnection() || !navigator.onLine) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      if (running) return;
      running = true;
      try {
        await syncCloudSaveNow();
      } finally {
        running = false;
      }
    }, delay);
  };

  const onLocalSave = (event: Event): void => {
    const saved = (event as CustomEvent<{ saved?: boolean }>).detail?.saved;
    if (saved) schedule();
  };
  const onOnline = (): void => schedule(1_000);

  window.addEventListener("khadijas-world:save-status", onLocalSave);
  window.addEventListener("online", onOnline);
  if (readConnection()) void refreshCloudSaveStatus();

  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("khadijas-world:save-status", onLocalSave);
    window.removeEventListener("online", onOnline);
  };
}
