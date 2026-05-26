import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

function routeFromNotification(
  response: Notifications.NotificationResponse | null,
): string | undefined {
  const route = response?.notification.request.content.data?.route;
  return typeof route === "string" ? route : undefined;
}

export function NotificationOpenListener() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = routeFromNotification(response);
      if (route) router.push(route as "/trigger");
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      const route = routeFromNotification(response);
      if (route) router.push(route as "/trigger");
    });

    return () => subscription.remove();
  }, [router]);

  return null;
}
