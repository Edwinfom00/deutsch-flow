"use server";

import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import type { CEFRLevel, Sector, Goal } from "@/types";

export async function completeOnboarding(data: {
  level: CEFRLevel;
  goal: Goal;
  sector: Sector;
  dailyGoalMinutes: number;
}) {
  const session = await assertAuth();

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
    .where(eq(userProfile.userId, session.user.id));
}
