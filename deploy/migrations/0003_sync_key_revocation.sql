ALTER TABLE sync_keys ADD COLUMN revoked INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS sync_keys_learner_revoked_created
  ON sync_keys(learner, revoked, created);
