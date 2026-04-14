"use server";

import { db } from "@/lib/db";
import { userProfile, user } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import type { CEFRLevel, Sector, Goal } from "@/types";

export async function getProfileSettings() {
  const session = await assertAuth();
  const uid = session.user.id;

  const [profile, userData] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),
    db.query.user.findFirst({ where: eq(user.id, uid) }),
  ]);

  return {
    name: userData?.name ?? "",
    email: userData?.email ?? "",
    level: (profile?.level ?? "A0") as CEFRLevel,
    sector: (profile?.sector ?? "QUOTIDIEN") as Sector,
    goal: (profile?.goal ?? "LOISIR") as Goal,
    dailyGoalMinutes: profile?.dailyGoalMinutes ?? 15,
  };
}

export async function updateProfileSettings(data: {
  level: CEFRLevel;
  sector: Sector;
  goal: Goal;
  dailyGoalMinutes: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  await db
    .update(userProfile)
    .set({
      level: data.level,
      sector: data.sector,
      goal: data.goal,
      dailyGoalMinutes: data.dailyGoalMinutes,
      updatedAt: new Date(),
    })
    .where(eq(userProfile.userId, uid));
}

export async function updateUserName(name: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  await db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, uid));
}
