import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const badgeCategoryEnum = pgEnum("badge_category", [
  "STREAK",
  "XP",
  "SKILL",
  "SECTOR",
  "SOCIAL",
  "MILESTONE",
]);

// ─── Badges ───────────────────────────────────────────────────────────────────
export const badge = pgTable("badge", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr").notNull(),
  description: text("description").notNull(),
  descriptionFr: text("description_fr").notNull(),
  icon: text("icon").notNull(), // Lucide icon name ou emoji
  category: badgeCategoryEnum("category").notNull(),
  xpBonus: integer("xp_bonus").notNull().default(0),
  // Condition en JSON: { type: "streak", value: 7 }
  condition: text("condition").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

// ─── User Badges ──────────────────────────────────────────────────────────────
export const userBadge = pgTable("user_badge", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  badgeId: text("badge_id")
    .notNull()
    .references(() => badge.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

// ─── XP Events ────────────────────────────────────────────────────────────────
export const xpEvent = pgTable("xp_event", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(), // "lesson_complete", "streak_bonus", etc.
  sourceId: text("source_id"), // lessonId, exerciseId, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Streak History ───────────────────────────────────────────────────────────
export const streakHistory = pgTable("streak_history", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").notNull().default(false),
  streakShieldUsed: boolean("streak_shield_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── League ───────────────────────────────────────────────────────────────────
export const leagueMember = pgTable("league_member", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  weekNumber: text("week_number").notNull(), // "2025-W14"
  weekXp: integer("week_xp").notNull().default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
