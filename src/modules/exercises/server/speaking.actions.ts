"use server";

import { assertAuth } from "@/lib/session";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { parseAIJson } from "@/lib/ai/parse";
import type { CEFRLevel } from "@/types";

export type SpeakingEvalResult = {
  score: number;
  pronunciationTips: string[];
  grammarNotes: string[];
  vocabularySuggestions: string[];
  encouragement: string;
};

/**
 * evalSpeakingResponse — évalue une réponse orale (transcription STT) avec l'IA.
 *
 * Retourne un score 0-100 + feedback détaillé : prononciation, grammaire, vocabulaire.
 * Remplace le scoring par nombre de mots de SprechenRenderer.
 */
export async function evalSpeakingResponse(params: {
  scenario: string;
  aiRole: string;
  userRole: string;
  transcription: string;
  level: CEFRLevel;
}): Promise<SpeakingEvalResult> {
  await assertAuth();

  const { scenario, aiRole, userRole, transcription, level } = params;

  // Empty / French response → immediate 0
  if (!transcription.trim()) {
    return {
      score: 0,
      pronunciationTips: [],
      grammarNotes: ["Tu n'as rien dit. Appuie sur le micro et parle en allemand !"],
      vocabularySuggestions: [],
      encouragement: "La prochaine fois, ose parler — même les erreurs font partie de l'apprentissage !",
    };
  }

  const prompt = `${SYSTEM_PROMPT_BASE}

Évalue cette réponse orale (transcription STT) d'un apprenant de niveau ${level}.

SCÉNARIO: ${scenario}
Rôle IA: ${aiRole}  |  Rôle utilisateur: ${userRole}

TRANSCRIPTION DE L'APPRENANT:
"${transcription}"

Réponds UNIQUEMENT avec un JSON valide, sans texte autour:
{
  "score": <entier 0-100>,
  "pronunciationTips": ["conseil de prononciation concret, ex: le mot X se prononce Y avec le son Z"],
  "grammarNotes": ["erreur/note grammaticale → correction courte"],
  "vocabularySuggestions": ["mot utilisé → alternative plus naturelle en allemand"],
  "encouragement": "1 phrase d'encouragement bienveillant en français"
}

BARÈME:
- 0  si réponse en français ou vide
- 40 si quelques mots allemands compris malgré erreurs
- 60 si compréhensible, erreurs notables
- 75 si bon allemand adapté au niveau ${level}
- 90 si excellent, naturel, précis

RÈGLES:
- Max 2 éléments par liste (les plus utiles uniquement)
- Commence toujours par valoriser un point positif dans "encouragement"
- Pour A0/A1: sois très indulgent sur la grammaire, valorise l'effort oral
- Pour B2+: sois plus précis sur les nuances grammaticales`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;

  return parseAIJson<SpeakingEvalResult>(raw);
}
