import { jsonrepair } from "jsonrepair";

/**
 * Parse le JSON retourné par l'IA avec réparation automatique.
 */
export function parseAIJson<T>(raw: string): T {
  const cleaned = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = JSON.parse(jsonrepair(cleaned));
  }

  // Si on attend un tableau mais l'IA a retourné un objet wrapper,
  // essayer d'extraire le premier tableau trouvé dans les valeurs
  if (Array.isArray(parsed)) return parsed as T;

  if (parsed !== null && typeof parsed === "object") {
    const values = Object.values(parsed as Record<string, unknown>);
    const firstArray = values.find((v) => Array.isArray(v));
    if (firstArray !== undefined) return firstArray as T;
  }

  return parsed as T;
}

/**
 * Garantit qu'une valeur est un tableau — utile après parseAIJson
 * quand l'IA peut retourner null, undefined ou un objet.
 */
export function ensureArray<T = object>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value === null || value === undefined) return [];
  if (typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    const firstArray = values.find((v) => Array.isArray(v));
    if (firstArray) return firstArray as T[];
  }
  return [];
}
