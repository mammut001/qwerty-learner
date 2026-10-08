CREATE TABLE IF NOT EXISTS cohorts (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  join_code_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS cohorts_created ON cohorts(created_at DESC);

CREATE TABLE IF NOT EXISTS learner_cohorts (
  learner TEXT NOT NULL PRIMARY KEY,
  cohort_id TEXT NOT NULL,
  joined_at INTEGER NOT NULL,
  FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
);

CREATE INDEX IF NOT EXISTS learner_cohorts_cohort ON learner_cohorts(cohort_id, joined_at DESC);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '9', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET
  value=excluded.value,
  updated_at=excluded.updated_at;
