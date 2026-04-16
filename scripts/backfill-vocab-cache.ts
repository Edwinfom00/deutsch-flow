import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { exercise, wordDetailCache } from "../src/lib/db/schema";
import { aiChat, SYSTEM_PROMPT_BASE } from "../src/lib/ai/client";
import { parseAIJson } from "../src/lib/ai/parse";
import { eq, notInArray, sql } from "drizzle-orm";

const BATCH_SIZE = 5;
const DELAY_MS = 1200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateDetail(word: string, article: string | null, level: string, sector: string) {
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
Génère exactement 10 phrases variées couvrant différents contextes du secteur ${sector}.`;

  const raw = await aiChat("word_detail", [{ role: "user", content: prompt }], 2000);
  return parseAIJson<{
    definitionDe: string; definitionFr: string; wordType: string;
    plural: string | null;
    sentences: Array<{ de: string; fr: string; context: string }>;
    synonyms: string[]; antonyms: string[]; tip: string | null;
  }>(raw);
}

async function main() {
  console.log("=== Backfill vocabulaire — wordDetailCache ===\n");

  const cachedIds = await db
    .select({ id: wordDetailCache.exerciseId })
    .from(wordDetailCache);

  const cachedSet = new Set(cachedIds.map((r) => r.id));

  const allVocab = await db
    .select()
    .from(exercise)
    .where(eq(exercise.type, "VOCAB_FLASHCARD"));

  const missing = allVocab.filter((ex) => !cachedSet.has(ex.id));

  console.log(`Total VOCAB_FLASHCARD : ${allVocab.length}`);
  console.log(`Déjà en cache         : ${cachedSet.size}`);
  console.log(`À traiter             : ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("Rien à faire — tous les mots ont déjà leur cache.");
    process.exit(0);
  }

  let done = 0;
  let errors = 0;

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (ex) => {
        const content = ex.content as {
          word?: string; article?: string;
        };
        const word = content.word ?? "";
        const article = content.article ?? null;

        if (!word) {
          console.warn(`  [SKIP] exerciseId=${ex.id} — mot vide`);
          return;
        }

        try {
          const detail = await generateDetail(word, article, ex.level, ex.sector);

          await db.insert(wordDetailCache).values({
            exerciseId: ex.id,
            definitionDe: detail.definitionDe,
            definitionFr: detail.definitionFr,
            wordType: detail.wordType,
            plural: detail.plural ?? null,
            sentences: detail.sentences as never,
            synonyms: detail.synonyms as never,
            antonyms: detail.antonyms as never,
            tip: detail.tip ?? null,
          }).onConflictDoNothing();

          done++;
          console.log(`  [OK] (${done}/${missing.length}) "${article ? article + " " : ""}${word}" — ${ex.level}`);
        } catch (err) {
          errors++;
          console.error(`  [ERR] "${word}" — ${(err as Error).message}`);
        }
      })
    );

    if (i + BATCH_SIZE < missing.length) {
      process.stdout.write(`  Pause ${DELAY_MS}ms…\r`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n=== Terminé ===`);
  console.log(`Traités avec succès : ${done}`);
  console.log(`Erreurs             : ${errors}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Erreur fatale :", e);
  process.exit(1);
});
