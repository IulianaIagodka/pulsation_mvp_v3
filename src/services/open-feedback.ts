import * as Linking from "expo-linking";

/** Public support inbox used by store pages and in-app feedback. */
export const SUPPORT_EMAIL = "support.pulsation@gmail.com";

export function buildFeedbackMailto(subject: string): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/** Opens the device mail client with a pre-filled Pulsation feedback draft. */
export async function openFeedbackMail(subject: string): Promise<void> {
  const url = buildFeedbackMailto(subject);
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn("[feedback] Failed to open mail client:", error);
  }
}
