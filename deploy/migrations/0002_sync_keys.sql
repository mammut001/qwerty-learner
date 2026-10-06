CREATE TABLE IF NOT EXISTS sync_keys (
  key_hash TEXT PRIMARY KEY,
  learner TEXT NOT NULL,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sync_keys_learner_created ON sync_keys(learner, created);
