import * as SQLite from "expo-sqlite";
import { schemaStatements } from "./schema";

const db = SQLite.openDatabaseSync("pulsation.db");

export function initializeDb() {
  schemaStatements.forEach((sql) => db.execSync(sql));
}

export function getDb() {
  return db;
}
