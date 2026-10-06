CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '5', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET
  value=excluded.value,
  updated_at=excluded.updated_at;
