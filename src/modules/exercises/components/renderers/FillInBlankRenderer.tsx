"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FillInTheBlankExercise } from "@/types";

interface Props {
  exercise: FillInTheBlankExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function FillInBlankRenderer({ exercise, onAnswer, answered }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const handleSelect = (position: number, value: string) => {
    if (answered) return;
    const newAnswers = { ...selectedAnswers, [position]: value };
    setSelectedAnswers(newAnswers);

    if (Object.keys(newAnswers).length === exercise.blanks.length) {
      let correct = 0;
      exercise.blanks.forEach((blank) => {
        if (newAnswers[blank.position] === blank.answer) correct++;
      });
      const score = Math.round((correct / exercise.blanks.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 1);
    }
  };

  // Construire le texte avec les blancs rendus
  const renderTextWithBlanks = () => {
    const parts = exercise.text.split("____");
    return parts.map((part, i) => {
      const blank = exercise.blanks.find((b) => b.position === i + 1);
      const userAnswer = selectedAnswers[i + 1];
      const isCorrect = answered && userAnswer === blank?.answer;

      return (
        <span key={i}>
          <span className="text-zinc-200">{part}</span>
          {blank && (
            <span
              className={cn(
                "inline-block min-w-[80px] border-b-2 mx-1 px-1 text-center font-medium transition-colors",
                !userAnswer && "border-zinc-600 text-zinc-500",
                userAnswer && !answered && "border-blue-500 text-blue-300",
                answered && isCorrect && "border-green-500 text-green-300",
                answered && !isCorrect && "border-red-500 text-red-300",
              )}
            >
              {userAnswer || "___"}
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-5">
      {/* Contexte */}
      {exercise.context && (
        <p className="text-xs text-zinc-500 italic">{exercise.context}</p>
      )}

      {/* Texte avec blancs */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
        <p className="text-base leading-8">{renderTextWithBlanks()}</p>
      </div>

      {/* Options de réponse pour chaque blanc */}
      {exercise.blanks.map((blank, i) => {
        if (!blank.options) return null;
        const userAnswer = selectedAnswers[blank.position];

        return (
          <motion.div
            key={blank.position}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="space-y-2"
          >
            {exercise.blanks.length > 1 && (
              <p className="text-xs text-zinc-500">Blanc {blank.position}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {blank.options.map((option) => {
                const isSelected = userAnswer === option;
                const isCorrect = answered && option === blank.answer;
                const isWrong = answered && isSelected && option !== blank.answer;

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(blank.position, option)}
                    disabled={answered}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                      !isSelected && !answered && "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-blue-500/50 hover:bg-blue-500/5",
                      isSelected && !answered && "border-blue-500 bg-blue-500/15 text-blue-200",
                      isCorrect && "border-green-500 bg-green-500/15 text-green-200",
                      isWrong && "border-red-500 bg-red-500/15 text-red-200",
                      answered && !isSelected && "opacity-40",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {answered && userAnswer !== blank.answer && (
              <p className="text-xs text-amber-400">
                ✓ Bonne réponse : <span className="font-medium">{blank.answer}</span>
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
