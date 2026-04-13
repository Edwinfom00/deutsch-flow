"use server";

import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { nanoid } from "nanoid";

/**
 * Crée le profil utilisateur après inscription
 * Appelé automatiquement après la création du compte BetterAuth
 */
export async function createUserProfile(userId: string) {
  await db.insert(userProfile).values({
    id: nanoid(),
    userId,
    level: "A0",
    sector: "QUOTIDIEN",
    goal: "LOISIR",
    dailyGoalMinutes: 15,
    totalXp: 0,
    currentStreak: 0,
    longestStreak: 0,
    onboardingCompleted: false,
  });
}
