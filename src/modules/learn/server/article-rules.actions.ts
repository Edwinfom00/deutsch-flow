"use server";

import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { assertAuth } from "@/lib/session";

export async function getMoreExamples(suffix: string, article: string, rule: string) {
  await assertAuth();

  const prompt = `Tu es un expert en grammaire allemande.

Règle : Les noms en "${suffix}" sont ${article === "die" ? "féminins" : article === "der" ? "masculins" : "neutres"} (${rule}).

Génère 5 exemples supplémentaires de mots allemands se terminant par "${suffix}" avec leur article ${article}.
Pour chaque mot, donne aussi une phrase d'exemple courte en allemand et sa traduction française.

Réponds UNIQUEMENT en JSON :
[
  {
    "word": "${article} Beispiel",
    "sentence": "phrase courte en allemand",
    "translation": "traduction française"
  }
]`;

  const raw = await aiChat("word_of_day", [{ role: "user", content: prompt }], 600);
  return parseAIJson<Array<{ word: string; sentence: string; translation: string }>>(raw);
}
