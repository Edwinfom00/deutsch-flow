"use client";

import { useTransition, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Zap, Clock, Brain, ArrowRight, Loader2,
  RotateCcw, Calendar, TrendingUp, RotateCw,
} from "lucide-react";
import { useSessionStore } from "../model/session.store";
import { LearnSession } from "./LearnSession";
import { GeneratingScreen } from "./GeneratingScreen";
import { startLearnSession, getActiveSession, abandonSession } from "../server/learn.actions";
import { getLearnHistory } from "../server/history.actions";
import { LEVEL_LABELS, SECTOR_LABELS, SECTOR_ICONS, SKILL_LABELS } from "@/types";
import type { CEFRLevel, Sector, Skill } from "@/types";

function LearnSkeleton() {
  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 w-16 bg-gray-200 rounded-sm" />
        <div className="h-3 w-48 bg-gray-100 rounded-sm" />
      </div>
      <div className="bg-gray-900 rounded-md overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="h-5 w-40 bg-white/10 rounded-md" />
          <div className="h-7 w-48 bg-white/10 rounded-sm" />
          <div className="h-3 w-32 bg-white/5 rounded-sm" />
        </div>
        <div className="grid grid-cols-3 border-t border-white/6">
          {[0,1,2].map(i => (
            <div key={i} className={`flex flex-col items-center gap-2 py-4 ${i < 2 ? "border-r border-white/6" : ""}`}>
              <div className="h-4 w-4 bg-white/10 rounded-sm" />
              <div className="h-5 w-8 bg-white/10 rounded-sm" />
              <div className="h-2 w-12 bg-white/5 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/6">
          <div className="h-11 bg-white/10 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0,1].map(i => (
          <div key={i} className="bg-white border border-gray-100 rounded-md p-4 space-y-3">
            <div className="h-8 w-8 bg-gray-100 rounded-md" />
            <div className="h-3.5 w-24 bg-gray-200 rounded-sm" />
            <div className="h-2.5 w-32 bg-gray-100 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props { level: string; sector: string; goalMinutes: number }

const exerciseCount = (m: number) => m <= 5 ? 3 : m <= 15 ? 5 : 8;

type HistorySession = {
  id: string; date: string; xpEarned: number;
  exercisesCompleted: number; timeSpentSeconds: number;
};
type SkillPerf = {
  skill: string; avgScore: number; totalAttempts: number; failedAttempts: number;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.round(seconds / 60)} min`;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
        <motion.div
          className={`h-full rounded-sm ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-8 text-right">{Math.round(score)}%</span>
    </div>
  );
}

export function LearnPage({ level, sector, goalMinutes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isHydrating, setIsHydrating] = useState(true);
  const [hasResumable, setHasResumable] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<{ sessions: HistorySession[]; skills: SkillPerf[] } | null>(null);
  const { status, exercises, setExercises, setError, reset } = useSessionStore();

  useEffect(() => {
    const check = async () => {
      try {
        const [active, hist] = await Promise.all([
          getActiveSession(),
          getLearnHistory(),
        ]);
        if (active && active.exercises.length > 0 && (status === "idle" || exercises.length === 0)) {
          setHasResumable(true);
        }
        setHistory(hist);
      } finally {
        setIsHydrating(false);
      }
    };
    check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResume = () => {
    startTransition(async () => {
      const active = await getActiveSession();
      if (active) setExercises(active.exercises as never, active.currentIndex, active.results as never);
      setHasResumable(false);
    });
  };

  const handleAbandon = () => {
    startTransition(async () => {
      await abandonSession();
      reset();
      setHasResumable(false);
    });
  };

  const handleStart = () => {
    setIsGenerating(true);
    startTransition(async () => {
      try {
        const result = await startLearnSession();
        setExercises(result.exercises as never, result.currentIndex, result.results as never);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur lors de la génération");
      } finally {
        setIsGenerating(false);
      }
    });
  };

  if (isHydrating) return <LearnSkeleton />;
  if (isGenerating) return <GeneratingScreen level={level} count={exerciseCount(goalMinutes)} />;
  if (status === "playing" || status === "completed") return <LearnSession />;

  const count = exerciseCount(goalMinutes);

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-[15px] font-semibold text-gray-900">Leçons</h1>
        <p className="text-xs text-gray-400 mt-0.5">Session générée par notre IA selon ton profil</p>
      </motion.div>

      {/* Bannière reprise */}
      {hasResumable && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm font-semibold text-amber-900">Session en cours</p>
            <p className="text-xs text-amber-600 mt-0.5">Tu as une session non terminée. Veux-tu la reprendre ?</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleAbandon} disabled={isPending} className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-amber-700 hover:bg-amber-100 rounded-md transition-colors">
              <RotateCcw className="h-3.5 w-3.5" /> Nouvelle
            </button>
            <button onClick={handleResume} disabled={isPending} className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors">
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              Reprendre
            </button>
          </div>
        </motion.div>
      )}

      {/* Session card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="bg-[#0a0a0f] rounded-md overflow-hidden">
        <div className="p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-md mb-4">
              <Brain className="h-3 w-3" /> Session IA personnalisée
            </span>
            <h2 className="text-2xl font-bold text-white font-heading leading-tight mb-1">Session du jour</h2>
            <p className="text-white/40 text-sm">{SECTOR_ICONS[sector as Sector]} {SECTOR_LABELS[sector as Sector]} · Niveau {level}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/6">
          {[
            { icon: BookOpen, label: "Exercices", value: count, color: "text-blue-400" },
            { icon: Clock, label: "Durée", value: `~${goalMinutes} min`, color: "text-violet-400" },
            { icon: Zap, label: "XP max", value: `+${count * 18}`, color: "text-amber-400" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`flex flex-col items-center gap-1.5 py-4 ${i < 2 ? "border-r border-white/6" : ""}`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
                <p className="text-lg font-bold text-white font-heading leading-none">{s.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/6">
          <button
            onClick={handleStart}
            disabled={isPending || isGenerating || hasResumable}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
          >
            {isPending || isGenerating
              ? <><Loader2 className="h-4 w-4 animate-spin" />Notre IA génère ta session...</>
              : <><ArrowRight className="h-4 w-4" />Commencer une nouvelle session</>
            }
          </button>
          {(isPending || isGenerating) && (
            <p className="text-center text-[11px] text-white/25 mt-2">
              Notre IA génère {count} exercices adaptés à ton niveau {level}…
            </p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { title: "Adapté à toi", desc: `Niveau ${level} — ${LEVEL_LABELS[level as CEFRLevel]}`, icon: Brain, color: "text-violet-500", bg: "bg-violet-50" },
          { title: "Méthode Goethe", desc: "Lesen, Schreiben, Hören, Sprechen", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} className="bg-white border border-gray-100 rounded-md p-4">
              <div className={`h-8 w-8 rounded-md ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{card.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {status === "error" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-600">
          Une erreur est survenue. Vérifie ta connexion et réessaie.
        </motion.div>
      )}

      {/* ── Historique des sessions ── */}
      {history && (history.sessions.length > 0 || history.skills.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historique</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Sessions passées */}
            {history.sessions.length > 0 && (
              <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-600">Sessions récentes</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {history.sessions.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-gray-800 capitalize">{formatDate(s.date)}</p>
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                            +{s.xpEarned} XP
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {s.exercisesCompleted} exercice{s.exercisesCompleted > 1 ? "s" : ""} · {formatTime(s.timeSpentSeconds)}
                        </p>
                      </div>
                      <button
                        onClick={handleStart}
                        disabled={isPending || isGenerating || hasResumable}
                        title="Refaire une session similaire"
                        className="h-7 w-7 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors disabled:opacity-40"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance par compétence */}
            {history.skills.length > 0 && (
              <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-600">Performance par compétence</p>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {history.skills
                    .sort((a, b) => a.avgScore - b.avgScore)
                    .map((s, i) => (
                      <motion.div
                        key={s.skill}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 font-medium">
                            {SKILL_LABELS[s.skill as Skill]}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {s.totalAttempts} essai{s.totalAttempts > 1 ? "s" : ""}
                          </span>
                        </div>
                        <ScoreBar score={s.avgScore} />
                      </motion.div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
