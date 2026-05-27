import * as SQLite from "expo-sqlite";
import { schemaStatements } from "./schema";

const db = SQLite.openDatabaseSync("pulsation.db");

export function initializeDb() {
  schemaStatements.forEach((sql) => db.execSync(sql));
  try {
    db.execSync("ALTER TABLE outcomes_profile ADD COLUMN last_find_three_variant INTEGER");
  } catch {
    // column already present
  }
}

export function getDb() {
  return db;
}
