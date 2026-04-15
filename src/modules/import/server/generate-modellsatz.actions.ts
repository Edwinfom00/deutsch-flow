"use server";

import { db } from "@/lib/db";
import { documentImport } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { inngest } from "@/lib/inngest/client";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function generateMoreModellsatz(sourceImportId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  // Vérifier que l'import source appartient à l'utilisateur
  const source = await db.query.documentImport.findFirst({
    where: (d, { and, eq }) => and(eq(d.id, sourceImportId), eq(d.userId, uid)),
  });
  if (!source) throw new Error("Import source introuvable");

  // Créer l'entrée en DB avec status "pending"
  const [newImport] = await db.insert(documentImport).values({
    id: nanoid(),
    userId: uid,
    fileName: `Modellsatz généré — ${source.fileName.split(".")[0]} (${new Date().toLocaleDateString("fr-FR")})`,
    fileSize: 0,
    docType: "modellsatz",
    status: "pending",
  }).returning();

  // Déclencher le job Inngest
  await inngest.send({
    name: "modellsatz/generate",
    data: {
      sourceImportId,
      userId: uid,
      newImportId: newImport.id,
    },
  });

  return { importId: newImport.id };
}

export async function getModellsatzGenerationStatus(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  return db.query.documentImport.findFirst({
    where: (d, { and, eq }) => and(eq(d.id, importId), eq(d.userId, uid)),
  });
}
