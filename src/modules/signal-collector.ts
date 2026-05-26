import { UserSignal } from "../types/domain";
import { getActiveSessionMinutes } from "./session-runtime";

function parseOptionalEnvMinutes(raw: string | undefined): number | undefined {
  if (raw == null || String(raw).trim() === "") return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, n);
}

export function collectSignal(): UserSignal {
  const overrideMinutes = parseOptionalEnvMinutes(process.env.EXPO_PUBLIC_SIMULATED_DISTRACT_MINUTES);
  const activeSessionMinutes = getActiveSessionMinutes();
  const distractingSessionMinutes =
    overrideMinutes !== undefined ? overrideMinutes : Math.max(20, activeSessionMinutes);
  const rawCategory = (process.env.EXPO_PUBLIC_SIMULATED_APP_CATEGORY ?? "other").toLowerCase();
  const appCategory: UserSignal["appCategory"] =
    rawCategory === "social" || rawCategory === "video" || rawCategory === "news"
      ? rawCategory
      : "other";

  return {
    timestamp: Date.now(),
    distractingSessionMinutes,
    appCategory,
  };
}
