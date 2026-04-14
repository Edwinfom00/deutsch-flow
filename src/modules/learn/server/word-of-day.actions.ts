"use server";

import { db } from "@/lib/db";
import { wordOfDay, userProfile } from "@/lib/db/schema";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { assertAuth } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel } from "@/types";

type WordEntry = {
  word: string;
  article: string | null;
  translation: string;
  exampleDe: string;
  exampleFr: string;
  wordType: string;
  tip: string | null;
};

async function generateWord(level: CEFRLevel): Promise<WordEntry> {
  const levelHints: Record<CEFRLevel, string> = {
    A0: "vocabulaire de base pour débutants complets (chiffres, couleurs, salutations, famille proche)",
    A1: "vocabulaire quotidien simple (nourriture, transport, logement, achats courants)",
    A2: "vocabulaire courant (travail basique, santé, loisirs, météo)",
    B1: "vocabulaire intermédiaire (opinions, actualités simples, relations professionnelles)",
    B2: "vocabulaire avancé (nuances, expressions idiomatiques, vocabulaire technique courant)",
    C1: "vocabulaire soutenu (registres formels, expressions abstraites, nuances stylistiques)",
    C2: "vocabulaire sophistiqué (termes rares, proverbes, registre littéraire ou académique)",
  };

  const prompt = `${SYSTEM_PROMPT_BASE}

Génère un "mot du jour" en allemand pour un apprenant de niveau ${level}.
Domaine suggéré : ${levelHints[level]}.

Choisis un mot utile, mémorable et adapté au niveau. Évite les mots trop basiques ou trop rares.

Réponds UNIQUEMENT en JSON valide:
{
  "word": "le mot allemand",
  "article": "der/die/das (null si pas un nom)",
  "translation": "traduction française",
  "exampleDe": "une phrase d'exemple en allemand utilisant ce mot (adaptée au niveau ${level})",
  "exampleFr": "traduction française de la phrase d'exemple",
  "wordType": "Nomen|Verb|Adjektiv|Adverb|Präposition|Konjunktion|Phrase",
  "tip": "astuce mémorisation ou info culturelle courte en français (1 phrase, optionnel)"
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson<WordEntry>(raw);
}

// ─── Récupérer ou générer le mot du jour ─────────────────────────────────────
export async function getWordOfDay() {
  const session = await assertAuth();
  const uid = session.user.id;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const level = (profile?.level ?? "A1") as CEFRLevel;
  const today = new Date().toISOString().split("T")[0];

  // Chercher un mot existant pour aujourd'hui et ce niveau
  const [existing] = await db
    .select()
    .from(wordOfDay)
    .where(and(eq(wordOfDay.date, today), eq(wordOfDay.level, level)));

  if (existing) return existing;

  // Générer un nouveau mot
  const generated = await generateWord(level);

  const [inserted] = await db
    .insert(wordOfDay)
    .values({
      id: nanoid(),
      date: today,
      level,
      ...generated,
    })
    .returning();

  return inserted;
}
