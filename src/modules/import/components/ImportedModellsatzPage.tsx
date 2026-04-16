"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, X, Zap, CheckCircle2, Clock, ArrowRight,
  RotateCcw, Plus, Brain, Lightbulb, BookOpen, Target, Trash2,
} from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { ExerciseRenderer } from "@/modules/exercises/components/ExerciseRenderer";
import { submitImportedExerciseResult, getImportedExercisesByType } from "../server/imported-content.actions";
import { generateMoreModellsatz } from "../server/generate-modellsatz.actions";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import type { ExerciseContent } from "@/types";
import type { ExerciseResult } from "@/modules/exercises/components/ExerciseRenderer";
import type { getImportedExercisesByType as GetType } from "../server/imported-content.actions";
import { CountdownTimer } from "./CountdownTimer";
import { cn } from "@/lib/utils";
import { PublishButton } from "./PublishButton";

type Data = Awaited<ReturnType<typeof GetType>>;
type ImportGroup = Data[number];

const SKILL_COLORS: Record<string, string> = {
  LESEN:     "bg-blue-50 text-blue-700 border-blue-200",
  SCHREIBEN: "bg-violet-50 text-violet-700 border-violet-200",
  HOEREN:    "bg-amber-50 text-amber-700 border-amber-200",
  SPRECHEN:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  WORTSCHATZ:"bg-pink-50 text-pink-700 border-pink-200",
  GRAMMATIK: "bg-orange-50 text-orange-700 border-orange-200",
};

const GENERATION_TIPS = [
  { icon: Brain,     text: "L'IA analyse la structure de ton Modellsatz pour reproduire le même format ÖSD." },
  { icon: Target,    text: "Les nouveaux examens respectent le même niveau CEFR et les mêmes types d'exercices." },
  { icon: BookOpen,  text: "Chaque Modellsatz généré a des textes et questions entièrement nouveaux." },
  { icon: Lightbulb, text: "Passer plusieurs Modellsatz du même niveau améliore significativement tes résultats." },
  { icon: Zap,       text: "Les exercices sont calibrés sur la structure exacte de l'examen importé." },
];

const GENERATION_STEPS = [
  "Analyse du Modellsatz source…",
  "Extraction de la structure ÖSD…",
  "Génération des textes de lecture…",
  "Création des questions…",
  "Calibrage du niveau…",
  "Finalisation des 2 Modellsatz…",
];

function GeneratingModellsatz() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const targets = [12, 28, 48, 65, 82, 95];
    let i = 0;
    const tick = () => { if (i >= targets.length) return; setProgress(targets[i]); setStepIndex(i); i++; };
    tick();
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((p) => (p + 1) % GENERATION_TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const tip = GENERATION_TIPS[tipIndex];
  const TipIcon = tip.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a0a0f] rounded-md p-6 space-y-5">
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-md bg-primary-500/15 border border-primary-500/30 flex items-center justify-center shrink-0">
          <GraduationCap className="h-5 w-5 text-violet-400" />
        </motion.div>
        <div>
          <p className="text-sm font-semibold text-white">Génération de 2 Modellsatz</p>
          <p className="text-xs text-white/40 mt-0.5">Notre IA s&apos;inspire de ton examen pour créer de nouveaux examens</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 bg-white/8 rounded-sm overflow-hidden">
          <motion.div className="h-full bg-violet-500 rounded-sm"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }} />
        </div>
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.p key={stepIndex} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.25 }}
              className="text-xs text-white/30">{GENERATION_STEPS[stepIndex]}</motion.p>
          </AnimatePresence>
          <span className="text-xs text-white/20 font-mono">{progress}%</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {GENERATION_STEPS.map((_, i) => (
          <div key={i} className={cn("flex-1 h-0.5 rounded-sm transition-all duration-500",
            i <= stepIndex ? "bg-violet-500" : "bg-white/10")} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tipIndex} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}
          className="bg-white/4 border border-white/8 rounded-md p-4 flex items-start gap-3">
          <div className="h-7 w-7 rounded-md bg-white/8 flex items-center justify-center shrink-0">
            <TipIcon className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{tip.text}</p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// Sanitise le contenu — convertit les objets {DE, FR} et autres objets non-rendables en strings
function sanitizeContent(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeContent);
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    // Objet bilingue {DE, FR} ou {de, fr} → prendre DE/de en priorité
    if (("DE" in o || "de" in o) && ("FR" in o || "fr" in o)) {
      return (o.DE ?? o.de ?? o.FR ?? o.fr ?? "") as string;
    }
    // Objet avec seulement DE ou FR
    if ("DE" in o && Object.keys(o).length === 1) return o.DE as string;
    if ("FR" in o && Object.keys(o).length === 1) return o.FR as string;
    // Récurser sur les autres objets
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      result[k] = sanitizeContent(v);
    }
    return result;
  }
  return String(obj);
}

function useTimer() {
  const startRef = useRef(Date.now());
  const getElapsed = () => Math.round((Date.now() - startRef.current) / 1000);
  const reset = () => { startRef.current = Date.now(); };
  return { getElapsed, reset };
}

export function ImportedModellsatzPage({ data: initialData }: { data: Data }) {
  const [data, setData] = useState(initialData);
  const [selectedGroup, setSelectedGroup] = useState<ImportGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"list" | "playing" | "done">("list");
  const [results, setResults] = useState<Array<{ id: string; score: number; skill: string; time: number }>>([]);
  const [isPending, startTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const timer = useTimer();
  const { confirm, ConfirmDialog } = useConfirm();

  const current = selectedGroup?.exercises[currentIndex];

  const handleGenerate = (importId: string) => {
    setIsGenerating(true);
    startTransition(async () => {
      try {
        // Déclenche Inngest et retourne immédiatement
        await generateMoreModellsatz(importId);
        // Polling toutes les 3s jusqu'à ce que le job soit terminé
        const poll = async () => {
          const fresh = await getImportedExercisesByType("modellsatz");
          setData(fresh);
          // Vérifier si un nouvel import est encore en processing
          const { getImports } = await import("../server/import.actions");
          const allImports = await getImports();
          const stillProcessing = allImports.some(
            (i) => i.docType === "modellsatz" && (i.status === "pending" || i.status === "processing")
          );
          if (stillProcessing) {
            setTimeout(poll, 3000);
          } else {
            setIsGenerating(false);
          }
        };
        setTimeout(poll, 3000);
      } catch {
        setIsGenerating(false);
      }
    });
  };

  const handleStart = (group: ImportGroup) => {
    setSelectedGroup(group);
    const firstIncomplete = group.exercises.findIndex((e) => !e.completed);
    const startIndex = firstIncomplete === -1 ? 0 : firstIncomplete;
    setCurrentIndex(startIndex);
    setResults([]);
    timer.reset();
    setPhase("playing");
  };

  const handleDelete = async (group: ImportGroup) => {
    const ok = await confirm({
      title: "Supprimer ce Modellsatz ?",
      description: `"${group.fileName}" et tous ses exercices seront définitivement supprimés.`,
      confirmLabel: "Supprimer",
      variant: "destructive",
    });
    if (!ok) return;
    startTransition(async () => {
      const { deleteImport } = await import("../server/import.actions");
      await deleteImport(group.importId);
      setData((prev) => prev.filter((g) => g.importId !== group.importId));
    });
  };

  const handleComplete = useCallback(async (result: ExerciseResult) => {
    if (!current || isNavigating) return;
    setIsNavigating(true);
    const elapsed = timer.getElapsed();
    timer.reset();

    try {
      await submitImportedExerciseResult({
        importedExerciseId: current.id,
        score: result.score,
        timeSpentSeconds: elapsed,
      });
    } catch {
      // silencieux — on avance quand même
    }

    setResults((prev) => [...prev, { id: current.id, score: result.score, skill: current.skill, time: elapsed }]);

    setTimeout(() => {
      setIsNavigating(false);
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= (selectedGroup?.exercises.length ?? 0)) {
          setPhase("done");
          return i;
        }
        return next;
      });
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, isNavigating, selectedGroup?.exercises.length]);

  // ── Résultats ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    const bySkill: Record<string, number[]> = {};
    for (const r of results) {
      if (!bySkill[r.skill]) bySkill[r.skill] = [];
      bySkill[r.skill].push(r.score);
    }
    const totalTime = results.reduce((s, r) => s + r.time, 0);
    const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);

    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-[#0a0a0f] rounded-md p-6 text-center space-y-3">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`h-14 w-14 rounded-md mx-auto flex items-center justify-center ${avgScore >= 70 ? "bg-emerald-500" : "bg-amber-400"}`}>
              <span className="text-white text-2xl font-black">{avgScore >= 80 ? "A" : avgScore >= 60 ? "B" : "C"}</span>
            </motion.div>
            <p className="text-lg font-bold text-white font-heading">Modellsatz terminé</p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-amber-400" />{avgScore}% moyen</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-blue-400" />{Math.round(totalTime / 60)} min</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-600">Résultats par compétence</p>
            </div>
            <div className="divide-y divide-gray-50">
              {Object.entries(bySkill).map(([skill, scores]) => {
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                return (
                  <div key={skill} className="flex items-center gap-3 px-4 py-3">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-sm border", SKILL_COLORS[skill] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
                      {SKILL_LABELS[skill as Skill] ?? skill}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                      <div className={`h-full rounded-sm ${avg >= 70 ? "bg-emerald-500" : avg >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                        style={{ width: `${avg}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{avg}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={() => { setPhase("list"); setSelectedGroup(null); }}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors">
            Retour aux Modellsatz
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Player ────────────────────────────────────────────────────────────────
  if (phase === "playing" && current) {
    const progress = selectedGroup ? currentIndex / selectedGroup.exercises.length : 0;
    // Récupérer le timeLimit depuis le contenu de l'exercice
    const timeLimit = (current.content as { timeLimit?: number }).timeLimit ?? null;

    const handleTimerExpire = () => {
      // Sauvegarder avec score 0 et passer au suivant
      startTransition(async () => {
        await submitImportedExerciseResult({
          importedExerciseId: current.id,
          score: 0,
          timeSpentSeconds: timeLimit ?? 0,
        });
        setResults((prev) => [...prev, { id: current.id, score: 0, skill: current.skill, time: timeLimit ?? 0 }]);
        if (currentIndex + 1 >= (selectedGroup?.exercises.length ?? 0)) {
          setPhase("done");
        } else {
          setCurrentIndex((i) => i + 1);
        }
      });
    };
    return (
      <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">
        <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={() => setPhase("list")} className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div className="h-full bg-gray-900 rounded-sm" initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} />
          </div>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-sm border shrink-0", SKILL_COLORS[current.skill] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
            {SKILL_LABELS[current.skill as Skill]}
          </span>
          <span className="text-xs text-gray-400 font-mono tabular-nums shrink-0">
            {currentIndex + 1}/{selectedGroup?.exercises.length}
          </span>
          {/* Timer décompte si timeLimit défini */}
          {timeLimit && (
            <CountdownTimer
              key={`${current.id}-timer`}
              seconds={timeLimit}
              onExpire={handleTimerExpire}
            />
          )}
          <button
            onClick={() => { setCurrentIndex(0); setResults([]); timer.reset(); }}
            title="Recommencer depuis le début"
            className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 flex items-start justify-center px-5 py-8 overflow-y-auto bg-gray-50">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                <ExerciseRenderer
                  exercise={sanitizeContent({ ...(current.content as object), level: current.level, skill: current.skill, xpReward: current.xpReward }) as ExerciseContent}
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

  // ── Liste ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <ConfirmDialog />
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Modellsatz</h1>
        <p className="text-xs text-gray-400 mt-0.5">Examens modèles Goethe/ÖSD — passe-les comme de vrais examens</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
          <GraduationCap className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Aucun Modellsatz importé</p>
          <p className="text-xs text-gray-400">Importe un examen modèle depuis la page <a href="/import" className="text-gray-600 underline">Upload</a>.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {isGenerating && <GeneratingModellsatz />}
          </AnimatePresence>

          {data.map((group, gi) => {
            const done = group.exercises.filter((e) => e.completed).length;
            const bySkill: Record<string, number> = {};
            for (const ex of group.exercises) {
              bySkill[ex.skill] = (bySkill[ex.skill] ?? 0) + 1;
            }
            // Un import est "source" si au moins la moitié de ses exercices ne sont pas générés
            const isSource = group.exercises.filter((e) => !e.isGenerated).length >= group.exercises.length / 2;

            return (
              <motion.div key={group.importId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-9 w-9 rounded-md flex items-center justify-center shrink-0",
                        isSource ? "bg-violet-50 border border-violet-200" : "bg-gray-50 border border-gray-200")}>
                        <GraduationCap className={cn("h-4 w-4", isSource ? "text-violet-600" : "text-gray-400")} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-48">{group.fileName}</p>
                          {!isSource && (
                            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm shrink-0">
                              Généré
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{group.exercises.length} exercices · {done} complétés</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <PublishButton importId={group.importId} isPublic={group.isPublic} level={group.level} />
                      <button
                        onClick={() => handleGenerate(group.importId)}
                        disabled={isGenerating || isPending}
                        title="Générer 2 nouveaux Modellsatz inspirés de celui-ci"
                        className="cursor-pointer flex items-center gap-1.5 h-8 px-2.5 border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Générer ×2</span>
                      </button>
                      <button onClick={() => handleStart(group)}
                        className="cursor-pointer flex items-center gap-1.5 h-8 px-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {done > 0 && done < group.exercises.length ? "Reprendre" : done === group.exercises.length ? "Refaire" : "Commencer"}
                        </span>
                      </button>
                      <button onClick={() => handleDelete(group)} title="Supprimer"
                        className="cursor-pointer h-8 w-8 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(bySkill).map(([skill, count]) => (
                      <span key={skill} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-sm border", SKILL_COLORS[skill] ?? "bg-gray-100 text-gray-600 border-gray-200")}>
                        {SKILL_LABELS[skill as Skill]} ({count})
                      </span>
                    ))}
                  </div>

                  <div className="h-1 bg-gray-100 rounded-sm overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-sm transition-all"
                      style={{ width: `${group.exercises.length > 0 ? (done / group.exercises.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
