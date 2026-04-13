"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExerciseContent } from "@/types";
import { SKILL_COLORS, SKILL_LABELS } from "@/types";

// Renderers spécifiques
import { MultipleChoiceRenderer } from "./renderers/MultipleChoiceRenderer";
import { TrueFalseRenderer } from "./renderers/TrueFalseRenderer";
import { FillInBlankRenderer } from "./renderers/FillInBlankRenderer";
import { FlashcardRenderer } from "./renderers/FlashcardRenderer";
import { SentenceBuilderRenderer } from "./renderers/SentenceBuilderRenderer";
import { WritingRenderer } from "./renderers/WritingRenderer";
import { MatchingRenderer } from "./renderers/MatchingRenderer";

export interface ExerciseResult {
  score: number; // 0-100
  quality: number; // 0-5 pour SM-2
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
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (score: number, quality: number, feedback?: string) => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const r = { score, quality, timeSpentSeconds, feedback };
    setResult(r);
  };

  const handleNext = () => {
    if (result) onComplete(result);
  };

  const skill = exercise.skill;
  const skillColor = SKILL_COLORS[skill];
  const skillLabel = SKILL_LABELS[skill];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge className={cn("text-white border-0 text-xs", skillColor)}>
          {skillLabel}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>Niveau {exercise.level}</span>
          <span>·</span>
          <span>+{exercise.xpReward} XP</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <p className="text-zinc-200 font-medium leading-relaxed">
          {exercise.instructions}
        </p>
        {exercise.instructionsDe && (
          <p className="mt-2 text-zinc-500 text-sm italic">
            {exercise.instructionsDe}
          </p>
        )}
      </div>

      {/* Exercise content — routing par type */}
      <AnimatePresence mode="wait">
        <motion.div
          key={exercise.type}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {renderExercise(exercise, handleAnswer, !!result)}
        </motion.div>
      </AnimatePresence>

      {/* Feedback après réponse */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "rounded-xl border p-5 space-y-3",
              result.score >= 70
                ? "bg-green-500/10 border-green-500/30"
                : result.score >= 40
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-red-500/10 border-red-500/30"
            )}
          >
            <div className="flex items-center gap-3">
              {result.score >= 70 ? (
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 shrink-0" />
              )}
              <div>
                <p className={cn(
                  "font-semibold",
                  result.score >= 70 ? "text-green-300" : "text-red-300"
                )}>
                  {result.score >= 70
                    ? result.score === 100 ? "Parfait ! 🎉" : "Très bien ! ✓"
                    : result.score >= 40 ? "Presque ! Continue 💪" : "Pas encore, mais tu vas y arriver ! 🌱"}
                </p>
                {result.feedback && (
                  <p className="text-sm text-zinc-300 mt-1">{result.feedback}</p>
                )}
              </div>
            </div>

            {/* Bouton suivant */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium h-9 px-4 rounded-lg transition-colors"
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </button>
              {onSkip && !result && (
                <button
                  onClick={onSkip}
                  className="text-sm text-zinc-500 hover:text-zinc-300 h-9 px-3 rounded-lg transition-colors"
                >
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

// ─── Router vers le bon renderer ─────────────────────────────────────────────
function renderExercise(
  exercise: ExerciseContent,
  onAnswer: (score: number, quality: number, feedback?: string) => void,
  answered: boolean
) {
  const type = exercise.type as string;

  if (
    type === "LESEN_MULTIPLE_CHOICE" ||
    type === "HOEREN_MULTIPLE_CHOICE"
  ) {
    return (
      <MultipleChoiceRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (
    type === "LESEN_RICHTIG_FALSCH" ||
    type === "HOEREN_RICHTIG_FALSCH"
  ) {
    return (
      <TrueFalseRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (
    type === "LESEN_LUECKENTEXT" ||
    type === "VOCAB_LUECKENTEXT" ||
    type === "GRAMMATIK_LUECKENTEXT"
  ) {
    return (
      <FillInBlankRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (type === "VOCAB_FLASHCARD") {
    return (
      <FlashcardRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (type === "GRAMMATIK_ORDNEN" || type === "LESEN_REIHENFOLGE") {
    return (
      <SentenceBuilderRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (
    type === "SCHREIBEN_EMAIL" ||
    type === "SCHREIBEN_MEINUNG" ||
    type === "SCHREIBEN_BESCHREIBUNG" ||
    type === "SCHREIBEN_NOTIZ" ||
    type === "SCHREIBEN_ZUSAMMENFASSUNG"
  ) {
    return (
      <WritingRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  if (
    type === "LESEN_ZUORDNUNG" ||
    type === "VOCAB_ZUORDNUNG" ||
    type === "HOEREN_ZUORDNUNG" ||
    type === "VOCAB_BILD"
  ) {
    return (
      <MatchingRenderer
        exercise={exercise as never}
        onAnswer={onAnswer}
        answered={answered}
      />
    );
  }

  // Fallback pour les types Sprechen et non implémentés
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
      <p className="text-zinc-400 text-sm">
        Type d&apos;exercice: <span className="text-white font-mono">{type}</span>
      </p>
      <button
        onClick={() => onAnswer(80, 4)}
        className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 px-4 rounded-lg transition-colors"
      >
        Marquer comme fait
      </button>
    </div>
  );
}
