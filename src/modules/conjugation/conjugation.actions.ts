"use server";

import { db } from "@/lib/db";
import { verbCache, userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, or } from "drizzle-orm";
import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { nanoid } from "nanoid";
import type { CEFRLevel } from "@/types";
import type { VerbData } from "@/data/german-verbs";

export interface VerbContext {
  sentences: Record<string, { de: string; fr: string }>;
  irregularityNote: string | null;
  memoryTip: string | null;
}

export interface StoryChallenge {
  title: string;
  story: string;
  blanks: Array<{
    id: string;
    person: string;
    tense: string;
    answer: string;
    hint: string;
  }>;
  context: string;
}

export interface CachedVerb extends VerbData {
  id: string;
  sector: string;
  level: string;
  sentences: Record<string, { de: string; fr: string }>;
  irregularityNote: string | null;
  memoryTip: string | null;
  story: StoryChallenge | null;
}

export async function getVerbsForUser(): Promise<CachedVerb[]> {
  const session = await assertAuth();
  const uid = session.user.id;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const sector = profile?.sector ?? "QUOTIDIEN";
  const level = (profile?.level ?? "A1") as CEFRLevel;

  const rows = await db
    .select()
    .from(verbCache)
    .where(
      or(
        and(eq(verbCache.sector, sector as never), eq(verbCache.level, level as never)),
        and(eq(verbCache.sector, "QUOTIDIEN" as never), eq(verbCache.level, level as never))
      )
    )
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    infinitive: r.infinitive,
    translation: r.translation,
    sector: r.sector,
    level: r.level,
    isIrregular: r.isIrregular,
    auxiliary: (r.auxiliary as "haben" | "sein" | undefined) ?? undefined,
    participle: r.participle ?? undefined,
    conjugations: r.conjugations as VerbData["conjugations"],
    sentences: (r.sentences as Record<string, { de: string; fr: string }>) ?? {},
    irregularityNote: r.irregularityNote,
    memoryTip: r.memoryTip,
    story: (r.story as StoryChallenge | null) ?? null,
  }));
}

const runtimeCache = new Map<string, VerbContext>();

export async function getVerbContext(
  infinitive: string,
  translation: string,
  isIrregular: boolean
): Promise<VerbContext> {
  await assertAuth();

  if (runtimeCache.has(infinitive)) return runtimeCache.get(infinitive)!;

  const row = await db.query.verbCache.findFirst({
    where: eq(verbCache.infinitive, infinitive),
  });

  if (row?.sentences && Object.keys(row.sentences as object).length > 0) {
    const ctx: VerbContext = {
      sentences: row.sentences as Record<string, { de: string; fr: string }>,
      irregularityNote: row.irregularityNote,
      memoryTip: row.memoryTip,
    };
    runtimeCache.set(infinitive, ctx);
    return ctx;
  }

  const prompt = `Pour le verbe allemand "${infinitive}" (${translation})${isIrregular ? " — irrégulier" : ""}, génère :
1. Une phrase d'exemple au Präsens pour chaque pronom (6 phrases)
2. Si irrégulier : note sur le pattern
3. Astuce mémo

JSON :
{
  "sentences": {
    "ich|Präsens": { "de": "...", "fr": "..." },
    "du|Präsens": { "de": "...", "fr": "..." },
    "er/sie/es|Präsens": { "de": "...", "fr": "..." },
    "wir|Präsens": { "de": "...", "fr": "..." },
    "ihr|Präsens": { "de": "...", "fr": "..." },
    "sie/Sie|Präsens": { "de": "...", "fr": "..." }
  },
  "irregularityNote": "${isIrregular ? "explication" : "null"}",
  "memoryTip": "astuce mémo"
}`;

  const raw = await aiChat("word_of_day", [{ role: "user", content: prompt }], 700);
  const result = await parseAIJson<VerbContext>(raw);
  runtimeCache.set(infinitive, result);
  return result;
}

export async function generateStoryChallenge(
  infinitive: string,
  translation: string
): Promise<StoryChallenge> {
  await assertAuth();

  const row = await db.query.verbCache.findFirst({
    where: eq(verbCache.infinitive, infinitive),
  });

  if (row?.story && (row.story as StoryChallenge).blanks?.length > 0) {
    return row.story as StoryChallenge;
  }

  const prompt = `Crée une mini-histoire en allemand (5-7 phrases) utilisant "${infinitive}" (${translation}) conjugué à différentes personnes et temps. Remplace 4 formes par [BLANK_1] à [BLANK_4].

JSON :
{
  "title": "titre court en français",
  "story": "histoire avec [BLANK_1] à [BLANK_4]",
  "context": "contexte en français",
  "blanks": [
    { "id": "BLANK_1", "person": "ich", "tense": "Präsens", "answer": "forme", "hint": "indice" }
  ]
}`;

  const raw = await aiChat("word_of_day", [{ role: "user", content: prompt }], 800);
  const story = await parseAIJson<StoryChallenge>(raw);

  // Garantir que blanks est bien un tableau
  if (!Array.isArray(story.blanks)) story.blanks = [];

  if (row) {
    await db.update(verbCache).set({ story: story as never }).where(eq(verbCache.id, row.id));
  }

  return story;
}

export async function triggerVerbGeneration() {
  await assertAuth();
  const { inngest } = await import("@/lib/inngest/client");
  await inngest.send({ name: "verbs/generate", data: {} });
  return { triggered: true };
}
