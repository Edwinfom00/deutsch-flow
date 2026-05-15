import { inngest } from "../client";
import { db } from "@/lib/db";
import { documentImport, importedExercise } from "@/lib/db/schema";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import { parseAIJson, ensureArray } from "@/lib/ai/parse";
import { normalizeType, normalizeSkill } from "@/lib/ai/normalize";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

type Step = { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> };

// ─── Helper — message Claude avec PDF base64 ──────────────────────────────────
function pdfMsg(base64: string, text: string) {
  return {
    role: "user" as const,
    content: [
      {
        type: "document" as const,
        source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
      },
      { type: "text" as const, text },
    ],
  };
}

// ─── Insérer un exercice importé ──────────────────────────────────────────────
async function insertExercise(
  content: object, level: CEFRLevel, sector: Sector,
  importId: string, userId: string, xpReward = 15, isGenerated = false, orderIndex = 0
) {
  const c = content as Record<string, unknown>;
  const [ex] = await db.insert(importedExercise).values({
    id: nanoid(), importId, userId,
    type: normalizeType(c.type as string) as never,
    level, sector,
    skill: normalizeSkill(c.skill as string) as never,
    content: content as never,
    difficultyScore: (c.difficultyScore as number) ?? 0.5,
    xpReward: (c.xpReward as number) ?? xpReward,
    isGenerated, orderIndex,
  }).returning();
  return ex.id;
}

// ─── Détection du type ────────────────────────────────────────────────────────
async function detectDocumentType(base64: string): Promise<{
  type: "exercises" | "modellsatz" | "grammar" | "unknown";
  level: CEFRLevel; sector: Sector; summary: string;
}> {
  const response = await anthropic.messages.create({
    model: AI_MODEL, max_tokens: 400,
    messages: [pdfMsg(base64, `Analyse ce document PDF allemand et détermine son type.
Réponds UNIQUEMENT en JSON:
{
  "type": "exercises" | "modellsatz" | "grammar" | "unknown",
  "level": "A0"|"A1"|"A2"|"B1"|"B2"|"C1"|"C2",
  "sector": "IT"|"BUSINESS"|"SANTE"|"DROIT"|"TOURISME"|"QUOTIDIEN"|"AUTRE",
  "summary": "description courte en français (1 phrase)"
}
- exercises: feuille d'exercices avec questions/réponses
- modellsatz: examen modèle Goethe/ÖSD complet avec plusieurs parties
- grammar: livre ou cours de grammaire`)],
  });
  return parseAIJson((response.content[0] as { text: string }).text);
}

// ─── Traitement exercices — 3 steps séparés ───────────────────────────────────
async function processExercises(
  step: Step, base64: string, level: CEFRLevel, sector: Sector, importId: string, userId: string
): Promise<string[]> {
  // Step 1 : extraction Claude (peut prendre du temps sur gros PDF)
  const extracted = await step.run("extract-exercises", async () => {
    const res = await anthropic.messages.create({
      model: AI_MODEL, max_tokens: 6000,
      messages: [pdfMsg(base64,
        `MISSION PRINCIPALE: Extraire TOUS les exercices présents dans ce document PDF.

Ne rien inventer. Ne rien omettre. Retourner UNIQUEMENT ce qui est dans le document.

Pour chaque exercice trouvé, retourne un objet JSON avec:
- "type": le type exact (MATCHING_HEADLINES, MULTIPLE_CHOICE_READING, SITUATION_AD_MATCHING, GRAMMATIK_LUECKENTEXT, SCHREIBEN_EMAIL, HOEREN_MULTIPLE_CHOICE, etc.)
- TOUTE la structure originale de l'exercice (textes, questions, réponses, options, hints, timeLimit, maxPoints, scoringRules, annonces, etc.)
- "level": "${level}", "sector": "${sector}", "skill": la compétence (LESEN/SCHREIBEN/HOEREN/SPRECHEN/GRAMMATIK/WORTSCHATZ)
- "xpReward": 20, "difficultyScore": 0.7
- "instructions": la consigne en français

Réponds UNIQUEMENT avec un tableau JSON valide. Pas de texte autour.
[{ ...exercice complet... }, ...]`
      )],
    });
    return ensureArray(parseAIJson((res.content[0] as { text: string }).text));
  });

  // Step 2 : insertion en DB des exercices extraits
  const extractedIds = await step.run("save-extracted-exercises", async () => {
    const ids: string[] = [];
    for (const [i, content] of extracted.entries()) {
      ids.push(await insertExercise(content, level, sector, importId, userId, 15, false, i));
    }
    return ids;
  });

  // Step 3 : génération supplémentaire Claude (step séparé — timeout indépendant)
  const extraIds = await step.run("generate-extra-exercises", async () => {
    if (extracted.length === 0) return [];
    try {
      const res = await anthropic.messages.create({
        model: AI_MODEL, max_tokens: 3000,
        messages: [pdfMsg(base64,
          `En t'inspirant du style et du niveau de ce document (${level}), génère 5 nouveaux exercices du même type pour le secteur ${sector}.
Respecte EXACTEMENT la même structure JSON que les exercices du document.
Réponds avec un tableau JSON de 5 exercices.`
        )],
      });
      const extra = ensureArray(parseAIJson((res.content[0] as { text: string }).text));
      const ids: string[] = [];
      for (const [i, content] of extra.entries()) {
        ids.push(await insertExercise(content, level, sector, importId, userId, 15, true, extracted.length + i));
      }
      return ids;
    } catch (err) {
      console.error("[process-document] Génération supplémentaire exercices échouée:", err);
      return [];
    }
  });

  return [...extractedIds, ...extraIds];
}

// ─── Traitement Modellsatz — 3 steps séparés ─────────────────────────────────
async function processModellsatz(
  step: Step, base64: string, level: CEFRLevel, sector: Sector, importId: string, userId: string
): Promise<string[]> {
  // Step 1 : extraction Claude (8000 tokens, peut être long)
  const extracted = await step.run("extract-modellsatz", async () => {
    const res = await anthropic.messages.create({
      model: AI_MODEL, max_tokens: 8000,
      messages: [pdfMsg(base64,
        `MISSION PRINCIPALE: Extraire INTÉGRALEMENT ce Modellsatz (examen modèle) de niveau ${level}.

Extraire TOUTES les parties sans exception:
- LESEN (Lecture): MATCHING_HEADLINES, MULTIPLE_CHOICE_READING, SITUATION_AD_MATCHING
- SCHREIBEN (Écriture): email, opinion, description
- HÖREN (Écoute): QCM sur dialogue, vrai/faux
- SPRECHEN (Expression orale): dialogue, roleplay

Structure EXACTE à respecter par type:
• MATCHING_HEADLINES → { type, texts[{number,content,source,correctAnswer,hint}], headlines[{letter,text}], answerGrid, timeLimit, maxPoints, scoringRules, instructions }
• MULTIPLE_CHOICE_READING → { type, readingText:{title,source,content,glossary[]}, questions[{number,questionText,options:{A,B,C},correctAnswer,explanation,hint}], example, timeLimit, maxPoints, instructions }
• SITUATION_AD_MATCHING → { type, situations[{number,text,keywords[],correctAnswer,pedagogicalHint}], ads[{id,titre,contenu}], examples[], timeLimit, maxPoints, instructions }
• GRAMMATIK_LUECKENTEXT → { type, texte:{corps,titre_texte}, questions[{numero,question,options:{a,b,c},bonne_reponse,explication_FR}], vocabulaire_cle[], consigne_FR }
• SCHREIBEN → { type, consigne_FR, elements_obligatoires[], grille_evaluation[{critere,points_max,description_FR}], expressions_utiles[{usage,expression}], exemple_reponse_modele:{texte,note_FR}, points_max_total, duree_recommandee_minutes }
• HOEREN → { type, script:{dialogue[{locuteur,replique}]}, questions[{numero,question,options,bonne_reponse}], consigne_FR }
• SPRECHEN → { type, scenario, userRole, partnerRole, suggestedPhrases:[], evaluationCriteria:[], timeLimit }

RÈGLES ABSOLUES:
1. Extraire le contenu RÉEL du PDF — ne rien inventer
2. Inclure TOUS les textes, TOUTES les questions, TOUTES les réponses
3. Inclure les annonces (ads) complètes pour SITUATION_AD_MATCHING
4. Inclure le texte de lecture complet pour MULTIPLE_CHOICE_READING
5. Chaque exercice: level="${level}", sector="${sector}", skill approprié, xpReward:20, difficultyScore:0.7

Réponds UNIQUEMENT avec un tableau JSON valide. Pas de texte autour.
[{ ...exercice complet... }, ...]`
      )],
    });
    return ensureArray(parseAIJson((res.content[0] as { text: string }).text));
  });

  // Step 2 : insertion en DB
  const extractedIds = await step.run("save-extracted-modellsatz", async () => {
    const ids: string[] = [];
    for (const [i, content] of extracted.entries()) {
      ids.push(await insertExercise(content, level, sector, importId, userId, 20, false, i));
    }
    return ids;
  });

  // Step 3 : génération d'un Modellsatz supplémentaire (step séparé)
  const extraIds = await step.run("generate-extra-modellsatz", async () => {
    if (extracted.length === 0) return [];
    try {
      const res = await anthropic.messages.create({
        model: AI_MODEL, max_tokens: 5000,
        messages: [pdfMsg(base64,
          `En t'inspirant de la structure de ce Modellsatz (niveau ${level}), génère un nouveau Modellsatz complet pour le secteur ${sector}.
Même structure, mêmes types d'exercices, contenus entièrement nouveaux.
Inclure LESEN (3 exercices), SCHREIBEN, HOEREN et SPRECHEN.
Réponds avec un tableau JSON de 6 exercices (1 par compétence/partie).`
        )],
      });
      const extra = ensureArray(parseAIJson((res.content[0] as { text: string }).text));
      const ids: string[] = [];
      for (const [i, content] of extra.entries()) {
        // orderIndex ≥ 100 = satz généré n°1
        ids.push(await insertExercise(content, level, sector, importId, userId, 20, true, 100 + i));
      }
      return ids;
    } catch (err) {
      console.error("[process-document] Génération Modellsatz supplémentaire échouée:", err);
      return [];
    }
  });

  return [...extractedIds, ...extraIds];
}

// ─── Traitement grammaire — 3 steps séparés ──────────────────────────────────
async function processGrammar(
  step: Step, base64: string, level: CEFRLevel, sector: Sector, importId: string, userId: string
): Promise<{ chapters: object[]; exerciseIds: string[] }> {
  // Step 1 : extraction des chapitres Claude
  const chapters = await step.run("extract-grammar-chapters", async () => {
    const res = await anthropic.messages.create({
      model: AI_MODEL, max_tokens: 5000,
      messages: [pdfMsg(base64,
        `MISSION PRINCIPALE: Extraire les règles de grammaire de ce document. Niveau: ${level}.

Extraire les 5 premiers chapitres/règles principaux TELS QU'ILS SONT dans le document.

Réponds en JSON avec UNIQUEMENT ce tableau:
[
  {
    "title": "titre du chapitre en français",
    "rule": "explication de la règle en français (2-3 phrases, fidèle au document)",
    "ruleDe": "explication en allemand simple (du document ou adaptée)",
    "examples": [{ "de": "exemple en allemand", "fr": "traduction", "highlight": "mot clé" }],
    "tip": "astuce mémo en français"
  }
]

Réponds UNIQUEMENT avec le tableau JSON valide. Pas de texte autour.`
      )],
    });
    return ensureArray(parseAIJson((res.content[0] as { text: string }).text));
  });

  // Step 2 : génération des exercices Claude (appel séparé)
  const exercises = await step.run("generate-grammar-exercises", async () => {
    if (chapters.length === 0) return [];
    try {
      const res = await anthropic.messages.create({
        model: AI_MODEL, max_tokens: 4000,
        messages: [pdfMsg(base64,
          `En te basant sur les règles de grammaire de ce document (niveau ${level}, secteur ${sector}), génère 2 exercices par règle pour les 5 premières règles (10 exercices au total).

Varie les types: GRAMMATIK_LUECKENTEXT, FILL_IN_BLANK, MULTIPLE_CHOICE, SENTENCE_BUILDER.

Réponds avec un tableau JSON de 10 exercices. Chaque exercice a:
- type, instructions (français), questions[], level="${level}", sector="${sector}", skill:"GRAMMATIK", xpReward:15, difficultyScore:0.5

Réponds UNIQUEMENT avec le tableau JSON valide.`
        )],
      });
      return ensureArray(parseAIJson((res.content[0] as { text: string }).text));
    } catch (err) {
      console.error("[process-document] Génération exercices grammaire échouée:", err);
      return [];
    }
  });

  // Step 3 : insertion en DB
  const exerciseIds = await step.run("save-grammar-exercises", async () => {
    const ids: string[] = [];
    for (const [i, content] of exercises.entries()) {
      ids.push(await insertExercise(content, level, sector, importId, userId, 15, false, i));
    }
    return ids;
  });

  return { chapters, exerciseIds };
}

// ─── Fonction Inngest principale ──────────────────────────────────────────────
export const processDocumentFn = inngest.createFunction(
  {
    id: "process-document",
    name: "Traitement document importé",
    retries: 2,
    triggers: [{ event: "document/process" }],
  },
  async ({ event, step }: {
    event: { data: { importId: string; userId: string; level: CEFRLevel; sector: Sector } };
    step: Step;
  }) => {
    const { importId, userId, level, sector } = event.data;

    // ── Marquer en cours ──────────────────────────────────────────────────────
    await step.run("mark-processing", async () => {
      await db.update(documentImport)
        .set({ status: "processing", updatedAt: new Date() })
        .where(eq(documentImport.id, importId));
    });

    try {
      // ── Lire le base64 depuis la DB ───────────────────────────────────────
      const pdfBase64 = await step.run("read-pdf-from-db", async () => {
        const doc = await db.query.documentImport.findFirst({
          where: eq(documentImport.id, importId),
        });
        if (!doc?.extractedText?.startsWith("BASE64:")) {
          throw new Error("PDF introuvable en base de données");
        }
        return doc.extractedText.slice(7);
      });

      // ── Détecter le type ──────────────────────────────────────────────────
      const detection = await step.run("detect-type", async () => {
        return detectDocumentType(pdfBase64);
      });

      await step.run("update-doc-type", async () => {
        await db.update(documentImport)
          .set({ docType: detection.type, updatedAt: new Date() })
          .where(eq(documentImport.id, importId));
      });

      const docLevel = detection.level ?? level;
      const docSector = detection.sector ?? sector;
      let result: object = {};

      if (detection.type === "exercises") {
        const exerciseIds = await processExercises(step, pdfBase64, docLevel, docSector, importId, userId);
        result = { type: "exercises", exerciseIds, count: exerciseIds.length, summary: detection.summary };

      } else if (detection.type === "modellsatz") {
        const exerciseIds = await processModellsatz(step, pdfBase64, docLevel, docSector, importId, userId);
        result = { type: "modellsatz", exerciseIds, count: exerciseIds.length, summary: detection.summary };

      } else if (detection.type === "grammar") {
        const { chapters, exerciseIds } = await processGrammar(step, pdfBase64, docLevel, docSector, importId, userId);
        result = { type: "grammar", chapters, exerciseIds, count: exerciseIds.length, summary: detection.summary };

      } else {
        result = { type: "unknown", summary: detection.summary };
      }

      // ── Succès ────────────────────────────────────────────────────────────
      await step.run("mark-done", async () => {
        await db.update(documentImport)
          .set({
            status: "done",
            result: result as never,
            extractedText: null, // libérer le base64
            updatedAt: new Date(),
          })
          .where(eq(documentImport.id, importId));
      });

      return result;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue lors du traitement";

      await step.run("mark-error", async () => {
        await db.update(documentImport)
          .set({ status: "error", errorMessage: message, updatedAt: new Date() })
          .where(eq(documentImport.id, importId));
      });

      throw err;
    }
  }
);
