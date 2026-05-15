"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA2LongTextMC, OsdRendererProps } from "../../../types/osd-a2.types";

export function LongTextMCRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA2LongTextMC>) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qNum: number, optId: string) => {
    if (answered) return;
    const next = { ...answers, [qNum]: optId };
    setAnswers(next);

    if (Object.keys(next).length === exercise.questions.length) {
      const correct = exercise.questions.filter((q) => next[q.number] === q.correctId).length;
      const score = Math.round((correct / exercise.questions.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-md overflow-hidden bg-white"
      >
        <div className="bg-gray-900 px-5 py-3 flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
          <div className="flex-1 min-w-0">
            {exercise.textTitle && (
              <p className="text-sm font-bold text-white">{exercise.textTitle}</p>
            )}
            {exercise.textSource && (
              <p className="text-[10px] text-white/40 italic mt-0.5">[{exercise.textSource}]</p>
            )}
          </div>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-gray-800 leading-relaxed whitespace-pre-line">
            {exercise.text}
          </p>
        </div>
      </motion.div>

      {exercise.beispiel && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2"
        >
          <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
            Beispiel
          </p>
          <p className="text-sm font-medium text-blue-900">{exercise.beispiel.question}</p>
          <div className="space-y-1.5 pl-2">
            {exercise.beispiel.options.map((opt) => {
              const isCorrect = opt.id === exercise.beispiel!.correctId;
              return (
                <div key={opt.id} className="flex items-start gap-2">
                  <span
                    className={cn(
                      "h-5 w-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5",
                      isCorrect ? "bg-blue-600 text-white" : "bg-white border border-blue-200 text-blue-400",
                    )}
                  >
                    {isCorrect ? "×" : opt.id}
                  </span>
                  <p className={cn("text-sm", isCorrect ? "text-blue-900 font-semibold" : "text-blue-700")}>
                    {opt.text}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {exercise.questions.map((q, i) => {
          const selected = answers[q.number];
          const isCorrect = answered && selected === q.correctId;
          const isWrong = answered && selected !== undefined && selected !== q.correctId;

          return (
            <motion.div
              key={q.number}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "border rounded-md p-4 bg-white space-y-3",
                isCorrect && "border-emerald-300 bg-emerald-50/40",
                isWrong && "border-red-200 bg-red-50/40",
                !answered && "border-gray-200",
              )}
            >
              <div className="flex items-start gap-2.5">
                <span className="h-6 w-6 rounded-md bg-gray-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {q.number}
                </span>
                <p className="flex-1 text-sm font-semibold text-gray-900">{q.question}</p>
                {answered && (
                  <span className="shrink-0">
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 pl-8">
                {q.options.map((opt) => {
                  const checked = selected === opt.id;
                  const isCorrectOpt = answered && opt.id === q.correctId;
                  const isWrongOpt = answered && checked && opt.id !== q.correctId;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(q.number, opt.id)}
                      disabled={answered}
                      className={cn(
                        "w-full flex items-start gap-2 px-3 py-2 rounded-md border text-left transition-all",
                        checked && !answered && "bg-gray-900 border-gray-900",
                        isCorrectOpt && "bg-emerald-500 border-emerald-500",
                        isWrongOpt && "bg-red-400 border-red-400",
                        !checked && !answered && "bg-white border-gray-200 hover:border-gray-400",
                        answered && !checked && !isCorrectOpt && "bg-white border-gray-200 opacity-50",
                      )}
                    >
                      <span
                        className={cn(
                          "h-5 w-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 border",
                          checked || isCorrectOpt || isWrongOpt
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-gray-100 text-gray-500 border-gray-200",
                        )}
                      >
                        {opt.id}
                      </span>
                      <span
                        className={cn(
                          "text-sm leading-relaxed",
                          checked || isCorrectOpt || isWrongOpt ? "text-white font-medium" : "text-gray-700",
                        )}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
