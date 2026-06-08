import { getCirclesHintPresentation } from "../modules/circles-hint-presentation";

describe("circles hint presentation", () => {
  it("shows onboarding hint with the requested delay", () => {
    const hint = getCirclesHintPresentation(2080);
    expect(hint.shouldShow).toBe(true);
    expect(hint.delayMs).toBe(2080);
    expect(hint.textOpacity).toBe(0.48);
  });
});
