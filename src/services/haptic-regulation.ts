import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { breathingRhythm } from "../design/animation-rhythm";

const hapticsAvailable = Platform.OS === "ios" || Platform.OS === "android";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function softImpact() {
  if (!hapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch {
    // Haptics unavailable on this device / simulator.
  }
}

async function lightImpact() {
  if (!hapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

async function mediumImpact() {
  if (!hapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // ignore
  }
}

async function subtleSelection() {
  if (!hapticsAvailable) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore
  }
}

/** Distant heartbeat — one soft double-pulse when trigger appears. */
export function playTriggerHaptic() {
  void (async () => {
    await softImpact();
    await delay(160);
    await subtleSelection();
  })();
}

/** Grounding arrival — slightly warmer than trigger. */
export function playReturnHaptic() {
  void (async () => {
    await lightImpact();
    await delay(120);
    await mediumImpact();
  })();
}

/** Subtle confirmation for secondary button taps. */
export function playKeepForMeHaptic() {
  void subtleSelection();
}

/** Light ack when the user taps the spiral button. */
export function playSpiralTapHaptic() {
  void softImpact();
}

/**
 * Triangle breath haptics: one pulse on inhale start and one on exhale start.
 * Returns stop() to cancel between screens.
 */
export function startTriangleBreathHapticLoop(): () => void {
  let cancelled = false;
  const timeouts = new Set<ReturnType<typeof setTimeout>>();

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      const id = setTimeout(() => {
        timeouts.delete(id);
        resolve();
      }, ms);
      timeouts.add(id);
    });

  const runCycle = async () => {
    const { cycles, inhaleMs, holdMs, exhaleMs } = breathingRhythm.triangleBreath;
    for (let cycle = 0; cycle < cycles && !cancelled; cycle += 1) {
      await softImpact();
      if (cancelled) return;

      await wait(inhaleMs);
      if (cancelled) return;

      await wait(holdMs);
      if (cancelled) return;

      await lightImpact();
      if (cancelled) return;

      await wait(exhaleMs);
    }
  };

  void runCycle();

  return () => {
    cancelled = true;
    timeouts.forEach((id) => clearTimeout(id));
    timeouts.clear();
  };
}

export const __hapticRegulationInternals = {
  delay,
  hapticsAvailable,
};
