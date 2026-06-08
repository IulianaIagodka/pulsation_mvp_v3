/** Match expo-router pathname with or without a leading slash. */
export function matchesAppRoute(pathname: string, route: `/${string}`): boolean {
  const bare = route.slice(1);
  return pathname === route || pathname === bare;
}
