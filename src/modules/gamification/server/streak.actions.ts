"use server";

import { db } from "@/lib/db";
import { userProfile, streakHistory, dailySession, xpEvent } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, gte, desc } from "drizzle-orm";
import type { CEFRLevel } from "@/types";

const XP_PER_LEVEL: Record<CEFRLevel, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: 9999,
};

const REASON_LABELS: Record<string, string> = {
  exercise_complete: "Exercice complété",
  lesson_complete: "Leçon complétée",
  streak_bonus: "Bonus streak",
  badge_earned: "Badge obtenu",
  review_complete: "Révision complétée",
};

export async function getStreakData() {
  const session = await assertAuth();
  const uid = session.user.id;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const [profile, history, sessions, events] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),
    db.select().from(streakHistory)
      .where(and(eq(streakHistory.userId, uid), gte(streakHistory.date, thirtyDaysAgo)))
      .orderBy(streakHistory.date),
    db.select().from(dailySession)
      .where(and(eq(dailySession.userId, uid), gte(dailySession.date, thirtyDaysAgo)))
      .orderBy(dailySession.date),
    db.select().from(xpEvent)
      .where(eq(xpEvent.userId, uid))
      .orderBy(desc(xpEvent.createdAt))
      .limit(20),
  ]);

  const totalXp = profile?.totalXp ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const level = (profile?.level ?? "A0") as CEFRLevel;

  const xpForLevel = XP_PER_LEVEL[level];
  const xpInLevel = totalXp % xpForLevel;
  const levelProgressPct = Math.min(Math.round((xpInLevel / xpForLevel) * 100), 100);

  // Build last 30 days streak array
  const streakMap = new Map(history.map((h) => [h.date, h.completed]));
  const streakDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0];
    return { date, completed: streakMap.get(date) ?? false };
  });

  // Build last 30 days XP array
  const xpMap = new Map(sessions.map((s) => [s.date, s.xpEarned]));
  const xpDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0];
    return { date, xp: xpMap.get(date) ?? 0 };
  });

  // XP events with French labels
  const xpEvents = events.map((e) => ({
    id: e.id,
    amount: e.amount,
    reason: REASON_LABELS[e.reason] ?? e.reason,
    createdAt: e.createdAt.toISOString(),
  }));

  return {
    totalXp,
    currentStreak,
    longestStreak,
    level,
    xpForLevel,
    xpInLevel,
    levelProgressPct,
    streakDays,
    xpDays,
    xpEvents,
  };
}
