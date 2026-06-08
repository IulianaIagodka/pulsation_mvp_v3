import { InterventionType, SchedulingProfile } from "../../types/domain";
import { getDb } from "../db";

const primaryId = "primary";

function getInitialSchedulingProfile(): SchedulingProfile {
  return {
    consecutiveIgnored: 0,
    totalCompleted: 0,
    completionsByType: {},
    completionsByHour: {},
  };
}

function safeParseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getSchedulingProfile(): SchedulingProfile {
  try {
    const row = getDb().getFirstSync<any>(
      "SELECT * FROM scheduling_profile WHERE id = ?",
      primaryId,
    );
    if (!row) {
      const initial = getInitialSchedulingProfile();
      saveSchedulingProfile(initial);
      return initial;
    }
    return {
      lastAppOpenAt: row.last_app_open_at ?? undefined,
      lastBackgroundAt: row.last_background_at ?? undefined,
      lastCompletedAt: row.last_completed_at ?? undefined,
      consecutiveIgnored: row.consecutive_ignored ?? 0,
      totalCompleted: row.total_completed ?? 0,
      completionsByType: safeParseJson(row.completions_by_type, {}),
      completionsByHour: safeParseJson(row.completions_by_hour, {}),
      lastScheduledIntervalMinutes: row.last_scheduled_interval_minutes ?? undefined,
      tapHintRevealedAtCycle:
        row.tap_hint_revealed_at_cycle != null ? Number(row.tap_hint_revealed_at_cycle) : undefined,
    };
  } catch (error) {
    console.warn("[scheduling-profile-repo] Failed to read scheduling profile:", error);
    return getInitialSchedulingProfile();
  }
}

export function saveSchedulingProfile(profile: SchedulingProfile) {
  try {
    getDb().runSync(
      `INSERT OR REPLACE INTO scheduling_profile (
        id, last_app_open_at, last_background_at, last_completed_at, consecutive_ignored, total_completed,
        completions_by_type, completions_by_hour, last_scheduled_interval_minutes, tap_hint_revealed_at_cycle,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primaryId,
        profile.lastAppOpenAt ?? null,
        profile.lastBackgroundAt ?? null,
        profile.lastCompletedAt ?? null,
        profile.consecutiveIgnored,
        profile.totalCompleted,
        JSON.stringify(profile.completionsByType),
        JSON.stringify(profile.completionsByHour),
        profile.lastScheduledIntervalMinutes ?? null,
        profile.tapHintRevealedAtCycle ?? null,
        Date.now(),
      ],
    );
  } catch (error) {
    console.warn("[scheduling-profile-repo] Failed to save scheduling profile:", error);
  }
}

export function recordAppOpen(at: number) {
  const profile = getSchedulingProfile();
  saveSchedulingProfile({ ...profile, lastAppOpenAt: at });
}

export function recordAppBackgrounded(at: number) {
  const profile = getSchedulingProfile();
  saveSchedulingProfile({ ...profile, lastBackgroundAt: at });
}

export function clearAppBackgrounded() {
  const profile = getSchedulingProfile();
  if (profile.lastBackgroundAt == null) return;
  saveSchedulingProfile({ ...profile, lastBackgroundAt: undefined });
}

export function recordPulsationCompleted(intervention: InterventionType, at: number) {
  const profile = getSchedulingProfile();
  const hour = new Date(at).getHours();
  saveSchedulingProfile({
    ...profile,
    lastCompletedAt: at,
    consecutiveIgnored: 0,
    totalCompleted: profile.totalCompleted + 1,
    completionsByType: {
      ...profile.completionsByType,
      [intervention]: (profile.completionsByType[intervention] ?? 0) + 1,
    },
    completionsByHour: {
      ...profile.completionsByHour,
      [hour]: (profile.completionsByHour[hour] ?? 0) + 1,
    },
  });
}

export function recordPulsationIgnored(at: number) {
  const profile = getSchedulingProfile();
  saveSchedulingProfile({
    ...profile,
    consecutiveIgnored: profile.consecutiveIgnored + 1,
    lastAppOpenAt: at,
  });
}

export function recordScheduledInterval(minutes: number) {
  const profile = getSchedulingProfile();
  saveSchedulingProfile({ ...profile, lastScheduledIntervalMinutes: minutes });
}

/** First time tap hint finishes fading in — anchor the 2-cycle grace window. */
export function recordTapHintRevealedAtCycle(anchorCycle?: number) {
  const profile = getSchedulingProfile();
  if (profile.tapHintRevealedAtCycle != null) return;
  saveSchedulingProfile({
    ...profile,
    tapHintRevealedAtCycle: anchorCycle ?? profile.totalCompleted,
  });
}
