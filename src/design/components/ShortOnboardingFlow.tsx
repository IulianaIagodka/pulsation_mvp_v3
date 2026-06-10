import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { AnchoredCirclesScreen } from "./AnchoredCirclesScreen";
import { AboutFooterLink } from "./AboutFooterLink";
import { ExplanationText } from "./ExplanationText";
import { breathingRhythm, copyReveal } from "../animation-rhythm";
import { armFlowScreenEntryDelay } from "../flow-screen-transition";
import { uiCopy } from "../../modules/delivery-layer";
import { useRegisterCirclesPress } from "../../hooks/use-register-circles-press";

const EXIT_FADE_MS = breathingRhythm.motion.screenFadeMs;

/** Cold-start headline — “Pulsation exists…” + About; circles tap continues to trigger. */
export function ShortOnboardingFlow() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const onCirclesPress = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
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
