CREATE TABLE IF NOT EXISTS error_book (
  learner TEXT NOT NULL,
  item_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_id TEXT NOT NULL,
  label TEXT NOT NULL,
  context TEXT NOT NULL,
  error_count INTEGER NOT NULL,
  correct_streak INTEGER NOT NULL,
  mastered INTEGER NOT NULL DEFAULT 0,
  first_wrong_at INTEGER,
  last_wrong_at INTEGER,
  last_attempt_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (learner, item_id)
);
CREATE INDEX IF NOT EXISTS error_book_lookup
  ON error_book(learner, mastered, kind, last_wrong_at DESC);

CREATE TABLE IF NOT EXISTS checkins (
  learner TEXT NOT NULL,
  day TEXT NOT NULL,
  status TEXT NOT NULL,
  completed_at INTEGER NOT NULL,
  source TEXT NOT NULL,
  PRIMARY KEY (learner, day)
);
CREATE INDEX IF NOT EXISTS checkins_day ON checkins(learner, day DESC);

CREATE TABLE IF NOT EXISTS achievements (
  learner TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  payload TEXT NOT NULL,
  PRIMARY KEY (learner, achievement_id)
);

CREATE TABLE IF NOT EXISTS weekly_reports (
  learner TEXT NOT NULL,
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  payload TEXT NOT NULL,
  generated_at INTEGER NOT NULL,
  finalized INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (learner, week_start)
);
CREATE INDEX IF NOT EXISTS weekly_reports_history
  ON weekly_reports(learner, week_start DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  scope TEXT NOT NULL,
  action TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL,
  blocked_until INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (scope, action)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  learner TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  actor_hash TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_log_learner_created
  ON audit_log(learner, created_at DESC);
