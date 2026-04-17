import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";
import { ceferLevelEnum, sectorEnum } from "./profile.schema";

export const exerciseTypeEnum = pgEnum("exercise_type", [
  "LESEN_ZUORDNUNG",
  "LESEN_MULTIPLE_CHOICE",
  "LESEN_RICHTIG_FALSCH",
  "LESEN_LUECKENTEXT",
  "LESEN_REIHENFOLGE",
  "SCHREIBEN_EMAIL",
  "SCHREIBEN_NOTIZ",
  "SCHREIBEN_MEINUNG",
  "SCHREIBEN_BESCHREIBUNG",
  "SCHREIBEN_ZUSAMMENFASSUNG",
  "HOEREN_MULTIPLE_CHOICE",
  "HOEREN_ZUORDNUNG",
  "HOEREN_ERGAENZUNG",
  "HOEREN_RICHTIG_FALSCH",
  "SPRECHEN_VORSTELLEN",
  "SPRECHEN_DIALOG",
  "SPRECHEN_BESCHREIBUNG",
  "SPRECHEN_DISKUSSION",
  "SPRECHEN_ROLEPLAY",
  "VOCAB_FLASHCARD",
  "VOCAB_LUECKENTEXT",
  "VOCAB_ZUORDNUNG",
  "VOCAB_BILD",
  "VOCAB_SEKTOR",
  "GRAMMATIK_LUECKENTEXT",
  "GRAMMATIK_ORDNEN",
  "GRAMMATIK_TRANSFORMATION",
  "GRAMMATIK_FEHLERKORREKTUR",
  "MATCHING_HEADLINES",
  "MULTIPLE_CHOICE_READING",
  "SITUATION_AD_MATCHING",
]);

export const skillEnum = pgEnum("skill", [
  "LESEN", "SCHREIBEN", "HOEREN", "SPRECHEN", "WORTSCHATZ", "GRAMMATIK",
]);

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

export const exercise = pgTable("exercise", {
  id: text("id").primaryKey(),
  lessonId: text("lesson_id").references(() => lesson.id, { onDelete: "cascade" }),
  type: exerciseTypeEnum("type").notNull(),
  level: ceferLevelEnum("level").notNull(),
  sector: sectorEnum("sector").notNull().default("QUOTIDIEN"),
  skill: skillEnum("skill").notNull(),
  content: jsonb("content").notNull(),
  difficultyScore: real("difficulty_score").notNull().default(0.5),
  xpReward: integer("xp_reward").notNull().default(10),
  isAiGenerated: boolean("is_ai_generated").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("exercise_level_skill_idx").on(t.level, t.skill),
  index("exercise_lesson_id_idx").on(t.lessonId),
]);

export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").notNull().references(() => lesson.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  score: real("score"),
  timeSpentSeconds: integer("time_spent_seconds"),
  xpEarned: integer("xp_earned").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("user_progress_user_id_idx").on(t.userId),
]);

export const spacedRepetition = pgTable("spaced_repetition", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id").notNull().references(() => exercise.id, { onDelete: "cascade" }),
  easeFactor: real("ease_factor").notNull().default(2.5),
  interval: integer("interval").notNull().default(1),
  repetitions: integer("repetitions").notNull().default(0),
  nextReviewAt: timestamp("next_review_at").notNull().defaultNow(),
  lastReviewAt: timestamp("last_review_at"),
  lastQuality: integer("last_quality"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("sr_user_next_review_idx").on(t.userId, t.nextReviewAt),
  index("sr_exercise_id_idx").on(t.exerciseId),
  uniqueIndex("sr_user_exercise_unique_idx").on(t.userId, t.exerciseId),
]);

export const activeLearnSession = pgTable("active_learn_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  exerciseIds: jsonb("exercise_ids").notNull(),
  exercisesData: jsonb("exercises_data").notNull(),
  currentIndex: integer("current_index").notNull().default(0),
  results: jsonb("results").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailySession = pgTable("daily_session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  exercisesCompleted: integer("exercises_completed").notNull().default(0),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("daily_session_user_date_idx").on(t.userId, t.date),
]);

export const skillPerformance = pgTable("skill_performance", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  skill: skillEnum("skill").notNull(),
  avgScore: real("avg_score").notNull().default(50),
  totalAttempts: integer("total_attempts").notNull().default(0),
  failedAttempts: integer("failed_attempts").notNull().default(0),
  weakExerciseTypes: jsonb("weak_exercise_types").notNull().default({}),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("skill_perf_user_skill_idx").on(t.userId, t.skill),
]);

export const wordDetailCache = pgTable("word_detail_cache", {
  exerciseId: text("exercise_id").primaryKey().references(() => exercise.id, { onDelete: "cascade" }),
  definitionDe: text("definition_de").notNull(),
  definitionFr: text("definition_fr").notNull(),
  wordType: text("word_type").notNull(),
  plural: text("plural"),
  sentences: jsonb("sentences").notNull(),
  synonyms: jsonb("synonyms").notNull().default([]),
  antonyms: jsonb("antonyms").notNull().default([]),
  tip: text("tip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const speakScenario = pgTable("speak_scenario", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiRole: text("ai_role").notNull(),
  userRole: text("user_role").notNull(),
  opener: text("opener").notNull(),
  difficulty: text("difficulty").notNull(),
  sector: text("sector").notNull(),
  level: text("level").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("speak_scenario_user_id_idx").on(t.userId),
]);

export const wordOfDay = pgTable("word_of_day", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  level: ceferLevelEnum("level").notNull(),
  word: text("word").notNull(),
  article: text("article"),
  translation: text("translation").notNull(),
  exampleDe: text("example_de").notNull(),
  exampleFr: text("example_fr").notNull(),
  wordType: text("word_type").notNull(),
  tip: text("tip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("word_of_day_date_level_idx").on(t.date, t.level),
]);

export const documentImport = pgTable("document_import", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  docType: text("doc_type").notNull(),
  status: text("status").notNull().default("pending"),
  extractedText: text("extracted_text"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  isPublic: boolean("is_public").notNull().default(false),
  publishedAt: timestamp("published_at"),
  level: ceferLevelEnum("level"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("doc_import_user_status_idx").on(t.userId, t.status, t.docType),
  index("doc_import_public_level_idx").on(t.isPublic, t.level, t.status),
  index("doc_import_created_at_idx").on(t.createdAt),
]);

export const importedExercise = pgTable("imported_exercise", {
  id: text("id").primaryKey(),
  importId: text("import_id").notNull().references(() => documentImport.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: exerciseTypeEnum("type").notNull(),
  level: ceferLevelEnum("level").notNull(),
  sector: sectorEnum("sector").notNull().default("QUOTIDIEN"),
  skill: skillEnum("skill").notNull(),
  content: jsonb("content").notNull(),
  xpReward: integer("xp_reward").notNull().default(15),
  difficultyScore: real("difficulty_score").notNull().default(0.5),
  isGenerated: boolean("is_generated").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("imported_ex_import_id_idx").on(t.importId),
  index("imported_ex_user_id_idx").on(t.userId),
  index("imported_ex_import_order_idx").on(t.importId, t.orderIndex),
]);

export const importedExerciseResult = pgTable("imported_exercise_result", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  importedExerciseId: text("imported_exercise_id").notNull().references(() => importedExercise.id, { onDelete: "cascade" }),
  score: real("score").notNull(),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (t) => [
  index("imported_ex_result_user_idx").on(t.userId),
  uniqueIndex("imported_ex_result_user_ex_idx").on(t.userId, t.importedExerciseId),
]);

export const levelTestAttempt = pgTable("level_test_attempt", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  fromLevel: ceferLevelEnum("from_level").notNull(),
  toLevel: ceferLevelEnum("to_level").notNull(),
  status: text("status").notNull().default("pending"),
  score: real("score"),
  exerciseIds: jsonb("exercise_ids").notNull().default([]),
  results: jsonb("results").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (t) => [
  index("level_test_user_idx").on(t.userId),
]);

export const phraseDuJour = pgTable("phrase_du_jour", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  level: ceferLevelEnum("level").notNull(),
  sector: sectorEnum("sector").notNull(),
  phraseDe: text("phrase_de").notNull(),
  phraseFr: text("phrase_fr").notNull(),
  context: text("context").notNull(),
  tip: text("tip"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("phrase_du_jour_date_level_sector_idx").on(t.date, t.level, t.sector),
]);

export const verbCache = pgTable("verb_cache", {
  id: text("id").primaryKey(),
  infinitive: text("infinitive").notNull().unique(),
  translation: text("translation").notNull(),
  sector: sectorEnum("sector").notNull(),
  level: ceferLevelEnum("level").notNull(),
  isIrregular: boolean("is_irregular").notNull().default(false),
  auxiliary: text("auxiliary"),
  participle: text("participle"),
  conjugations: jsonb("conjugations").notNull(),
  sentences: jsonb("sentences").notNull().default({}),
  irregularityNote: text("irregularity_note"),
  memoryTip: text("memory_tip"),
  story: jsonb("story"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("verb_cache_sector_level_idx").on(t.sector, t.level),
]);
