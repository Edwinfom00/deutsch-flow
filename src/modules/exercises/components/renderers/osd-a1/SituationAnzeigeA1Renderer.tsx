"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1SituationAnzeige, OsdRendererProps } from "../../../types/osd-a1.types";

export function SituationAnzeigeA1Renderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1SituationAnzeige>) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const usedNumbers = new Set(exercise.situations.map((s) => s.correctAnzeige));
  const distractorNumbers = exercise.anzeigen
    .map((a) => a.number)
    .filter((n) => !usedNumbers.has(n));

  const handleSelect = (sitLetter: string, anzeigeNum: number) => {
    if (answered) return;
    const next = { ...answers, [sitLetter]: anzeigeNum };
    setAnswers(next);

    if (Object.keys(next).length === exercise.situations.length) {
      const correct = exercise.situations.filter(
        (s) => next[s.letter] === s.correctAnzeige,
      ).length;
      const score = Math.round((correct / exercise.situations.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      {distractorNumbers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">
            {distractorNumbers.length === 1
              ? "Attention : 1 annonce n'a aucune correspondance."
              : `Attention : ${distractorNumbers.length} annonces n'ont aucune correspondance.`}
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Situations à associer
          </p>
          {exercise.situations.map((sit, i) => {
            const selected = answers[sit.letter];
            const isCorrect = answered && selected === sit.correctAnzeige;
            const isWrong = answered && selected !== undefined && selected !== sit.correctAnzeige;

            return (
              <motion.div
                key={sit.letter}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "border rounded-md p-3.5 space-y-2.5 bg-white",
                  isCorrect && "border-emerald-300 bg-emerald-50/50",
                  isWrong && "border-red-200 bg-red-50/50",
                  !answered && "border-gray-200",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-gray-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                    {sit.letter}
                  </span>
                  <p className="flex-1 text-sm text-gray-800 leading-relaxed">{sit.text}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap pl-8">
                  <span className="text-[11px] text-gray-500 shrink-0 mr-1">Anzeige :</span>
                  {exercise.anzeigen.map((a) => {
                    const checked = selected === a.number;
                    const isCorrectBtn = answered && a.number === sit.correctAnzeige;
                    const isWrongBtn = answered && checked && a.number !== sit.correctAnzeige;
                    return (
                      <button
                        key={a.number}
                        onClick={() => handleSelect(sit.letter, a.number)}
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
                        {a.number}
                      </button>
                    );
                  })}
                  {answered && (
                    <span className="ml-auto">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Annonces disponibles ({exercise.anzeigen.length})
          </p>
          {exercise.anzeigen.map((a) => {
            const isDistractor = !usedNumbers.has(a.number);
            return (
              <motion.div
                key={a.number}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "border rounded-md p-3 bg-white",
                  answered && isDistractor && "border-amber-300 bg-amber-50/40",
                  answered && !isDistractor && "border-gray-200",
                  !answered && "border-gray-200",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className="h-6 w-6 rounded-md bg-gray-100 text-gray-700 text-[11px] font-black flex items-center justify-center shrink-0">
                    {a.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    {a.title && (
                      <p className="text-xs font-bold text-gray-900 mb-0.5">{a.title}</p>
                    )}
                    <p className="text-[11px] text-gray-600 leading-relaxed">{a.text}</p>
                    {answered && isDistractor && (
                      <p className="text-[10px] text-amber-700 italic mt-1.5 font-semibold">
                        (Annonce sans correspondance)
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
