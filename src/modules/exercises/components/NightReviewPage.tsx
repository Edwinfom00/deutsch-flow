"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, X, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Flame } from "lucide-react";
import { ExerciseRenderer } from "./ExerciseRenderer";
import type { ExerciseResult } from "./ExerciseRenderer";
import type { getNightReviewItems } from "../server/night-review.actions";
import type { ExerciseContent } from "@/types";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import { cn } from "@/lib/utils";

type Item = Awaited<ReturnType<typeof getNightReviewItems>>[number];

function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const o = obj as Record<string, unknown>;
  if (("DE" in o || "de" in o) && ("FR" in o || "fr" in o))
    return (o.DE ?? o.de ?? o.FR ?? o.fr ?? "") as string;
  const r: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) r[k] = sanitize(v);
  return r;
}

const SCORE_COLORS = [
  { max: 40, bg: "bg-red-50", border: "border-red-200", text: "text-red-600", bar: "bg-red-400" },
  { max: 60, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", bar: "bg-amber-400" },
  { max: 100, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", bar: "bg-emerald-500" },
];

function scoreStyle(score: number) {
  return SCORE_COLORS.find((c) => score <= c.max) ?? SCORE_COLORS[2];
}

interface Props {
  items: Item[];
}

export function NightReviewPage({ items }: Props) {
  const [phase, setPhase] = useState<"list" | "playing" | "done">("list");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{ id: string; score: number }>>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const current = items[currentIndex];

  const handleComplete = useCallback((result: ExerciseResult) => {
    if (!current || isNavigating) return;
    setIsNavigating(true);
    setResults((prev) => [...prev, { id: current.id, score: result.score }]);
    setTimeout(() => {
      setIsNavigating(false);
      setCurrentIndex((i) => {
        if (i + 1 >= items.length) { setPhase("done"); return i; }
        return i + 1;
      });
    }, 900);
  }, [current, isNavigating, items.length]);

  if (items.length === 0) {
    return (
      <div className="p-5 max-w-5xl mx-auto">
        <div className="bg-white border border-gray-200/70 rounded-md p-12 text-center space-y-4">
          <div className="h-12 w-12 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Aucun exercice raté cette semaine</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Les exercices avec un score inférieur à 60% apparaîtront ici pour une révision rapide.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    const improved = results.filter((r) => r.score >= 60).length;
    const ss = scoreStyle(avg);
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-[#0a0a0f] rounded-md p-6 text-center space-y-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn("h-14 w-14 rounded-md mx-auto flex items-center justify-center", ss.bg)}
            >
              <Flame className={cn("h-7 w-7", ss.text)} />
            </motion.div>
            <p className="text-lg font-bold text-white font-heading">Nuit blanche terminée</p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { label: "Score moyen", value: `${avg}%` },
                { label: "Améliorés", value: `${improved}/${results.length}` },
                { label: "Exercices", value: results.length },
              ].map((s) => (
                <div key={s.label} className="bg-white/6 rounded-md p-3">
                  <p className="text-lg font-bold text-white font-heading">{s.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { setPhase("list"); setCurrentIndex(0); setResults([]); }}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors"
          >
            Retour à la liste
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === "playing" && current) {
    const progress = currentIndex / items.length;
    return (
      <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">
        <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={() => setPhase("list")} className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-sm"
              initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-sm border shrink-0",
            "bg-gray-50 text-gray-500 border-gray-200"
          )}>
            {SKILL_LABELS[current.skill as Skill] ?? current.skill}
          </span>
          <span className="text-xs text-gray-400 font-mono tabular-nums shrink-0">
            {currentIndex + 1}/{items.length}
          </span>
        </div>
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
                  exercise={sanitize({ ...(current.content as object), level: current.level, skill: current.skill, xpReward: current.xpReward }) as ExerciseContent}
                  onComplete={handleComplete}
                  hideHeader
                />
              </motion.div>
            </AnimatePresence>
            {isNavigating && <p className="mt-4 text-center text-xs text-gray-400">Sauvegarde…</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-violet-500" />
            <h1 className="text-[15px] font-semibold text-gray-900">Mode nuit blanche</h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {items.length} exercice{items.length > 1 ? "s" : ""} raté{items.length > 1 ? "s" : ""} cette semaine · score &lt; 60%
          </p>
        </div>
        <button
          onClick={() => { setCurrentIndex(0); setResults([]); setPhase("playing"); }}
          className="cursor-pointer flex items-center gap-1.5 h-9 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors shrink-0"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Tout réviser
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const ss = scoreStyle(item.score);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-gray-200/70 rounded-md px-4 py-3 flex items-center gap-3"
            >
              <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0 border", ss.bg, ss.border)}>
                {item.score >= 60
                  ? <CheckCircle2 className={cn("h-4 w-4", ss.text)} />
                  : <XCircle className={cn("h-4 w-4", ss.text)} />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">
                  {SKILL_LABELS[item.skill as Skill] ?? item.skill}
                  <span className="text-gray-300 font-normal ml-2">{item.type.replace(/_/g, " ").toLowerCase()}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden max-w-24">
                    <div className={cn("h-full rounded-sm", ss.bar)} style={{ width: `${item.score}%` }} />
                  </div>
                  <span className={cn("text-[10px] font-bold", ss.text)}>{item.score}%</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-gray-300 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-sm shrink-0">
                {item.level}
              </span>
            </motion.div>
          );
        })}
      </div>

      {results.length > 0 && (
        <button
          onClick={() => { setCurrentIndex(0); setResults([]); setPhase("playing"); }}
          className="cursor-pointer w-full h-9 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Recommencer
        </button>
      )}
    </div>
  );
}
