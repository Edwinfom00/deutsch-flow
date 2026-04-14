"use server";

import { db } from "@/lib/db";
import { exercise, spacedRepetition, userProfile, dailySession } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { computeSM2 } from "@/lib/sm2";

export async function getDueReviews() {
  const session = await assertAuth();
  const uid = session.user.id;

  // Récupérer les entrées SM-2 dues + l'exercice original
  const due = await db
    .select({ exercise, sr: spacedRepetition })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(and(eq(spacedRepetition.userId, uid), lte(spacedRepetition.nextReviewAt, new Date())))
    .limit(20);

  // Stats globales
  const all = await db
    .select({ nextReviewAt: spacedRepetition.nextReviewAt })
    .from(spacedRepetition)
    .where(eq(spacedRepetition.userId, uid));

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dueToday = due.length;
  const dueTomorrow = all.filter((r) => {
    const d = new Date(r.nextReviewAt);
    return d >= tomorrow && d < new Date(tomorrow.getTime() + 86400000);
  }).length;
  const totalTracked = all.length;

  // Retourner les exercices originaux directement — pas de regénération IA au chargement
  const reviews = due.map((row) => ({
    srId: row.sr.id,
    exerciseId: row.exercise.id,
    type: row.exercise.type,
    skill: row.exercise.skill,
    level: row.exercise.level,
    content: row.exercise.content,
    xpReward: row.exercise.xpReward,
    interval: row.sr.interval,
    repetitions: row.sr.repetitions,
    lastQuality: row.sr.lastQuality,
  }));

  return {
    due: reviews,
    stats: { dueToday, dueTomorrow, totalTracked },
  };
}

export async function submitReview(params: {
  srId: string;
  exerciseId: string;
  score: number;
  quality: number;
  timeSpentSeconds: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;
  const { srId, exerciseId, score, quality, timeSpentSeconds } = params;

  const [sr] = await db.select().from(spacedRepetition).where(eq(spacedRepetition.id, srId));
  if (!sr) throw new Error("Révision introuvable");

  const now = new Date();

  // SM-2
  const { easeFactor: ef, interval, repetitions: reps, nextReviewAt } = computeSM2(sr, quality);

  await db.update(spacedRepetition).set({
    easeFactor: ef, interval, repetitions: reps,
    nextReviewAt, lastReviewAt: now, lastQuality: quality, updatedAt: now,
  }).where(eq(spacedRepetition.id, srId));

  // XP réduit pour les révisions (50%)
  const [ex] = await db.select().from(exercise).where(eq(exercise.id, exerciseId));
  const xpEarned = Math.round((ex?.xpReward ?? 10) * (score / 100) * 0.5);

  await db.update(userProfile).set({
    totalXp: sql`${userProfile.totalXp} + ${xpEarned}`,
    lastActivityAt: now,
    updatedAt: now,
  }).where(eq(userProfile.userId, uid));

  const today = now.toISOString().split("T")[0];
  const [todaySession] = await db.select().from(dailySession)
    .where(and(eq(dailySession.userId, uid), eq(dailySession.date, today)));

  if (todaySession) {
    await db.update(dailySession).set({
      xpEarned: todaySession.xpEarned + xpEarned,
      exercisesCompleted: todaySession.exercisesCompleted + 1,
      timeSpentSeconds: todaySession.timeSpentSeconds + timeSpentSeconds,
    }).where(eq(dailySession.id, todaySession.id));
  } else {
    await db.insert(dailySession).values({
      id: nanoid(), userId: uid, date: today,
      xpEarned, exercisesCompleted: 1, timeSpentSeconds,
    });
  }

  return { xpEarned, nextReviewAt, interval };
}
