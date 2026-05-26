export function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}
