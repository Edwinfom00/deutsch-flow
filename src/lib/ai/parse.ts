import { jsonrepair } from "jsonrepair";

/**
 * Parse le JSON retourné par l'IA avec réparation automatique.
 * Niveau 1 : strip markdown fences + trim
 * Niveau 2 : jsonrepair (100+ patterns cassés)
 */
export function parseAIJson<T>(raw: string): T {
  // Niveau 1 — nettoyer les fences markdown
  const cleaned = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  // Niveau 2 — JSON.parse direct
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Niveau 3 — jsonrepair
    return JSON.parse(jsonrepair(cleaned)) as T;
  }
}
