"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, CheckCircle2, Trophy, BookOpen, Headphones, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_A1_MOCKS } from "../../mocks/modellsatz-a1";
import { ALL_A2_MOCKS } from "../../mocks/modellsatz-a2";
import {
  OSD_A1_TYPE_LABELS,
  type OsdA1Exercise,
  type OsdA1ExerciseType,
} from "../../types/osd-a1.types";
import {
  OSD_A2_TYPE_LABELS,
  type OsdA2Exercise,
  type OsdA2ExerciseType,
} from "../../types/osd-a2.types";
import { OsdA1Dispatcher } from "./OsdA1Dispatcher";
import { OsdA2Dispatcher } from "./OsdA2Dispatcher";

type Level = "A1" | "A2";

const A1_GROUPS: Record<string, { label: string; icon: typeof BookOpen; color: string; types: OsdA1ExerciseType[] }> = {
  lesen: {
    label: "Lesen",
    icon: BookOpen,
    color: "text-blue-600",
    types: ["OSD_A1_SITUATION_ANZEIGE", "OSD_A1_JA_NEIN_PER_ANZEIGE", "OSD_A1_TEXT_BILD"],
  },
  hoeren: {
    label: "Hören",
    icon: Headphones,
    color: "text-amber-600",
    types: ["OSD_A1_HOEREN_AUDIO_FOTO", "OSD_A1_HOEREN_NOTIZEN", "OSD_A1_HOEREN_INTERVIEW_SINGLE"],
  },
  schreiben: {
    label: "Schreiben",
    icon: PenLine,
    color: "text-violet-600",
    types: ["OSD_A1_FORMULAR", "OSD_A1_EMAIL_ANTWORT"],
  },
};

const A2_GROUPS: Record<string, { label: string; icon: typeof BookOpen; color: string; types: OsdA2ExerciseType[] }> = {
  lesen: {
    label: "Lesen",
    icon: BookOpen,
    color: "text-blue-600",
    types: ["OSD_A2_HEADLINE_TEXT_MATCHING", "OSD_A2_LONG_TEXT_MC"],
  },
  hoeren: {
    label: "Hören",
    icon: Headphones,
    color: "text-amber-600",
    types: ["OSD_A2_WETTER_MULTI_SELECT", "OSD_A2_HOEREN_NOTIZEN", "OSD_A2_HOEREN_INTERVIEW_MULTI"],
  },
  schreiben: {
    label: "Schreiben",
    icon: PenLine,
    color: "text-violet-600",
    types: ["OSD_A2_EMAIL_ANTWORT"],
  },
};

export function PlaygroundClient() {
  const [level, setLevel] = useState<Level>("A1");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<{ score: number; quality: number } | null>(null);
  const [iteration, setIteration] = useState(0);

  const exercise: OsdA1Exercise | OsdA2Exercise | undefined =
    level === "A1"
      ? ALL_A1_MOCKS.find((m) => m.type === selectedType)
      : ALL_A2_MOCKS.find((m) => m.type === selectedType);

  const reset = () => {
    setAnswered(false);
    setResult(null);
    setIteration((n) => n + 1);
  };

  const handleAnswer = (score: number, quality: number) => {
    setResult({ score, quality });
    setAnswered(true);
  };

  const switchLevel = (lvl: Level) => {
    setLevel(lvl);
    setSelectedType(null);
    setAnswered(false);
    setResult(null);
  };

  const currentGroups = level === "A1" ? A1_GROUPS : A2_GROUPS;
  const currentLabel = (t: string) =>
    level === "A1"
      ? OSD_A1_TYPE_LABELS[t as OsdA1ExerciseType]
      : OSD_A2_TYPE_LABELS[t as OsdA2ExerciseType];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Dev · ÖSD Playground
            </p>
            <h1 className="text-lg font-bold text-gray-900 mt-0.5">
              Composants ÖSD — Banc d&apos;essai
            </h1>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            {(["A1", "A2"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => switchLevel(lvl)}
                className={cn(
                  "h-8 px-4 rounded-md text-xs font-bold transition-colors",
                  level === lvl ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
                )}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4 lg:sticky lg:top-6 self-start">
          {Object.entries(currentGroups).map(([key, group]) => {
            const Icon = group.icon;
            return (
              <div key={key} className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
                  <Icon className={cn("h-3.5 w-3.5", group.color)} />
                  <p className="text-xs font-bold text-gray-700">{group.label}</p>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {(group.types as readonly string[]).map((t) => {
                    const isSelected = selectedType === t;
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedType(t);
                          setAnswered(false);
                          setResult(null);
                          setIteration((n) => n + 1);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors",
                          isSelected ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100",
                        )}
                      >
                        {currentLabel(t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        <main className="space-y-4">
          {!exercise && (
            <div className="bg-white border border-gray-200 rounded-md p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-gray-700">Choisis un exercice à gauche</p>
              <p className="text-xs text-gray-400">
                Niveau {level} ·{" "}
                {level === "A1" ? ALL_A1_MOCKS.length : ALL_A2_MOCKS.length} types disponibles
              </p>
            </div>
          )}

          {exercise && (
            <>
              <div className="bg-white border border-gray-200 rounded-md px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Niveau {level} · Type : {exercise.type}
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">
                    {currentLabel(exercise.type)}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="h-8 px-3 text-xs font-semibold text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
                </button>
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={cn(
                      "rounded-md border p-4 flex items-center gap-3",
                      result.score >= 70 ? "bg-emerald-50 border-emerald-200" :
                      result.score >= 40 ? "bg-amber-50 border-amber-200" :
                      "bg-red-50 border-red-200",
                    )}
                  >
                    <Trophy className={cn(
                      "h-5 w-5",
                      result.score >= 70 ? "text-emerald-600" :
                      result.score >= 40 ? "text-amber-600" : "text-red-500",
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-bold",
                        result.score >= 70 ? "text-emerald-800" :
                        result.score >= 40 ? "text-amber-800" : "text-red-800",
                      )}>
                        Score : {result.score}/100 · Qualité {result.quality}/5
                      </p>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {result.score === 100 ? "Parfait !" :
                         result.score >= 70 ? "Très bien !" :
                         result.score >= 40 ? "Presque !" : "À retravailler"}
                      </p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white border border-gray-200 rounded-md p-5">
                {level === "A1" ? (
                  <OsdA1Dispatcher
                    key={`a1-${exercise.type}-${iteration}`}
                    exercise={exercise as OsdA1Exercise}
                    onAnswer={handleAnswer}
                    answered={answered}
                  />
                ) : (
                  <OsdA2Dispatcher
                    key={`a2-${exercise.type}-${iteration}`}
                    exercise={exercise as OsdA2Exercise}
                    onAnswer={handleAnswer}
                    answered={answered}
                  />
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
