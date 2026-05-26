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
