"use server";

import { db } from "@/lib/db";
import { importedExercise, importedExerciseResult, documentImport } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getImportedExercisesByType(docType: "exercises" | "modellsatz" | "grammar") {
  const session = await assertAuth();
  const uid = session.user.id;

  const imports = await db.select().from(documentImport)
    .where(and(eq(documentImport.userId, uid), eq(documentImport.docType, docType), eq(documentImport.status, "done")))
    .orderBy(desc(documentImport.createdAt));

  const result = [];
  for (const imp of imports) {
    const exercises = await db.select().from(importedExercise)
      .where(and(eq(importedExercise.importId, imp.id), eq(importedExercise.userId, uid)))
      .orderBy(importedExercise.orderIndex);

    const results = await db.select().from(importedExerciseResult)
      .where(eq(importedExerciseResult.userId, uid));

    const resultMap = new Map(results.map((r) => [r.importedExerciseId, r]));

    result.push({
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      isPublic: imp.isPublic,
      level: imp.level,
      result: imp.result as { summary?: string; chapters?: object[] } | null,
      exercises: exercises.map((ex) => ({
        id: ex.id,
        type: ex.type,
        skill: ex.skill,
        level: ex.level,
        content: ex.content,
        xpReward: ex.xpReward,
        isGenerated: ex.isGenerated,
        orderIndex: ex.orderIndex,
        completed: resultMap.has(ex.id),
        score: resultMap.get(ex.id)?.score ?? null,
      })),
    });
  }

  return result;
}

export async function submitImportedExerciseResult(params: {
  importedExerciseId: string;
  score: number;
  timeSpentSeconds: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  // Vérifier que l'exercice appartient à l'utilisateur
  const ex = await db.query.importedExercise.findFirst({
    where: and(eq(importedExercise.id, params.importedExerciseId), eq(importedExercise.userId, uid)),
  });
  if (!ex) throw new Error("Exercice introuvable");

  // Upsert result
  const existing = await db.query.importedExerciseResult.findFirst({
    where: and(
      eq(importedExerciseResult.userId, uid),
      eq(importedExerciseResult.importedExerciseId, params.importedExerciseId)
    ),
  });

  if (existing) {
    await db.update(importedExerciseResult).set({
      score: params.score,
      timeSpentSeconds: params.timeSpentSeconds,
      completedAt: new Date(),
    }).where(eq(importedExerciseResult.id, existing.id));
  } else {
    await db.insert(importedExerciseResult).values({
      id: nanoid(),
      userId: uid,
      importedExerciseId: params.importedExerciseId,
      score: params.score,
      timeSpentSeconds: params.timeSpentSeconds,
    });
  }

  return { xpEarned: Math.round(ex.xpReward * (params.score / 100)) };
}
