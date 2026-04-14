import { inngest } from "../client";
import { db } from "@/lib/db";
import { documentImport, exercise, spacedRepetition } from "@/lib/db/schema";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

const VALID_SKILLS = ["LESEN", "SCHREIBEN", "HOEREN", "SPRECHEN", "WORTSCHATZ", "GRAMMATIK"] as const;
const VALID_TYPES = [
  "LESEN_ZUORDNUNG","LESEN_MULTIPLE_CHOICE","LESEN_RICHTIG_FALSCH","LESEN_LUECKENTEXT","LESEN_REIHENFOLGE",
  "SCHREIBEN_EMAIL","SCHREIBEN_NOTIZ","SCHREIBEN_MEINUNG","SCHREIBEN_BESCHREIBUNG","SCHREIBEN_ZUSAMMENFASSUNG",
  "HOEREN_MULTIPLE_CHOICE","HOEREN_ZUORDNUNG","HOEREN_ERGAENZUNG","HOEREN_RICHTIG_FALSCH",
  "SPRECHEN_VORSTELLEN","SPRECHEN_DIALOG","SPRECHEN_BESCHREIBUNG","SPRECHEN_DISKUSSION","SPRECHEN_ROLEPLAY",
  "VOCAB_FLASHCARD","VOCAB_LUECKENTEXT","VOCAB_ZUORDNUNG","VOCAB_BILD","VOCAB_SEKTOR",
  "GRAMMATIK_LUECKENTEXT","GRAMMATIK_ORDNEN","GRAMMATIK_TRANSFORMATION","GRAMMATIK_FEHLERKORREKTUR",
] as const;

function normalizeSkill(raw: string | undefined): typeof VALID_SKILLS[number] {
  const upper = (raw ?? "").toUpperCase();
  return (VALID_SKILLS as readonly string[]).includes(upper)
    ? upper as typeof VALID_SKILLS[number]
    : "WORTSCHATZ";
}

function normalizeType(raw: string | undefined): typeof VALID_TYPES[number] {
  const upper = (raw ?? "").toUpperCase();
  return (VALID_TYPES as readonly string[]).includes(upper)
    ? upper as typeof VALID_TYPES[number]
    : "GRAMMATIK_LUECKENTEXT";
}

async function insertExercise(content: object, level: CEFRLevel, sector: Sector, userId: string, xpReward = 15) {
  const c = content as Record<string, unknown>;
  const [ex] = await db.insert(exercise).values({
    id: nanoid(),
    type: normalizeType(c.type as string) as never,
    level,
    sector,
    skill: normalizeSkill(c.skill as string) as never,
    content: content as never,
    difficultyScore: (c.difficultyScore as number) ?? 0.5,
    xpReward: (c.xpReward as number) ?? xpReward,
    isAiGenerated: true,
  }).returning();

  await db.insert(spacedRepetition).values({
    id: nanoid(), userId, exerciseId: ex.id,
    easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewAt: new Date(),
  });

  return ex.id;
}
async function detectDocumentType(text: string): Promise<{
  type: "exercises" | "modellsatz" | "grammar" | "unknown";
  level: CEFRLevel;
  sector: Sector;
  summary: string;
}> {
  const prompt = `${SYSTEM_PROMPT_BASE}

Analyse ce texte extrait d'un document allemand et détermine son type.

TEXTE (premiers 3000 caractères):
${text.slice(0, 3000)}

Réponds en JSON:
{
  "type": "exercises" | "modellsatz" | "grammar" | "unknown",
  "level": "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "sector": "IT" | "BUSINESS" | "SANTE" | "DROIT" | "TOURISME" | "QUOTIDIEN" | "AUTRE",
  "summary": "description courte du document en français (1 phrase)"
}

Critères:
- "exercises": feuille d'exercices avec questions/réponses
- "modellsatz": examen modèle Goethe/ÖSD complet avec plusieurs parties
- "grammar": livre ou cours de grammaire avec règles et explications
- "unknown": autre type de document`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return parseAIJson((response.content[0] as { text: string }).text);
}

// ─── Traitement exercices ─────────────────────────────────────────────────────
async function processExercises(
  text: string, level: CEFRLevel, sector: Sector, userId: string
): Promise<string[]> {
  const prompt = `${SYSTEM_PROMPT_BASE}

Extrait et convertis les exercices de ce document en JSON.
Niveau: ${level}, Secteur: ${sector}

TEXTE:
${text.slice(0, 8000)}

Pour chaque exercice trouvé, génère un objet JSON correspondant à l'un de ces types:
- LESEN_MULTIPLE_CHOICE, LESEN_RICHTIG_FALSCH, LESEN_LUECKENTEXT
- GRAMMATIK_LUECKENTEXT, GRAMMATIK_ORDNEN, GRAMMATIK_TRANSFORMATION
- VOCAB_FLASHCARD, VOCAB_LUECKENTEXT, VOCAB_ZUORDNUNG
- SCHREIBEN_EMAIL, SCHREIBEN_MEINUNG

Réponds avec un tableau JSON d'exercices (max 10):
[
  { "type": "...", "instructions": "...", ...champs selon le type... }
]

Chaque exercice doit avoir: type, instructions (en français), level: "${level}", sector: "${sector}", skill, xpReward, difficultyScore.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const extracted = parseAIJson<object[]>((response.content[0] as { text: string }).text);
  const exerciseIds: string[] = [];

  for (const content of extracted) {
    exerciseIds.push(await insertExercise(content, level, sector, userId, 15));
  }

  // Générer 5 exercices supplémentaires du même style
  const stylePrompt = `${SYSTEM_PROMPT_BASE}

En t'inspirant du style de ces exercices extraits d'un document de niveau ${level}:
${JSON.stringify(extracted.slice(0, 2))}

Génère 5 nouveaux exercices du même type et niveau pour le secteur ${sector}.
Réponds avec un tableau JSON de 5 exercices avec les mêmes champs.`;

  const extraResponse = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 3000,
    messages: [{ role: "user", content: stylePrompt }],
  });

  const extra = parseAIJson<object[]>((extraResponse.content[0] as { text: string }).text);
  for (const content of extra) {
    exerciseIds.push(await insertExercise(content, level, sector, userId, 15));
  }

  return exerciseIds;
}

// ─── Traitement Modellsatz ────────────────────────────────────────────────────
async function processModellsatz(
  text: string, level: CEFRLevel, sector: Sector, userId: string
): Promise<string[]> {
  const prompt = `${SYSTEM_PROMPT_BASE}

Ce document est un Modellsatz (examen modèle) de niveau ${level}.
Extrait toutes les parties (Lesen, Schreiben, Hören, Sprechen) et convertis chaque exercice.

TEXTE:
${text.slice(0, 10000)}

Réponds avec un tableau JSON d'exercices (toutes les parties):
[{ "type": "...", "instructions": "...", ...}]

Inclure: type, instructions, level: "${level}", sector: "${sector}", skill, xpReward: 20, difficultyScore.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 5000,
    messages: [{ role: "user", content: prompt }],
  });

  const extracted = parseAIJson<object[]>((response.content[0] as { text: string }).text);
  const exerciseIds: string[] = [];

  for (const content of extracted) {
    exerciseIds.push(await insertExercise(content, level, sector, userId, 20));
  }

  // Générer 1 Modellsatz supplémentaire complet
  const extraPrompt = `${SYSTEM_PROMPT_BASE}

Génère un Modellsatz complet de niveau ${level} pour le secteur ${sector}.
Inclure: 2 exercices Lesen, 1 Schreiben, 1 Hören (avec script), 1 Sprechen.
Réponds avec un tableau JSON de 5 exercices.`;

  const extraResponse = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: extraPrompt }],
  });

  const extra = parseAIJson<object[]>((extraResponse.content[0] as { text: string }).text);
  for (const content of extra) {
    exerciseIds.push(await insertExercise(content, level, sector, userId, 20));
  }

  return exerciseIds;
}

// ─── Traitement livre de grammaire ────────────────────────────────────────────
async function processGrammar(
  text: string, level: CEFRLevel, sector: Sector, userId: string
): Promise<{ chapters: object[]; exerciseIds: string[] }> {
  // Extraire les 3 premiers chapitres/règles
  const prompt = `${SYSTEM_PROMPT_BASE}

Ce document est un livre de grammaire allemande. Niveau cible: ${level}.
Extrait les 3 premières règles/chapitres principaux et crée un cours interactif.

TEXTE:
${text.slice(0, 8000)}

Réponds en JSON:
{
  "chapters": [
    {
      "title": "titre du chapitre en français",
      "rule": "explication de la règle en français (2-3 phrases claires)",
      "ruleDe": "explication en allemand simple",
      "examples": [
        { "de": "exemple en allemand", "fr": "traduction", "highlight": "mot clé à retenir" }
      ],
      "tip": "astuce mémo en français"
    }
  ],
  "exercises": [
    { "type": "GRAMMATIK_LUECKENTEXT", "instructions": "...", ...champs complets... }
  ]
}

Génère 2 exercices par chapitre (6 au total). Chaque exercice: type, instructions, level: "${level}", sector: "${sector}", skill: "GRAMMATIK", xpReward: 15, difficultyScore: 0.5.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 5000,
    messages: [{ role: "user", content: prompt }],
  });

  const result = parseAIJson<{ chapters: object[]; exercises: object[] }>(
    (response.content[0] as { text: string }).text
  );

  const exerciseIds: string[] = [];
  for (const content of result.exercises ?? []) {
    exerciseIds.push(await insertExercise(content, level, sector, userId, 15));
  }

  return { chapters: result.chapters ?? [], exerciseIds };
}

// ─── Fonction Inngest principale ──────────────────────────────────────────────
export const processDocumentFn = inngest.createFunction(
  {
    id: "process-document",
    name: "Traitement document importé",
    retries: 2,
    triggers: [{ event: "document/process" }],
  },
  async ({ event, step }: { event: { data: { importId: string; userId: string; extractedText: string; level: CEFRLevel; sector: Sector } }; step: { run: <T>(id: string, fn: () => Promise<T>) => Promise<T> } }) => {
    const { importId, userId, extractedText, level, sector } = event.data as {
      importId: string;
      userId: string;
      extractedText: string;
      level: CEFRLevel;
      sector: Sector;
    };

    // Marquer comme en cours
    await step.run("mark-processing", async () => {
      await db.update(documentImport).set({ status: "processing", updatedAt: new Date() })
        .where(eq(documentImport.id, importId));
    });

    // Détecter le type
    const detection = await step.run("detect-type", async () => {
      return detectDocumentType(extractedText);
    });

    await step.run("update-doc-type", async () => {
      await db.update(documentImport).set({ docType: detection.type, updatedAt: new Date() })
        .where(eq(documentImport.id, importId));
    });

    const docLevel = detection.level ?? level;
    const docSector = detection.sector ?? sector;

    // Traiter selon le type
    let result: object = {};

    if (detection.type === "exercises") {
      const exerciseIds = await step.run("process-exercises", async () => {
        return processExercises(extractedText, docLevel, docSector, userId);
      });
      result = { type: "exercises", exerciseIds, count: exerciseIds.length, summary: detection.summary };
    } else if (detection.type === "modellsatz") {
      const exerciseIds = await step.run("process-modellsatz", async () => {
        return processModellsatz(extractedText, docLevel, docSector, userId);
      });
      result = { type: "modellsatz", exerciseIds, count: exerciseIds.length, summary: detection.summary };
    } else if (detection.type === "grammar") {
      const { chapters, exerciseIds } = await step.run("process-grammar", async () => {
        return processGrammar(extractedText, docLevel, docSector, userId);
      });
      result = { type: "grammar", chapters, exerciseIds, count: exerciseIds.length, summary: detection.summary };
    } else {
      result = { type: "unknown", summary: detection.summary };
    }

    // Marquer comme terminé
    await step.run("mark-done", async () => {
      await db.update(documentImport).set({
        status: "done",
        result: result as never,
        updatedAt: new Date(),
      }).where(eq(documentImport.id, importId));
    });

    return result;
  }
);
