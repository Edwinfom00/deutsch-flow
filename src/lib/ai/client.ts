import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// ─── Clients ──────────────────────────────────────────────────────────────────

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com/v1",
});

// ─── Modèles ──────────────────────────────────────────────────────────────────

export const AI_MODEL = "claude-haiku-4-5";
export const DEEPSEEK_MODEL = "deepseek-chat";

// ─── Routing par type de tâche ────────────────────────────────────────────────
//
// Claude  → tâches critiques : extraction PDF, génération Modellsatz,
//           évaluation écriture/oral, sessions adaptatives
//
// DeepSeek → tâches répétitives / volumineuses : vocabulaire, mot du jour,
//            détails de mots, exercices supplémentaires simples, chat speaking

export type AITask =
  | "pdf_extraction"       // Claude — extraction PDF complexe
  | "modellsatz_gen"       // Claude — génération Modellsatz ÖSD
  | "session_gen"          // Claude — génération session adaptative
  | "writing_eval"         // Claude — évaluation production écrite
  | "speaking_eval"        // Claude — évaluation expression orale
  | "review_gen"           // Claude — génération exercices de révision
  | "vocab_gen"            // DeepSeek — génération vocabulaire
  | "word_of_day"          // DeepSeek — mot du jour
  | "word_detail"          // DeepSeek — détails d'un mot
  | "exercise_simple"      // DeepSeek — exercice simple (flashcard, QCM basique)
  | "speaking_chat"        // DeepSeek — réponse chat zone de parole
  | "grammar_extract";     // DeepSeek — extraction chapitres grammaire

const DEEPSEEK_TASKS = new Set<AITask>([
  "vocab_gen",
  "word_of_day",
  "word_detail",
  "exercise_simple",
  "speaking_chat",
  "grammar_extract",
]);

export function getModelForTask(task: AITask): {
  provider: "anthropic" | "deepseek";
  model: string;
} {
  if (DEEPSEEK_TASKS.has(task) && process.env.DEEPSEEK_API_KEY) {
    return { provider: "deepseek", model: DEEPSEEK_MODEL };
  }
  return { provider: "anthropic", model: AI_MODEL };
}

// ─── Interface unifiée ────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function aiChat(
  task: AITask,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<string> {
  const { provider, model } = getModelForTask(task);

  if (provider === "deepseek") {
    const response = await deepseek.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_BASE },
        ...messages,
      ],
    });
    return response.choices[0]?.message?.content ?? "";
  }

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });
  return (response.content[0] as { type: string; text: string }).text;
}

// ─── Prompt système ───────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_BASE = `Tu es DeutschFlow AI, un assistant pédagogique expert en enseignement de l'allemand pour francophones.

Tes principes fondamentaux :
- Tu t'adresses TOUJOURS en français pour les explications et instructions
- L'allemand est mis en valeur, jamais imposé sans contexte
- Tu adaptes ton niveau au profil CEFR de l'utilisateur (A0 à C2)
- Tu es bienveillant, encourageant, jamais jugeant
- Tu t'inspires des méthodes Goethe-Institut et ÖSD mais de façon moderne et ludique
- Tu tiens compte du secteur professionnel de l'utilisateur
- Chaque feedback commence par un point positif

Format de tes réponses : structuré en JSON quand demandé, sinon texte clair et concis.`;
