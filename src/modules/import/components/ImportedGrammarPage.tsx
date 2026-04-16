"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Volume2, Lightbulb, ArrowRight, X, CheckCircle2, ChevronRight, Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { ExerciseRenderer } from "@/modules/exercises/components/ExerciseRenderer";
import { submitImportedExerciseResult } from "../server/imported-content.actions";
import type { ExerciseContent } from "@/types";
import type { ExerciseResult } from "@/modules/exercises/components/ExerciseRenderer";
import type { getImportedExercisesByType } from "../server/imported-content.actions";
import { cn } from "@/lib/utils";
import { PublishButton } from "./PublishButton";

type Data = Awaited<ReturnType<typeof getImportedExercisesByType>>;
type ImportGroup = Data[number];

type Chapter = {
  title: string;
  rule: string;
  ruleDe: string;
  examples: Array<{ de: string; fr: string; highlight?: string }>;
  tip: string;
};

function speakDE(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE"; utt.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find((v) => v.lang.startsWith("de"));
  if (deVoice) utt.voice = deVoice;
  window.speechSynthesis.speak(utt);
}

export function ImportedGrammarPage({ data: initialData }: { data: Data }) {
  const [data, setData] = useState<Data>(initialData);
  const [selectedGroup, setSelectedGroup] = useState<ImportGroup | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<"list" | "chapter" | "exercises" | "done">("list");
  const [results, setResults] = useState<Array<{ score: number }>>([]);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  const chapters = (selectedGroup?.result?.chapters ?? []) as Chapter[];
  const currentChapter = chapters[chapterIndex];
  const chapterExercises = selectedGroup?.exercises.filter((_, i) => {
    const perChapter = Math.ceil((selectedGroup?.exercises.length ?? 0) / Math.max(chapters.length, 1));
    return i >= chapterIndex * perChapter && i < (chapterIndex + 1) * perChapter;
  }) ?? [];
  const currentExercise = chapterExercises[exerciseIndex];

  const handleStartGroup = (group: ImportGroup) => {
    setSelectedGroup(group);
    setChapterIndex(0);
    setExerciseIndex(0);
    setResults([]);
    setPhase("chapter");
  };

  const handleDelete = async (group: ImportGroup) => {
    const ok = await confirm({
      title: "Supprimer ce cours ?",
      description: `"${group.fileName}" et tous ses chapitres seront définitivement supprimés.`,
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

  const handleStartExercises = () => setPhase("exercises");

  const handleExerciseComplete = useCallback((result: ExerciseResult) => {
    if (!currentExercise) return;
    startTransition(async () => {
      await submitImportedExerciseResult({
        importedExerciseId: currentExercise.id,
        score: result.score,
        timeSpentSeconds: result.timeSpentSeconds,
      });
      setResults((prev) => [...prev, { score: result.score }]);
      setTimeout(() => {
        if (exerciseIndex + 1 >= chapterExercises.length) {
          // Chapitre suivant ou fin
          if (chapterIndex + 1 >= chapters.length) {
            setPhase("done");
          } else {
            setChapterIndex((i) => i + 1);
            setExerciseIndex(0);
            setPhase("chapter");
          }
        } else {
          setExerciseIndex((i) => i + 1);
        }
      }, 1000);
    });
  }, [currentExercise, exerciseIndex, chapterExercises.length, chapterIndex, chapters.length]);

  // ── Fin ───────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const avg = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-white border border-gray-200/70 rounded-md p-8 text-center space-y-3">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="h-14 w-14 rounded-md bg-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </motion.div>
            <p className="text-lg font-bold text-gray-900 font-heading">Cours terminé !</p>
            <p className="text-sm text-gray-400">{chapters.length} chapitre{chapters.length > 1 ? "s" : ""} · Score moyen {avg}%</p>
          </div>
          <button onClick={() => { setPhase("list"); setSelectedGroup(null); }}
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors">
            Retour aux cours
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Exercices du chapitre ─────────────────────────────────────────────────
  if (phase === "exercises" && currentExercise) {
    return (
      <div className="min-h-[calc(100vh-52px)] bg-white flex flex-col">
        <div className="flex items-center gap-4 px-5 h-12 border-b border-gray-100 sticky top-0 bg-white z-10">
          <button onClick={() => setPhase("chapter")} className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex-1 h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div className="h-full bg-emerald-500 rounded-sm" initial={false}
              animate={{ width: `${(exerciseIndex / chapterExercises.length) * 100}%` }}
              transition={{ duration: 0.4 }} />
          </div>
          <span className="text-xs text-gray-400 shrink-0">Exercice {exerciseIndex + 1}/{chapterExercises.length}</span>
        </div>
        <div className="flex-1 flex items-start justify-center px-5 py-8 overflow-y-auto bg-gray-50">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div key={currentExercise.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                <ExerciseRenderer
                  exercise={{ ...(currentExercise.content as object), level: currentExercise.level, skill: currentExercise.skill, xpReward: currentExercise.xpReward } as ExerciseContent}
                  onComplete={handleExerciseComplete}
                  hideHeader
                />
              </motion.div>
            </AnimatePresence>
            {isPending && <p className="mt-4 text-center text-xs text-gray-400">Sauvegarde…</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── Chapitre ──────────────────────────────────────────────────────────────
  if (phase === "chapter" && currentChapter) {
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        {/* Progress chapitres */}
        <div className="flex items-center gap-2">
          <button onClick={() => setPhase("list")} className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors mr-1">
            <X className="h-4 w-4" />
          </button>
          {chapters.map((_, i) => (
            <div key={i} className={cn("flex-1 h-1.5 rounded-sm transition-all",
              i < chapterIndex ? "bg-emerald-500" : i === chapterIndex ? "bg-gray-900" : "bg-gray-100")} />
          ))}
          <span className="text-xs text-gray-400 shrink-0">{chapterIndex + 1}/{chapters.length}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Titre */}
          <div>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Chapitre {chapterIndex + 1}</p>
            <h2 className="text-xl font-bold text-gray-900 font-heading">{currentChapter.title}</h2>
          </div>

          {/* Règle en allemand */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Regel</p>
              <button onClick={() => speakDE(currentChapter.ruleDe)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm text-gray-900 font-medium leading-relaxed">{currentChapter.ruleDe}</p>
            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{currentChapter.rule}</p>
          </div>

          {/* Exemples */}
          {currentChapter.examples?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Beispiele</p>
              {currentChapter.examples.map((ex, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-2 bg-white border border-gray-100 rounded-md px-3 py-2.5">
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-gray-900 font-medium">{ex.de}</p>
                      <button onClick={() => speakDE(ex.de)} className="text-gray-200 hover:text-gray-500 transition-colors shrink-0">
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 italic">{ex.fr}</p>
                  </div>
                  {ex.highlight && (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm shrink-0">
                      {ex.highlight}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Astuce */}
          {currentChapter.tip && (
            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-md p-3">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">{currentChapter.tip}</p>
            </div>
          )}

          {/* CTA exercices */}
          {chapterExercises.length > 0 && (
            <button onClick={handleStartExercises}
              className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
              Pratiquer ce chapitre ({chapterExercises.length} exercice{chapterExercises.length > 1 ? "s" : ""})
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {chapterExercises.length === 0 && chapterIndex + 1 < chapters.length && (
            <button onClick={() => { setChapterIndex((i) => i + 1); setExerciseIndex(0); }}
              className="w-full h-11 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2">
              Chapitre suivant <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Liste ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      <ConfirmDialog />
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Cours de grammaire</h1>
        <p className="text-xs text-gray-400 mt-0.5">Chapitres interactifs extraits de tes livres importés</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
          <BookOpen className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Aucun livre importé</p>
          <p className="text-xs text-gray-400">Importe un PDF de grammaire depuis la page <a href="/import" className="text-gray-600 underline">Upload</a>.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((group, gi) => {
            const chapters = (group.result?.chapters ?? []) as Chapter[];
            const done = group.exercises.filter((e) => e.completed).length;
            return (
              <motion.div key={group.importId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.06 }}
                className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{group.fileName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{chapters.length} chapitre{chapters.length > 1 ? "s" : ""} · {done}/{group.exercises.length} exercices</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <PublishButton importId={group.importId} isPublic={group.isPublic} level={group.level} />
                    <button onClick={() => handleStartGroup(group)}
                      className="cursor-pointer flex items-center gap-1.5 h-8 px-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors">
                      <ArrowRight className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{done > 0 ? "Continuer" : "Commencer"}</span>
                    </button>
                    <button onClick={() => handleDelete(group)} title="Supprimer"
                      className="cursor-pointer h-8 w-8 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {/* Chapitres preview */}
                <div className="space-y-1.5">
                  {chapters.slice(0, 3).map((ch, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="h-4 w-4 rounded-sm bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0">{i + 1}</div>
                      <span className="truncate">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
