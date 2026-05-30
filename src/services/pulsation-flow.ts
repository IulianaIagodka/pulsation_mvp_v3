import { initializeDb } from "../data/db";
import { recordEffectiveness } from "../data/repositories/effectiveness-repo";
import { logEvent } from "../data/repositories/events-repo";
import { getOutcomesProfile, saveOutcomesProfile } from "../data/repositories/outcomes-repo";
import {
  recordPulsationCompleted,
  recordPulsationIgnored,
} from "../data/repositories/scheduling-profile-repo";
import { getSafetyState, saveSafetyState } from "../data/repositories/safety-repo";
import { InterventionType } from "../types/domain";
import { collectSignal } from "../modules/signal-collector";
import { calculateEffectiveness } from "../modules/reflection-engine";
import { runTriggerEngine } from "../modules/trigger-engine";
import { updateMemory } from "../modules/memory-update";
import { getSchedulingExplanation } from "../modules/inactivity-trigger";

export function bootstrapPulsation() {
  try {
    initializeDb();
  } catch (error) {
    console.warn("[pulsation-flow] Failed to initialize DB:", error);
  }
}

export function decideIntervention(): InterventionType {
  try {
    bootstrapPulsation();
    const signal = collectSignal();
    logEvent("signal_collected", signal);
    const decision = runTriggerEngine(signal);
    logEvent("trigger_evaluated", {
      ...decision,
      scheduling: getSchedulingExplanation(),
    });
    return decision.selected ?? "feet_on_ground";
  } catch (error) {
    console.warn("[pulsation-flow] Failed to decide intervention:", error);
    return "feet_on_ground";
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
      interventionsToday: completed ? safety.interventionsToday + 1 : safety.interventionsToday,
      dismissalStreak: completed ? 0 : safety.dismissalStreak + 1,
      lastInterventionAt: completed ? now : safety.lastInterventionAt,
    });

    if (completed) {
      recordPulsationCompleted(intervention, now);
    } else {
      recordPulsationIgnored(now);
    }
  } catch (error) {
    console.warn("[pulsation-flow] Failed to register outcome:", error);
  }
}

export function registerPulsationDismissed() {
  try {
    const now = Date.now();
    recordPulsationIgnored(now);
    logEvent("pulsation_dismissed", { at: now });

    const safety = getSafetyState();
    saveSafetyState({
      ...safety,
      dismissalStreak: safety.dismissalStreak + 1,
    });
  } catch (error) {
    console.warn("[pulsation-flow] Failed to register dismissal:", error);
  }
}
