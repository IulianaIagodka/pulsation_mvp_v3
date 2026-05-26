export function calculateEffectiveness(completed: boolean, dismissed: boolean) {
  if (completed) return 0.85;
  if (dismissed) return 0.25;
  return 0.5;
}
