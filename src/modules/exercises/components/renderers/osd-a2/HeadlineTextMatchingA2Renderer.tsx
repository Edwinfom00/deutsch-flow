"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OsdA2HeadlineTextMatching,
  OsdRendererProps,
} from "../../../types/osd-a2.types";

export function HeadlineTextMatchingA2Renderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA2HeadlineTextMatching>) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const usedLetters = new Set(exercise.texts.map((t) => t.correctHeadline));
  const distractorsCount = exercise.headlines.filter((h) => !usedLetters.has(h.letter)).length;

  const handleSelect = (textNumber: number, letter: string) => {
    if (answered) return;
    const next = { ...answers, [textNumber]: letter };
    setAnswers(next);

    if (Object.keys(next).length === exercise.texts.length) {
      const correct = exercise.texts.filter(
        (t) => next[t.number] === t.correctHeadline,
      ).length;
      const score = Math.round((correct / exercise.texts.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      {distractorsCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">
            {distractorsCount} titres sont des distracteurs (sans correspondance).
          </p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          Titres disponibles ({exercise.headlines.length})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
          {exercise.headlines.map((h) => {
            const isDistractor = !usedLetters.has(h.letter);
            return (
              <div
                key={h.letter}
                className={cn(
                  "flex items-start gap-2 bg-white border rounded-md px-3 py-1.5 text-[12px]",
                  answered && isDistractor && "border-amber-300 bg-amber-50/40",
                  !answered && "border-gray-200",
                  answered && !isDistractor && "border-gray-200",
                )}
              >
                <span className="h-5 w-5 rounded-md bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                  {h.letter}
                </span>
                <span className="text-gray-700 leading-tight pt-0.5">{h.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {exercise.texts.map((text, i) => {
          const selected = answers[text.number];
          const isCorrect = answered && selected === text.correctHeadline;
          const isWrong = answered && selected !== undefined && selected !== text.correctHeadline;

          return (
            <motion.div
              key={text.number}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "border rounded-md overflow-hidden bg-white",
                isCorrect && "border-emerald-300",
                isWrong && "border-red-200",
                !answered && "border-gray-200",
              )}
            >
              <div className="p-4">
                <div className="flex items-start gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    {text.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    {text.source && (
                      <p className="text-[10px] text-gray-400 italic mb-1">[{text.source}]</p>
                    )}
                    <p className="text-[13px] text-gray-800 leading-relaxed">{text.content}</p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  "px-4 py-3 border-t flex items-center gap-2 flex-wrap",
                  isCorrect ? "bg-emerald-50 border-emerald-200" :
                  isWrong ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100",
                )}
              >
                <span className="text-[11px] text-gray-500 shrink-0 mr-1">Überschrift :</span>
                {exercise.headlines.map((h) => {
                  const checked = selected === h.letter;
                  const isCorrectBtn = answered && h.letter === text.correctHeadline;
                  const isWrongBtn = answered && checked && h.letter !== text.correctHeadline;
                  return (
                    <button
                      key={h.letter}
                      onClick={() => handleSelect(text.number, h.letter)}
                      disabled={answered}
                      className={cn(
                        "h-7 w-7 rounded-md text-xs font-black border transition-all",
                        checked && !answered && "bg-gray-900 text-white border-gray-900",
                        isCorrectBtn && "bg-emerald-500 text-white border-emerald-500",
                        isWrongBtn && "bg-red-400 text-white border-red-400",
                        !checked && !answered && "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                        answered && !checked && !isCorrectBtn && "opacity-25 bg-white text-gray-400 border-gray-200",
                      )}
                    >
                      {h.letter}
                    </button>
                  );
                })}
                {answered && (
                  <span className="ml-auto flex items-center gap-1.5 shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-xs text-red-500 font-semibold">
                          → {text.correctHeadline}
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
