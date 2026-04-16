"use server";

import { db } from "@/lib/db";
import { documentImport, exercise, spacedRepetition } from "@/lib/db/schema";
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

    const exercises = await db.select().from(exercise)
      .where(inArray(exercise.id, res.exerciseIds));

    const srRows = await db.select().from(spacedRepetition)
      .where(and(eq(spacedRepetition.userId, uid), inArray(spacedRepetition.exerciseId, res.exerciseIds)));

    result.push({
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      exercises: exercises.map((ex) => {
        const sr = srRows.find((r) => r.exerciseId === ex.id);
        return {
          id: ex.id,
          type: ex.type,
          skill: ex.skill,
          level: ex.level,
          content: ex.content,
          xpReward: ex.xpReward,
          mastery: sr ? (sr.repetitions >= 5 ? "mastered" : sr.repetitions >= 2 ? "learning" : "new") : "new",
          isDue: sr ? new Date(sr.nextReviewAt) <= new Date() : true,
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

    const exercises = await db.select().from(exercise)
      .where(inArray(exercise.id, res.exerciseIds));

    // Grouper par compétence
    const bySkill: Record<string, typeof exercises> = {};
    for (const ex of exercises) {
      if (!bySkill[ex.skill]) bySkill[ex.skill] = [];
      bySkill[ex.skill].push(ex);
    }

    result.push({
      importId: imp.id,
      fileName: imp.fileName,
      createdAt: imp.createdAt,
      summary: res.summary,
      totalExercises: exercises.length,
      bySkill,
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
