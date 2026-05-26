import { InterventionType } from "../../types/domain";
import { getDb } from "../db";
import { createId } from "./id";

export function recordEffectiveness(
  interventionId: InterventionType,
  completed: boolean,
  score: number,
) {
  try {
    getDb().runSync(
      `INSERT INTO post_intervention_effectiveness
        (id, intervention_id, effectiveness_score, completed, created_at)
        VALUES (?, ?, ?, ?, ?)`,
      [createId(), interventionId, score, completed ? 1 : 0, Date.now()],
    );
  } catch (error) {
    console.warn("[effectiveness-repo] Failed to record effectiveness:", error);
  }
}
