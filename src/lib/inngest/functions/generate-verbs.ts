import { inngest } from "../client";
import { db } from "@/lib/db";
import { verbCache } from "@/lib/db/schema";
import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { ensureArray } from "@/lib/ai/parse";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel } from "@/types";

const SECTORS = ["IT", "BUSINESS", "SANTE", "DROIT", "TOURISME", "QUOTIDIEN", "AUTRE"] as const;
type Sector = typeof SECTORS[number];

const SECTOR_CONTEXT: Record<Sector, string> = {
  IT: "développement logiciel, DevOps, cybersécurité, cloud, réunions techniques, déploiement, debugging",
  BUSINESS: "réunions d'affaires, négociations, emails professionnels, finance, comptabilité, management",
  SANTE: "médecine, hôpital, communication patient-médecin, soins, pharmacie, urgences",
  DROIT: "juridique, contrats, conformité, tribunal, procédures légales, notariat",
  TOURISME: "voyage, hôtels, restaurants, transports, tourisme, réservations, visites",
  QUOTIDIEN: "vie quotidienne, famille, shopping, loisirs, cuisine, sport, amis",
  AUTRE: "situations diverses, culture générale, actualités, environnement",
};

const LEVEL_HINTS: Record<CEFRLevel, string> = {
  A0: "verbes très basiques, actions simples du quotidien",
  A1: "verbes courants, actions quotidiennes simples",
  A2: "verbes intermédiaires, actions professionnelles simples",
  B1: "verbes variés, nuances, contextes professionnels",
  B2: "verbes avancés, expressions idiomatiques, registres variés",
  C1: "verbes soutenus, registres formels, nuances fines",
  C2: "verbes sophistiqués, expressions rares, registre littéraire",
};

const PERSONS = ["ich", "du", "er/sie/es", "wir", "ihr", "sie/Sie"] as const;
const TENSES = ["Präsens", "Präteritum", "Perfekt", "Futur I"] as const;

async function generateVerbsBatch(
  sector: Sector,
  level: CEFRLevel,
  existingInfinitives: string[],
  count: number
): Promise<Array<{
  infinitive: string;
  translation: string;
  isIrregular: boolean;
  auxiliary: "haben" | "sein" | null;
  participle: string | null;
  conjugations: Record<string, Record<string, string>>;
  sentences: Record<string, { de: string; fr: string }>;
  irregularityNote: string | null;
  memoryTip: string | null;
  story: {
    title: string;
    story: string;
    context: string;
    blanks: Array<{ id: string; person: string; tense: string; answer: string; hint: string }>;
  } | null;
}>> {
  const exclusion = existingInfinitives.length > 0
    ? `\nVerbes déjà en base (NE PAS répéter) : ${existingInfinitives.slice(-80).join(", ")}\n`
    : "";

  const prompt = `Tu es un expert en grammaire allemande et en pédagogie des langues.

Génère exactement ${count} verbes allemands utiles pour un apprenant de niveau ${level} dans le secteur ${sector}.
Contexte du secteur : ${SECTOR_CONTEXT[sector]}.
Niveau : ${LEVEL_HINTS[level]}.
${exclusion}
Pour chaque verbe, génère TOUT le nécessaire en une seule fois :
- Conjugaisons complètes aux 4 temps (Präsens, Präteritum, Perfekt, Futur I) pour les 6 personnes
- 6 phrases d'exemple au Präsens (une par pronom), naturelles et liées au secteur
- Si irrégulier : explication du pattern (Ablaut, etc.)
- Astuce mémo
- Une mini-histoire (5-6 phrases) utilisant le verbe avec 4 blancs à conjuguer

Réponds UNIQUEMENT avec un tableau JSON valide :
[
  {
    "infinitive": "verbe à l'infinitif",
    "translation": "traduction française",
    "isIrregular": true,
    "auxiliary": "haben",
    "participle": "Partizip II",
    "conjugations": {
      "Präsens": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
      "Präteritum": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
      "Perfekt": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." },
      "Futur I": { "ich": "...", "du": "...", "er/sie/es": "...", "wir": "...", "ihr": "...", "sie/Sie": "..." }
    },
    "sentences": {
      "ich|Präsens": { "de": "phrase naturelle", "fr": "traduction" },
      "du|Präsens": { "de": "...", "fr": "..." },
      "er/sie/es|Präsens": { "de": "...", "fr": "..." },
      "wir|Präsens": { "de": "...", "fr": "..." },
      "ihr|Präsens": { "de": "...", "fr": "..." },
      "sie/Sie|Präsens": { "de": "...", "fr": "..." }
    },
    "irregularityNote": "explication du pattern irrégulier ou null",
    "memoryTip": "astuce mémo courte en français",
    "story": {
      "title": "titre court en français",
      "story": "histoire avec [BLANK_1] à [BLANK_4]",
      "context": "contexte en français",
      "blanks": [
        { "id": "BLANK_1", "person": "ich", "tense": "Präsens", "answer": "forme correcte", "hint": "indice court" }
      ]
    }
  }
]`;

  const raw = await aiChat("vocab_gen", [{ role: "user", content: prompt }], 4000);
  const result = parseAIJson(raw);
  return ensureArray(result);
}

export const generateVerbsFn = inngest.createFunction(
  {
    id: "generate-verbs-daily",
    name: "Générer les verbes du jour",
    retries: 2,
    triggers: [
      { cron: "0 2 * * *" },
      { event: "verbs/generate" },
    ],
  },
  async ({ step }) => {
    const VERBS_PER_SECTOR = 5;
    const LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2"];
    let totalGenerated = 0;

    for (const sector of SECTORS) {
      for (const level of LEVELS) {
        await step.run(`generate-${sector}-${level}`, async () => {
          const existing = await db
            .select({ infinitive: verbCache.infinitive })
            .from(verbCache)
            .where(eq(verbCache.sector, sector as never));

          const existingInfinitives = existing.map((r) => r.infinitive);

          let verbs;
          try {
            verbs = await generateVerbsBatch(sector, level, existingInfinitives, VERBS_PER_SECTOR);
          } catch {
            return { skipped: true, sector, level };
          }

          for (const verb of verbs) {
            const alreadyExists = existingInfinitives.includes(verb.infinitive);
            if (alreadyExists) continue;

            try {
              await db.insert(verbCache).values({
                id: nanoid(),
                infinitive: verb.infinitive,
                translation: verb.translation,
                sector: sector as never,
                level: level as never,
                isIrregular: verb.isIrregular ?? false,
                auxiliary: verb.auxiliary ?? null,
                participle: verb.participle ?? null,
                conjugations: verb.conjugations as never,
                sentences: (verb.sentences ?? {}) as never,
                irregularityNote: verb.irregularityNote ?? null,
                memoryTip: verb.memoryTip ?? null,
                story: (verb.story ?? null) as never,
              }).onConflictDoNothing();
              totalGenerated++;
            } catch {
              // doublon ou erreur — on continue
            }
          }

          return { sector, level, count: verbs.length };
        });
      }
    }

    return { totalGenerated };
  }
);
