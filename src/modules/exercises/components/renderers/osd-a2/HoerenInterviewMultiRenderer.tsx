"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OsdA2HoerenInterviewMulti,
  OsdRendererProps,
} from "../../../types/osd-a2.types";

export function HoerenInterviewMultiRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA2HoerenInterviewMulti>) {
  const [answers, setAnswers] = useState<Record<number, Set<number>>>(() =>
    Object.fromEntries(exercise.speakers.map((s) => [s.number, new Set<number>()])),
  );
  const [showScripts, setShowScripts] = useState(false);

  const toggle = (speakerNum: number, colIdx: number) => {
    if (answered) return;
    setAnswers((prev) => {
      const current = new Set(prev[speakerNum] ?? new Set());
      if (current.has(colIdx)) current.delete(colIdx);
      else current.add(colIdx);
      return { ...prev, [speakerNum]: current };
    });
  };

  const handleSubmit = () => {
    if (answered) return;
    let totalPoints = 0;
    const maxPerRow = 2;

    for (const speaker of exercise.speakers) {
      const userSet = answers[speaker.number] ?? new Set();
      const correctSet = new Set(speaker.correctColumnIndices);
      const correctUserCount = Array.from(userSet).filter((c) => correctSet.has(c)).length;
      const wrongUserCount = Array.from(userSet).filter((c) => !correctSet.has(c)).length;

      if (wrongUserCount === 0 && correctUserCount === speaker.correctColumnIndices.length) {
        totalPoints += maxPerRow;
      } else if (wrongUserCount === 1 && correctUserCount >= 1) {
        totalPoints += 1;
      }
    }

    const maxTotal = exercise.speakers.length * maxPerRow;
    const score = Math.round((totalPoints / maxTotal) * 100);
    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  const allRowsAnswered = exercise.speakers.every(
    (s) => (answers[s.number]?.size ?? 0) > 0,
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-2.5">
        <Volume2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Mode debug — pas d&apos;audio</p>
          <p className="text-[11px] text-amber-700">
            Plusieurs réponses possibles par personne. Cliquez sur « Afficher les scripts ».
          </p>
        </div>
        <button
          onClick={() => setShowScripts((p) => !p)}
          className="h-7 px-2.5 text-[11px] font-semibold text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 flex items-center gap-1.5 shrink-0"
        >
          {showScripts ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showScripts ? "Masquer" : "Afficher"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-md overflow-hidden bg-white"
      >
        <div className="px-4 py-3 bg-gray-900 text-white">
          <p className="text-sm font-semibold">{exercise.question}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Personne
                </th>
                {exercise.columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center"
                  >
                    {col}
                  </th>
                ))}
                {answered && <th className="px-3 py-2.5 w-10" aria-hidden />}
              </tr>
            </thead>
            <tbody>
              {exercise.speakers.map((speaker) => {
                const userSet = answers[speaker.number] ?? new Set();
                const correctSet = new Set(speaker.correctColumnIndices);
                const allCorrect =
                  answered &&
                  userSet.size === correctSet.size &&
                  Array.from(userSet).every((c) => correctSet.has(c));
                const partialOk =
                  answered &&
                  !allCorrect &&
                  Array.from(userSet).some((c) => correctSet.has(c));

                return (
                  <tr
                    key={speaker.number}
                    className={cn(
                      "border-b border-gray-100 last:border-b-0",
                      allCorrect && "bg-emerald-50/60",
                      partialOk && "bg-amber-50/60",
                      answered && !allCorrect && !partialOk && "bg-red-50/40",
                    )}
                  >
                    <td className="px-4 py-3 align-top">
                      <p className="text-xs font-bold text-gray-800">{speaker.label}</p>
                      {showScripts && (
                        <p className="text-[11px] text-gray-500 italic mt-1 leading-relaxed">
                          « {speaker.script} »
                        </p>
                      )}
                    </td>
                    {exercise.columns.map((_, colIdx) => {
                      const checked = userSet.has(colIdx);
                      const isCorrectCol = answered && correctSet.has(colIdx);
                      const isWrongCol = answered && checked && !correctSet.has(colIdx);
                      return (
                        <td key={colIdx} className="px-3 py-3 text-center align-top">
                          <button
                            onClick={() => toggle(speaker.number, colIdx)}
                            disabled={answered}
                            aria-label={`${speaker.label} - ${exercise.columns[colIdx]}`}
                            className={cn(
                              "h-7 w-7 rounded-md border-2 transition-all inline-flex items-center justify-center",
                              checked && !answered && "bg-gray-900 border-gray-900",
                              isCorrectCol && checked && "bg-emerald-500 border-emerald-500",
                              isCorrectCol && !checked && "bg-emerald-50 border-emerald-400",
                              isWrongCol && "bg-red-400 border-red-400",
                              !checked && !answered && "border-gray-300 hover:border-gray-500 bg-white",
                              answered && !checked && !isCorrectCol && "border-gray-200 bg-white opacity-40",
                            )}
                          >
                            {(checked || (isCorrectCol && !checked)) && (
                              <span
                                className={cn(
                                  "text-xs font-black",
                                  checked ? "text-white" : "text-emerald-600",
                                )}
                              >
                                ×
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    {answered && (
                      <td className="px-3 py-3 text-center">
                        {allCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 inline" />
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={!allRowsAnswered}
          className="h-9 px-5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
        >
          Valider
        </button>
      )}
    </div>
  );
}
