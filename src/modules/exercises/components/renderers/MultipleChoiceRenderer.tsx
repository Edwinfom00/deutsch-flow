"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MultipleChoiceExercise } from "@/types";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function MultipleChoiceRenderer({ exercise, onAnswer, answered }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    const option = exercise.options.find((o) => o.id === id);
    const isCorrect = option?.isCorrect ?? false;
    onAnswer(isCorrect ? 100 : 0, isCorrect ? 5 : 1);
  };

  return (
    <div className="space-y-4">
      {/* Texte de lecture si présent */}
      {exercise.text && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-200 leading-relaxed text-sm font-mono">
            {exercise.text}
          </p>
        </div>
      )}

      {/* Question */}
      <p className="text-white font-medium">{exercise.question}</p>

      {/* Options */}
      <div className="space-y-2.5">
        {exercise.options.map((option, i) => {
          const isSelected = selected === option.id;
          const showResult = answered && isSelected;
          const isCorrect = option.isCorrect;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200",
                !answered && "hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer",
                !isSelected && !answered && "border-zinc-800 bg-zinc-900/40",
                isSelected && !answered && "border-blue-500 bg-blue-500/10",
                showResult && isCorrect && "border-green-500 bg-green-500/10",
                showResult && !isCorrect && "border-red-500 bg-red-500/10",
                answered && !isSelected && isCorrect && "border-green-500/50 bg-green-500/5",
                answered && !isSelected && !isCorrect && "border-zinc-800 bg-zinc-900/20 opacity-60",
              )}
            >
              <span className={cn(
                "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                !isSelected ? "border-zinc-600 text-zinc-600" : "border-current",
                isSelected && !answered && "border-blue-400 text-blue-400",
                showResult && isCorrect && "border-green-400 text-green-400",
                showResult && !isCorrect && "border-red-400 text-red-400",
              )}>
                {option.id.toUpperCase()}
              </span>
              <span className={cn(
                "flex-1 text-sm",
                !answered && "text-zinc-200",
                showResult && isCorrect && "text-green-200 font-medium",
                showResult && !isCorrect && "text-red-200",
                answered && !isSelected && "text-zinc-500",
              )}>
                {option.text}
              </span>
              {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {/* Explication */}
      {answered && exercise.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
        >
          <span className="text-blue-400 text-sm">💡</span>
          <p className="text-blue-300 text-sm">{exercise.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
