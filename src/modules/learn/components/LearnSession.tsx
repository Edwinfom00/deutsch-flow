"use client";

import { useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Zap, ChevronRight } from "lucide-react";
import { useSessionStore } from "../model/session.store";
import { ExerciseRenderer } from "@/modules/exercises/components/ExerciseRenderer";
import { completeLearnSession, saveSessionProgress } from "../server/learn.actions";
import type { ExerciseContent } from "@/types";
import type { ExerciseResult } from "@/modules/exercises/components/ExerciseRenderer";

export function LearnSession() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    exercises, currentIndex, results, status,
    submitResult, next, reset, totalXpEarned, avgScore,
  } = useSessionStore();

  const current = exercises[currentIndex];
  const progress = exercises.length > 0 ? (currentIndex / exercises.length) : 0;

  const handleComplete = useCallback((result: ExerciseResult) => {
    submitResult(current.id, result);
    // Sauvegarder la progression en DB
    saveSessionProgress({
      currentIndex: currentIndex + 1,
      result: { ...result, exerciseId: current.id },
    }).catch(() => {}); // silencieux, le localStorage prend le relais
    setTimeout(() => next(), 1200);
  }, [current, submitResult, next, currentIndex]);

  const handleFinish = () => {
    startTransition(async () => {
      await completeLearnSession({
        exerciseResults: results.map((r) => ({
          exerciseId: r.exerciseId,
          score: r.score,
          quality: r.quality,
          timeSpentSeconds: r.timeSpentSeconds,
        })),
        totalXpEarned: totalXpEarned(),
      });
      reset();
      router.push("/dashboard");
      router.refresh();
    });
  };

  // ── Écran de résultats ────────────────────────────────────────────────────
  if (status === "completed") {
    const xp = totalXpEarned();
    const score = avgScore();
    const scoreIcon = score >= 80 ? "A" : score >= 60 ? "B" : "C";
    const scoreColor = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-gray-400";
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Score badge */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className={`inline-flex h-14 w-14 rounded-md ${scoreColor} items-center justify-center`}
            >
              <span className="text-white text-2xl font-black font-heading">{scoreIcon}</span>
            </motion.div>

          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900">Session terminée</h2>
            <p className="text-gray-400 text-sm mt-1">{exercises.length} exercices complétés</p>
          </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Score moyen", value: `${score}%` },
              { label: "XP gagnés", value: `+${xp}` },
              { label: "Exercices", value: exercises.length },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-md p-3">
                <p className="text-xl font-bold text-gray-900 font-heading">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Per-exercise recap */}
          <div className="space-y-2 text-left">
            {results.map((r, i) => {
              const exType = exercises.find((e) => e.id === r.exerciseId)?.type ?? "";
              const typeLabel: Record<string, string> = {
                LESEN_LUECKENTEXT: "Lire · texte lacunaire", LESEN_MULTIPLE_CHOICE: "Lire · QCM",
                LESEN_RICHTIG_FALSCH: "Lire · Vrai/Faux", LESEN_ZUORDNUNG: "Lire · Correspondances",
                SCHREIBEN_EMAIL: "Écrire · E-mail", SCHREIBEN_NOTIZ: "Écrire · Note",
                SCHREIBEN_MEINUNG: "Écrire · Opinion", SCHREIBEN_BESCHREIBUNG: "Écrire · Description",
                SCHREIBEN_ZUSAMMENFASSUNG: "Écrire · Résumé",
                HOEREN_MULTIPLE_CHOICE: "Écouter · QCM", HOEREN_RICHTIG_FALSCH: "Écouter · Vrai/Faux",
                HOEREN_ZUORDNUNG: "Écouter · Correspondances", HOEREN_ERGAENZUNG: "Écouter · Compléter",
                SPRECHEN_VORLESEN: "Parler · Lecture", SPRECHEN_BESCHREIBUNG: "Parler · Description",
                SPRECHEN_FRAGE: "Parler · Question",
                VOCAB_LUECKENTEXT: "Vocab · Lacunaire", VOCAB_ZUORDNUNG: "Vocab · Correspondances",
                VOCAB_BILD: "Vocab · Images", VOCAB_FLASHCARD: "Vocab · Flashcard",
                VOCAB_SEKTOR: "Vocab · Secteur",
                GRAMMATIK_LUECKENTEXT: "Grammaire · Lacunaire", GRAMMATIK_MULTIPLE_CHOICE: "Grammaire · QCM",
                GRAMMATIK_UMFORMUNG: "Grammaire · Reformulation",
              };
              return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{typeLabel[exType] ?? `Exercice ${i + 1}`}</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-20 bg-gray-100 rounded-sm overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${r.score >= 70 ? "bg-emerald-500" : r.score >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right">{r.score}%</span>
                </div>
              </div>
              );
            })}
          </div>

          <button
            onClick={handleFinish}
            disabled={isPending}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isPending ? "Sauvegarde..." : "Retour au dashboard"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button
          onClick={() => { reset(); router.push("/dashboard"); }}
          className="text-gray-300 hover:text-gray-600 transition-colors"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
          <motion.div
            className="h-full bg-gray-900 rounded-sm"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>

        {/* XP counter */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-semibold text-gray-700">{totalXpEarned()}</span>
          <span>XP</span>
        </div>

        {/* Counter */}
        <span className="text-xs text-gray-400 font-mono tabular-nums">
          {currentIndex + 1}/{exercises.length}
        </span>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex items-start justify-center px-5 py-8 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
            >
              <ExerciseRenderer
                exercise={{
                  ...(current.content as ExerciseContent),
                  level: (current.content as ExerciseContent).level ?? current.level,
                  skill: (current.content as ExerciseContent).skill ?? current.skill,
                  xpReward: (current.content as ExerciseContent).xpReward ?? current.xpReward,
                } as ExerciseContent}
                onComplete={handleComplete}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
