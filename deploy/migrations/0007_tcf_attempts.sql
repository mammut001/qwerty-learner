CREATE TABLE IF NOT EXISTS tcf_attempts (
  learner TEXT NOT NULL,
  attempt_id TEXT NOT NULL,
  skill TEXT NOT NULL CHECK (skill IN ('listening','reading')),
  question_count INTEGER NOT NULL CHECK (question_count = 39),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= question_count),
  scaled_score INTEGER NOT NULL CHECK (scaled_score >= 0 AND scaled_score <= 699),
  nclc INTEGER NOT NULL CHECK (nclc >= 0 AND nclc <= 10),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds >= 0 AND duration_seconds <= 3600),
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  answers TEXT NOT NULL,
  PRIMARY KEY (learner, attempt_id)
);
CREATE INDEX IF NOT EXISTS tcf_attempts_history
  ON tcf_attempts(learner, skill, finished_at DESC);

INSERT INTO schema_meta(key, value, updated_at)
VALUES('schema_version', '7', CAST(strftime('%s','now') AS INTEGER) * 1000)
ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at;
