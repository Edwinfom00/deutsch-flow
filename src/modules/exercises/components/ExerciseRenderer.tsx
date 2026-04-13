"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseContent } from "@/types";
import { SKILL_LABELS } from "@/types";

import { MultipleChoiceRenderer } from "./renderers/MultipleChoiceRenderer";
import { TrueFalseRenderer } from "./renderers/TrueFalseRenderer";
import { FillInBlankRenderer } from "./renderers/FillInBlankRenderer";
import { FlashcardRenderer } from "./renderers/FlashcardRenderer";
import { SentenceBuilderRenderer } from "./renderers/SentenceBuilderRenderer";
import { WritingRenderer } from "./renderers/WritingRenderer";
import { MatchingRenderer } from "./renderers/MatchingRenderer";
import { HoerenMCRenderer, HoerenRFRenderer } from "./renderers/HoerenRenderer";
import { GrammatikTransformationRenderer } from "./renderers/GrammatikTransformationRenderer";
import { SprechenRenderer } from "./renderers/SprechenRenderer";

export interface ExerciseResult {
  score: number;
  quality: number;
  timeSpentSeconds: number;
  feedback?: string;
}

interface ExerciseRendererProps {
  exercise: ExerciseContent;
  onComplete: (result: ExerciseResult) => void;
  onSkip?: () => void;
}

export function ExerciseRenderer({ exercise, onComplete, onSkip }: ExerciseRendererProps) {
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const handleAnswer = (score: number, quality: number, feedback?: string) => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    setResult({ score, quality, timeSpentSeconds, feedback });
  };

  const handleNext = () => { if (result) onComplete(result); };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {SKILL_LABELS[exercise.skill]}
        </span>
        <span className="text-[11px] text-gray-400">
          Niveau {exercise.level} · +{exercise.xpReward} XP
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <p className="text-gray-900 font-medium leading-relaxed text-sm">
          {exercise.instructions}
        </p>
        {exercise.instructionsDe && (
          <p className="mt-1.5 text-gray-400 text-xs italic">{exercise.instructionsDe}</p>
        )}
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.type}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {renderExercise(exercise, handleAnswer, !!result)}
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-md border p-4 space-y-3",
              result.score >= 70 ? "bg-emerald-50 border-emerald-200" :
              result.score >= 40 ? "bg-amber-50 border-amber-200" :
              "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-center gap-2.5">
              {result.score >= 70
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              }
              <p className={cn(
                "text-sm font-semibold",
                result.score >= 70 ? "text-emerald-700" :
                result.score >= 40 ? "text-amber-700" : "text-red-700"
              )}>
                {result.score === 100 ? "Parfait !" :
                 result.score >= 70 ? "Très bien !" :
                 result.score >= 40 ? "Presque !" : "Pas encore — continue !"}
              </p>
            </div>
            {result.feedback && (
              <p className="text-sm text-gray-600 leading-relaxed">{result.feedback}</p>
            )}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 h-8 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Suivant <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {onSkip && !result && (
                <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 h-8 px-3 rounded-md transition-colors">
                  Passer
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderExercise(
  exercise: ExerciseContent,
  onAnswer: (score: number, quality: number, feedback?: string) => void,
  answered: boolean
) {
  const type = exercise.type as string;

  if (type === "LESEN_MULTIPLE_CHOICE")
    return <MultipleChoiceRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "HOEREN_MULTIPLE_CHOICE")
    return <HoerenMCRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "LESEN_RICHTIG_FALSCH")
    return <TrueFalseRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "HOEREN_RICHTIG_FALSCH")
    return <HoerenRFRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "LESEN_LUECKENTEXT" || type === "VOCAB_LUECKENTEXT" || type === "GRAMMATIK_LUECKENTEXT")
    return <FillInBlankRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "VOCAB_FLASHCARD")
    return <FlashcardRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "GRAMMATIK_ORDNEN" || type === "LESEN_REIHENFOLGE")
    return <SentenceBuilderRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (type === "GRAMMATIK_TRANSFORMATION")
    return <GrammatikTransformationRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (["SCHREIBEN_EMAIL","SCHREIBEN_MEINUNG","SCHREIBEN_BESCHREIBUNG","SCHREIBEN_NOTIZ","SCHREIBEN_ZUSAMMENFASSUNG"].includes(type))
    return <WritingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (["LESEN_ZUORDNUNG","VOCAB_ZUORDNUNG","HOEREN_ZUORDNUNG","VOCAB_BILD"].includes(type))
    return <MatchingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (["SPRECHEN_DIALOG","SPRECHEN_ROLEPLAY","SPRECHEN_VORSTELLEN","SPRECHEN_DISKUSSION","SPRECHEN_BESCHREIBUNG"].includes(type))
    return <SprechenRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-5 text-center">
      <p className="text-xs text-gray-400 mb-3">Type : <span className="font-mono text-gray-600">{type}</span></p>
      <button onClick={() => onAnswer(80, 4)} className="h-8 px-4 bg-gray-900 text-white text-xs font-semibold rounded-md">
        Marquer comme fait
      </button>
    </div>
  );
}
