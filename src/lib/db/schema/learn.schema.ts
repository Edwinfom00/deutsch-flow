import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  real,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { ceferLevelEnum, sectorEnum } from "./profile.schema";

// ─── Exercise Types (inspirés Goethe/ÖSD) ────────────────────────────────────
export const exerciseTypeEnum = pgEnum("exercise_type", [
  // LESEN (Lecture)
  "LESEN_ZUORDNUNG",        // Associer textes et titres/résumés
  "LESEN_MULTIPLE_CHOICE",  // QCM sur un texte
  "LESEN_RICHTIG_FALSCH",   // Vrai/Faux/Pas dans le texte
  "LESEN_LUECKENTEXT",      // Texte à trous (lecture)
  "LESEN_REIHENFOLGE",      // Remettre dans l'ordre

  // SCHREIBEN (Écriture)
  "SCHREIBEN_EMAIL",        // Écrire un email formel/informel
  "SCHREIBEN_NOTIZ",        // Rédiger une note/message
  "SCHREIBEN_MEINUNG",      // Exprimer son opinion
  "SCHREIBEN_BESCHREIBUNG", // Décrire une image/situation
  "SCHREIBEN_ZUSAMMENFASSUNG", // Résumer un texte

  // HÖREN (Écoute)
  "HOEREN_MULTIPLE_CHOICE", // QCM sur un audio
  "HOEREN_ZUORDNUNG",       // Associer dialogues et situations
  "HOEREN_ERGAENZUNG",      // Compléter pendant l'écoute
  "HOEREN_RICHTIG_FALSCH",  // Vrai/Faux sur audio

  // SPRECHEN (Expression orale)
  "SPRECHEN_VORSTELLEN",    // Se présenter
  "SPRECHEN_DIALOG",        // Dialogue guidé avec l'IA
  "SPRECHEN_BESCHREIBUNG",  // Décrire une image à l'oral
  "SPRECHEN_DISKUSSION",    // Discuter d'un sujet
  "SPRECHEN_ROLEPLAY",      // Jeu de rôle situationnel

  // WORTSCHATZ (Vocabulaire)
  "VOCAB_FLASHCARD",        // Carte mémo avec spaced repetition
  "VOCAB_LUECKENTEXT",      // Phrase à compléter
  "VOCAB_ZUORDNUNG",        // Associer mot et définition
  "VOCAB_BILD",             // Associer image et mot
  "VOCAB_SEKTOR",           // Vocab sectoriel spécifique

  // GRAMMATIK (Grammaire)
  "GRAMMATIK_LUECKENTEXT",  // Conjugaison / déclinaison à trous
  "GRAMMATIK_ORDNEN",       // Construire une phrase
  "GRAMMATIK_TRANSFORMATION", // Transformer une phrase
  "GRAMMATIK_FEHLERKORREKTUR", // Corriger les erreurs
]);

export const skillEnum = pgEnum("skill", [
  "LESEN", "SCHREIBEN", "HOEREN", "SPRECHEN", "WORTSCHATZ", "GRAMMATIK",
]);

// ─── Lessons ──────────────────────────────────────────────────────────────────
export const lesson = pgTable("lesson", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleFr: text("title_fr").notNull(),
  description: text("description"),
  level: ceferLevelEnum("level").notNull(),
  sector: sectorEnum("sector").notNull().default("QUOTIDIEN"),
  skill: skillEnum("skill").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  xpReward: integer("xp_reward").notNull().default(20),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Exercises ─────────────────────────────────────────────────────────────────
export const exercise = pgTable("exercise", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lesson.id, { onDelete: "cascade" }),
  type: exerciseTypeEnum("type").notNull(),
  level: ceferLevelEnum("level").notNull(),
  sector: sectorEnum("sector").notNull().default("QUOTIDIEN"),
  skill: skillEnum("skill").notNull(),
  // Le contenu JSON de l'exercice (instructions, contenus, réponses, etc.)
  content: jsonb("content").notNull(),
  // Indice de difficulté 0-1 pour l'algorithme adaptatif
  difficultyScore: real("difficulty_score").notNull().default(0.5),
  xpReward: integer("xp_reward").notNull().default(10),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── User Progress ────────────────────────────────────────────────────────────
export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  score: real("score"), // 0-100
  timeSpentSeconds: integer("time_spent_seconds"),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Spaced Repetition ────────────────────────────────────────────────────────
export const spacedRepetition = pgTable("spaced_repetition", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "cascade" }),
  // Algorithme SM-2
  easeFactor: real("ease_factor").notNull().default(2.5),
  interval: integer("interval").notNull().default(1), // jours
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  lastReviewAt: timestamp("last_review_at"),
  lastQuality: integer("last_quality"), // 0-5 (SM-2)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Daily Sessions ───────────────────────────────────────────────────────────
export const dailySession = pgTable("daily_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  xpEarned: integer("xp_earned").notNull().default(0),
  exercisesCompleted: integer("exercises_completed").notNull().default(0),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
