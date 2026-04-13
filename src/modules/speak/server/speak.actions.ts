"use server";

import { parseAIJson } from "@/lib/ai/parse";
import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "@/lib/ai/client";
import { assertAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile, speakScenario } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { CEFRLevel, Sector } from "@/types";

export type Scenario = {
  id: string;
  title: string;
  description: string;
  aiRole: string;
  userRole: string;
  opener: string;
  difficulty: "facile" | "moyen" | "difficile";
  sector: string;
  level: string;
};

export type Message = { role: "ai" | "user"; text: string; feedback?: string };

// ─── Générer des scénarios via l'IA ──────────────────────────────────────────
async function generateScenarios(level: CEFRLevel, sector: Sector, count = 5): Promise<Omit<Scenario, "id">[]> {
  const sectorLabels: Record<string, string> = {
    IT: "informatique et développement logiciel",
    BUSINESS: "business et finance",
    SANTE: "santé et médecine",
    DROIT: "droit et juridique",
    TOURISME: "tourisme et voyage",
    QUOTIDIEN: "vie quotidienne",
    AUTRE: "situations variées",
  };

  const prompt = `${SYSTEM_PROMPT_BASE}

Génère ${count} scénarios de conversation en allemand pour un apprenant de niveau ${level} travaillant dans le secteur ${sectorLabels[sector] ?? sector}.

Chaque scénario doit être réaliste, pratique et adapté au niveau ${level}.
Varie les difficultés : certains faciles, certains moyens, certains difficiles.
Inclure 2-3 scénarios liés au secteur ${sector} et 1-2 scénarios de vie quotidienne.

Réponds UNIQUEMENT en JSON valide:
[
  {
    "title": "titre court en français (3-5 mots)",
    "description": "description courte en français (1 phrase)",
    "aiRole": "rôle de l'IA en allemand (ex: Kollege, Arzt, Rezeptionist)",
    "userRole": "rôle de l'utilisateur en allemand (ex: Entwickler, Patient, Kunde)",
    "opener": "première phrase de l'IA en allemand pour lancer la conversation",
    "difficulty": "facile" | "moyen" | "difficile",
    "sector": "${sector}"
  }
]

IMPORTANT: Pas d'emojis. Opener adapté au niveau ${level} (phrases simples pour A0-A1, plus complexes pour B1+).`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  const parsed = parseAIJson<Omit<Scenario, "id" | "level">[]>(raw);
  return parsed.map((s) => ({ ...s, level }));
}

// ─── Récupérer ou générer les scénarios ──────────────────────────────────────
export async function getScenarios() {
  const session = await assertAuth();
  const uid = session.user.id;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const level = (profile?.level ?? "A1") as CEFRLevel;
  const sector = (profile?.sector ?? "QUOTIDIEN") as Sector;

  // Récupérer les scénarios existants
  const existing = await db.select().from(speakScenario)
    .where(eq(speakScenario.userId, uid))
    .orderBy(desc(speakScenario.createdAt));

  if (existing.length > 0) {
    return { scenarios: existing as Scenario[], level, sector };
  }

  // Aucun scénario — générer les 5 premiers
  const generated = await generateScenarios(level, sector, 5);
  const saved = await Promise.all(
    generated.map(async (s) => {
      const [row] = await db.insert(speakScenario).values({
        id: nanoid(),
        userId: uid,
        ...s,
      }).returning();
      return row;
    })
  );

  return { scenarios: saved as Scenario[], level, sector };
}

// ─── Générer de nouveaux scénarios supplémentaires ───────────────────────────
export async function generateMoreScenarios() {
  const session = await assertAuth();
  const uid = session.user.id;

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, uid),
  });

  const level = (profile?.level ?? "A1") as CEFRLevel;
  const sector = (profile?.sector ?? "QUOTIDIEN") as Sector;

  const generated = await generateScenarios(level, sector, 5);
  const saved = await Promise.all(
    generated.map(async (s) => {
      const [row] = await db.insert(speakScenario).values({
        id: nanoid(),
        userId: uid,
        ...s,
      }).returning();
      return row;
    })
  );

  return saved as Scenario[];
}

// ─── Envoyer un message dans la conversation ─────────────────────────────────
export async function sendMessage(params: {
  scenario: Scenario;
  history: Message[];
  userMessage: string;
  level: string;
}) {
  await assertAuth();
  const { scenario, history, userMessage, level } = params;

  const historyText = history
    .map((m) => `${m.role === "ai" ? scenario.aiRole : "Utilisateur"}: ${m.text}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT_BASE}

Tu joues le rôle de: ${scenario.aiRole}
Situation: ${scenario.description}
Niveau de l'apprenant: ${level}

HISTORIQUE:
${historyText}
Utilisateur: ${userMessage}

INSTRUCTIONS:
1. Réponds EN ALLEMAND comme ${scenario.aiRole}, adapté au niveau ${level}
2. Reste dans le scénario, sois naturel et réaliste
3. Si erreur grammaticale notable, continue normalement mais note-la
4. Réponse courte (1-3 phrases max)

Réponds en JSON:
{
  "reply": "ta réponse en allemand",
  "feedback": "correction discrète si erreur notable, sinon null (en français, 1 phrase max)",
  "isConversationEnd": false
}

Si la conversation a naturellement atteint sa conclusion, mets isConversationEnd à true.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson<{ reply: string; feedback: string | null; isConversationEnd: boolean }>(raw);
}

// ─── Évaluer la conversation ──────────────────────────────────────────────────
export async function evaluateConversation(params: {
  scenario: Scenario;
  history: Message[];
  level: string;
}) {
  await assertAuth();
  const { scenario, history, level } = params;

  const userMessages = history.filter((m) => m.role === "user").map((m) => m.text).join("\n");

  const prompt = `${SYSTEM_PROMPT_BASE}

Évalue cette conversation en allemand d'un apprenant de niveau ${level}.
SCÉNARIO: ${scenario.title} — ${scenario.description}

MESSAGES DE L'APPRENANT:
${userMessages}

Réponds en JSON:
{
  "score": 75,
  "fluency": "commentaire sur la fluidité en français",
  "grammar": "commentaire sur la grammaire en français",
  "vocabulary": "commentaire sur le vocabulaire en français",
  "corrections": [
    { "original": "phrase erronée", "correction": "forme correcte", "explanation": "explication courte" }
  ],
  "encouragement": "message d'encouragement en français (1 phrase)",
  "usefulPhrases": ["phrase utile pour ce scénario en allemand", "autre phrase"]
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson(raw);
}
