"use server";

import { db } from "@/lib/db";
import { exercise, spacedRepetition } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { generateExercise } from "@/lib/ai/exercise-generator";
import { parseAIJson } from "@/lib/ai/parse";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

export async function getVocabulary() {
  const session = await assertAuth();
  const uid = session.user.id;

  // Tous les VOCAB_FLASHCARD liés à cet utilisateur via SM-2
  const rows = await db
    .select({ exercise, sr: spacedRepetition })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(and(eq(spacedRepetition.userId, uid), eq(exercise.type, "VOCAB_FLASHCARD")))
    .orderBy(desc(spacedRepetition.updatedAt));

  const now = new Date();

  return rows.map((r) => {
    const content = r.exercise.content as {
      word?: string; article?: string; translation?: string;
      exampleSentence?: string; exampleTranslation?: string; tags?: string[];
    };

    const isDue = new Date(r.sr.nextReviewAt) <= now;
    const mastery = r.sr.repetitions >= 5 && r.sr.easeFactor >= 2.3
      ? "mastered"
      : r.sr.repetitions >= 2
      ? "learning"
      : "new";

    return {
      srId: r.sr.id,
      exerciseId: r.exercise.id,
      word: content.word ?? "",
      article: content.article ?? null,
      translation: content.translation ?? "",
      exampleSentence: content.exampleSentence ?? "",
      exampleTranslation: content.exampleTranslation ?? "",
      tags: content.tags ?? [],
      sector: r.exercise.sector,
      level: r.exercise.level,
      mastery,
      isDue,
      interval: r.sr.interval,
      repetitions: r.sr.repetitions,
      easeFactor: r.sr.easeFactor,
      nextReviewAt: r.sr.nextReviewAt,
    };
  });
}

export async function generateVocabWords(params: {
  sector: Sector;
  level: CEFRLevel;
  count?: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;
  const { sector, level, count = 5 } = params;

  const generated = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      generateExercise({
        type: "VOCAB_FLASHCARD",
        level,
        sector,
        skill: "WORTSCHATZ",
        topic: `mot ${i + 1} sur ${count} — choisis un mot différent des précédents, varié et utile pour le secteur`,
      })
    )
  );

  const saved = await Promise.all(
    generated.map(async ({ content, difficultyScore, xpReward }) => {
      const [ex] = await db.insert(exercise).values({
        id: nanoid(),
        type: "VOCAB_FLASHCARD",
        level,
        sector,
        skill: "WORTSCHATZ",
        content: content as never,
        difficultyScore,
        xpReward,
        isAiGenerated: true,
      }).returning();

      // Créer l'entrée SM-2 immédiatement (due maintenant)
      await db.insert(spacedRepetition).values({
        id: nanoid(),
        userId: uid,
        exerciseId: ex.id,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReviewAt: new Date(),
      });

      return ex;
    })
  );

  return saved.length;
}

export async function getWordDetail(exerciseId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const [row] = await db
    .select({ exercise, sr: spacedRepetition })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(and(eq(spacedRepetition.userId, uid), eq(spacedRepetition.exerciseId, exerciseId)));

  if (!row) throw new Error("Mot introuvable");

  const content = row.exercise.content as {
    word?: string; article?: string; translation?: string;
    exampleSentence?: string; exampleTranslation?: string;
    synonyms?: string[]; tags?: string[];
  };

  const word = content.word ?? "";
  const article = content.article ?? null;
  const level = row.exercise.level;
  const sector = row.exercise.sector;

  // ── Vérifier le cache avant d'appeler l'IA ────────────────────────────────
  const { wordDetailCache } = await import("@/lib/db/schema");
  const cached = await db.query.wordDetailCache.findFirst({
    where: (c, { eq }) => eq(c.exerciseId, exerciseId),
  });

  let detail: {
    definitionDe: string; definitionFr: string; wordType: string;
    plural: string | null; sentences: Array<{ de: string; fr: string; context: string }>;
    synonyms: string[]; antonyms: string[]; tip: string;
  };

  if (cached) {
    // Utiliser le cache
    detail = {
      definitionDe: cached.definitionDe,
      definitionFr: cached.definitionFr,
      wordType: cached.wordType,
      plural: cached.plural,
      sentences: cached.sentences as Array<{ de: string; fr: string; context: string }>,
      synonyms: cached.synonyms as string[],
      antonyms: cached.antonyms as string[],
      tip: cached.tip ?? "",
    };
  } else {
    // Générer via l'IA et mettre en cache
    const prompt = `${SYSTEM_PROMPT_BASE}

Pour le mot allemand "${article ? article + " " : ""}${word}" (niveau ${level}, secteur ${sector}), génère:

Réponds UNIQUEMENT en JSON valide:
{
  "definitionDe": "définition en allemand simple et claire (2-3 phrases, adapté au niveau ${level})",
  "definitionFr": "traduction courte de la définition en français (1-2 phrases)",
  "wordType": "Nomen / Verb / Adjektiv / Adverb / Präposition",
  "plural": "forme plurielle si nom (ex: die Sicherheitslücken), sinon null",
  "sentences": [
    {
      "de": "phrase en allemand utilisant le mot naturellement",
      "fr": "traduction française",
      "context": "contexte court en français (ex: email professionnel, réunion)"
    }
  ],
  "synonyms": ["synonyme1 en allemand", "synonyme2"],
  "antonyms": ["antonyme1 en allemand"],
  "tip": "astuce mémo ou règle grammaticale en allemand simple (1 phrase)"
}

Génère exactement 10 phrases variées couvrant différents contextes du secteur ${sector}.
IMPORTANT: La définition principale doit être EN ALLEMAND, accessible pour un niveau ${level}.`;

    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (response.content[0] as { type: string; text: string }).text;
    detail = parseAIJson(raw);

    // Sauvegarder en cache
    await db.insert(wordDetailCache).values({
      exerciseId,
      definitionDe: detail.definitionDe,
      definitionFr: detail.definitionFr,
      wordType: detail.wordType,
      plural: detail.plural ?? null,
      sentences: detail.sentences as never,
      synonyms: detail.synonyms as never,
      antonyms: detail.antonyms as never,
      tip: detail.tip ?? null,
    });
  }

  return {
    exerciseId: row.exercise.id,
    srId: row.sr.id,
    word,
    article: article as string | null,
    translation: content.translation ?? "",
    exampleSentence: content.exampleSentence ?? "",
    exampleTranslation: content.exampleTranslation ?? "",
    synonyms: content.synonyms ?? [],
    tags: content.tags ?? [],
    sector: row.exercise.sector,
    level: row.exercise.level,
    mastery: row.sr.repetitions >= 5 ? "mastered" : row.sr.repetitions >= 2 ? "learning" : "new",
    interval: row.sr.interval,
    repetitions: row.sr.repetitions,
    definitionDe: detail.definitionDe,
    definitionFr: detail.definitionFr,
    wordType: detail.wordType,
    plural: detail.plural,
    sentences: detail.sentences,
    allSynonyms: detail.synonyms,
    antonyms: detail.antonyms,
    tip: detail.tip,
  };
}
