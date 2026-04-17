"use server";

import { db } from "@/lib/db";
import { phraseDuJour, userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
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

export async function getPhraseDuJour() {
  const session = await assertAuth();
  const uid = session.user.id;
  const today = new Date().toISOString().split("T")[0];

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const level = (profile?.level ?? "A1") as CEFRLevel;
  const sector = (profile?.sector ?? "QUOTIDIEN") as Sector;

  const existing = await db.query.phraseDuJour.findFirst({
    where: and(
      eq(phraseDuJour.date, today),
      eq(phraseDuJour.level, level as never),
      eq(phraseDuJour.sector, sector as never)
    ),
  });

  if (existing) return existing;

  const prompt = `Génère une phrase utile en allemand pour un apprenant de niveau ${level} dans le secteur ${sector} (${SECTOR_CONTEXT[sector] ?? "général"}).

La phrase doit être naturelle, utilisable en situation réelle, adaptée au niveau ${level}.

Réponds UNIQUEMENT en JSON :
{
  "phraseDe": "la phrase en allemand",
  "phraseFr": "traduction française naturelle",
  "context": "contexte d'utilisation court en français (ex: 'En réunion', 'Au téléphone')",
  "tip": "astuce grammaticale ou culturelle courte en français, ou null"
}`;

  const raw = await aiChat("word_of_day", [{ role: "user", content: prompt }], 300);
  const phrase = await parseAIJson<{
    phraseDe: string; phraseFr: string; context: string; tip: string | null;
  }>(raw);

  const [row] = await db.insert(phraseDuJour).values({
    id: nanoid(),
    date: today,
    level: level as never,
    sector: sector as never,
    ...phrase,
  }).returning();

  return row;
}
