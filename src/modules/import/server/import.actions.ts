"use server";

import { db } from "@/lib/db";
import { documentImport, importedExercise, importedExerciseResult } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, desc, and, inArray } from "drizzle-orm";

export async function deleteImport(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const imp = await db.query.documentImport.findFirst({
    where: and(eq(documentImport.id, importId), eq(documentImport.userId, uid)),
  });
  if (!imp) throw new Error("Import introuvable");

  await db.delete(documentImport).where(
    and(eq(documentImport.id, importId), eq(documentImport.userId, uid))
  );
}

export async function getImports() {
  const session = await assertAuth();
  const uid = session.user.id;

  return db.select({
    id: documentImport.id,
    fileName: documentImport.fileName,
    fileSize: documentImport.fileSize,
    docType: documentImport.docType,
    status: documentImport.status,
    result: documentImport.result,
    errorMessage: documentImport.errorMessage,
    createdAt: documentImport.createdAt,
  }).from(documentImport)
    .where(eq(documentImport.userId, uid))
    .orderBy(desc(documentImport.createdAt))
    .limit(20);
}

export async function getImportStatus(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  return db.query.documentImport.findFirst({
    where: (d, { and, eq }) => and(eq(d.id, importId), eq(d.userId, uid)),
  });
}

export async function getImportedExercises() {
  const session = await assertAuth();
  const uid = session.user.id;

  // Récupérer tous les imports "exercises" terminés
  const imports = await db.select().from(documentImport)
    .where(and(eq(documentImport.userId, uid), eq(documentImport.docType, "exercises"), eq(documentImport.status, "done")))
    .orderBy(desc(documentImport.createdAt));

  const result = [];
  for (const imp of imports) {
    const res = imp.result as { exerciseIds?: string[] } | null;
    if (!res?.exerciseIds?.length) continue;

    const exercises = await db.select().from(importedExercise)
      .where(inArray(importedExercise.id, res.exerciseIds));

    const resultRows = await db.select().from(importedExerciseResult)
      .where(and(eq(importedExerciseResult.userId, uid), inArray(importedExerciseResult.importedExerciseId, res.exerciseIds)));

    result.push({
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      exercises: exercises.map((ex) => {
        const done = resultRows.find((r) => r.importedExerciseId === ex.id);
        return {
          id: ex.id,
          type: ex.type,
          skill: ex.skill,
          level: ex.level,
          content: ex.content,
          xpReward: ex.xpReward,
          mastery: done ? (done.score >= 80 ? "mastered" : done.score >= 50 ? "learning" : "new") : "new",
          isDue: !done,
        };
      }),
    });
  }
  return result;
}

export async function getImportedModellsatz() {
  const session = await assertAuth();
  const uid = session.user.id;

  const imports = await db.select().from(documentImport)
    .where(and(eq(documentImport.userId, uid), eq(documentImport.docType, "modellsatz"), eq(documentImport.status, "done")))
    .orderBy(desc(documentImport.createdAt));

  const result = [];
  for (const imp of imports) {
    const res = imp.result as { exerciseIds?: string[]; summary?: string } | null;
    if (!res?.exerciseIds?.length) continue;

    const exercises = await db.select().from(importedExercise)
      .where(inArray(importedExercise.id, res.exerciseIds))
      .orderBy(importedExercise.orderIndex);

    // Grouper par Modellsatz (orderIndex / 100) puis par compétence
    const satzMap: Record<number, { bySkill: Record<string, typeof exercises> }> = {};
    for (const ex of exercises) {
      const satzIndex = Math.floor(ex.orderIndex / 100); // 0 = satz original, 1 = satz généré 1, etc.
      if (!satzMap[satzIndex]) satzMap[satzIndex] = { bySkill: {} };
      if (!satzMap[satzIndex].bySkill[ex.skill]) satzMap[satzIndex].bySkill[ex.skill] = [];
      satzMap[satzIndex].bySkill[ex.skill].push(ex);
    }

    result.push({
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      summary: res.summary,
      totalExercises: exercises.length,
      // bySkill conservé pour rétrocompatibilité (satz original = satzIndex 0)
      bySkill: satzMap[0]?.bySkill ?? {},
      modellsatze: Object.entries(satzMap).map(([idx, s]) => ({
        index: Number(idx),
        label: Number(idx) === 0 ? "Original" : `Variante ${Number(idx)}`,
        bySkill: s.bySkill,
      })),
    });
  }
  return result;
}

export async function getImportedGrammar() {
  const session = await assertAuth();
  const uid = session.user.id;

  const imports = await db.select().from(documentImport)
    .where(and(eq(documentImport.userId, uid), eq(documentImport.docType, "grammar"), eq(documentImport.status, "done")))
    .orderBy(desc(documentImport.createdAt));

  return imports.map((imp) => {
    const res = imp.result as {
      chapters?: Array<{ title: string; rule: string; ruleDe: string; examples: object[]; tip: string }>;
      exerciseIds?: string[];
      summary?: string;
    } | null;
    return {
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      summary: res?.summary,
      chapters: res?.chapters ?? [],
      exerciseCount: res?.exerciseIds?.length ?? 0,
    };
  });
}
