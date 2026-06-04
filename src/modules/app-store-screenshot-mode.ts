/** QA: show full onboarding copy at once for App Store captures (simulator ⌘S). */
export function isAppStoreScreenshotMode(): boolean {
  return process.env.EXPO_PUBLIC_APP_STORE_SCREENSHOTS === "true";
}
