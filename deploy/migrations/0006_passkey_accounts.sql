CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  learner TEXT NOT NULL UNIQUE,
  user_handle TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS passkeys (
  credential_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  public_key TEXT NOT NULL,
  algorithm INTEGER NOT NULL,
  sign_count INTEGER NOT NULL DEFAULT 0,
  transports TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);
CREATE INDEX IF NOT EXISTS passkeys_account ON passkeys(account_id, created_at);
CREATE TABLE IF NOT EXISTS passkey_challenges (
  challenge TEXT PRIMARY KEY,
  purpose TEXT NOT NULL,
  learner TEXT,
  user_handle TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS passkey_challenges_expiry ON passkey_challenges(expires_at);
CREATE TABLE IF NOT EXISTS account_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_sessions_account ON account_sessions(account_id, expires_at);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '6', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;
