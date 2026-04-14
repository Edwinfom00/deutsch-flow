"use server";

import { db } from "@/lib/db";
import {
  userProfile, dailySession, skillPerformance,
  spacedRepetition, exercise,
} from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, gte, desc, count, sum } from "drizzle-orm";
import type { CEFRLevel } from "@/types";

const LEVEL_ORDER: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

const XP_THRESHOLDS: Record<CEFRLevel, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: Infinity,
};

// XP cumulatif pour atteindre chaque niveau depuis le départ
const CUMULATIVE_XP: Record<CEFRLevel, number> = {
  A0: 0, A1: 200, A2: 500, B1: 800, B2: 1200, C1: 1800, C2: 2500,
};

const SKILL_LABELS: Record<string, string> = {
  LESEN: "Lecture", SCHREIBEN: "Écriture",
  HOEREN: "Écoute", SPRECHEN: "Expression orale",
  WORTSCHATZ: "Vocabulaire", GRAMMATIK: "Grammaire",
};

export async function getAnalyticsData() {
  const session = await assertAuth();
  const uid = session.user.id;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0];

  const [profile, sessions30, sessions90, skills, srStats] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),

    // 30 derniers jours de sessions
    db.select().from(dailySession)
      .where(and(eq(dailySession.userId, uid), gte(dailySession.date, thirtyDaysAgo)))
      .orderBy(dailySession.date),

    // 90 derniers jours (pour calculs globaux)
    db.select().from(dailySession)
      .where(and(eq(dailySession.userId, uid), gte(dailySession.date, ninetyDaysAgo)))
      .orderBy(dailySession.date),

    // Performances par compétence
    db.select().from(skillPerformance)
      .where(eq(skillPerformance.userId, uid)),

    // Statut SM-2 global
    db.select({
      total: count(),
      exerciseType: exercise.skill,
    })
      .from(spacedRepetition)
      .innerJoin(exercise, eq(spacedRepetition.exerciseId, exercise.id))
      .where(eq(spacedRepetition.userId, uid))
      .groupBy(exercise.skill),
  ]);

  // ── Métriques globales ────────────────────────────────────────────────────
  const totalXp = profile?.totalXp ?? 0;
  const level = (profile?.level ?? "A0") as CEFRLevel;
  const levelIndex = LEVEL_ORDER.indexOf(level);

  const totalSessions = sessions90.length;
  const totalExercises = sessions90.reduce((s, r) => s + r.exercisesCompleted, 0);
  const totalTimeSeconds = sessions90.reduce((s, r) => s + r.timeSpentSeconds, 0);
  const avgScoreGlobal = skills.length > 0
    ? Math.round(skills.reduce((s, k) => s + k.avgScore, 0) / skills.length)
    : 0;

  // ── Calcul de la vitesse de progression ──────────────────────────────────
  // jours actifs sur les 30 derniers jours
  const activeDays30 = sessions30.filter((s) => s.xpEarned > 0).length;
  const totalXp30 = sessions30.reduce((s, r) => s + r.xpEarned, 0);
  const avgDailyXp = activeDays30 > 0 ? totalXp30 / activeDays30 : 0;

  // XP restant pour le prochain niveau
  const nextLevel = levelIndex < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[levelIndex + 1] : null;
  const xpCurrentLevel = CUMULATIVE_XP[level];
  const xpNextLevel = nextLevel ? CUMULATIVE_XP[nextLevel] : null;
  const xpInLevel = Math.max(0, totalXp - xpCurrentLevel);
  const xpNeededForNext = xpNextLevel !== null ? xpNextLevel - xpCurrentLevel : null;
  const xpProgressPct = xpNeededForNext
    ? Math.min(Math.round((xpInLevel / xpNeededForNext) * 100), 100)
    : 100;

  // Estimation date d'examen (niveau cible = B1 = niveau recommandé pour 1er examen Goethe)
  let examEstimate: { level: CEFRLevel; daysLeft: number; date: string } | null = null;
  const TARGET_EXAM_LEVEL: CEFRLevel = levelIndex >= LEVEL_ORDER.indexOf("B1") ? "B2" : "B1";
  const xpForTarget = CUMULATIVE_XP[TARGET_EXAM_LEVEL];

  if (avgDailyXp > 0 && totalXp < xpForTarget) {
    const xpMissing = xpForTarget - totalXp;
    const daysLeft = Math.ceil(xpMissing / avgDailyXp);
    const targetDate = new Date(Date.now() + daysLeft * 86400000);
    examEstimate = {
      level: TARGET_EXAM_LEVEL,
      daysLeft,
      date: targetDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    };
  }

  // ── Graphique XP sur 30 jours ─────────────────────────────────────────────
  const xpMap = new Map(sessions30.map((s) => [s.date, s.xpEarned]));
  const exercisesMap = new Map(sessions30.map((s) => [s.date, s.exercisesCompleted]));

  const chart30 = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0];
    return {
      date,
      xp: xpMap.get(date) ?? 0,
      exercises: exercisesMap.get(date) ?? 0,
      label: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      shortLabel: new Date(date).toLocaleDateString("fr-FR", { weekday: "short" }),
    };
  });

  // ── Performances par compétence enrichies ────────────────────────────────
  const skillsEnriched = skills.map((s) => ({
    skill: s.skill,
    label: SKILL_LABELS[s.skill] ?? s.skill,
    avgScore: Math.round(s.avgScore),
    totalAttempts: s.totalAttempts,
    failedAttempts: s.failedAttempts,
    successRate: s.totalAttempts > 0
      ? Math.round(((s.totalAttempts - s.failedAttempts) / s.totalAttempts) * 100)
      : 0,
    status: s.avgScore >= 75 ? "good" as const : s.avgScore >= 50 ? "medium" as const : "weak" as const,
  })).sort((a, b) => a.avgScore - b.avgScore); // Les plus faibles en premier

  // ── Streak actuel ─────────────────────────────────────────────────────────
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;

  // ── Mots suivis en SM-2 ───────────────────────────────────────────────────
  const totalTracked = srStats.reduce((s, r) => s + r.total, 0);

  return {
    level,
    nextLevel,
    totalXp,
    xpInLevel,
    xpNeededForNext,
    xpProgressPct,
    totalSessions,
    totalExercises,
    totalTimeSeconds,
    avgScoreGlobal,
    avgDailyXp: Math.round(avgDailyXp),
    activeDays30,
    currentStreak,
    longestStreak,
    totalTracked,
    examEstimate,
    chart30,
    skills: skillsEnriched,
  };
}
