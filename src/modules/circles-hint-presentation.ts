import { footerFaintLinkOpacity } from "../design/tokens";

export type CirclesHintPresentation = {
  shouldShow: boolean;
  delayMs: number;
  textOpacity: number;
};

/** Onboarding under-circles hint — always shown when registered. */
export function getCirclesHintPresentation(baseDelayMs: number): CirclesHintPresentation {
  return {
    shouldShow: true,
    delayMs: baseDelayMs,
    textOpacity: footerFaintLinkOpacity,
  };
}
