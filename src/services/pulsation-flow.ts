import { initializeDb } from "../data/db";
import { recordEffectiveness } from "../data/repositories/effectiveness-repo";
import { logEvent } from "../data/repositories/events-repo";
import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import { getSafetyState, saveSafetyState } from "../data/repositories/safety-repo";
import { InterventionType } from "../types/domain";
import { collectSignal } from "../modules/signal-collector";
import { calculateEffectiveness } from "../modules/reflection-engine";
import { runTriggerEngine } from "../modules/trigger-engine";
import { updateMemory } from "../modules/memory-update";
import {
  isTestRotateModeEnabled,
  pickNextRotatingIntervention,
} from "../modules/test-intervention-rotate";

export function bootstrapPulsation() {
  try {
    initializeDb();
  } catch (error) {
    console.warn("[pulsation-flow] Failed to initialize DB:", error);
  }
}

export function decideIntervention(): InterventionType | undefined {
  try {
    bootstrapPulsation();
    if (isTestRotateModeEnabled()) {
      const selected = pickNextRotatingIntervention();
      logEvent("trigger_evaluated", {
        shouldDeliver: true,
        selected,
        reason: "test_rotate",
      });
      return selected;
    }
    const signal = collectSignal();
    logEvent("signal_collected", signal);
    const decision = runTriggerEngine(signal);
    logEvent("trigger_evaluated", decision);
    return decision.shouldDeliver ? decision.selected : undefined;
  } catch (error) {
    console.warn("[pulsation-flow] Failed to decide intervention:", error);
    return undefined;
  }
}

export function registerInterventionOutcome(intervention: InterventionType, completed: boolean) {
  try {
    const now = Date.now();
    const score = calculateEffectiveness(completed, !completed);
    recordEffectiveness(intervention, completed, score);
    logEvent("intervention_outcome", { intervention, completed, score });

    const profile = getOutcomesProfile();
    const updated = updateMemory(profile, intervention, completed, now);
    saveOutcomesProfile(updated);

    const safety = getSafetyState();
    saveSafetyState({
      ...safety,
      interventionsToday: safety.interventionsToday + 1,
      dismissalStreak: completed ? 0 : safety.dismissalStreak + 1,
      lastInterventionAt: now,
    });
  } catch (error) {
    console.warn("[pulsation-flow] Failed to register outcome:", error);
  }
}
