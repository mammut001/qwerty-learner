CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  state TEXT,
  revision INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS mutations (
  learner TEXT NOT NULL,
  id TEXT NOT NULL,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL,
  PRIMARY KEY (learner, id)
);
