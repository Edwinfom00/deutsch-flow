"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck, ArrowRight, X, Zap, CheckCircle2, RotateCcw, ChevronDown } from "lucide-react";
import { ExerciseRenderer } from "@/modules/exercises/components/ExerciseRenderer";
import { submitImportedExerciseResult } from "../server/imported-content.actions";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import type { ExerciseContent } from "@/types";
import type { ExerciseResult } from "@/modules/exercises/components/ExerciseRenderer";
import type { getImportedExercisesByType } from "../server/imported-content.actions";
import { cn } from "@/lib/utils";
import { PublishButton } from "./PublishButton";

type Data = Awaited<ReturnType<typeof getImportedExercisesByType>>;
type ImportGroup = Data[number];
type Ex = ImportGroup["exercises"][number];

// Sanitise les objets {DE, FR} en strings
function sanitizeContent(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeContent);
  if (typeof obj === "object") {
    const o = obj as Record<string, unknown>;
    if (("DE" in o || "de" in o) && ("FR" in o || "fr" in o))
      return (o.DE ?? o.de ?? o.FR ?? o.fr ?? "") as string;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) result[k] = sanitizeContent(v);
    return result;
  }
  return String(obj);
}

export function ImportedExercisesPage({ data }: { data: Data }) {
  const [selectedGroup, setSelectedGroup] = useState<ImportGroup | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"list" | "playing" | "done">("list");
  const [results, setResults] = useState<Array<{ id: string; score: number; xp: number }>>([]);
  const [isPending, startTransition] = useTransition();

  const current = selectedGroup?.exercises[currentIndex];

  const handleStart = (group: ImportGroup) => {
    setSelectedGroup(group);
    // Reprendre au premier exercice non complété
    const firstIncomplete = group.exercises.findIndex((e) => !e.completed);
    setCurrentIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
    setResults([]);
    setPhase("playing");
  };

  const [isNavigating, setIsNavigating] = useState(false);

  const handleComplete = useCallback(async (result: ExerciseResult) => {
    if (!current || isNavigating) return;
    setIsNavigating(true);

    try {
      const { xpEarned } = await submitImportedExerciseResult({
        importedExerciseId: current.id,
        score: result.score,
        timeSpentSeconds: result.timeSpentSeconds,
      });
      setResults((prev) => [...prev, { id: current.id, score: result.score, xp: xpEarned }]);
    } catch {
      setResults((prev) => [...prev, { id: current.id, score: result.score, xp: 0 }]);
    }

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

  // ── Écran résultats ───────────────────────────────────────────────────────
  if (phase === "done") {
    const totalXp = results.reduce((s, r) => s + r.xp, 0);
    const avgScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <div className="bg-white border border-gray-200/70 rounded-md p-6 text-center space-y-3">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`h-14 w-14 rounded-md mx-auto flex items-center justify-center ${avgScore >= 70 ? "bg-emerald-500" : "bg-amber-400"}`}>
              <CheckCircle2 className="h-7 w-7 text-white" />
            </motion.div>
            <p className="text-lg font-bold text-gray-900 font-heading">Session terminée !</p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Score moyen", value: `${avgScore}%` },
                { label: "XP gagnés", value: `+${totalXp}` },
                { label: "Exercices", value: results.length },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-md p-3">
                  <p className="text-xl font-bold text-gray-900 font-heading">{s.value}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setPhase("list"); setSelectedGroup(null); }}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors">
            Retour aux exercices
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Player ────────────────────────────────────────────────────────────────
  if (phase === "playing" && current) {
    const progress = selectedGroup ? currentIndex / selectedGroup.exercises.length : 0;
    const isGenerated = current.isGenerated;
    return (
      <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">
        <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={() => setPhase("list")} className="text-gray-300 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div className="h-full bg-gray-900 rounded-sm" initial={false}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }} />
          </div>
          {isGenerated && (
            <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm shrink-0">
              Généré
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-mono tabular-nums">{currentIndex + 1}/{selectedGroup?.exercises.length}</span>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center px-5 py-8 overflow-y-auto bg-gray-50">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={current.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                <ExerciseRenderer
                  exercise={sanitizeContent({ ...(current.content as object), level: current.level, skill: current.skill, xpReward: current.xpReward }) as ExerciseContent}
                  onComplete={handleComplete}
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
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Exercices importés</h1>
        <p className="text-xs text-gray-400 mt-0.5">Exercices extraits de tes PDF + exercices générés dans le même style</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
          <FileCheck className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Aucun exercice importé</p>
          <p className="text-xs text-gray-400">Importe un PDF d&apos;exercices depuis la page <a href="/import" className="text-gray-600 underline">Upload</a>.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((group, gi) => (
            <ImportGroupCard key={group.importId} group={group} index={gi} onStart={handleStart} />
          ))}
        </div>
      )}
    </div>
  );
}

function ImportGroupCard({ group, index, onStart }: { group: ImportGroup; index: number; onStart: (g: ImportGroup) => void; }) {
  const [expanded, setExpanded] = useState(index === 0);
  const done = group.exercises.filter((e) => e.completed).length;
  const total = group.exercises.length;
  const original = group.exercises.filter((e) => !e.isGenerated).length;
  const generated = group.exercises.filter((e) => e.isGenerated).length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="h-8 w-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <FileCheck className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{group.fileName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-gray-400">{original} extraits · {generated} générés</p>
            <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden max-w-20">
              <div className="h-full bg-emerald-500 rounded-sm" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
            </div>
            <span className="text-[10px] text-gray-400">{done}/{total}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <PublishButton importId={group.importId} isPublic={group.isPublic} level={group.level} />
          <button onClick={() => onStart(group)}
            className="flex items-center gap-1.5 h-8 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors">
            {done === total && total > 0 ? <><RotateCcw className="h-3.5 w-3.5" />Refaire</> : <><ArrowRight className="h-3.5 w-3.5" />Commencer</>}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-300 hover:text-gray-600 transition-colors">
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {group.exercises.map((ex) => (
            <div key={ex.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className={cn("h-5 w-5 rounded-sm flex items-center justify-center shrink-0",
                ex.completed ? "bg-emerald-100" : "bg-gray-100")}>
                {ex.completed
                  ? <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  : <div className="h-2 w-2 rounded-sm bg-gray-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">{SKILL_LABELS[ex.skill as Skill]}</span>
                <span className="text-[10px] text-gray-300 ml-2">{ex.type.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              {ex.isGenerated && (
                <span className="text-[9px] font-bold text-violet-500 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm">Généré</span>
              )}
              {ex.score !== null && (
                <span className="text-[10px] font-semibold text-gray-600">{Math.round(ex.score)}%</span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
