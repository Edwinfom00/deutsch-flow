import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
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

export const badge = pgTable("badge", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameFr: text("name_fr").notNull(),
  description: text("description").notNull(),
  descriptionFr: text("description_fr").notNull(),
  icon: text("icon").notNull(),
  category: badgeCategoryEnum("category").notNull(),
  xpBonus: integer("xp_bonus").notNull().default(0),
  condition: text("condition").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userBadge = pgTable("user_badge", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull().references(() => badge.id, { onDelete: "cascade" }),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
}, (t) => [
  index("user_badge_user_id_idx").on(t.userId),
  uniqueIndex("user_badge_user_badge_idx").on(t.userId, t.badgeId),
]);

export const xpEvent = pgTable("xp_event", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  sourceId: text("source_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("xp_event_user_created_idx").on(t.userId, t.createdAt),
]);

export const streakHistory = pgTable("streak_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  completed: boolean("completed").notNull().default(false),
  streakShieldUsed: boolean("streak_shield_used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("streak_history_user_date_idx").on(t.userId, t.date),
]);

export const leagueMember = pgTable("league_member", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  weekNumber: text("week_number").notNull(),
  weekXp: integer("week_xp").notNull().default(0),
  rank: integer("rank"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("league_member_user_week_idx").on(t.userId, t.weekNumber),
  index("league_member_week_xp_idx").on(t.weekNumber, t.weekXp),
]);

export const streakChallenge = pgTable("streak_challenge", {
  id: text("id").primaryKey(),
  challengerId: text("challenger_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  challengedId: text("challenged_id").references(() => user.id, { onDelete: "set null" }),
  importId: text("import_id"),
  status: text("status").notNull().default("pending"),
  challengerScore: integer("challenger_score"),
  challengedScore: integer("challenged_score"),
  challengerCompleted: boolean("challenger_completed").notNull().default(false),
  challengedCompleted: boolean("challenged_completed").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
