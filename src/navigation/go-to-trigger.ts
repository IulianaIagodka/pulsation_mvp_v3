import type { Router } from "expo-router";

function isOnTrigger(pathname: string): boolean {
  return pathname === "/trigger" || pathname === "trigger";
}

function isReturnPath(pathname: string): boolean {
  return pathname === "/return" || pathname === "return";
}

/**
 * Land on a single trigger screen — avoids stacking duplicate `/trigger` routes
 * and avoids stopping on `/action` when popping from `/return`.
 */
export function goToTrigger(router: Router, pathname: string): void {
  if (isOnTrigger(pathname)) {
    return;
  }

  if (isReturnPath(pathname)) {
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
