// ─── CEFR Levels ──────────────────────────────────────────────────────────────
export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export const CEFER_LEVELS: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

export const LEVEL_LABELS: Record<CEFRLevel, string> = {
  A0: "Débutant complet",
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Intermédiaire avancé",
  C1: "Avancé",
  C2: "Maîtrise",
};

export const LEVEL_HOURS: Record<CEFRLevel, number> = {
  A0: 0,
  A1: 60,
  A2: 150,
  B1: 350,
  B2: 550,
  C1: 750,
  C2: 1000,
};

// ─── Sectors ──────────────────────────────────────────────────────────────────
export type Sector = "IT" | "BUSINESS" | "SANTE" | "DROIT" | "TOURISME" | "QUOTIDIEN" | "AUTRE";

export const SECTOR_LABELS: Record<Sector, string> = {
  IT: "Informatique & Tech",
  BUSINESS: "Business & Finance",
  SANTE: "Santé & Médical",
  DROIT: "Droit & Juridique",
  TOURISME: "Tourisme & Voyage",
  QUOTIDIEN: "Vie quotidienne",
  AUTRE: "Autre",
};

export const SECTOR_ICONS: Record<Sector, string> = {
  IT: "💻",
  BUSINESS: "📊",
  SANTE: "🏥",
  DROIT: "⚖️",
  TOURISME: "✈️",
  QUOTIDIEN: "🏠",
  AUTRE: "🎯",
};

// ─── Goals ────────────────────────────────────────────────────────────────────
export type Goal = "VOYAGE" | "TRAVAIL" | "ETUDES" | "CERTIFICATION" | "LOISIR";

export const GOAL_LABELS: Record<Goal, string> = {
  VOYAGE: "Voyager en Allemagne",
  TRAVAIL: "Travailler en Allemagne",
  ETUDES: "Étudier en Allemagne",
  CERTIFICATION: "Obtenir une certification Goethe",
  LOISIR: "Apprendre par plaisir",
};

// ─── Skills ───────────────────────────────────────────────────────────────────
export type Skill = "LESEN" | "SCHREIBEN" | "HOEREN" | "SPRECHEN" | "WORTSCHATZ" | "GRAMMATIK";

export const SKILL_LABELS: Record<Skill, string> = {
  LESEN: "Lecture",
  SCHREIBEN: "Écriture",
  HOEREN: "Écoute",
  SPRECHEN: "Expression orale",
  WORTSCHATZ: "Vocabulaire",
  GRAMMATIK: "Grammaire",
};

export const SKILL_COLORS: Record<Skill, string> = {
  LESEN: "bg-blue-500",
  SCHREIBEN: "bg-purple-500",
  HOEREN: "bg-amber-500",
  SPRECHEN: "bg-green-500",
  WORTSCHATZ: "bg-pink-500",
  GRAMMATIK: "bg-orange-500",
};

// ─── Exercise Content Types ───────────────────────────────────────────────────
export interface BaseExercise {
  id: string;
  type: string;
  instructions: string; // En français
  instructionsDe?: string; // En allemand (optionnel)
  level: CEFRLevel;
  sector: Sector;
  skill: Skill;
  xpReward: number;
  difficultyScore: number;
}

// Exercice à trous
export interface FillInTheBlankExercise extends BaseExercise {
  type: "LESEN_LUECKENTEXT" | "VOCAB_LUECKENTEXT" | "GRAMMATIK_LUECKENTEXT";
  text: string; // Texte avec ____ pour les blancs
  blanks: Array<{
    position: number;
    answer: string;
    options?: string[]; // Si choix multiple
  }>;
  context?: string; // Contexte de la phrase
}

// QCM
export interface MultipleChoiceExercise extends BaseExercise {
  type: "LESEN_MULTIPLE_CHOICE" | "HOEREN_MULTIPLE_CHOICE";
  question: string;
  text?: string; // Texte à lire
  audioUrl?: string; // URL audio pour Hören
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
}

// Vrai/Faux
export interface TrueFalseExercise extends BaseExercise {
  type: "LESEN_RICHTIG_FALSCH" | "HOEREN_RICHTIG_FALSCH";
  text?: string;
  audioUrl?: string;
  statements: Array<{
    id: string;
    statement: string;
    answer: "RICHTIG" | "FALSCH" | "NICHT_IM_TEXT";
  }>;
}

// Association
export interface MatchingExercise extends BaseExercise {
  type: "LESEN_ZUORDNUNG" | "VOCAB_ZUORDNUNG" | "HOEREN_ZUORDNUNG";
  pairs: Array<{
    id: string;
    left: string;
    right: string;
  }>;
}

// Vocabulaire flashcard
export interface FlashcardExercise extends BaseExercise {
  type: "VOCAB_FLASHCARD";
  word: string;
  article?: "der" | "die" | "das"; // Genre pour les noms
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  imageUrl?: string;
  audioUrl?: string;
  tags: string[]; // Secteur, thème, etc.
}

// Écriture
export interface WritingExercise extends BaseExercise {
  type: "SCHREIBEN_EMAIL" | "SCHREIBEN_NOTIZ" | "SCHREIBEN_MEINUNG" | "SCHREIBEN_BESCHREIBUNG";
  prompt: string; // Consigne de rédaction
  minWords?: number;
  maxWords?: number;
  template?: string; // Structure suggérée
  rubric?: string[]; // Critères d'évaluation
}

// Expression orale / Dialog
export interface SpeakingExercise extends BaseExercise {
  type: "SPRECHEN_DIALOG" | "SPRECHEN_ROLEPLAY" | "SPRECHEN_VORSTELLEN";
  scenario: string; // Description de la situation
  aiRole: string; // Rôle que joue l'IA
  userRole: string; // Rôle de l'utilisateur
  targetPhrases?: string[]; // Expressions à utiliser
  keyVocabulary?: Array<{ word: string; translation: string }>;
}

// Construire une phrase
export interface SentenceBuilderExercise extends BaseExercise {
  type: "GRAMMATIK_ORDNEN";
  words: string[]; // Mots à réordonner
  solution: string; // Phrase correcte
  hint?: string;
}

export type ExerciseContent =
  | FillInTheBlankExercise
  | MultipleChoiceExercise
  | TrueFalseExercise
  | MatchingExercise
  | FlashcardExercise
  | WritingExercise
  | SpeakingExercise
  | SentenceBuilderExercise;

// ─── User Types ───────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  userId: string;
  level: CEFRLevel;
  sector: Sector;
  goal: Goal;
  dailyGoalMinutes: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date | null;
  onboardingCompleted: boolean;
}
