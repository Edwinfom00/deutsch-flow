"use server";

import { db } from "@/lib/db";
import { exercise, userProgress, spacedRepetition, dailySession, xpEvent, userProfile } from "@/lib/db/schema";
import { generateExercise, generateDailySession } from "@/lib/ai/exercise-generator";
import { eq, and, lte, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { computeSM2 } from "@/lib/sm2";
import type { CEFRLevel, Sector, Skill } from "@/types";

// ─── Générer et sauvegarder un exercice IA ────────────────────────────────────
export async function createAiExercise(params: {
  type: string;
  level: CEFRLevel;
  sector: Sector;
  skill: Skill;
  lessonId?: string;
  topic?: string;
}) {
  const generated = await generateExercise(params);

  const [saved] = await db.insert(exercise).values({
    id: nanoid(),
    lessonId: params.lessonId ?? null,
    type: params.type as never, // cast pour l'enum drizzle
    level: params.level,
    sector: params.sector,
    skill: params.skill,
    content: generated.content as never,
    difficultyScore: generated.difficultyScore,
    xpReward: generated.xpReward,
    isAiGenerated: true,
  }).returning();

  return saved;
}

// ─── Récupérer les exercices dus (Spaced Repetition) ─────────────────────────
export async function getDueExercises(userId: string, limit = 10) {
  const now = new Date();

  const due = await db
    .select({
      exercise: exercise,
      sr: spacedRepetition,
    })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(
      and(
        eq(spacedRepetition.userId, userId),
        lte(spacedRepetition.nextReviewAt, now)
      )
    )
    .limit(limit);

  return due;
}

// ─── Enregistrer une réponse à un exercice ────────────────────────────────────
export async function submitExerciseAnswer(params: {
  userId: string;
  exerciseId: string;
  lessonId?: string;
  score: number; // 0-100
  timeSpentSeconds: number;
  quality: number; // 0-5 pour SM-2
}) {
  const { userId, exerciseId, lessonId, score, timeSpentSeconds, quality } = params;

  // 1. Récupérer ou créer l'entrée Spaced Repetition
  const existing = await db
    .select()
    .from(spacedRepetition)
    .where(
      and(
        eq(spacedRepetition.userId, userId),
        eq(spacedRepetition.exerciseId, exerciseId)
      )
    )
    .limit(1);

  const sr = existing[0];
  const now = new Date();

  // ── Algorithme SM-2 ──────────────────────────────────────────────────────
  const { easeFactor: newEaseFactor, interval: newInterval, repetitions: newRepetitions, nextReviewAt } =
    computeSM2(sr ?? null, quality);

  // 2. Upsert Spaced Repetition
  if (sr) {
    await db
      .update(spacedRepetition)
      .set({
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReviewAt,
        lastReviewAt: now,
        lastQuality: quality,
        updatedAt: now,
      })
      .where(eq(spacedRepetition.id, sr.id));
  } else {
    await db.insert(spacedRepetition).values({
      id: nanoid(),
      userId,
      exerciseId,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewAt,
      lastReviewAt: now,
      lastQuality: quality,
    });
  }

  // 3. Récupérer l'exercice pour l'XP
  const [ex] = await db.select().from(exercise).where(eq(exercise.id, exerciseId));
  const xpEarned = Math.round((ex?.xpReward ?? 10) * (score / 100));

  // 4. Enregistrer l'XP event
  await db.insert(xpEvent).values({
    id: nanoid(),
    userId,
    amount: xpEarned,
    reason: "exercise_complete",
    sourceId: exerciseId,
  });

  // 5. Mettre à jour le total XP du profil
  await db
    .update(userProfile)
    .set({
      totalXp: sql`${userProfile.totalXp} + ${xpEarned}`,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(userProfile.userId, userId));

  // 6. Mettre à jour la session du jour
  const today = now.toISOString().split("T")[0];
  const [todaySession] = await db
    .select()
    .from(dailySession)
    .where(and(eq(dailySession.userId, userId), eq(dailySession.date, today)));

  if (todaySession) {
    await db
      .update(dailySession)
      .set({
        xpEarned: todaySession.xpEarned + xpEarned,
        exercisesCompleted: todaySession.exercisesCompleted + 1,
        timeSpentSeconds: todaySession.timeSpentSeconds + timeSpentSeconds,
      })
      .where(eq(dailySession.id, todaySession.id));
  } else {
    await db.insert(dailySession).values({
      id: nanoid(),
      userId,
      date: today,
      xpEarned,
      exercisesCompleted: 1,
      timeSpentSeconds,
    });
  }

  return { xpEarned, nextReviewAt };
}

// ─── Générer une session quotidienne ─────────────────────────────────────────
export async function createDailySessionExercises(
  userId: string,
  level: CEFRLevel,
  sector: Sector,
  goalMinutes: number
) {
  const exercises = await generateDailySession(level, sector, goalMinutes);

  const saved = await Promise.all(
    exercises.map(async ({ content, difficultyScore, xpReward }) => {
      const [saved] = await db.insert(exercise).values({
        id: nanoid(),
        type: (content as { type: string }).type as never,
        level,
        sector,
        skill: (content as { skill: Skill }).skill,
        content: content as never,
        difficultyScore,
        xpReward,
        isAiGenerated: true,
      }).returning();
      return saved;
    })
  );

  return saved;
}
