CREATE TABLE IF NOT EXISTS world_saves (
  slot_id TEXT PRIMARY KEY NOT NULL,
  access_hash TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  encrypted_payload TEXT NOT NULL,
  payload_bytes INTEGER NOT NULL CHECK (payload_bytes > 0 AND payload_bytes <= 1450000),
  client_updated_at TEXT,
  last_device_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS world_saves_updated_at_idx
  ON world_saves(updated_at);
