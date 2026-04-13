"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
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
    const isCorrect = exercise.options.find((o) => o.id === id)?.isCorrect ?? false;
    onAnswer(isCorrect ? 100 : 0, isCorrect ? 5 : 1);
  };

  return (
    <div className="space-y-3">
      {exercise.text && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-gray-800 leading-relaxed text-sm">{exercise.text}</p>
        </div>
      )}

      <p className="text-sm font-medium text-gray-900">{exercise.question}</p>

      <div className="space-y-2">
        {exercise.options.map((option, i) => {
          const isSelected = selected === option.id;
          const showResult = answered && isSelected;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(option.id)}
              disabled={answered}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-md border text-left transition-all text-sm",
                !answered && "hover:border-gray-300 hover:bg-gray-50 cursor-pointer",
                !isSelected && !answered && "border-gray-200 bg-white text-gray-700",
                isSelected && !answered && "border-blue-400 bg-blue-50 text-blue-800",
                showResult && option.isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                showResult && !option.isCorrect && "border-red-300 bg-red-50 text-red-700",
                answered && !isSelected && option.isCorrect && "border-emerald-300 bg-emerald-50/50 text-emerald-700",
                answered && !isSelected && !option.isCorrect && "border-gray-100 bg-gray-50 text-gray-400",
              )}
            >
              <span className={cn(
                "shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center text-[11px] font-bold",
                !isSelected && "border-gray-300 text-gray-400",
                isSelected && !answered && "border-blue-500 bg-blue-500 text-white",
                showResult && option.isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                showResult && !option.isCorrect && "border-red-400 bg-red-400 text-white",
                answered && !isSelected && option.isCorrect && "border-emerald-400 bg-emerald-400 text-white",
              )}>
                {option.id.toUpperCase()}
              </span>
              <span className="flex-1">{option.text}</span>
              {showResult && option.isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {answered && exercise.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 bg-blue-50 border border-blue-200 rounded-md p-3"
        >
          <p className="text-blue-700 text-sm">{exercise.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}
