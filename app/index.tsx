import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ExtendedOnboardingFlow } from "../src/design/components/ExtendedOnboardingFlow";
import { ShortOnboardingFlow } from "../src/design/components/ShortOnboardingFlow";
import { isAppStoreScreenshotMode } from "../src/modules/app-store-screenshot-mode";
import {
  clearLaunchOnboardingBackgroundFlag,
  resolveLaunchOnboardingKind,
} from "../src/services/launch-routing";

export default function OnboardingScreen() {
  const captureMode = isAppStoreScreenshotMode();
  const launchKind = captureMode ? "extended" : resolveLaunchOnboardingKind();

  useEffect(() => {
    if (launchKind === "skip") {
      clearLaunchOnboardingBackgroundFlag();
    }
  }, [launchKind]);

  if (launchKind === "skip") {
    return <Redirect href="/trigger" />;
  }

  if (launchKind === "extended") {
    return <ExtendedOnboardingFlow />;
  }

  return <ShortOnboardingFlow />;
}
