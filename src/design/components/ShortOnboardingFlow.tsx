import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { ExplanationText } from "./ExplanationText";
import { breathingRhythm, copyReveal, getOnboardingCirclesHintDelayMs } from "../animation-rhythm";
import { armFlowScreenEntryDelay } from "../flow-screen-transition";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesHint } from "../../hooks/use-register-circles-hint";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";
import { useCirclesHintPresentation } from "../../hooks/use-circles-hint-presentation";

const EXIT_FADE_MS = breathingRhythm.motion.screenFadeMs;
const ONBOARDING_HINT_DELAY_MS = getOnboardingCirclesHintDelayMs(0);

/** Cold-start headline — “Pulsation exists…” + About; circles tap continues to trigger. */
export function ShortOnboardingFlow() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const [hintFadingOut, setHintFadingOut] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const circlesHintPresentation = useCirclesHintPresentation(ONBOARDING_HINT_DELAY_MS);
  const hintRegistration = useMemo(
    () => ({
      presentation: { ...circlesHintPresentation, shouldShow: true },
      visible: true,
      delayMs: ONBOARDING_HINT_DELAY_MS,
      fadeMs: copyReveal.fadeMs,
      label: uiCopy.onboardingCirclesHint,
      holdAfterReveal: true,
      fadeOutDelayMs: hintFadingOut ? 0 : undefined,
    }),
    [circlesHintPresentation, hintFadingOut],
  );
  useRegisterCirclesHint(hintRegistration);

  const onCirclesPress = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    setHintFadingOut(true);
    armFlowScreenEntryDelay(EXIT_FADE_MS);
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: EXIT_FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      router.replace("/trigger");
    }, copyReveal.fadeMs);
  }, [contentOpacity, isExiting, router]);
  useRegisterCirclesPress(onCirclesPress);

  return (
    <Animated.View style={[styles.root, { opacity: contentOpacity }]}>
      <AnchoredCirclesScreen
        footer={<AboutFooterLink label={uiCopy.aboutLink} onPress={() => router.push("/about")} />}
        pinMainLikeTrigger
        mainLine={
          <ExplanationText variant="main" holdAfterReveal>
            {uiCopy.onboardingLine}
          </ExplanationText>
        }
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
