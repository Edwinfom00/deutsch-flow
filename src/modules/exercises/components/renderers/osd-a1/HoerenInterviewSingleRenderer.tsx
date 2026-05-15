"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OsdA1HoerenInterviewSingleChoice,
  OsdRendererProps,
} from "../../../types/osd-a1.types";

export function HoerenInterviewSingleRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1HoerenInterviewSingleChoice>) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showScripts, setShowScripts] = useState(false);

  const handleSelect = (speakerNum: number, colIdx: number) => {
    if (answered) return;
    const next = { ...answers, [speakerNum]: colIdx };
    setAnswers(next);

    if (Object.keys(next).length === exercise.speakers.length) {
      const correct = exercise.speakers.filter(
        (s) => next[s.number] === s.correctColumnIndex,
      ).length;
      const score = Math.round((correct / exercise.speakers.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-2.5">
        <Volume2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Mode debug — pas d&apos;audio</p>
          <p className="text-[11px] text-amber-700">
            Cliquez sur « Afficher les scripts » pour lire le texte de chaque enregistrement.
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
                {answered && (
                  <th className="px-3 py-2.5 w-10 text-center" aria-hidden />
                )}
              </tr>
            </thead>
            <tbody>
              {exercise.speakers.map((speaker) => {
                const selected = answers[speaker.number];
                const isCorrect = answered && selected === speaker.correctColumnIndex;
                const isWrong = answered && selected !== undefined && selected !== speaker.correctColumnIndex;

                return (
                  <tr
                    key={speaker.number}
                    className={cn(
                      "border-b border-gray-100 last:border-b-0",
                      isCorrect && "bg-emerald-50/60",
                      isWrong && "bg-red-50/60",
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
                      const checked = selected === colIdx;
                      const isCorrectCol = answered && colIdx === speaker.correctColumnIndex;
                      const isWrongCol = answered && checked && colIdx !== speaker.correctColumnIndex;
                      return (
                        <td key={colIdx} className="px-3 py-3 text-center align-top">
                          <button
                            onClick={() => handleSelect(speaker.number, colIdx)}
                            disabled={answered}
                            aria-label={`${speaker.label} - ${exercise.columns[colIdx]}`}
                            className={cn(
                              "h-7 w-7 rounded-md border-2 transition-all inline-flex items-center justify-center",
                              checked && !answered && "bg-gray-900 border-gray-900",
                              isCorrectCol && "bg-emerald-500 border-emerald-500",
                              isWrongCol && "bg-red-400 border-red-400",
                              !checked && !answered && "border-gray-300 hover:border-gray-500 bg-white",
                              answered && !checked && !isCorrectCol && "border-gray-200 bg-white opacity-40",
                            )}
                          >
                            {(checked || isCorrectCol) && (
                              <span className="text-white text-xs font-black">×</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    {answered && (
                      <td className="px-3 py-3 text-center">
                        {isCorrect ? (
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
    </div>
  );
}
