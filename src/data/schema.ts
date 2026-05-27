export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS intervention (
    id TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS post_intervention_effectiveness (
    id TEXT PRIMARY KEY NOT NULL,
    intervention_id TEXT NOT NULL,
    effectiveness_score REAL NOT NULL,
    completed INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS safety_state (
    id TEXT PRIMARY KEY NOT NULL,
    quiet_hours_start INTEGER NOT NULL,
    quiet_hours_end INTEGER NOT NULL,
    daily_cap INTEGER NOT NULL,
    cooldown_minutes INTEGER NOT NULL,
    interventions_today INTEGER NOT NULL,
    last_intervention_at INTEGER,
    dismissal_streak INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS outcomes_profile (
    id TEXT PRIMARY KEY NOT NULL,
    preferred_by_hour TEXT NOT NULL,
    completion_rates TEXT NOT NULL,
    recent_interventions TEXT NOT NULL,
    last_find_three_variant INTEGER,
    updated_at INTEGER NOT NULL
  );`,
] as const;
