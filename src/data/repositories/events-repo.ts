import { getDb } from "../db";
import { createId } from "./id";

export function logEvent(eventType: string, payload: Record<string, unknown>) {
  try {
    const id = createId();
    getDb().runSync(
      "INSERT INTO events (id, event_type, payload, created_at) VALUES (?, ?, ?, ?)",
      [id, eventType, JSON.stringify(payload), Date.now()],
    );
  } catch (error) {
    console.warn("[events-repo] Failed to persist event:", eventType, error);
  }
}

export function countEventsByType(eventType: string): number {
  try {
    const row = getDb().getFirstSync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM events WHERE event_type = ?",
      eventType,
    );
    return row?.total ?? 0;
  } catch (error) {
    console.warn("[events-repo] Failed to count events:", eventType, error);
    return 0;
  }
}
