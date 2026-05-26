import { SafetyState } from "../../types/domain";

export function isSameLocalDay(leftTs: number, rightTs: number) {
  const left = new Date(leftTs);
  const right = new Date(rightTs);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function normalizeSafetyState(state: SafetyState, updatedAt?: number): SafetyState {
  if (!updatedAt) return state;
  if (isSameLocalDay(updatedAt, Date.now())) return state;
  return {
    ...state,
    interventionsToday: 0,
    dismissalStreak: 0,
  };
}
