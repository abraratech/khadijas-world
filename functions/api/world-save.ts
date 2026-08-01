import {
  CLOUD_SAVE_MAX_ENVELOPE_CHARS,
  isEncryptedWorldSaveEnvelope,
  type CloudSaveMetadata,
  type CloudSaveRequestBody,
  type CloudSaveResponseBody,
  type EncryptedWorldSaveEnvelope,
} from "../../src/game/cloudSaveContract";

interface Env {
  WORLD_SAVE_DB: D1Database;
  NPC_CHAT_RATE_LIMIT?: KVNamespace;
}

interface WorldSaveRow {
  slot_id: string;
  access_hash: string;
  revision: number;
  encrypted_payload: string;
  client_updated_at: string | null;
  last_device_id: string;
  updated_at: string;
}

const MAX_BODY_BYTES = 1_550_000;
const MAX_REQUESTS = 40;
const RATE_LIMIT_WINDOW_SECONDS = 600;

function jsonResponse(body: CloudSaveResponseBody, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

function isCredential(value: unknown, minimum: number, maximum: number): value is string {
  return typeof value === "string"
    && value.length >= minimum
    && value.length <= maximum
    && /^[A-Za-z0-9_-]+$/.test(value);
}

function parseRequest(value: unknown): CloudSaveRequestBody | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (
    body.operation !== "status"
    && body.operation !== "pull"
    && body.operation !== "push"
    && body.operation !== "delete"
  ) return null;
  if (!isCredential(body.slotId, 40, 64)) return null;
  if (!isCredential(body.accessToken, 40, 64)) return null;
  if (!isCredential(body.deviceId, 16, 80)) return null;

  const parsed: CloudSaveRequestBody = {
    operation: body.operation,
    slotId: body.slotId,
    accessToken: body.accessToken,
    deviceId: body.deviceId,
  };

  if (body.operation === "push") {
    if (
      typeof body.baseRevision !== "number"
      || !Number.isInteger(body.baseRevision)
      || body.baseRevision < 0
      || body.baseRevision > 2_000_000_000
      || typeof body.clientUpdatedAt !== "string"
      || body.clientUpdatedAt.length < 20
      || body.clientUpdatedAt.length > 40
      || !isEncryptedWorldSaveEnvelope(body.envelope)
    ) return null;
    const envelopeText = JSON.stringify(body.envelope);
    if (envelopeText.length > CLOUD_SAVE_MAX_ENVELOPE_CHARS) return null;
    parsed.baseRevision = body.baseRevision;
    parsed.clientUpdatedAt = body.clientUpdatedAt;
    parsed.envelope = body.envelope;
  }

  return parsed;
}

function metadata(row: WorldSaveRow): CloudSaveMetadata {
  return {
    revision: row.revision,
    updatedAt: row.updated_at,
    clientUpdatedAt: row.client_updated_at,
    lastDeviceId: row.last_device_id,
  };
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const bytes = new Uint8Array(digest);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function allowedByRateLimit(
  kv: KVNamespace | undefined,
  body: CloudSaveRequestBody,
): Promise<boolean> {
  if (!kv) return true;
  const key = `world-save:${body.slotId.slice(0, 24)}:${body.deviceId}`;
  const current = await kv.get<{ count: number }>(key, "json");
  const count = current?.count ?? 0;
  if (count >= MAX_REQUESTS) return false;
  await kv.put(key, JSON.stringify({ count: count + 1 }), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

async function readRow(db: D1Database, slotId: string): Promise<WorldSaveRow | null> {
  return db.prepare(
    `SELECT slot_id, access_hash, revision, encrypted_payload,
      client_updated_at, last_device_id, updated_at
     FROM world_saves WHERE slot_id = ?1`,
  ).bind(slotId).first<WorldSaveRow>();
}

function parseEnvelope(row: WorldSaveRow): EncryptedWorldSaveEnvelope | null {
  try {
    const envelope = JSON.parse(row.encrypted_payload) as unknown;
    return isEncryptedWorldSaveEnvelope(envelope) ? envelope : null;
  } catch {
    return null;
  }
}

async function authenticatedRow(
  env: Env,
  body: CloudSaveRequestBody,
): Promise<WorldSaveRow | null> {
  const row = await readRow(env.WORLD_SAVE_DB, body.slotId);
  if (!row) return null;
  const accessHash = await sha256(body.accessToken);
  return constantTimeEqual(accessHash, row.access_hash) ? row : null;
}

async function pushSave(env: Env, body: CloudSaveRequestBody): Promise<Response> {
  const baseRevision = body.baseRevision ?? -1;
  const envelope = body.envelope;
  if (!envelope || !body.clientUpdatedAt) {
    return jsonResponse({ ok: false, reason: "invalid" }, 400);
  }
  const accessHash = await sha256(body.accessToken);
  const envelopeText = JSON.stringify(envelope);
  const envelopeBytes = new TextEncoder().encode(envelopeText).byteLength;
  const now = new Date().toISOString();
  const existing = await readRow(env.WORLD_SAVE_DB, body.slotId);

  if (!existing) {
    if (baseRevision !== 0) return jsonResponse({ ok: false, reason: "not-found" }, 404);
    try {
      await env.WORLD_SAVE_DB.prepare(
        `INSERT INTO world_saves (
          slot_id, access_hash, revision, encrypted_payload, payload_bytes,
          client_updated_at, last_device_id, created_at, updated_at
        ) VALUES (?1, ?2, 1, ?3, ?4, ?5, ?6, ?7, ?7)`,
      ).bind(
        body.slotId,
        accessHash,
        envelopeText,
        envelopeBytes,
        body.clientUpdatedAt,
        body.deviceId,
        now,
      ).run();
      return jsonResponse({
        ok: true,
        operation: "push",
        revision: 1,
        updatedAt: now,
        clientUpdatedAt: body.clientUpdatedAt,
        lastDeviceId: body.deviceId,
      });
    } catch {
      const raced = await readRow(env.WORLD_SAVE_DB, body.slotId);
      return jsonResponse({
        ok: false,
        reason: "conflict",
        metadata: raced ? metadata(raced) : undefined,
      }, 409);
    }
  }

  if (!constantTimeEqual(accessHash, existing.access_hash)) {
    return jsonResponse({ ok: false, reason: "not-found" }, 404);
  }
  if (existing.revision !== baseRevision) {
    return jsonResponse({ ok: false, reason: "conflict", metadata: metadata(existing) }, 409);
  }

  const nextRevision = existing.revision + 1;
  const result = await env.WORLD_SAVE_DB.prepare(
    `UPDATE world_saves
     SET revision = ?1, encrypted_payload = ?2, payload_bytes = ?3,
         client_updated_at = ?4, last_device_id = ?5, updated_at = ?6
     WHERE slot_id = ?7 AND access_hash = ?8 AND revision = ?9`,
  ).bind(
    nextRevision,
    envelopeText,
    envelopeBytes,
    body.clientUpdatedAt,
    body.deviceId,
    now,
    body.slotId,
    accessHash,
    existing.revision,
  ).run();

  if ((result.meta.changes ?? 0) !== 1) {
    const raced = await readRow(env.WORLD_SAVE_DB, body.slotId);
    return jsonResponse({
      ok: false,
      reason: "conflict",
      metadata: raced ? metadata(raced) : undefined,
    }, 409);
  }

  return jsonResponse({
    ok: true,
    operation: "push",
    revision: nextRevision,
    updatedAt: now,
    clientUpdatedAt: body.clientUpdatedAt,
    lastDeviceId: body.deviceId,
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.WORLD_SAVE_DB) {
    return jsonResponse({ ok: false, reason: "unavailable" }, 503);
  }
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ ok: false, reason: "invalid" }, 415);
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return jsonResponse({ ok: false, reason: "invalid" }, 400);
  }
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, reason: "invalid" }, 413);
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return jsonResponse({ ok: false, reason: "invalid" }, 400);
  }
  const body = parseRequest(value);
  if (!body) return jsonResponse({ ok: false, reason: "invalid" }, 400);
  if (!(await allowedByRateLimit(env.NPC_CHAT_RATE_LIMIT, body))) {
    return jsonResponse({ ok: false, reason: "rate-limited" }, 429);
  }

  if (body.operation === "push") return pushSave(env, body);

  const row = await authenticatedRow(env, body);
  if (!row) return jsonResponse({ ok: false, reason: "not-found" }, 404);

  if (body.operation === "status") {
    return jsonResponse({ ok: true, operation: "status", ...metadata(row) });
  }
  if (body.operation === "pull") {
    const envelope = parseEnvelope(row);
    if (!envelope) return jsonResponse({ ok: false, reason: "unavailable" }, 503);
    return jsonResponse({ ok: true, operation: "pull", envelope, ...metadata(row) });
  }

  await env.WORLD_SAVE_DB.prepare(
    "DELETE FROM world_saves WHERE slot_id = ?1 AND access_hash = ?2",
  ).bind(body.slotId, row.access_hash).run();
  return jsonResponse({ ok: true, operation: "delete" });
};

export const onRequestGet: PagesFunction<Env> = async () =>
  jsonResponse({ ok: false, reason: "invalid" }, 405);
