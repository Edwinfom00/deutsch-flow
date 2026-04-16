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
  const [selected, setSelected] = useState<Record<number, string>>({});

  const handleSelect = (pos: number, val: string) => {
    if (answered) return;
    const next = { ...selected, [pos]: val };
    setSelected(next);
    if (Object.keys(next).length === exercise.blanks.length) {
      const correct = exercise.blanks.filter((b) => next[b.position] === b.answer).length;
      const score = Math.round((correct / exercise.blanks.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 1);
    }
  };

  const renderText = () => {
    const parts = exercise.text.split("____");
    return parts.map((part, i) => {
      const blank = exercise.blanks.find((b) => b.position === i + 1);
      const ua = selected[i + 1];
      const isCorrect = answered && ua === blank?.answer;
      return (
        <span key={i}>
          <span className="text-gray-800">{part}</span>
          {blank && (
            <span className={cn(
              "inline-block min-w-20 border-b-2 mx-1 px-1 text-center font-semibold transition-colors",
              !ua && "border-gray-300 text-gray-400",
              ua && !answered && "border-blue-500 text-blue-700",
              answered && isCorrect && "border-emerald-500 text-emerald-700",
              answered && !isCorrect && "border-red-400 text-red-600",
            )}>
              {ua || "___"}
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {exercise.context && <p className="text-xs text-gray-400 italic">{exercise.context}</p>}

      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-sm leading-8">{renderText()}</p>
      </div>

      {exercise.blanks.map((blank, i) => {
        if (!blank.options) return null;
        const ua = selected[blank.position];
        return (
          <motion.div key={blank.position} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="space-y-2">
            {exercise.blanks.length > 1 && <p className="text-xs text-gray-400">Blanc {blank.position}</p>}
            <div className="flex flex-wrap gap-2">
              {blank.options.map((opt, oi) => {
                const isSel = ua === opt;
                const isCorrect = answered && opt === blank.answer;
                const isWrong = answered && isSel && opt !== blank.answer;
                return (
                  <button
                    key={`opt-${blank.position}-${oi}`}
                    onClick={() => handleSelect(blank.position, opt)}
                    disabled={answered}
                    className={cn(
                      "px-4 py-2 rounded-md border text-sm font-medium transition-all",
                      !isSel && !answered && "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                      isSel && !answered && "border-blue-400 bg-blue-50 text-blue-800",
                      isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                      isWrong && "border-red-300 bg-red-50 text-red-700",
                      answered && !isSel && "opacity-40",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && ua !== blank.answer && (
              <p className="text-xs text-amber-600">Bonne réponse : <span className="font-semibold">{blank.answer}</span></p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
