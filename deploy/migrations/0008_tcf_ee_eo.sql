CREATE TABLE IF NOT EXISTS tcf_ee_drafts (
  learner TEXT NOT NULL PRIMARY KEY,
  draft_id TEXT NOT NULL,
  task1_id TEXT NOT NULL,
  task1_response TEXT NOT NULL DEFAULT '',
  task2_id TEXT NOT NULL,
  task2_response TEXT NOT NULL DEFAULT '',
  task3_id TEXT NOT NULL,
  task3_response TEXT NOT NULL DEFAULT '',
  remaining_seconds INTEGER NOT NULL CHECK (remaining_seconds >= 0 AND remaining_seconds <= 3600),
  current_task INTEGER NOT NULL DEFAULT 0 CHECK (current_task >= 0 AND current_task <= 2),
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tcf_ee_attempts (
  learner TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  task1_id TEXT NOT NULL,
  task1_response TEXT NOT NULL,
  task2_id TEXT NOT NULL,
  task2_response TEXT NOT NULL,
  task3_id TEXT NOT NULL,
  task3_response TEXT NOT NULL,
  word_counts TEXT NOT NULL,
  scores TEXT NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 20),
  nclc INTEGER NOT NULL CHECK (nclc >= 0 AND nclc <= 10),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (learner, attempt_id)
);
CREATE INDEX IF NOT EXISTS tcf_ee_attempts_history
  ON tcf_ee_attempts(learner, finished_at DESC);

CREATE TABLE IF NOT EXISTS tcf_eo_attempts (
  learner TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  task1_id TEXT NOT NULL,
  task1_duration INTEGER NOT NULL DEFAULT 0,
  task2_id TEXT NOT NULL,
  task2_duration INTEGER NOT NULL DEFAULT 0,
  task3_id TEXT NOT NULL,
  task3_duration INTEGER NOT NULL DEFAULT 0,
  recordings_meta TEXT NOT NULL,
  scores TEXT NOT NULL,
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 20),
  nclc INTEGER NOT NULL CHECK (nclc >= 0 AND nclc <= 10),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  PRIMARY KEY (learner, attempt_id)
);
CREATE INDEX IF NOT EXISTS tcf_eo_attempts_history
  ON tcf_eo_attempts(learner, finished_at DESC);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '8', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;
