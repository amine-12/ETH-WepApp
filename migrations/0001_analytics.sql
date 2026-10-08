CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  module_id TEXT NOT NULL DEFAULT '',
  section_id TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS analytics_created_at ON analytics_events(created_at);
