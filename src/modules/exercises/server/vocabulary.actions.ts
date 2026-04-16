"use server";

import { db } from "@/lib/db";
import { exercise, spacedRepetition, wordDetailCache } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { parseAIJson } from "@/lib/ai/parse";
import { aiChat, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

const PAGE_SIZE = 20;

export async function getVocabulary(page = 1) {
  const session = await assertAuth();
  const uid = session.user.id;
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, countResult] = await Promise.all([
    db
      .select({ exercise, sr: spacedRepetition })
      .from(spacedRepetition)
      .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
      .where(and(eq(spacedRepetition.userId, uid), eq(exercise.type, "VOCAB_FLASHCARD")))
      .orderBy(desc(spacedRepetition.updatedAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(spacedRepetition)
      .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
      .where(and(eq(spacedRepetition.userId, uid), eq(exercise.type, "VOCAB_FLASHCARD"))),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const now = new Date();

  const words = rows.map((r) => {
    const content = r.exercise.content as {
      word?: string; article?: string; translation?: string;
      exampleSentence?: string; exampleTranslation?: string; tags?: string[];
    };
    const isDue = new Date(r.sr.nextReviewAt) <= now;
    const mastery =
      r.sr.repetitions >= 5 && r.sr.easeFactor >= 2.3 ? "mastered"
      : r.sr.repetitions >= 2 ? "learning"
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

  return {
    words,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function generateVocabWords(params: {
  sector: Sector;
  level: CEFRLevel;
  count?: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;
  const { sector, level, count = 5 } = params;

  const existingRows = await db
    .select({ content: exercise.content })
    .from(spacedRepetition)
    .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
    .where(and(eq(spacedRepetition.userId, uid), eq(exercise.type, "VOCAB_FLASHCARD")));

  const existingWords = existingRows
    .map((r) => (r.content as { word?: string }).word ?? "")
    .filter(Boolean);

  const exclusionBlock =
    existingWords.length > 0
      ? `\nMots déjà dans le vocabulaire de l'utilisateur (NE PAS répéter) :\n${existingWords.join(", ")}\n`
      : "";

  const LEVEL_HINTS: Record<CEFRLevel, string> = {
    A0: "mots très basiques : chiffres, couleurs, salutations, famille, objets du quotidien",
    A1: "mots courants : nourriture, transport, logement, achats, corps humain",
    A2: "mots intermédiaires : travail, santé, loisirs, météo, sentiments",
    B1: "mots variés : opinions, actualités, relations professionnelles, voyages",
    B2: "mots avancés : nuances, expressions idiomatiques, vocabulaire technique",
    C1: "mots soutenus : registres formels, expressions abstraites, termes spécialisés",
    C2: "mots sophistiqués : termes rares, proverbes, registre littéraire, argot cultivé",
  };

  const prompt = `${SYSTEM_PROMPT_BASE}

Génère exactement ${count} mots de vocabulaire allemand pour un apprenant de niveau ${level}, secteur ${sector}.
Domaine : ${LEVEL_HINTS[level]}.
${exclusionBlock}
Règles absolues :
- Chaque mot doit être UNIQUE et différent des mots existants listés ci-dessus
- Varie les catégories grammaticales (Nomen, Verb, Adjektiv, Adverb, Phrase)
- Varie les thèmes au sein du secteur ${sector}
- Pour chaque mot, génère IMMÉDIATEMENT tous ses détails complets (définition, phrases, synonymes)
  afin qu'aucun appel API supplémentaire ne soit nécessaire

Réponds UNIQUEMENT avec un tableau JSON de ${count} objets :
[
  {
    "word": "le mot allemand",
    "article": "der/die/das ou null si pas un nom",
    "translation": "traduction française courte",
    "exampleSentence": "une phrase d'exemple en allemand (niveau ${level})",
    "exampleTranslation": "traduction française de la phrase",
    "wordType": "Nomen|Verb|Adjektiv|Adverb|Präposition|Konjunktion|Phrase",
    "tags": ["tag1", "tag2"],
    "difficultyScore": 0.5,
    "definitionDe": "définition en allemand simple (2-3 phrases, niveau ${level})",
    "definitionFr": "traduction courte de la définition en français",
    "plural": "forme plurielle si nom, sinon null",
    "sentences": [
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" },
      { "de": "phrase en allemand", "fr": "traduction", "context": "contexte court" }
    ],
    "synonyms": ["synonyme1", "synonyme2"],
    "antonyms": ["antonyme1"],
    "tip": "astuce mémo ou règle grammaticale en français (1 phrase)"
  }
]`;

  const raw = await aiChat("vocab_gen", [{ role: "user", content: prompt }], 4000);
  const generated = await parseAIJson<Array<{
    word: string; article: string | null; translation: string;
    exampleSentence: string; exampleTranslation: string;
    wordType: string; tags: string[]; difficultyScore: number;
    definitionDe: string; definitionFr: string; plural: string | null;
    sentences: Array<{ de: string; fr: string; context: string }>;
    synonyms: string[]; antonyms: string[]; tip: string | null;
  }>>(raw);

  const deduped = generated.filter(
    (g, i, arr) =>
      !existingWords.includes(g.word) &&
      arr.findIndex((x) => x.word === g.word) === i
  );

  let saved = 0;
  for (const item of deduped) {
    const [ex] = await db.insert(exercise).values({
      id: nanoid(),
      type: "VOCAB_FLASHCARD",
      level,
      sector,
      skill: "WORTSCHATZ",
      content: {
        word: item.word,
        article: item.article,
        translation: item.translation,
        exampleSentence: item.exampleSentence,
        exampleTranslation: item.exampleTranslation,
        wordType: item.wordType,
        tags: item.tags,
        synonyms: item.synonyms,
      } as never,
      difficultyScore: item.difficultyScore ?? 0.5,
      xpReward: 10,
      isAiGenerated: true,
    }).returning();

    await db.insert(spacedRepetition).values({
      id: nanoid(),
      userId: uid,
      exerciseId: ex.id,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewAt: new Date(),
    });

    await db.insert(wordDetailCache).values({
      exerciseId: ex.id,
      definitionDe: item.definitionDe,
      definitionFr: item.definitionFr,
      wordType: item.wordType,
      plural: item.plural ?? null,
      sentences: item.sentences as never,
      synonyms: item.synonyms as never,
      antonyms: item.antonyms as never,
      tip: item.tip ?? null,
    });

    saved++;
  }

  return saved;
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

  const cached = await db.query.wordDetailCache.findFirst({
    where: (c, { eq }) => eq(c.exerciseId, exerciseId),
  });

  let detail: {
    definitionDe: string; definitionFr: string; wordType: string;
    plural: string | null;
    sentences: Array<{ de: string; fr: string; context: string }>;
    synonyms: string[]; antonyms: string[]; tip: string;
  };

  if (cached) {
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
    const prompt = `${SYSTEM_PROMPT_BASE}

Pour le mot allemand "${article ? article + " " : ""}${word}" (niveau ${level}, secteur ${sector}), génère tous les détails.

Réponds UNIQUEMENT en JSON valide :
{
  "definitionDe": "définition en allemand simple (2-3 phrases, niveau ${level})",
  "definitionFr": "traduction courte en français",
  "wordType": "Nomen|Verb|Adjektiv|Adverb|Präposition|Konjunktion|Phrase",
  "plural": "forme plurielle si nom, sinon null",
  "sentences": [
    { "de": "phrase", "fr": "traduction", "context": "contexte" }
  ],
  "synonyms": ["synonyme1"],
  "antonyms": ["antonyme1"],
  "tip": "astuce mémo en français (1 phrase)"
}
Génère exactement 10 phrases variées.`;

    const raw = await aiChat("word_detail", [{ role: "user", content: prompt }], 2000);
    detail = parseAIJson(raw);

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
    article,
    translation: content.translation ?? "",
    exampleSentence: content.exampleSentence ?? "",
    exampleTranslation: content.exampleTranslation ?? "",
    synonyms: content.synonyms ?? [],
    tags: content.tags ?? [],
    sector: row.exercise.sector,
    level: row.exercise.level,
    mastery:
      row.sr.repetitions >= 5 ? "mastered"
      : row.sr.repetitions >= 2 ? "learning"
      : "new",
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
