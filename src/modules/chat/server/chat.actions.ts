"use server";

import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { assertAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CEFRLevel } from "@/types";

export type ChatMessage = { role: "user" | "assistant"; text: string };

// ─── Envoyer un message au tuteur IA ─────────────────────────────────────────
export async function sendTutorMessage(params: {
  history: ChatMessage[];
  userMessage: string;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const level = (profile?.level ?? "A1") as CEFRLevel;
  const { history, userMessage } = params;

  const systemPrompt = `${SYSTEM_PROMPT_BASE}

Tu es un tuteur de langue allemande conversationnel. L'apprenant est de niveau ${level}.

Tes responsabilités :
1. Répondre aux questions sur la grammaire, le vocabulaire, la culture allemande
2. Corriger les phrases allemandes de l'utilisateur avec des explications claires
3. Proposer des exemples pratiques adaptés au niveau ${level}
4. Alterner intelligemment entre français (pour les explications) et allemand (pour les exemples et la pratique)
5. Encourager l'apprenant et rester bienveillant

Quand l'utilisateur écrit en allemand : corriger si nécessaire, expliquer en français.
Quand il pose une question en français : répondre en français avec des exemples en allemand.
Si le niveau est A0/A1 : rester simple, éviter le jargon grammatical complexe.
Si le niveau est B1+ : utiliser la terminologie grammaticale précise.

Garde tes réponses concises (3-5 phrases max sauf si une explication détaillée est vraiment nécessaire).`;

  const messages = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    system: systemPrompt,
    messages,
  });

  const reply = (response.content[0] as { type: string; text: string }).text;
  return { reply, level };
}

// ─── Analyser un texte allemand ───────────────────────────────────────────────
export async function analyzeGermanText(text: string) {
  await assertAuth();

  const prompt = `Analyse cette phrase/texte allemand et donne un retour pédagogique en français.

Texte: "${text}"

Réponds en JSON:
{
  "isCorrect": true/false,
  "corrected": "version corrigée si nécessaire, sinon null",
  "errors": [
    { "original": "partie erronée", "correction": "forme correcte", "rule": "règle grammaticale concernée" }
  ],
  "vocabulary": [
    { "word": "mot allemand", "translation": "traduction française", "note": "info utile optionnelle" }
  ],
  "level": "niveau CECR estimé (A1/A2/B1/etc.)",
  "tip": "conseil pédagogique court en français"
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const { parseAIJson } = await import("@/lib/ai/parse");
  return parseAIJson<{
    isCorrect: boolean;
    corrected: string | null;
    errors: Array<{ original: string; correction: string; rule: string }>;
    vocabulary: Array<{ word: string; translation: string; note?: string }>;
    level: string;
    tip: string;
  }>(raw);
}
