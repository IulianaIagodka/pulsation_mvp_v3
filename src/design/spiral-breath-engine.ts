import { Animated, Easing } from "react-native";
import { breathingRhythm, getTriangleBreathIntroDelayMs } from "./animation-rhythm";

export type SpiralAnimationMode = "calm" | "triangle";

const scale = new Animated.Value(1);
const opacity = new Animated.Value(breathingRhythm.spiral.opacityExhale);

let runningAnimation: Animated.CompositeAnimation | null = null;
let triangleIntroTimer: ReturnType<typeof setTimeout> | null = null;
let requestedMode: SpiralAnimationMode = "calm";
let calmLoopActive = false;
let engineStarted = false;

function stopRunning() {
  runningAnimation?.stop();
  runningAnimation = null;
}

function clearTriangleIntroTimer() {
  if (triangleIntroTimer) {
    clearTimeout(triangleIntroTimer);
    triangleIntroTimer = null;
  }
}

function buildCalmLoop() {
  const {
    inhaleMs: calmInhaleMs,
    holdMs: calmHoldMs,
    exhaleMs: calmExhaleMs,
    postExhaleHoldMs,
    scaleExhale,
    scaleInhale,
    opacityExhale,
    opacityInhale,
  } = breathingRhythm.spiral;

  return Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleInhale,
          duration: calmInhaleMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityInhale,
          duration: calmInhaleMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleInhale,
          duration: calmHoldMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityInhale,
          duration: calmHoldMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleExhale,
          duration: calmExhaleMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityExhale,
          duration: calmExhaleMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleExhale,
          duration: postExhaleHoldMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityExhale,
          duration: postExhaleHoldMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ]),
  );
}

function buildTriangleBreathSequence() {
  const { inhaleMs, holdMs, exhaleMs, cycles } = breathingRhythm.triangleBreath;
  const { scaleExhale, scaleInhale, opacityExhale, opacityInhale } = breathingRhythm.spiral;

  const makeTriangleCycle = () =>
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleInhale,
          duration: inhaleMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityInhale,
          duration: inhaleMs,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(holdMs),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: scaleExhale,
          duration: exhaleMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: opacityExhale,
          duration: exhaleMs,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

  return Animated.sequence(Array.from({ length: cycles }, () => makeTriangleCycle()));
}

function startCalmLoop(force = false, options?: { preserveTriangleIntro?: boolean }) {
  if (!force && calmLoopActive && runningAnimation) {
    return;
  }

  if (!options?.preserveTriangleIntro) {
    clearTriangleIntroTimer();
  }
  stopRunning();
  calmLoopActive = false;

  scale.setValue(breathingRhythm.spiral.scaleExhale);
  opacity.setValue(breathingRhythm.spiral.opacityExhale);

  calmLoopActive = true;

  const loop = buildCalmLoop();
  runningAnimation = loop;
  loop.start();
}

function startTriangleMode() {
  clearTriangleIntroTimer();

  // Intro copy uses the same calm rhythm — do not restart the loop on entry.
  if (!calmLoopActive || !runningAnimation) {
    startCalmLoop(true, { preserveTriangleIntro: true });
  }

  const fullBreath = buildTriangleBreathSequence();

  triangleIntroTimer = setTimeout(() => {
    triangleIntroTimer = null;
    if (requestedMode !== "triangle") return;

    stopRunning();
    calmLoopActive = false;
    runningAnimation = fullBreath;
    fullBreath.start(({ finished }) => {
      if (!finished || requestedMode !== "triangle") return;
      calmLoopActive = false;
      runningAnimation = null;
      startCalmLoop();
    });
  }, getTriangleBreathIntroDelayMs());
}

/** Re-attach breath loop once the spiral view is mounted (native driver stops without a view). */
export function resumeCalmLoopAfterViewMount() {
  if (requestedMode === "calm") {
    startCalmLoop(true);
    return;
  }

  // Triangle intro still uses the calm loop until timed breath starts.
  if (triangleIntroTimer) {
    startCalmLoop(true, { preserveTriangleIntro: true });
  }
}

/** Keeps one shared breath loop across navigation and remounts. */
export function setSpiralAnimationMode(mode: SpiralAnimationMode) {
  if (mode === requestedMode) {
    return;
  }

  requestedMode = mode;

  if (mode === "calm") {
    startCalmLoop();
    return;
  }

  startTriangleMode();
}

export function ensureSpiralBreathEngineStarted() {
  if (engineStarted) {
    return;
  }
  engineStarted = true;
  requestedMode = "calm";
}

export function getSpiralBreathValues() {
  return { scale, opacity };
}
