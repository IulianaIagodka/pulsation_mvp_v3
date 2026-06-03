import * as SQLite from "expo-sqlite";
import { schemaStatements } from "./schema";

const db = SQLite.openDatabaseSync("pulsation.db");

function ensureOutcomesProfileColumns() {
  const rows = db.getAllSync<{ name: string }>("PRAGMA table_info(outcomes_profile)");
  const existing = new Set(rows.map((row) => row.name));
  const missingColumnSql: Array<{ column: string; sql: string }> = [
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

  missingColumnSql.forEach(({ column, sql }) => {
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

export function initializeDb() {
  schemaStatements.forEach((sql) => db.execSync(sql));
  ensureOutcomesProfileColumns();
}

export function getDb() {
  return db;
}
