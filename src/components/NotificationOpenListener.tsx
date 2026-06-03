import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { usePathname, useRouter } from "expo-router";
import { goToTrigger } from "../navigation/go-to-trigger";

const STALE_NOTIFICATION_MS = 30_000;

function routeFromNotification(
  response: Notifications.NotificationResponse | null,
): string | undefined {
  const route = response?.notification.request.content.data?.route;
  return typeof route === "string" ? route : undefined;
}

function isFreshNotificationResponse(response: Notifications.NotificationResponse): boolean {
  const date = response.notification.date;
  if (typeof date !== "number") {
    return false;
  }
  return Date.now() - date <= STALE_NOTIFICATION_MS;
}

export function NotificationOpenListener() {
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const handledColdStartRef = useRef(false);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const openTrigger = () => {
      goToTrigger(router, pathnameRef.current);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = routeFromNotification(response);
      if (route === "/trigger") {
        openTrigger();
      }
    });

    // Only replay when the app was opened from a notification moments ago.
    // Stale cached responses were causing extra /trigger stacks and crashes on normal launch.
    if (!handledColdStartRef.current) {
      handledColdStartRef.current = true;
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response || !isFreshNotificationResponse(response)) {
          return;
        }
        const route = routeFromNotification(response);
        if (route === "/trigger") {
          openTrigger();
        }
      });
    }

    return () => subscription.remove();
  }, [router]);

  return null;
}
