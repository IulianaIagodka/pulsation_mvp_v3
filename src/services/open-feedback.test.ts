jest.mock("expo-linking", () => ({
  openURL: jest.fn(async () => undefined),
}));

import * as Linking from "expo-linking";
import { buildFeedbackMailto, openFeedbackMail, SUPPORT_EMAIL } from "./open-feedback";

describe("open-feedback", () => {
  it("builds a mailto URL with the support inbox and encoded subject", () => {
    expect(SUPPORT_EMAIL).toBe("support.pulsation@gmail.com");
    expect(buildFeedbackMailto("Pulsation feedback")).toBe(
      "mailto:support.pulsation@gmail.com?subject=Pulsation%20feedback",
    );
    expect(buildFeedbackMailto("Відгук щодо Pulsation")).toBe(
      `mailto:support.pulsation@gmail.com?subject=${encodeURIComponent("Відгук щодо Pulsation")}`,
    );
  });

  it("opens the mail client with the feedback draft", async () => {
    await openFeedbackMail("Pulsation feedback");
    expect(Linking.openURL).toHaveBeenCalledWith(
      "mailto:support.pulsation@gmail.com?subject=Pulsation%20feedback",
    );
  });
});
