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

  const hasNichtImText = exercise.statements.some(
    (s) => s.answer === "NICHT_IM_TEXT"
  );

  const handleSelect = (statementId: string, answer: Answer) => {
    if (answered) return;
    const newAnswers = { ...userAnswers, [statementId]: answer };
    setUserAnswers(newAnswers);

    // Soumettre quand tous ont une réponse
    if (Object.keys(newAnswers).length === exercise.statements.length) {
      let correct = 0;
      exercise.statements.forEach((s) => {
        if (newAnswers[s.id] === s.answer) correct++;
      });
      const score = Math.round((correct / exercise.statements.length) * 100);
      const quality = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2;
      onAnswer(score, quality);
    }
  };

  return (
    <div className="space-y-4">
      {/* Texte ou script */}
      {(exercise.text || exercise.audioUrl) && (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          {exercise.text && (
            <p className="text-zinc-200 leading-relaxed text-sm">{exercise.text}</p>
          )}
          {exercise.audioUrl && (
            <audio controls className="w-full mt-3">
              <source src={exercise.audioUrl} />
            </audio>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <div className="h-5 w-5 rounded bg-green-600/30 border border-green-600/50 flex items-center justify-center">
            <Check className="h-3 w-3 text-green-400" />
          </div>
          Richtig
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <div className="h-5 w-5 rounded bg-red-600/30 border border-red-600/50 flex items-center justify-center">
            <X className="h-3 w-3 text-red-400" />
          </div>
          Falsch
        </div>
        {hasNichtImText && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <div className="h-5 w-5 rounded bg-zinc-700/50 border border-zinc-600 flex items-center justify-center">
              <Minus className="h-3 w-3 text-zinc-400" />
            </div>
            Nicht im Text
          </div>
        )}
      </div>

      {/* Énoncés */}
      <div className="space-y-3">
        {exercise.statements.map((statement, i) => {
          const userAnswer = userAnswers[statement.id];
          const isCorrect = answered && userAnswer === statement.answer;

          return (
            <motion.div
              key={statement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "border rounded-xl p-4 space-y-3",
                answered && isCorrect && "border-green-500/40 bg-green-500/5",
                answered && !isCorrect && userAnswer && "border-red-500/40 bg-red-500/5",
                !answered && "border-zinc-800 bg-zinc-900/40"
              )}
            >
              <p className="text-zinc-200 text-sm">{statement.statement}</p>

              <div className="flex gap-2">
                {/* Richtig */}
                <AnswerButton
                  onClick={() => handleSelect(statement.id, "RICHTIG")}
                  selected={userAnswer === "RICHTIG"}
                  correct={answered ? statement.answer === "RICHTIG" : null}
                  disabled={answered}
                  icon={<Check className="h-3.5 w-3.5" />}
                  label="Richtig"
                  colorClass="green"
                />
                {/* Falsch */}
                <AnswerButton
                  onClick={() => handleSelect(statement.id, "FALSCH")}
                  selected={userAnswer === "FALSCH"}
                  correct={answered ? statement.answer === "FALSCH" : null}
                  disabled={answered}
                  icon={<X className="h-3.5 w-3.5" />}
                  label="Falsch"
                  colorClass="red"
                />
                {/* Nicht im Text (B1+) */}
                {hasNichtImText && (
                  <AnswerButton
                    onClick={() => handleSelect(statement.id, "NICHT_IM_TEXT")}
                    selected={userAnswer === "NICHT_IM_TEXT"}
                    correct={answered ? statement.answer === "NICHT_IM_TEXT" : null}
                    disabled={answered}
                    icon={<Minus className="h-3.5 w-3.5" />}
                    label="Nicht im Text"
                    colorClass="zinc"
                  />
                )}
              </div>

              {/* Correction si faux */}
              {answered && !isCorrect && userAnswer && (
                <p className="text-xs text-amber-400">
                  Bonne réponse : {statement.answer === "RICHTIG" ? "Richtig ✓" : statement.answer === "FALSCH" ? "Falsch ✗" : "Nicht im Text —"}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function AnswerButton({
  onClick,
  selected,
  correct,
  disabled,
  icon,
  label,
  colorClass,
}: {
  onClick: () => void;
  selected: boolean;
  correct: boolean | null;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  colorClass: "green" | "red" | "zinc";
}) {
  const colors = {
    green: {
      selected: "border-green-500 bg-green-500/20 text-green-300",
      correct: "border-green-500 bg-green-500/20 text-green-300",
      wrong: "border-red-500/50 bg-red-500/10 text-red-400",
      base: "border-zinc-700 bg-zinc-800/50 text-zinc-400",
    },
    red: {
      selected: "border-red-500 bg-red-500/20 text-red-300",
      correct: "border-green-500 bg-green-500/20 text-green-300",
      wrong: "border-red-500/50 bg-red-500/10 text-red-400",
      base: "border-zinc-700 bg-zinc-800/50 text-zinc-400",
    },
    zinc: {
      selected: "border-zinc-500 bg-zinc-700 text-zinc-200",
      correct: "border-green-500 bg-green-500/20 text-green-300",
      wrong: "border-red-500/50 bg-red-500/10 text-red-400",
      base: "border-zinc-700 bg-zinc-800/50 text-zinc-400",
    },
  }[colorClass];

  let cls = colors.base;
  if (selected && !disabled) cls = colors.selected;
  if (disabled && selected && correct === true) cls = colors.correct;
  if (disabled && selected && correct === false) cls = colors.wrong;
  if (disabled && !selected && correct === true) cls = colors.correct + " opacity-60";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
        cls,
        !disabled && "hover:opacity-80 cursor-pointer"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
