"use server";

import { db } from "@/lib/db";
import { exercise, dailySession, activeLearnSession } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { generateDailySession } from "@/lib/ai/exercise-generator";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { computeSM2 } from "@/lib/sm2";
import type { CEFRLevel, Sector, Skill } from "@/types";

// XP cumulatif requis pour quitter chaque niveau (ex: A0 → A1 à 200 XP total)
const LEVEL_UP_THRESHOLDS: Record<CEFRLevel, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: Infinity,
};
const LEVEL_ORDER: CEFRLevel[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

type PartialResult = {
  exerciseId: string;
  score: number;
  quality: number;
  timeSpentSeconds: number;
  feedback?: string;
};

// ─── Récupérer la session active en cours ────────────────────────────────────
export async function getActiveSession() {
  const session = await assertAuth();
  const uid = session.user.id;

  const active = await db.query.activeLearnSession.findFirst({
    where: (s, { eq }) => eq(s.userId, uid),
  });

  if (!active) return null;

  return {
    id: active.id,
    exercises: active.exercisesData as SessionExercise[],
    currentIndex: active.currentIndex,
    results: (active.results as PartialResult[]) ?? [],
  };
}

// ─── Démarrer ou reprendre une session ───────────────────────────────────────
export async function startLearnSession() {
  const session = await assertAuth();
  const uid = session.user.id;

  // Vérifier si une session active existe déjà
  const existing = await db.query.activeLearnSession.findFirst({
    where: (s, { eq }) => eq(s.userId, uid),
  });
  if (existing) {
    return {
      exercises: existing.exercisesData as SessionExercise[],
      currentIndex: existing.currentIndex,
      results: (existing.results as PartialResult[]) ?? [],
      resumed: true,
    };
  }

  const profile = await db.query.userProfile.findFirst({
    where: (p, { eq }) => eq(p.userId, uid),
  });
  if (!profile) throw new Error("Profil introuvable");

  const level = profile.level as CEFRLevel;
  const sector = profile.sector as Sector;
  const goalMinutes = profile.dailyGoalMinutes;

  // Charger le profil de performance adaptatif
  const { skillPerformance } = await import("@/lib/db/schema");
  const perfRows = await db.select().from(skillPerformance)
    .where(eq(skillPerformance.userId, uid));

  const skillProfiles = perfRows.map((r) => ({
    skill: r.skill,
    avgScore: r.avgScore,
    weakExerciseTypes: (r.weakExerciseTypes as Record<string, number>) ?? {},
  }));

  // Générer via notre modèle IA avec adaptation
  const rawGenerated = await generateDailySession(level, sector, goalMinutes, skillProfiles);
  // Guard : s'assurer que le retour est bien un tableau (l'IA peut retourner null ou un objet)
  const generated = Array.isArray(rawGenerated) && rawGenerated.length > 0
    ? rawGenerated
    : (() => { throw new Error("La génération de session a retourné un résultat invalide. Réessaie."); })();

  // Sauvegarder les exercices en DB
  const saved = await Promise.all(
    generated.map(async ({ content, difficultyScore, xpReward }) => {
      const [ex] = await db.insert(exercise).values({
        id: nanoid(),
        type: (content as { type: string }).type as never,
        level,
        sector,
        skill: (content as { skill?: Skill }).skill ?? "WORTSCHATZ",
        content: content as never,
        difficultyScore,
        xpReward,
        isAiGenerated: true,
      }).returning();
      return ex;
    })
  );

  const exercisesData: SessionExercise[] = saved.map((ex) => ({
    id: ex.id,
    type: ex.type,
    level: ex.level,
    sector: ex.sector,
    skill: ex.skill,
    content: ex.content,
    xpReward: ex.xpReward,
    difficultyScore: ex.difficultyScore,
  }));

  // Persister la session active en DB
  await db.insert(activeLearnSession).values({
    id: nanoid(),
    userId: uid,
    exerciseIds: saved.map((e) => e.id),
    exercisesData,
    currentIndex: 0,
    results: [],
  });

  return { exercises: exercisesData, currentIndex: 0, results: [], resumed: false };
}

// ─── Sauvegarder la progression après chaque exercice ────────────────────────
export async function saveSessionProgress(params: {
  currentIndex: number;
  result: PartialResult;
}) {
  const session = await assertAuth();
  const uid = session.user.id;

  const active = await db.query.activeLearnSession.findFirst({
    where: (s, { eq }) => eq(s.userId, uid),
  });
  if (!active) return;

  const results = [...((active.results as PartialResult[]) ?? []), params.result];

  await db.update(activeLearnSession).set({
    currentIndex: params.currentIndex,
    results,
    updatedAt: new Date(),
  }).where(eq(activeLearnSession.userId, uid));
}

// ─── Terminer et nettoyer la session ─────────────────────────────────────────
export async function completeLearnSession(params: {
  exerciseResults: PartialResult[];
  totalXpEarned: number;
}) {
  const session = await assertAuth();
  const uid = session.user.id;
  const { exerciseResults, totalXpEarned } = params;

  const today = new Date().toISOString().split("T")[0];
  const totalTime = exerciseResults.reduce((s, r) => s + r.timeSpentSeconds, 0);

  // Supprimer la session active
  await db.delete(activeLearnSession).where(eq(activeLearnSession.userId, uid));

  // Upsert daily session
  const [existing] = await db
    .select()
    .from(dailySession)
    .where(and(eq(dailySession.userId, uid), eq(dailySession.date, today)));

  if (existing) {
    await db.update(dailySession).set({
      xpEarned: existing.xpEarned + totalXpEarned,
      exercisesCompleted: existing.exercisesCompleted + exerciseResults.length,
      timeSpentSeconds: existing.timeSpentSeconds + totalTime,
    }).where(eq(dailySession.id, existing.id));
  } else {
    await db.insert(dailySession).values({
      id: nanoid(),
      userId: uid,
      date: today,
      xpEarned: totalXpEarned,
      exercisesCompleted: exerciseResults.length,
      timeSpentSeconds: totalTime,
    });
  }

  const { userProfile, streakHistory, skillPerformance } = await import("@/lib/db/schema");

  // Récupérer le profil pour le level-up
  const currentProfile = await db.query.userProfile.findFirst({
    where: (p, { eq }) => eq(p.userId, uid),
  });

  const newTotalXp = (currentProfile?.totalXp ?? 0) + totalXpEarned;
  const currentLevel = (currentProfile?.level ?? "A0") as CEFRLevel;
  const currentLevelIndex = LEVEL_ORDER.indexOf(currentLevel);

  // Déterminer si un ou plusieurs niveaux sont franchis
  let newLevel = currentLevel;
  for (let i = currentLevelIndex; i < LEVEL_ORDER.length - 1; i++) {
    if (newTotalXp >= LEVEL_UP_THRESHOLDS[LEVEL_ORDER[i]]) {
      newLevel = LEVEL_ORDER[i + 1];
    } else {
      break;
    }
  }

  await db.update(userProfile).set({
    totalXp: newTotalXp,
    ...(newLevel !== currentLevel ? { level: newLevel } : {}),
    lastActivityAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(userProfile.userId, uid));

  // ── Mettre à jour le profil de performance adaptatif ──────────────────────
  // Récupérer les exercices de la session pour connaître skill + type
  const exerciseIds = exerciseResults.map((r) => r.exerciseId);
  if (exerciseIds.length > 0) {
    const { exercise: exerciseTable } = await import("@/lib/db/schema");
    const { inArray } = await import("drizzle-orm");
    const sessionExercises = await db.select().from(exerciseTable)
      .where(inArray(exerciseTable.id, exerciseIds));

    // Grouper les résultats par compétence
    const bySkill = new Map<string, { scores: number[]; types: string[] }>();
    for (const ex of sessionExercises) {
      const result = exerciseResults.find((r) => r.exerciseId === ex.id);
      if (!result) continue;
      const entry = bySkill.get(ex.skill) ?? { scores: [], types: [] };
      entry.scores.push(result.score);
      if (result.score < 60) entry.types.push(ex.type);
      bySkill.set(ex.skill, entry);
    }

    // Upsert skill_performance pour chaque compétence
    for (const [skill, data] of bySkill.entries()) {
      const avgNew = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const failed = data.scores.filter((s) => s < 60).length;

      const [existing] = await db.select().from(skillPerformance)
        .where(and(eq(skillPerformance.userId, uid), eq(skillPerformance.skill, skill as never)));

      if (existing) {
        // Moyenne pondérée : 70% historique + 30% session actuelle
        const newAvg = existing.avgScore * 0.7 + avgNew * 0.3;
        const weakTypes = (existing.weakExerciseTypes as Record<string, number>) ?? {};
        for (const t of data.types) {
          weakTypes[t] = (weakTypes[t] ?? 0) + 1;
        }
        await db.update(skillPerformance).set({
          avgScore: Math.round(newAvg * 10) / 10,
          totalAttempts: existing.totalAttempts + data.scores.length,
          failedAttempts: existing.failedAttempts + failed,
          weakExerciseTypes: weakTypes,
          updatedAt: new Date(),
        }).where(eq(skillPerformance.id, existing.id));
      } else {
        const weakTypes: Record<string, number> = {};
        for (const t of data.types) weakTypes[t] = (weakTypes[t] ?? 0) + 1;
        await db.insert(skillPerformance).values({
          id: nanoid(),
          userId: uid,
          skill: skill as never,
          avgScore: Math.round(avgNew * 10) / 10,
          totalAttempts: data.scores.length,
          failedAttempts: failed,
          weakExerciseTypes: weakTypes,
        });
      }
    }
  }

  // ── Spaced Repetition — upsert SM-2 pour chaque exercice ────────────────
  if (exerciseIds.length > 0) {
    const { spacedRepetition } = await import("@/lib/db/schema");
    const now = new Date();

    for (const result of exerciseResults) {
      const quality = result.quality ?? (result.score >= 80 ? 5 : result.score >= 60 ? 4 : result.score >= 40 ? 3 : 1);

      const [existing] = await db.select().from(spacedRepetition)
        .where(and(eq(spacedRepetition.userId, uid), eq(spacedRepetition.exerciseId, result.exerciseId)));

      const { easeFactor: ef, interval, repetitions: reps, nextReviewAt } =
        computeSM2(existing ?? null, quality);

      if (existing) {
        await db.update(spacedRepetition).set({
          easeFactor: ef, interval, repetitions: reps,
          nextReviewAt, lastReviewAt: now, lastQuality: quality, updatedAt: now,
        }).where(eq(spacedRepetition.id, existing.id));
      } else {
        await db.insert(spacedRepetition).values({
          id: nanoid(), userId: uid, exerciseId: result.exerciseId,
          easeFactor: ef, interval, repetitions: reps,
          nextReviewAt, lastReviewAt: now, lastQuality: quality,
        });
      }
    }
  }

  // ── Streak — calculé depuis dailySession (source de vérité) ─────────────
  const [todayStreak] = await db
    .select()
    .from(streakHistory)
    .where(and(eq(streakHistory.userId, uid), eq(streakHistory.date, today)));

  if (!todayStreak) {
    await db.insert(streakHistory).values({
      id: nanoid(), userId: uid, date: today, completed: true,
    });

    // Recalculer depuis dailySession — source de vérité fiable
    const allSessions = await db
      .select({ date: dailySession.date })
      .from(dailySession)
      .where(eq(dailySession.userId, uid));

    const activeDates = new Set(allSessions.map((s) => s.date));
    activeDates.add(today); // aujourd'hui vient d'être complété

    let streak = 0;
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (activeDates.has(dateStr)) {
        streak++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else {
        break;
      }
    }

    const profile = await db.query.userProfile.findFirst({
      where: (p, { eq }) => eq(p.userId, uid),
    });

    await db.update(userProfile).set({
      currentStreak: streak,
      longestStreak: Math.max(streak, profile?.longestStreak ?? 0),
      updatedAt: new Date(),
    }).where(eq(userProfile.userId, uid));
  }

  // ── Auto-capture vocabulaire ─────────────────────────────────────────────
  // Transforme les paires VOCAB_ZUORDNUNG / VOCAB_BILD en flashcards perso
  if (exerciseIds.length > 0) {
    const { exercise: exerciseTable, spacedRepetition: srTable } = await import("@/lib/db/schema");
    const { inArray, not } = await import("drizzle-orm");

    const vocabExercises = await db.select().from(exerciseTable)
      .where(
        and(
          inArray(exerciseTable.id, exerciseIds),
          inArray(exerciseTable.type as never, ["VOCAB_ZUORDNUNG", "VOCAB_BILD"] as never[])
        )
      );

    for (const ex of vocabExercises) {
      const content = ex.content as { pairs?: Array<{ id: string; left: string; right: string }> };
      if (!content.pairs) continue;

      for (const pair of content.pairs) {
        // left = mot allemand, right = traduction française (ZUORDNUNG)
        // left = description image, right = mot allemand (BILD) — on inverse
        const isVocabBild = ex.type === "VOCAB_BILD";
        const wordDe = isVocabBild ? pair.right : pair.left;
        const translationFr = isVocabBild ? pair.left : pair.right;

        if (!wordDe || !translationFr) continue;

        // Créer un exercice VOCAB_FLASHCARD minimal pour ce mot
        const [newEx] = await db.insert(exerciseTable).values({
          id: nanoid(),
          type: "VOCAB_FLASHCARD" as never,
          level: ex.level,
          sector: ex.sector,
          skill: "WORTSCHATZ" as never,
          content: {
            type: "VOCAB_FLASHCARD",
            instructions: "Mémorise ce mot.",
            word: wordDe,
            translation: translationFr,
            exampleSentence: "",
            exampleTranslation: "",
            synonyms: [],
            tags: [ex.sector, ex.level],
          } as never,
          difficultyScore: ex.difficultyScore,
          xpReward: ex.xpReward,
          isAiGenerated: true,
        }).returning().catch(() => []);

        if (!newEx) continue;

        // Ajouter en SM-2 seulement si ce mot n'est pas encore suivi
        const alreadyTracked = await db.select().from(srTable)
          .where(and(eq(srTable.userId, uid), eq(srTable.exerciseId, newEx.id)))
          .limit(1);

        if (alreadyTracked.length === 0) {
          await db.insert(srTable).values({
            id: nanoid(),
            userId: uid,
            exerciseId: newEx.id,
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewAt: new Date(),
          }).catch(() => {});
        }
      }
    }
  }

  // Vérifier et attribuer les badges mérités
  const { checkAndAwardBadges } = await import("@/modules/gamification/server/badges.actions");
  await checkAndAwardBadges();

  return { success: true };
}

// ─── Abandonner la session active ────────────────────────────────────────────
export async function abandonSession() {
  const session = await assertAuth();
  await db.delete(activeLearnSession)
    .where(eq(activeLearnSession.userId, session.user.id));
}

interface SessionExercise {
  id: string;
  type: string;
  level: string;
  sector: string;
  skill: string;
  content: unknown;
  xpReward: number;
  difficultyScore: number;
}
