"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Zap, CheckCircle2, Clock, TrendingUp, ArrowRight, X } from "lucide-react";
import { ExerciseRenderer } from "./ExerciseRenderer";
import { submitReview } from "../server/review.actions";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import type { ExerciseResult } from "./ExerciseRenderer";
import type { getDueReviews } from "../server/review.actions";

type ReviewData = Awaited<ReturnType<typeof getDueReviews>>;
type ReviewItem = ReviewData["due"][number];

interface Props { initialData: ReviewData }

const intervalLabel = (days: number) => {
  if (days === 1) return "demain";
  if (days < 7) return `dans ${days} jours`;
  if (days < 30) return `dans ${Math.round(days / 7)} sem.`;
  return `dans ${Math.round(days / 30)} mois`;
};

type Phase = "idle" | "playing" | "done" | "empty";

export function ReviewPage({ initialData }: Props) {
  const [data] = useState(initialData);
  const [sessionItems] = useState<ReviewItem[]>(data.due);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ xpEarned: number; interval: number; score: number }>>([]);
  const [phase, setPhase] = useState<Phase>(
    data.due.length > 0 ? "idle" : "empty"
  );
  const [isPending, startTransition] = useTransition();

  const current = sessionItems[currentIndex];
  const progress = sessionItems.length > 0 ? currentIndex / sessionItems.length : 0;

  const handleComplete = useCallback((result: ExerciseResult) => {
    if (!current) return;
    startTransition(async () => {
      const res = await submitReview({
        srId: current.srId,
        exerciseId: current.exerciseId,
        score: result.score,
        quality: result.quality,
        timeSpentSeconds: result.timeSpentSeconds,
      });
      setResults((prev) => [...prev, { xpEarned: res.xpEarned, interval: res.interval, score: result.score }]);
      setTimeout(() => {
        if (currentIndex + 1 >= sessionItems.length) {
          setPhase("done");
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1000);
    });
  }, [current, currentIndex, sessionItems.length]);

  // ── Écran vide ────────────────────────────────────────────────────────────
  if ((phase as string) === "empty") {
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Révisions</h1>
          <p className="text-xs text-gray-400 mt-0.5">Spaced repetition · Algorithme SM-2</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3"
        >
          <div className="h-12 w-12 rounded-md bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="text-base font-semibold text-gray-900">Tout est à jour !</p>
          <p className="text-sm text-gray-400">
            Aucune révision due pour l&apos;instant.
            {data.stats.dueTomorrow > 0 && (
              <> <span className="text-gray-600 font-medium">{data.stats.dueTomorrow} exercice{data.stats.dueTomorrow > 1 ? "s" : ""}</span> à revoir demain.</>
            )}
          </p>
          <p className="text-xs text-gray-300">{data.stats.totalTracked} exercice{data.stats.totalTracked > 1 ? "s" : ""} suivis au total</p>
        </motion.div>
      </div>
    );
  }

  // ── Écran de résultats ────────────────────────────────────────────────────
  if (phase === "done") {
    const totalXp = results.reduce((s, r) => s + r.xpEarned, 0);
    const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Révisions</h1>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white border border-gray-200/70 rounded-md p-5 text-center space-y-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`h-12 w-12 rounded-md mx-auto flex items-center justify-center ${avgScore >= 70 ? "bg-emerald-500" : "bg-amber-400"}`}
            >
              <CheckCircle2 className="h-6 w-6 text-white" />
            </motion.div>
            <p className="text-lg font-bold text-gray-900 font-heading">Révisions terminées !</p>
            <p className="text-sm text-gray-400">{sessionItems.length} exercice{sessionItems.length > 1 ? "s" : ""} révisé{sessionItems.length > 1 ? "s" : ""}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Score moyen", value: `${avgScore}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "XP gagnés", value: `+${totalXp}`, icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
              { label: "Révisés", value: sessionItems.length, icon: RotateCcw, color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="bg-white border border-gray-200/70 rounded-md p-4 text-center">
                  <div className={`h-7 w-7 rounded-md ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                  <p className="text-xl font-bold text-gray-900 font-heading">{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Détail par exercice */}
          <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600">Détail</p>
            </div>
            <div className="divide-y divide-gray-50">
              {results.map((r, i) => {
                const item = sessionItems[i];
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700">{SKILL_LABELS[item.skill as Skill]}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Prochain rappel : {intervalLabel(r.interval)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-sm overflow-hidden">
                        <div className={`h-full rounded-sm ${r.score >= 70 ? "bg-emerald-500" : r.score >= 40 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{r.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Page d'accueil ────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Révisions</h1>
          <p className="text-xs text-gray-400 mt-0.5">Spaced repetition · Algorithme SM-2</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "À réviser", value: data.stats.dueToday, color: "text-red-500", bg: "bg-red-50", icon: Clock },
            { label: "Demain", value: data.stats.dueTomorrow, color: "text-amber-500", bg: "bg-amber-50", icon: RotateCcw },
            { label: "Suivis", value: data.stats.totalTracked, color: "text-blue-500", bg: "bg-blue-50", icon: TrendingUp },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white border border-gray-200/70 rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                  <div className={`h-6 w-6 rounded-md ${s.bg} flex items-center justify-center`}>
                    <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 font-heading">{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Liste des exercices dus */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600">Exercices à réviser aujourd&apos;hui</p>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
              {data.stats.dueToday} dus
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {sessionItems.slice(0, 5).map((item, i) => (
              <motion.div key={item.srId} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{SKILL_LABELS[item.skill as Skill]}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {item.repetitions} répétition{item.repetitions > 1 ? "s" : ""} · {item.type.replace(/_/g, " ").toLowerCase()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                  (item.lastQuality ?? 5) >= 4 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  (item.lastQuality ?? 5) >= 3 ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-red-50 text-red-600 border-red-200"
                }`}>
                  {(item.lastQuality ?? 5) >= 4 ? "Maîtrisé" : (item.lastQuality ?? 5) >= 3 ? "En cours" : "Difficile"}
                </span>
              </motion.div>
            ))}
            {sessionItems.length > 5 && (
              <div className="px-4 py-2.5 text-center">
                <p className="text-xs text-gray-400">+{sessionItems.length - 5} autres exercices</p>
              </div>
            )}
          </div>
        </motion.div>

        <button
          onClick={() => setPhase("playing")}
          className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
        >
          Commencer les révisions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Player ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => setPhase("idle")} className="text-gray-300 hover:text-gray-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
          <motion.div className="h-full bg-gray-900 rounded-sm" initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="font-mono tabular-nums">{currentIndex + 1}/{sessionItems.length}</span>
        </div>
      </div>

      {/* Exercise */}
      <div className="flex-1 flex items-start justify-center px-5 py-8 overflow-y-auto bg-gray-50">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div key={current?.srId}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
              {current && (
                <ExerciseRenderer
                  exercise={{
                    ...(current.content as object),
                    level: (current.content as { level?: string }).level ?? current.level,
                    skill: (current.content as { skill?: string }).skill ?? current.skill,
                    xpReward: current.xpReward,
                  } as never}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
          {isPending && (
            <div className="mt-4 text-center text-xs text-gray-400">Sauvegarde…</div>
          )}
        </div>
      </div>
    </div>
  );
}
