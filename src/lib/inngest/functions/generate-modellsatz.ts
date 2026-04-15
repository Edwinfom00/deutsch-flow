import { inngest } from "../client";
import { db } from "@/lib/db";
import { documentImport, importedExercise } from "@/lib/db/schema";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { normalizeType, normalizeSkill } from "@/lib/ai/normalize";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

export const generateModellsatzFn = inngest.createFunction(
  {
    id: "generate-modellsatz",
    name: "Génération de Modellsatz supplémentaires",
    retries: 2,
    triggers: [{ event: "modellsatz/generate" }],
  },
  async ({ event, step }: {
    event: { data: { sourceImportId: string; userId: string; newImportId: string } };
    step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> }
  }) => {
    const { sourceImportId, userId, newImportId } = event.data;

    // Marquer comme en cours
    await step.run("mark-processing", async () => {
      await db.update(documentImport)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(documentImport.id, newImportId));
    });

    // Récupérer les exercices source
    const sourceExercises = await step.run("fetch-source", async () => {
      return db.select().from(importedExercise)
        .where(and(eq(importedExercise.importId, sourceImportId), eq(importedExercise.userId, userId)))
        .limit(10);
    });

    if (sourceExercises.length === 0) {
      await db.update(documentImport)
        .set({ status: "error", errorMessage: "Source introuvable", updatedAt: new Date() })
        .where(eq(documentImport.id, newImportId));
      return;
    }

    const level = sourceExercises[0].level as CEFRLevel;
    const sector = sourceExercises[0].sector as Sector;

    const sourceStructure = sourceExercises.map((ex) => ({
      type: (ex.content as { type?: string }).type ?? ex.type,
      skill: ex.skill,
    }));

    // Générer 2 Modellsatz via Claude
    const exercises = await step.run("generate", async () => {
      const response = await anthropic.messages.create({
        model: AI_MODEL,
        max_tokens: 8000,
        messages: [{
          role: "user",
          content: `Tu dois générer 2 Modellsatz complets de niveau ${level} pour le secteur ${sector}.

Structure source à reproduire:
${JSON.stringify(sourceStructure, null, 2)}

Exemple d'exercice source (format exact à respecter):
${JSON.stringify(sourceExercises[0].content, null, 2).slice(0, 1500)}

RÈGLES:
1. Respecte EXACTEMENT la même structure JSON
2. Génère des contenus DIFFÉRENTS (nouveaux textes, nouvelles questions)
3. Maintiens le niveau ${level}
4. Chaque Modellsatz: 1 MATCHING_HEADLINES, 1 MULTIPLE_CHOICE_READING, 1 SITUATION_AD_MATCHING, 1 GRAMMATIK_LUECKENTEXT, 1 SCHREIBEN_EMAIL
5. Inclure timeLimit, maxPoints, instructions, scoringRules

Réponds avec un tableau JSON de 10 exercices (5 par Modellsatz).
Chaque exercice a un champ "modellsatz_index" (1 ou 2).`,
        }],
      });
      return parseAIJson<Array<Record<string, unknown>>>((response.content[0] as { text: string }).text);
    });

    // Sauvegarder les exercices
    const savedIds = await step.run("save-exercises", async () => {
      const ids: string[] = [];
      for (const [i, content] of exercises.entries()) {
        const [ex] = await db.insert(importedExercise).values({
          id: nanoid(),
          importId: newImportId,
          userId,
          type: normalizeType(content.type as string) as never,
          level,
          sector,
          skill: normalizeSkill(content.skill as string) as never,
          content: content as never,
          xpReward: 20,
          difficultyScore: 0.7,
          isGenerated: true,
          orderIndex: i,
        }).returning();
        ids.push(ex.id);
      }
      return ids;
    });

    // Marquer comme terminé
    await step.run("mark-done", async () => {
      await db.update(documentImport).set({
        status: "done",
        result: { type: "modellsatz", summary: `2 Modellsatz ${level} générés`, exerciseIds: savedIds, count: savedIds.length } as never,
        updatedAt: new Date(),
      }).where(eq(documentImport.id, newImportId));
    });

    return { count: savedIds.length };
  }
);
