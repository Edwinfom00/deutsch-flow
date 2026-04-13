"use server";

import { db } from "@/lib/db";
import { exercise, spacedRepetition, userProfile, dailySession } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { generateExercise } from "@/lib/ai/exercise-generator";
import { eq, and, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector, Skill } from "@/types";

export async function getDueReviews() {
  const session = await assertAuth();
  const uid = session.user.id;

  // Récupérer les entrées SM-2 dues + l'exercice original (pour type/skill/level)
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

  // Regénérer chaque exercice dû via l'IA (nouveau contenu, même type/skill/niveau)
  const profile = await db.query.userProfile.findFirst({
    where: (p, { eq }) => eq(p.userId, uid),
  });

  const regenerated = await Promise.all(
    due.map(async (row) => {
      try {
        const generated = await generateExercise({
          type: row.exercise.type,
          level: row.exercise.level as CEFRLevel,
          sector: (profile?.sector ?? row.exercise.sector) as Sector,
          skill: row.exercise.skill as Skill,
        });

        // Sauvegarder le nouvel exercice généré
        const [newEx] = await db.insert(exercise).values({
          id: nanoid(),
          type: row.exercise.type as never,
          level: row.exercise.level,
          sector: row.exercise.sector,
          skill: row.exercise.skill,
          content: generated.content as never,
          difficultyScore: generated.difficultyScore,
          xpReward: row.exercise.xpReward,
          isAiGenerated: true,
        }).returning();

        // Mettre à jour la référence SM-2 vers le nouvel exercice
        await db.update(spacedRepetition)
          .set({ exerciseId: newEx.id, updatedAt: new Date() })
          .where(eq(spacedRepetition.id, row.sr.id));

        return {
          srId: row.sr.id,
          exerciseId: newEx.id,
          type: newEx.type,
          skill: newEx.skill,
          level: newEx.level,
          content: newEx.content,
          xpReward: newEx.xpReward,
          interval: row.sr.interval,
          repetitions: row.sr.repetitions,
          lastQuality: row.sr.lastQuality,
        };
      } catch {
        // Fallback : utiliser l'exercice original si la regénération échoue
        return {
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
        };
      }
    })
  );

  return {
    due: regenerated,
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
  let ef = sr.easeFactor;
  let interval = sr.interval;
  let reps = sr.repetitions;

  if (quality >= 3) {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps += 1;
  } else {
    reps = 0;
    interval = 1;
  }
  ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

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
