"use server";

import { db } from "@/lib/db";
import { exercise, spacedRepetition, importedExerciseResult, importedExercise } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, gte, lte, lt } from "drizzle-orm";

export async function getNightReviewItems() {
  const session = await assertAuth();
  const uid = session.user.id;

  const weekAgo = new Date(Date.now() - 7 * 86400000);

  // Exercices SM-2 avec score < 60 cette semaine (lastQuality <= 2)
  const weakSR = await db
    .select({ exercise, sr: spacedRepetition })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(
      and(
        eq(spacedRepetition.userId, uid),
        lte(spacedRepetition.lastQuality, 2),
        gte(spacedRepetition.lastReviewAt, weekAgo)
      )
    )
    .limit(30);

  // Exercices importés avec score < 60 cette semaine
  const weakImported = await db
    .select({ ex: importedExercise, result: importedExerciseResult })
    .from(importedExerciseResult)
    .innerJoin(importedExercise, eq(importedExerciseResult.importedExerciseId, importedExercise.id))
    .where(
      and(
        eq(importedExerciseResult.userId, uid),
        lt(importedExerciseResult.score, 60),
        gte(importedExerciseResult.completedAt, weekAgo)
      )
    )
    .limit(20);

  const items = [
    ...weakSR.map((r) => ({
      id: r.sr.id,
      exerciseId: r.exercise.id,
      type: r.exercise.type,
      skill: r.exercise.skill,
      level: r.exercise.level,
      content: r.exercise.content,
      xpReward: r.exercise.xpReward,
      score: r.sr.lastQuality !== null ? Math.round((r.sr.lastQuality / 5) * 100) : 0,
      source: "sm2" as const,
    })),
    ...weakImported.map((r) => ({
      id: r.result.id,
      exerciseId: r.ex.id,
      type: r.ex.type,
      skill: r.ex.skill,
      level: r.ex.level,
      content: r.ex.content,
      xpReward: r.ex.xpReward,
      score: Math.round(r.result.score),
      source: "imported" as const,
    })),
  ].sort((a, b) => a.score - b.score);

  return items;
}
