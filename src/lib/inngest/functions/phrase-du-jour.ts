import { inngest } from "../client";
import { db } from "@/lib/db";
import { phraseDuJour, userProfile } from "@/lib/db/schema";
import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

const SECTOR_CONTEXT: Record<string, string> = {
  IT: "informatique, développement logiciel, réunions tech",
  BUSINESS: "réunions d'affaires, négociations, emails professionnels",
  SANTE: "médecine, hôpital, communication patient-médecin",
  DROIT: "juridique, contrats, conformité",
  TOURISME: "voyage, hôtels, restaurants, transports",
  QUOTIDIEN: "vie quotidienne, famille, shopping, loisirs",
  AUTRE: "situations diverses",
};

async function generatePhrase(level: CEFRLevel, sector: Sector, date: string): Promise<{
  phraseDe: string;
  phraseFr: string;
  context: string;
  tip: string | null;
}> {
  const prompt = `Génère une phrase utile en allemand pour un apprenant de niveau ${level} travaillant dans le secteur ${sector} (${SECTOR_CONTEXT[sector] ?? "général"}).

Date : ${date} — varie les phrases selon la date.

La phrase doit :
- Être naturelle et utilisable en situation réelle
- Être adaptée au niveau ${level} (simple pour A0/A1, plus complexe pour B1+)
- Être liée au contexte ${sector}

Réponds UNIQUEMENT en JSON :
{
  "phraseDe": "la phrase en allemand",
  "phraseFr": "traduction française naturelle",
  "context": "contexte d'utilisation court en français (ex: 'En réunion', 'Au téléphone')",
  "tip": "astuce grammaticale ou culturelle courte en français, ou null"
}`;

  const raw = await aiChat("word_of_day", [{ role: "user", content: prompt }], 300);
  return parseAIJson(raw);
}

export const generatePhraseDuJourFn = inngest.createFunction(
  {
    id: "generate-phrase-du-jour",
    name: "Générer les phrases du jour",
    retries: 2,
    triggers: [{ cron: "0 1 * * *" }],
  },
  async ({ step }) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const distinctProfiles = await step.run("get-distinct-profiles", async () => {
      const profiles = await db
        .selectDistinct({ level: userProfile.level, sector: userProfile.sector })
        .from(userProfile);
      return profiles;
    });

    let generated = 0;

    for (const { level, sector } of distinctProfiles) {
      await step.run(`generate-${level}-${sector}`, async () => {
        const existing = await db.query.phraseDuJour.findFirst({
          where: and(
            eq(phraseDuJour.date, tomorrow),
            eq(phraseDuJour.level, level as never),
            eq(phraseDuJour.sector, sector as never)
          ),
        });
        if (existing) return { skipped: true };

        const phrase = await generatePhrase(level as CEFRLevel, sector as Sector, tomorrow);

        await db.insert(phraseDuJour).values({
          id: nanoid(),
          date: tomorrow,
          level: level as never,
          sector: sector as never,
          ...phrase,
        });

        generated++;
        return { level, sector };
      });
    }

    return { date: tomorrow, generated };
  }
);
