import * as SQLite from "expo-sqlite";
import { schemaStatements } from "./schema";

let db = SQLite.openDatabaseSync("pulsation.db");

const OUTCOMES_OPTIONAL_COLUMNS: Array<{ column: string; sql: string }> = [
  {
    column: "last_find_three_variant",
    sql: "ALTER TABLE outcomes_profile ADD COLUMN last_find_three_variant INTEGER",
  },
  {
    column: "onboarding_completed",
    sql: "ALTER TABLE outcomes_profile ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0",
  },
  {
    column: "extended_onboarding_completed",
    sql: "ALTER TABLE outcomes_profile ADD COLUMN extended_onboarding_completed INTEGER NOT NULL DEFAULT 0",
  },
  {
    column: "preference_scores",
    sql: "ALTER TABLE outcomes_profile ADD COLUMN preference_scores TEXT NOT NULL DEFAULT '{}'",
  },
  {
    column: "kept_interventions",
    sql: "ALTER TABLE outcomes_profile ADD COLUMN kept_interventions TEXT NOT NULL DEFAULT '[]'",
  },
];

const SCHEDULING_OPTIONAL_COLUMNS: Array<{ column: string; sql: string }> = [
  {
    column: "last_background_at",
    sql: "ALTER TABLE scheduling_profile ADD COLUMN last_background_at INTEGER",
  },
];

function ensureSchedulingProfileColumns() {
  const rows = db.getAllSync<{ name: string }>("PRAGMA table_info(scheduling_profile)");
  const existing = new Set(rows.map((row) => row.name));

  SCHEDULING_OPTIONAL_COLUMNS.forEach(({ column, sql }) => {
    if (existing.has(column)) {
      return;
    }
    try {
      db.execSync(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("duplicate column")) {
        return;
      }
      console.warn(`[db] Failed to add scheduling_profile.${column}:`, error);
    }
  });
}

function ensureOutcomesProfileColumns() {
  const rows = db.getAllSync<{ name: string }>("PRAGMA table_info(outcomes_profile)");
  const existing = new Set(rows.map((row) => row.name));

  OUTCOMES_OPTIONAL_COLUMNS.forEach(({ column, sql }) => {
    if (existing.has(column)) {
      return;
    }
    try {
      db.execSync(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("duplicate column")) {
        return;
      }
      console.warn(`[db] Failed to add outcomes_profile.${column}:`, error);
    }
  });
}

function applySchema() {
  schemaStatements.forEach((sql) => db.execSync(sql));
  ensureOutcomesProfileColumns();
  ensureSchedulingProfileColumns();
}

function resetLocalDatabase() {
  const tables = [
    "events",
    "intervention",
    "post_intervention_effectiveness",
    "safety_state",
    "outcomes_profile",
    "scheduling_profile",
  ] as const;

  tables.forEach((table) => {
    try {
      db.execSync(`DROP TABLE IF EXISTS ${table}`);
    } catch (error) {
      console.warn(`[db] Failed to drop ${table}:`, error);
    }
  });

  applySchema();
}

export function initializeDb() {
  try {
    applySchema();
  } catch (error) {
    console.warn("[db] initialize failed, resetting local tables:", error);
    try {
      resetLocalDatabase();
    } catch (resetError) {
      console.warn("[db] reset failed:", resetError);
    }
  }
}

export function getDb() {
  return db;
}
