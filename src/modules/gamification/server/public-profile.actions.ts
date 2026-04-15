"use server";

import { db } from "@/lib/db";
import {
  userProfile,
  userBadge,
  badge,
  dailySession,
  streakHistory,
  user,
} from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, gte, desc } from "drizzle-orm";
import type { CEFRLevel } from "@/types";

const XP_PER_LEVEL: Record<CEFRLevel, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: 9999,
};

export async function getPublicProfile(targetUserId: string) {
  await assertAuth();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const [targetUser, profile, earnedBadges, sessions, history] =
    await Promise.all([
      db.query.user.findFirst({ where: eq(user.id, targetUserId) }),
      db.query.userProfile.findFirst({
        where: eq(userProfile.userId, targetUserId),
      }),
      db
        .select({
          badgeId: userBadge.badgeId,
          earnedAt: userBadge.earnedAt,
          name: badge.nameFr,
          description: badge.descriptionFr,
          icon: badge.icon,
          category: badge.category,
          xpBonus: badge.xpBonus,
        })
        .from(userBadge)
        .innerJoin(badge, eq(userBadge.badgeId, badge.id))
        .where(eq(userBadge.userId, targetUserId))
        .orderBy(desc(userBadge.earnedAt)),
      db
        .select()
        .from(dailySession)
        .where(
          and(
            eq(dailySession.userId, targetUserId),
            gte(dailySession.date, thirtyDaysAgo)
          )
        )
        .orderBy(dailySession.date),
      db
        .select()
        .from(streakHistory)
        .where(
          and(
            eq(streakHistory.userId, targetUserId),
            gte(streakHistory.date, thirtyDaysAgo)
          )
        )
        .orderBy(streakHistory.date),
    ]);

  if (!profile || !targetUser) return null;

  const level = (profile.level ?? "A0") as CEFRLevel;
  const totalXp = profile.totalXp ?? 0;
  const xpForLevel = XP_PER_LEVEL[level];
  const xpInLevel = totalXp % xpForLevel;
  const levelProgressPct = Math.min(
    Math.round((xpInLevel / xpForLevel) * 100),
    100
  );

  const xpMap = new Map(sessions.map((s) => [s.date, s.xpEarned]));
  const streakMap = new Map(history.map((h) => [h.date, h.completed]));

  const activityDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000)
      .toISOString()
      .split("T")[0];
    return {
      date,
      xp: xpMap.get(date) ?? 0,
      active: streakMap.get(date) ?? false,
    };
  });

  const xp30d = sessions.reduce((s, d) => s + d.xpEarned, 0);
  const activeDays30d = activityDays.filter((d) => d.active).length;
  const maxDayXp = Math.max(...activityDays.map((d) => d.xp), 1);

  return {
    userId: targetUserId,
    name: targetUser.name,
    level,
    totalXp,
    xpForLevel,
    xpInLevel,
    levelProgressPct,
    currentStreak: profile.currentStreak ?? 0,
    longestStreak: profile.longestStreak ?? 0,
    xp30d,
    activeDays30d,
    maxDayXp,
    badges: earnedBadges,
    activityDays,
  };
}

export type PublicProfile = NonNullable<
  Awaited<ReturnType<typeof getPublicProfile>>
>;
