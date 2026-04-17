"use server";

import { aiChat } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import { assertAuth } from "@/lib/session";

export interface DeclensionError {
  original: string;
  correction: string;
  case: string;
  explanation: string;
}

export async function checkDeclension(text: string, level: string): Promise<{
  errors: DeclensionError[];
  hasErrors: boolean;
}> {
  await assertAuth();

  if (!text.trim() || text.trim().split(/\s+/).length < 3) {
    return { errors: [], hasErrors: false };
  }

  const prompt = `Analyse UNIQUEMENT les erreurs de déclinaison (cas grammaticaux) dans ce texte allemand.
Ne corriger QUE : Nominatif, Accusatif, Datif, Génitif — articles, adjectifs, pronoms.
Ignorer : orthographe, conjugaison, vocabulaire, style.
Niveau de l'apprenant : ${level}.

Texte : "${text}"

Réponds en JSON (tableau vide si aucune erreur de déclinaison) :
[
  {
    "original": "groupe de mots erroné",
    "correction": "forme correcte",
    "case": "Nominatif|Akkusativ|Dativ|Genitiv",
    "explanation": "explication courte en français (1 phrase)"
  }
]`;

  const raw = await aiChat("word_detail", [{ role: "user", content: prompt }], 400);
  const errors = await parseAIJson<DeclensionError[]>(raw);
  const safeErrors = Array.isArray(errors) ? errors.slice(0, 5) : [];

  return { errors: safeErrors, hasErrors: safeErrors.length > 0 };
}
