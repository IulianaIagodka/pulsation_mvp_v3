import type { Router } from "expo-router";
import { matchesAppRoute } from "./route-path";

/**
 * Land on a single trigger screen — avoids stacking duplicate `/trigger` routes
 * and avoids stopping on `/action` when popping from `/return`.
 */
export function goToTrigger(router: Router, pathname: string): void {
  if (matchesAppRoute(pathname, "/trigger")) {
    return;
  }

  if (matchesAppRoute(pathname, "/return")) {
    try {
      if (router.canGoBack?.()) {
        router.back();
        return;
      }
    } catch (error) {
      console.warn("[navigation] back to trigger failed:", error);
    }
  }

  try {
    if (router.dismissTo) {
      router.dismissTo("/trigger");
      return;
    }
  } catch (error) {
    console.warn("[navigation] dismissTo trigger failed:", error);
  }

  try {
    if (router.canDismiss?.()) {
      router.dismissAll?.();
    }
  } catch (error) {
    console.warn("[navigation] dismissAll to trigger failed:", error);
  }

  try {
    router.replace("/trigger");
  } catch (error) {
    console.warn("[navigation] replace to trigger failed:", error);
  }
}
