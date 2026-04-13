"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrueFalseExercise } from "@/types";

type Answer = "RICHTIG" | "FALSCH" | "NICHT_IM_TEXT";

interface Props {
  exercise: TrueFalseExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function TrueFalseRenderer({ exercise, onAnswer, answered }: Props) {
  const [userAnswers, setUserAnswers] = useState<Record<string, Answer>>({});
  const hasNicht = exercise.statements.some((s) => s.answer === "NICHT_IM_TEXT");

  const handleSelect = (id: string, answer: Answer) => {
    if (answered) return;
    const next = { ...userAnswers, [id]: answer };
    setUserAnswers(next);
    if (Object.keys(next).length === exercise.statements.length) {
      const correct = exercise.statements.filter((s) => next[s.id] === s.answer).length;
      const score = Math.round((correct / exercise.statements.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-3">
      {exercise.text && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-56 overflow-y-auto">
          <p className="text-gray-800 text-sm leading-relaxed">{exercise.text}</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-3 flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1"><Check className="h-3 w-3 text-emerald-600" /> Richtig</span>
        <span className="flex items-center gap-1"><X className="h-3 w-3 text-red-500" /> Falsch</span>
        {hasNicht && <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-gray-400" /> Nicht im Text</span>}
      </div>

      <div className="space-y-2.5">
        {exercise.statements.map((s, i) => {
          const ua = userAnswers[s.id];
          const isCorrect = answered && ua === s.answer;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "border rounded-md p-3.5 space-y-2.5",
                answered && isCorrect && "border-emerald-200 bg-emerald-50",
                answered && !isCorrect && ua && "border-red-200 bg-red-50",
                !answered && "border-gray-200 bg-white"
              )}
            >
              <p className="text-sm text-gray-800">{s.statement}</p>
              <div className="flex gap-2">
                {(["RICHTIG", "FALSCH", ...(hasNicht ? ["NICHT_IM_TEXT"] : [])] as Answer[]).map((val) => {
                  const icons = { RICHTIG: Check, FALSCH: X, NICHT_IM_TEXT: Minus };
                  const labels = { RICHTIG: "Richtig", FALSCH: "Falsch", NICHT_IM_TEXT: "Nicht im Text" };
                  const Icon = icons[val];
                  const isSelected = ua === val;
                  const isRight = answered && s.answer === val;

                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(s.id, val)}
                      disabled={answered}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all",
                        !isSelected && !answered && "border-gray-200 text-gray-500 hover:border-gray-400 hover:bg-gray-50",
                        isSelected && !answered && "border-blue-400 bg-blue-50 text-blue-700",
                        isRight && "border-emerald-400 bg-emerald-50 text-emerald-700",
                        answered && isSelected && !isRight && "border-red-300 bg-red-50 text-red-600",
                        answered && !isSelected && isRight && "border-emerald-300 bg-emerald-50/60 text-emerald-600 opacity-70",
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {labels[val]}
                    </button>
                  );
                })}
              </div>
              {answered && !isCorrect && ua && (
                <p className="text-xs text-amber-600">
                  Bonne réponse : {s.answer === "RICHTIG" ? "Richtig" : s.answer === "FALSCH" ? "Falsch" : "Nicht im Text"}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
