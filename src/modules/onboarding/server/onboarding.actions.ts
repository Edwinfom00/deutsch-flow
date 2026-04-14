"use server";

import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector, Goal } from "@/types";

export async function completeOnboarding(data: {
  level: CEFRLevel;
  goal: Goal;
  sector: Sector;
  dailyGoalMinutes: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  const existing = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  if (existing) {
    await db
      .update(userProfile)
      .set({
        level: data.level,
        goal: data.goal,
        sector: data.sector,
        dailyGoalMinutes: data.dailyGoalMinutes,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, uid));
  } else {
    // Utilisateur Google (pas de profil pré-créé)
    await db.insert(userProfile).values({
      id: nanoid(),
      userId: uid,
      level: data.level,
      goal: data.goal,
      sector: data.sector,
      dailyGoalMinutes: data.dailyGoalMinutes,
      totalXp: 0,
      currentStreak: 0,
      longestStreak: 0,
      onboardingCompleted: true,
    });
  }
}
