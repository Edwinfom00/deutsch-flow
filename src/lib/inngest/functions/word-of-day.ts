import { inngest } from "../client";
import { db } from "@/lib/db";
import { wordOfDay } from "@/lib/db/schema";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel } from "@/types";

const LEVELS: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

const LEVEL_HINTS: Record<CEFRLevel, string> = {
  A0: "vocabulaire de base (chiffres, couleurs, salutations, famille proche)",
  A1: "vocabulaire quotidien simple (nourriture, transport, logement, achats)",
  A2: "vocabulaire courant (travail, santé, loisirs, météo)",
  B1: "vocabulaire intermédiaire (opinions, actualités simples, relations pro)",
  B2: "vocabulaire avancé (nuances, expressions idiomatiques, vocabulaire tech)",
  C1: "vocabulaire soutenu (registres formels, expressions abstraites)",
  C2: "vocabulaire sophistiqué (termes rares, proverbes, registre littéraire)",
};

async function generateWordForLevel(level: CEFRLevel, date: string) {
  const prompt = `${SYSTEM_PROMPT_BASE}

Génère un "mot du jour" en allemand pour un apprenant de niveau ${level}.
Domaine : ${LEVEL_HINTS[level]}.
Date : ${date} (varie les mots selon la date).

Réponds UNIQUEMENT en JSON valide:
{
  "word": "le mot allemand",
  "article": "der/die/das (null si pas un nom)",
  "translation": "traduction française",
  "exampleDe": "phrase d'exemple en allemand adaptée au niveau ${level}",
  "exampleFr": "traduction française de la phrase",
  "wordType": "Nomen|Verb|Adjektiv|Adverb|Präposition|Konjunktion|Phrase",
  "tip": "astuce ou info culturelle en français (1 phrase, peut être null)"
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson<{
    word: string; article: string | null; translation: string;
    exampleDe: string; exampleFr: string; wordType: string; tip: string | null;
  }>(raw);
}

export const generateWordOfDayFn = inngest.createFunction(
  { 
    id: "generate-word-of-day",
    name: "Générer les mots du jour",
    retries: 2,
    triggers: [
      { cron: "0 0 * * *" } // ✅ ici maintenant
    ]
  },
  async ({ step }) => {
    const tomorrow = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    for (const level of LEVELS) {
      await step.run(`generate-${level}`, async () => {
        // Vérifier si déjà généré
        const [existing] = await db
          .select()
          .from(wordOfDay)
          .where(
            and(
              eq(wordOfDay.date, tomorrow),
              eq(wordOfDay.level, level)
            )
          );

        if (existing) return { skipped: true, level };

        const generated = await generateWordForLevel(level, tomorrow);

        await db.insert(wordOfDay).values({
          id: nanoid(),
          date: tomorrow,
          level,
          ...generated,
        });

        return { level, word: generated.word };
      });
    }

    return { date: tomorrow, levelsGenerated: LEVELS.length };
  }
);