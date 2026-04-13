import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const ceferLevelEnum = pgEnum("cefer_level", [
  "A0", "A1", "A2", "B1", "B2", "C1", "C2",
]);

export const sectorEnum = pgEnum("sector", [
  "IT",
  "BUSINESS",
  "SANTE",
  "DROIT",
  "TOURISME",
  "QUOTIDIEN",
  "AUTRE",
]);

export const goalEnum = pgEnum("goal", [
  "VOYAGE",
  "TRAVAIL",
  "ETUDES",
  "CERTIFICATION",
  "LOISIR",
]);

export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  level: ceferLevelEnum("level").notNull().default("A0"),
  sector: sectorEnum("sector").notNull().default("QUOTIDIEN"),
  goal: goalEnum("goal").notNull().default("LOISIR"),
  dailyGoalMinutes: integer("daily_goal_minutes").notNull().default(15),
  totalXp: integer("total_xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
