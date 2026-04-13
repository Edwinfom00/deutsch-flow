import { anthropic, AI_MODEL, SYSTEM_PROMPT_BASE } from "./client";
import { parseAIJson } from "./parse";
import type {
  CEFRLevel,
  Sector,
  Skill,
  ExerciseContent,
  MultipleChoiceExercise,
  FillInTheBlankExercise,
  TrueFalseExercise,
  MatchingExercise,
  FlashcardExercise,
  WritingExercise,
  SpeakingExercise,
  SentenceBuilderExercise,
} from "@/types";

// ─── Référentiel Goethe/ÖSD ───────────────────────────────────────────────────
// Basé sur les structures officielles des examens Goethe-Institut et ÖSD

export const EXERCISE_PROMPTS: Record<string, string> = {
  // ── LESEN ──────────────────────────────────────────────────────────────────
  LESEN_ZUORDNUNG: `
Génère un exercice de LECTURE ZUORDNUNG (association) style Goethe/ÖSD.
L'apprenant doit associer 5 courts textes (annonces, affiches, messages) à des besoins ou catégories.
Format JSON exact:
{
  "type": "LESEN_ZUORDNUNG",
  "instructions": "Associe chaque texte à la bonne description. (FR)",
  "pairs": [
    { "id": "1", "left": "texte allemand court", "right": "description en français" }
  ] // 5 paires
}`,

  LESEN_MULTIPLE_CHOICE: `
Génère un exercice LESEN MEHRFACHWAHL (choix multiple) style Goethe/ÖSD.
L'apprenant lit un texte puis répond à des questions à choix multiple (a, b, c).
Format JSON exact:
{
  "type": "LESEN_MULTIPLE_CHOICE",
  "instructions": "Lis le texte et coche la bonne réponse.",
  "text": "texte en allemand (80-200 mots selon le niveau)",
  "question": "question sur le texte en français",
  "options": [
    { "id": "a", "text": "réponse A en français", "isCorrect": false },
    { "id": "b", "text": "réponse B en français", "isCorrect": true },
    { "id": "c", "text": "réponse C en français", "isCorrect": false }
  ],
  "explanation": "explication courte en français"
}`,

  LESEN_RICHTIG_FALSCH: `
Génère un exercice RICHTIG/FALSCH/NICHT IM TEXT style Goethe B1+.
Très important: inclure des énoncés "pas mentionnés dans le texte" (Nicht im Text).
Format JSON exact:
{
  "type": "LESEN_RICHTIG_FALSCH",
  "instructions": "Lis le texte. Les affirmations sont-elles Richtig (vrai), Falsch (faux) ou Nicht im Text (non mentionné) ?",
  "text": "texte en allemand",
  "statements": [
    { "id": "1", "statement": "affirmation en français", "answer": "RICHTIG" },
    { "id": "2", "statement": "affirmation en français", "answer": "FALSCH" },
    { "id": "3", "statement": "affirmation en français", "answer": "NICHT_IM_TEXT" }
  ] // 3-5 énoncés
}`,

  LESEN_LUECKENTEXT: `
Génère un exercice LÜCKENTEXT (texte à trous) de lecture style Goethe/ÖSD.
Utilise des connecteurs logiques, prépositions ou mots de liaison manquants.
Format JSON exact:
{
  "type": "LESEN_LUECKENTEXT",
  "instructions": "Complète le texte avec les mots de la liste.",
  "text": "Texte avec ____ pour chaque blanc",
  "blanks": [
    { "position": 1, "answer": "weil", "options": ["weil", "obwohl", "damit", "wenn"] }
  ]
}`,

  LESEN_REIHENFOLGE: `
Génère un exercice REIHENFOLGE (remise en ordre) style Goethe/ÖSD.
Des extraits de texte mélangés à remettre dans l'ordre logique.
Format JSON exact:
{
  "type": "LESEN_REIHENFOLGE",
  "instructions": "Remets les paragraphes dans l'ordre correct.",
  "items": [
    { "id": "A", "text": "paragraphe en allemand", "correctPosition": 3 },
    { "id": "B", "text": "paragraphe en allemand", "correctPosition": 1 }
  ]
}`,

  // ── SCHREIBEN ──────────────────────────────────────────────────────────────
  SCHREIBEN_EMAIL: `
Génère un exercice SCHREIBEN EMAIL style Goethe/ÖSD.
Selon le niveau: email informel (du-Form, A1-B1) ou formel (Sie-Form, B1-C1).
Inclure EXACTEMENT 3 points à traiter.
Format JSON exact:
{
  "type": "SCHREIBEN_EMAIL",
  "instructions": "Écris un email en allemand en répondant aux 3 points suivants.",
  "prompt": "situation décrite en français",
  "template": "Betreff: [Objet]\\n\\n[Anrede],\\n\\n...",
  "rubric": [
    "Point 1 à traiter",
    "Point 2 à traiter",
    "Point 3 à traiter"
  ],
  "minWords": 30,
  "maxWords": 80,
  "tone": "formel" // ou "informel"
}`,

  SCHREIBEN_MEINUNG: `
Génère un exercice MEINUNGSÄUSSERUNG (expression d'opinion) style Goethe B1+.
L'apprenant doit donner son avis sur un sujet d'actualité ou quotidien.
Format JSON exact:
{
  "type": "SCHREIBEN_MEINUNG",
  "instructions": "Exprime ton opinion sur ce sujet en allemand. Utilise des arguments.",
  "prompt": "sujet + contexte en français (ex: article, post de forum)",
  "rubric": [
    "Exprimer une position claire",
    "Donner 2 arguments avec exemples",
    "Conclure avec une recommandation"
  ],
  "minWords": 80,
  "maxWords": 150,
  "useful_phrases": ["Ich bin der Meinung, dass...", "Einerseits..., andererseits...", "Meiner Ansicht nach..."]
}`,

  SCHREIBEN_BESCHREIBUNG: `
Génère un exercice BILDBESCHREIBUNG (description d'image/situation).
L'apprenant décrit une scène ou situation en allemand.
Format JSON exact:
{
  "type": "SCHREIBEN_BESCHREIBUNG",
  "instructions": "Décris cette situation en allemand.",
  "prompt": "description de la scène/situation à décrire",
  "imageDescription": "description détaillée de l'image fictive pour l'IA",
  "rubric": ["Décrire les éléments principaux", "Utiliser le bon temps", "Vocabulaire précis"],
  "minWords": 50,
  "maxWords": 100
}`,

  // ── HÖREN ──────────────────────────────────────────────────────────────────
  HOEREN_MULTIPLE_CHOICE: `
Génère un exercice HÖREN MEHRFACHWAHL (écoute + QCM).
Puisqu'on n'a pas d'audio, génère le SCRIPT de ce qui serait dit + les questions.
Format JSON exact:
{
  "type": "HOEREN_MULTIPLE_CHOICE",
  "instructions": "Écoute le dialogue et réponds aux questions.",
  "script": "dialogue/texte qui serait lu (en allemand)",
  "question": "question en français",
  "options": [
    { "id": "a", "text": "option A", "isCorrect": false },
    { "id": "b", "text": "option B", "isCorrect": true },
    { "id": "c", "text": "option C", "isCorrect": false }
  ],
  "explanation": "explication en français"
}`,

  HOEREN_RICHTIG_FALSCH: `
Génère un exercice HÖREN RICHTIG/FALSCH style Goethe/ÖSD.
Format JSON exact:
{
  "type": "HOEREN_RICHTIG_FALSCH",
  "instructions": "Écoute le texte et dis si les affirmations sont vraies ou fausses.",
  "script": "texte audio en allemand",
  "statements": [
    { "id": "1", "statement": "affirmation en français", "answer": "RICHTIG" },
    { "id": "2", "statement": "affirmation en français", "answer": "FALSCH" }
  ]
}`,

  // ── SPRECHEN ───────────────────────────────────────────────────────────────
  SPRECHEN_DIALOG: `
Génère un exercice SPRECHEN DIALOG (dialogue guidé) style Goethe/ÖSD.
L'IA joue un rôle et l'utilisateur répond oralement ou par écrit.
Format JSON exact:
{
  "type": "SPRECHEN_DIALOG",
  "instructions": "Participe à ce dialogue. L'IA joue le rôle indiqué.",
  "scenario": "description de la situation en français",
  "aiRole": "rôle de l'IA (ex: Kollege, Verkäufer, Arzt)",
  "userRole": "rôle de l'utilisateur",
  "aiOpener": "première phrase de l'IA pour lancer le dialogue",
  "targetPhrases": ["phrase utile 1", "phrase utile 2"],
  "keyVocabulary": [
    { "word": "mot allemand", "translation": "traduction française" }
  ]
}`,

  SPRECHEN_ROLEPLAY: `
Génère un exercice ROLLENSPIEL (jeu de rôle situationnel) style Goethe/ÖSD.
Situation professionnelle ou quotidienne concrète liée au secteur de l'utilisateur.
Format JSON exact:
{
  "type": "SPRECHEN_ROLEPLAY",
  "instructions": "Mets-toi dans ce rôle et réponds à la situation.",
  "scenario": "contexte détaillé en français",
  "aiRole": "rôle de l'IA",
  "userRole": "rôle de l'utilisateur",
  "aiOpener": "phrase d'ouverture de l'IA",
  "objectives": ["objectif 1 à accomplir", "objectif 2"],
  "keyVocabulary": [
    { "word": "mot clé", "translation": "traduction" }
  ]
}`,

  SPRECHEN_VORSTELLEN: `
Génère un exercice SELBSTVORSTELLUNG (se présenter) style Goethe A1/A2.
Format JSON exact:
{
  "type": "SPRECHEN_VORSTELLEN",
  "instructions": "Présente-toi en allemand en utilisant ces points.",
  "scenario": "contexte de la présentation",
  "aiRole": "Interlocuteur (collègue, professeur)",
  "userRole": "toi-même",
  "aiOpener": "Hallo! Kannst du dich kurz vorstellen?",
  "targetPhrases": [
    "Ich heiße... / Mein Name ist...",
    "Ich komme aus...",
    "Ich arbeite als...",
    "Meine Hobbys sind..."
  ]
}`,

  // ── VOCABULAIRE ────────────────────────────────────────────────────────────
  VOCAB_FLASHCARD: `
Génère une CARTE MÉMOIRE de vocabulaire avec contexte sectoriel.
Format JSON exact:
{
  "type": "VOCAB_FLASHCARD",
  "instructions": "Mémorise ce mot avec son exemple.",
  "word": "mot allemand",
  "article": "der", // ou "die", "das", null si verbe/adjectif
  "translation": "traduction française",
  "exampleSentence": "phrase exemple en allemand",
  "exampleTranslation": "traduction de l'exemple",
  "synonyms": ["synonyme1", "synonyme2"], // 2-3 synonymes allemands si existants, sinon []
  "tags": ["secteur", "thème", "A1"] // niveau et domaine
}`,

  VOCAB_LUECKENTEXT: `
Génère un exercice VOKABULAR LÜCKENTEXT (phrase à compléter).
Format JSON exact:
{
  "type": "VOCAB_LUECKENTEXT",
  "instructions": "Complète la phrase avec le bon mot.",
  "text": "Phrase en allemand avec ____ à la place du mot manquant",
  "blanks": [
    {
      "position": 1,
      "answer": "mot correct",
      "options": ["mot correct", "faux1", "faux2", "faux3"]
    }
  ],
  "context": "explication du contexte en français"
}`,

  VOCAB_ZUORDNUNG: `
Génère un exercice VOKABULAR ZUORDNUNG (associer mot et définition/traduction).
Format JSON exact:
{
  "type": "VOCAB_ZUORDNUNG",
  "instructions": "Associe chaque mot allemand à sa traduction française.",
  "pairs": [
    { "id": "1", "left": "mot allemand", "right": "traduction française" }
  ] // 5 paires, vocabulaire sectoriel
}`,

  VOCAB_BILD: `
Génère un exercice VOKABULAR BILD (associer image et mot).
Format JSON exact:
{
  "type": "VOCAB_BILD",
  "instructions": "Associe chaque description d'image au bon mot allemand.",
  "pairs": [
    { "id": "1", "left": "description de l'image en français", "right": "mot allemand" }
  ] // 4-6 paires avec vocabulaire visuel
}`,

  // ── GRAMMAIRE ──────────────────────────────────────────────────────────────
  GRAMMATIK_LUECKENTEXT: `
Génère un exercice GRAMMATIK LÜCKENTEXT (grammaire à trous).
Focus sur les points difficiles de l'allemand: cas (Nominatif/Accusatif/Datif/Génitif),
conjugaisons, séparation des verbes, subordonnées, Konjunktiv II, Passiv...
Format JSON exact:
{
  "type": "GRAMMATIK_LUECKENTEXT",
  "instructions": "Complète avec la bonne forme grammaticale.",
  "text": "Phrase avec ____ où va la forme grammaticale",
  "blanks": [
    {
      "position": 1,
      "answer": "forme correcte",
      "options": ["forme correcte", "forme incorrecte 1", "forme incorrecte 2"],
      "explanation": "explication de la règle en français"
    }
  ]
}`,

  GRAMMATIK_ORDNEN: `
Génère un exercice SATZGLIEDER ORDNEN (construction de phrase).
L'apprenant doit remettre les mots dans le bon ordre.
Format JSON exact:
{
  "type": "GRAMMATIK_ORDNEN",
  "instructions": "Remets les mots dans le bon ordre pour former une phrase correcte.",
  "words": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "solution": "la phrase correcte",
  "hint": "indice grammatical en français (ex: Verbe en 2e position)"
}`,

  GRAMMATIK_TRANSFORMATION: `
Génère un exercice SATZTRANSFORMATION (transformer une phrase).
Exemple: aktiv → passiv, Aussagesatz → Fragesatz, Präsens → Perfekt.
Format JSON exact:
{
  "type": "GRAMMATIK_TRANSFORMATION",
  "instructions": "Transforme la phrase selon la consigne.",
  "sourceText": "phrase originale en allemand",
  "transformationType": "type de transformation (ex: Aktiv → Passiv)",
  "solution": "phrase transformée correcte",
  "hint": "règle ou formule aide en français"
}`,

  GRAMMATIK_FEHLERKORREKTUR: `
Génère un exercice FEHLERKORREKTUR (correction d'erreurs).
Texte avec 3-5 erreurs grammaticales typiques à trouver et corriger.
Format JSON exact:
{
  "type": "GRAMMATIK_FEHLERKORREKTUR",
  "instructions": "Trouve et corrige les erreurs dans ce texte.",
  "text": "texte en allemand avec erreurs intégrées",
  "errors": [
    {
      "position": "mot ou groupe erroné",
      "correction": "forme correcte",
      "explanation": "pourquoi c'est faux en français"
    }
  ]
}`,
};

// ─── Interface du générateur ──────────────────────────────────────────────────

export interface GenerateExerciseParams {
  type: string;
  level: CEFRLevel;
  sector: Sector;
  skill: Skill;
  topic?: string;
  adaptiveContext?: string;
}

export interface GeneratedExercise {
  content: ExerciseContent;
  difficultyScore: number;
  xpReward: number;
}

export interface SkillProfile {
  skill: string;
  avgScore: number;
  weakExerciseTypes: Record<string, number>;
}

/**
 * Génère un exercice via notre modèle IA en s'inspirant des méthodes Goethe/ÖSD
 */
export async function generateExercise(
  params: GenerateExerciseParams
): Promise<GeneratedExercise> {
  const { type, level, sector, skill, topic, adaptiveContext } = params;

  const exercisePrompt = EXERCISE_PROMPTS[type];
  if (!exercisePrompt) {
    throw new Error(`Type d'exercice inconnu: ${type}`);
  }

  const difficultyByLevel: Record<CEFRLevel, number> = {
    A0: 0.1, A1: 0.2, A2: 0.35, B1: 0.5, B2: 0.65, C1: 0.8, C2: 0.95,
  };

  const xpByLevel: Record<CEFRLevel, number> = {
    A0: 10, A1: 12, A2: 15, B1: 18, B2: 22, C1: 25, C2: 30,
  };

  const sectorContext: Record<string, string> = {
    IT: "développement logiciel, DevOps, cybersécurité, cloud, réunions techniques",
    BUSINESS: "réunions d'affaires, négociations, emails professionnels, finance",
    SANTE: "vocabulaire médical, communication patient-médecin, hôpital",
    DROIT: "termes juridiques, contrats, conformité",
    TOURISME: "voyage, hôtels, restaurants, transports, tourisme",
    QUOTIDIEN: "vie quotidienne, famille, shopping, loisirs",
    AUTRE: "situations diverses et variées",
  };

  const prompt = `${SYSTEM_PROMPT_BASE}
${adaptiveContext ?? ""}
PARAMÈTRES DE L'EXERCICE:
- Niveau CEFR: ${level}
- Secteur: ${sector} (contexte: ${sectorContext[sector] || "général"})
- Compétence: ${skill}
- Sujet spécifique: ${topic || "choix libre adapté au secteur"}

CONSIGNES DE GÉNÉRATION:
${exercisePrompt}

RÈGLES IMPORTANTES:
1. Adapte strictement le niveau de langue au CEFR ${level}
2. Utilise du vocabulaire réel du secteur ${sector} quand c'est possible
3. Le contenu doit être pratique et utile en situation réelle
4. Pour les niveaux A0/A1: phrases très courtes, vocabulaire ultra basique
5. Pour B1/B2: phrases complexes, connecteurs logiques, nuances
6. Pour C1: style élaboré, registre soutenu, idiomes

Réponds UNIQUEMENT avec le JSON valide de l'exercice, sans texte autour.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const rawJson = (response.content[0] as { type: string; text: string }).text;
  const content = parseAIJson<ExerciseContent>(rawJson);

  return {
    content,
    difficultyScore: difficultyByLevel[level],
    xpReward: xpByLevel[level],
  };
}

/**
 * Génère une session d'exercices quotidienne équilibrée et adaptative.
 * Si un profil de performance est fourni, les lacunes sont priorisées.
 */
export async function generateDailySession(
  level: CEFRLevel,
  sector: Sector,
  goalMinutes: number = 15,
  skillProfiles: SkillProfile[] = []
): Promise<GeneratedExercise[]> {
  const exerciseCount = goalMinutes <= 5 ? 3 : goalMinutes <= 15 ? 5 : 8;

  // Plan de base par niveau
  const basePlan: Record<string, Array<{ type: string; skill: Skill }>> = {
    A0: [
      { type: "VOCAB_FLASHCARD", skill: "WORTSCHATZ" },
      { type: "VOCAB_LUECKENTEXT", skill: "WORTSCHATZ" },
      { type: "GRAMMATIK_ORDNEN", skill: "GRAMMATIK" },
      { type: "SPRECHEN_VORSTELLEN", skill: "SPRECHEN" },
      { type: "LESEN_RICHTIG_FALSCH", skill: "LESEN" },
    ],
    A1: [
      { type: "VOCAB_FLASHCARD", skill: "WORTSCHATZ" },
      { type: "VOCAB_LUECKENTEXT", skill: "WORTSCHATZ" },
      { type: "GRAMMATIK_ORDNEN", skill: "GRAMMATIK" },
      { type: "SPRECHEN_VORSTELLEN", skill: "SPRECHEN" },
      { type: "LESEN_RICHTIG_FALSCH", skill: "LESEN" },
    ],
    A2: [
      { type: "VOCAB_ZUORDNUNG", skill: "WORTSCHATZ" },
      { type: "LESEN_MULTIPLE_CHOICE", skill: "LESEN" },
      { type: "SCHREIBEN_EMAIL", skill: "SCHREIBEN" },
      { type: "GRAMMATIK_LUECKENTEXT", skill: "GRAMMATIK" },
      { type: "SPRECHEN_DIALOG", skill: "SPRECHEN" },
    ],
    B1: [
      { type: "LESEN_RICHTIG_FALSCH", skill: "LESEN" },
      { type: "SCHREIBEN_EMAIL", skill: "SCHREIBEN" },
      { type: "HOEREN_MULTIPLE_CHOICE", skill: "HOEREN" },
      { type: "GRAMMATIK_TRANSFORMATION", skill: "GRAMMATIK" },
      { type: "SPRECHEN_ROLEPLAY", skill: "SPRECHEN" },
      { type: "SCHREIBEN_MEINUNG", skill: "SCHREIBEN" },
    ],
    B2: [
      { type: "LESEN_LUECKENTEXT", skill: "LESEN" },
      { type: "SCHREIBEN_MEINUNG", skill: "SCHREIBEN" },
      { type: "HOEREN_RICHTIG_FALSCH", skill: "HOEREN" },
      { type: "GRAMMATIK_FEHLERKORREKTUR", skill: "GRAMMATIK" },
      { type: "SPRECHEN_DISKUSSION", skill: "SPRECHEN" },
      { type: "LESEN_ZUORDNUNG", skill: "LESEN" },
      { type: "SCHREIBEN_BESCHREIBUNG", skill: "SCHREIBEN" },
      { type: "GRAMMATIK_TRANSFORMATION", skill: "GRAMMATIK" },
    ],
  };

  const plan = basePlan[level] ?? basePlan["B2"];

  // ── Adaptation basée sur les lacunes ──────────────────────────────────────
  let adaptedPlan = [...plan];

  if (skillProfiles.length > 0) {
    // Identifier les compétences faibles (score < 60)
    const weakSkills = skillProfiles
      .filter((p) => p.avgScore < 60)
      .sort((a, b) => a.avgScore - b.avgScore); // les plus faibles en premier

    // Identifier les types d'exercices les plus ratés
    const weakTypes = new Map<string, number>();
    for (const profile of skillProfiles) {
      for (const [type, count] of Object.entries(profile.weakExerciseTypes)) {
        weakTypes.set(type, (weakTypes.get(type) ?? 0) + (count as number));
      }
    }

    // Remplacer jusqu'à 40% des exercices par des exercices ciblant les lacunes
    const slotsToReplace = Math.floor(exerciseCount * 0.4);
    let replaced = 0;

    for (const weakSkill of weakSkills) {
      if (replaced >= slotsToReplace) break;

      // Trouver le type d'exercice le plus raté pour cette compétence
      const weakTypeForSkill = [...weakTypes.entries()]
        .filter(([type]) => {
          const skillMap: Record<string, string> = {
            LESEN: "LESEN", SCHREIBEN: "SCHREIBEN", HOEREN: "HOEREN",
            SPRECHEN: "SPRECHEN", WORTSCHATZ: "VOCAB", GRAMMATIK: "GRAMMATIK",
          };
          return type.startsWith(skillMap[weakSkill.skill] ?? "");
        })
        .sort((a, b) => b[1] - a[1])[0];

      const targetType = weakTypeForSkill?.[0] ??
        plan.find((p) => p.skill === weakSkill.skill)?.type;

      if (targetType && EXERCISE_PROMPTS[targetType]) {
        // Insérer en début de plan pour que ce soit fait en premier
        adaptedPlan.unshift({ type: targetType, skill: weakSkill.skill as Skill });
        replaced++;
      }
    }

    // Dédupliquer en gardant l'ordre (les lacunes en premier)
    const seen = new Set<string>();
    adaptedPlan = adaptedPlan.filter((item) => {
      const key = item.type;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const selected = adaptedPlan.slice(0, exerciseCount);

  // Construire le contexte adaptatif pour le prompt
  const adaptiveContext = skillProfiles.length > 0
    ? buildAdaptiveContext(skillProfiles)
    : "";

  const exercises = await Promise.all(
    selected.map(({ type, skill }) =>
      generateExercise({ type, level, sector, skill, adaptiveContext })
    )
  );

  return exercises;
}

/**
 * Construit un contexte textuel des lacunes pour enrichir le prompt de génération
 */
function buildAdaptiveContext(profiles: SkillProfile[]): string {
  const weak = profiles.filter((p) => p.avgScore < 65);
  if (weak.length === 0) return "";

  const lines = weak.map((p) => {
    const types = Object.entries(p.weakExerciseTypes)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 2)
      .map(([t]) => t)
      .join(", ");
    return `- ${p.skill}: score moyen ${Math.round(p.avgScore)}%${types ? ` (types difficiles: ${types})` : ""}`;
  });

  return `\nPROFIL DE L'APPRENANT (lacunes identifiées):\n${lines.join("\n")}\n→ Génère un exercice qui cible spécifiquement ces difficultés, avec des explications adaptées.`;
}

/**
 * Évalue une réponse écrite avec l'IA (pour Schreiben)
 */
export async function evaluateWritingResponse(
  exercise: WritingExercise,
  userResponse: string,
  level: CEFRLevel
): Promise<{
  score: number; // 0-100
  feedback: string;
  corrections: Array<{ original: string; correction: string; explanation: string }>;
  encouragement: string;
}> {
  const prompt = `${SYSTEM_PROMPT_BASE}

Évalue cette réponse écrite d'un apprenant de niveau ${level}.

EXERCICE:
${exercise.instructions}
Consigne: ${exercise.prompt}

RÉPONSE DE L'APPRENANT:
${userResponse}

Critères d'évaluation (${exercise.rubric?.join(", ") || "général"}):

Réponds en JSON avec exactement ce format:
{
  "score": 75,
  "feedback": "retour général positif et constructif en français",
  "corrections": [
    { "original": "mot/phrase erroné", "correction": "forme correcte", "explanation": "explication en français" }
  ],
  "encouragement": "message d'encouragement chaleureux en français (1 phrase)",
  "modelAnswer": "exemple complet de bonne réponse en allemand (même consigne, même longueur)"
}

IMPORTANT: Commence TOUJOURS par un point positif dans le feedback. Soit bienveillant.`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const rawJson = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson(rawJson);
}

/**
 * Évalue une réponse orale (transcription fournie par speech-to-text)
 */
export async function evaluateSpeakingResponse(
  exercise: SpeakingExercise,
  transcription: string,
  level: CEFRLevel
): Promise<{
  score: number;
  pronunciationTips: string[];
  grammarNotes: string[];
  vocabularySuggestions: string[];
  encouragement: string;
}> {
  const prompt = `${SYSTEM_PROMPT_BASE}

Évalue cette réponse orale (transcription) d'un apprenant de niveau ${level}.

EXERCICE: ${exercise.scenario}
RÔLE DE L'UTILISATEUR: ${exercise.userRole}

TRANSCRIPTION DE LA RÉPONSE:
${transcription}

Réponds en JSON:
{
  "score": 70,
  "pronunciationTips": ["conseil prononciation 1 en français"],
  "grammarNotes": ["note grammaticale 1 en français"],
  "vocabularySuggestions": ["suggestion vocabulaire (mot allemand → meilleure alternative)"],
  "encouragement": "message d'encouragement en français"
}`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const rawJson = (response.content[0] as { type: string; text: string }).text;
  return parseAIJson(rawJson);
}
