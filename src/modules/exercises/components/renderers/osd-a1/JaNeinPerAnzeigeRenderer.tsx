"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1JaNeinPerAnzeige, OsdRendererProps } from "../../../types/osd-a1.types";

export function JaNeinPerAnzeigeRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1JaNeinPerAnzeige>) {
  const [answers, setAnswers] = useState<Record<string, "JA" | "NEIN">>({});

  const allQuestions = exercise.anzeigen.flatMap((a) => a.questions);
  const totalCount = allQuestions.length;

  const handleSelect = (qid: string, value: "JA" | "NEIN") => {
    if (answered) return;
    const next = { ...answers, [qid]: value };
    setAnswers(next);

    if (Object.keys(next).length === totalCount) {
      const correct = allQuestions.filter((q) => next[q.id] === q.correctAnswer).length;
      const score = Math.round((correct / totalCount) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <div className="space-y-4">
        {exercise.anzeigen.map((anzeige, ai) => (
          <motion.div
            key={anzeige.number}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ai * 0.08 }}
            className="border border-gray-200 rounded-md overflow-hidden bg-white"
          >
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-md bg-gray-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {anzeige.number}
                </span>
                <div className="flex-1 min-w-0">
                  {anzeige.title && (
                    <p className="text-sm font-bold text-gray-900 mb-1">{anzeige.title}</p>
                  )}
                  <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
                    {anzeige.text}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {anzeige.questions.map((q) => {
                const selected = answers[q.id];
                const isCorrect = answered && selected === q.correctAnswer;
                const isWrong = answered && selected && selected !== q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={cn(
                      "p-3.5 flex items-start gap-3",
                      isCorrect && "bg-emerald-50",
                      isWrong && "bg-red-50",
                    )}
                  >
                    <p className="flex-1 text-sm text-gray-800 leading-relaxed">{q.question}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(["JA", "NEIN"] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => handleSelect(q.id, v)}
                          disabled={answered}
                          className={cn(
                            "h-7 px-3 rounded-md text-[11px] font-black border transition-all",
                            selected === v && !answered && "bg-gray-900 text-white border-gray-900",
                            answered && q.correctAnswer === v && "bg-emerald-500 text-white border-emerald-500",
                            answered && selected === v && v !== q.correctAnswer && "bg-red-400 text-white border-red-400",
                            selected !== v && !answered && "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                            answered && v !== q.correctAnswer && selected !== v && "opacity-25 bg-white text-gray-400 border-gray-200",
                          )}
                        >
                          {v}
                        </button>
                      ))}
                      {answered && (
                        <span className="ml-1.5">
                          {isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
