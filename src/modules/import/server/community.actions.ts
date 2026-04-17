"use server";

import { db } from "@/lib/db";
import { documentImport, importedExercise, user, userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import type { CEFRLevel } from "@/types";

// ─── Toggle public/privé ──────────────────────────────────────────────────────
export async function toggleImportPublic(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const imp = await db.query.documentImport.findFirst({
    where: and(eq(documentImport.id, importId), eq(documentImport.userId, uid)),
  });
  if (!imp) throw new Error("Import introuvable");

  const newPublic = !imp.isPublic;

  // Détecter le niveau depuis les exercices si pas encore défini
  let level = imp.level;
  if (!level) {
    const firstEx = await db.query.importedExercise.findFirst({
      where: eq(importedExercise.importId, importId),
    });
    level = firstEx?.level ?? null;
  }

  await db.update(documentImport).set({
    isPublic: newPublic,
    publishedAt: newPublic ? new Date() : null,
    level: level as never,
    updatedAt: new Date(),
  }).where(eq(documentImport.id, importId));

  return { isPublic: newPublic };
}

// ─── Récupérer les imports de la communauté ───────────────────────────────────
export async function getCommunityImports(params: {
  docType?: string;
  level?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  // Récupérer le niveau de l'utilisateur pour le filtre par défaut
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });
  const userLevel = profile?.level ?? "A1";

  const { docType, level = userLevel, search, page = 1, pageSize = 12 } = params;
  const offset = (page - 1) * pageSize;

  // Construire les conditions
  const conditions = [
    eq(documentImport.isPublic, true),
    eq(documentImport.status, "done"),
  ];

  if (level && level !== "ALL") {
    conditions.push(eq(documentImport.level, level as never));
  }
  if (docType && docType !== "ALL") {
    conditions.push(eq(documentImport.docType, docType));
  }
  if (search) {
    conditions.push(
      or(
        ilike(documentImport.fileName, `%${search}%`),
      )!
    );
  }

  const [items, countResult] = await Promise.all([
    db.select({
      id: documentImport.id,
      fileName: documentImport.fileName,
      docType: documentImport.docType,
      level: documentImport.level,
      result: documentImport.result,
      publishedAt: documentImport.publishedAt,
      isOwn: sql<boolean>`${documentImport.userId} = ${uid}`,
      authorName: user.name,
    })
    .from(documentImport)
    .innerJoin(user, eq(documentImport.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(documentImport.publishedAt))
    .limit(pageSize)
    .offset(offset),

    db.select({ count: sql<number>`count(*)` })
    .from(documentImport)
    .where(and(...conditions)),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    userLevel,
  };
}

// ─── Copier un import public dans ses propres imports ─────────────────────────
export async function copyPublicImport(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const source = await db.query.documentImport.findFirst({
    where: and(eq(documentImport.id, importId), eq(documentImport.isPublic, true)),
  });
  if (!source) throw new Error("Import introuvable ou non public");

  // Récupérer les exercices source
  const sourceExercises = await db.select().from(importedExercise)
    .where(eq(importedExercise.importId, importId));

  // Créer une copie de l'import
  const { nanoid } = await import("nanoid");
  const [newImport] = await db.insert(documentImport).values({
    id: nanoid(),
    userId: uid,
    fileName: `${source.fileName} (copie)`,
    fileSize: source.fileSize,
    docType: source.docType,
    status: "done",
    result: source.result,
    level: source.level,
  }).returning();

  // Copier les exercices en un seul bulk insert
  if (sourceExercises.length > 0) {
    await db.insert(importedExercise).values(
      sourceExercises.map((ex) => ({
        id: nanoid(),
        importId: newImport.id,
        userId: uid,
        type: ex.type,
        level: ex.level,
        sector: ex.sector,
        skill: ex.skill,
        content: ex.content,
        xpReward: ex.xpReward,
        difficultyScore: ex.difficultyScore,
        isGenerated: ex.isGenerated,
        orderIndex: ex.orderIndex,
      }))
    );
  }

  return { importId: newImport.id };
}
