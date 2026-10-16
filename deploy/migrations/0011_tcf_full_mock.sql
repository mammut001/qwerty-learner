CREATE TABLE IF NOT EXISTS tcf_full_mock_sessions (
  learner TEXT NOT NULL PRIMARY KEY,
  revision INTEGER NOT NULL CHECK (revision >= 0),
  payload TEXT NOT NULL CHECK (length(payload) <= 65000),
  updated_at INTEGER NOT NULL
);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '11', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;
