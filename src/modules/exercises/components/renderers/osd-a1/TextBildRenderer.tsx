"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1TextBild, OsdRendererProps } from "../../../types/osd-a1.types";

export function TextBildRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1TextBild>) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const usedBilder = new Set(exercise.texts.map((t) => t.correctBild));
  const distractorBilder = exercise.bilder.filter((b) => !usedBilder.has(b.number));

  const handleSelect = (textLetter: string, bildNum: number) => {
    if (answered) return;
    const next = { ...answers, [textLetter]: bildNum };
    setAnswers(next);

    if (Object.keys(next).length === exercise.texts.length) {
      const correct = exercise.texts.filter((t) => next[t.letter] === t.correctBild).length;
      const score = Math.round((correct / exercise.texts.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      {distractorBilder.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">
            {distractorBilder.length === 1
              ? "Attention : 1 image n'a aucune correspondance."
              : `Attention : ${distractorBilder.length} images n'ont aucune correspondance.`}
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Images disponibles
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {exercise.bilder.map((b) => {
            const isDistractor = !usedBilder.has(b.number);
            return (
              <div
                key={b.number}
                className={cn(
                  "relative border rounded-md p-2 bg-white aspect-square flex flex-col items-center justify-center text-center gap-1.5",
                  answered && isDistractor && "border-amber-300 bg-amber-50/40",
                  answered && !isDistractor && "border-gray-200",
                  !answered && "border-gray-200",
                )}
              >
                <span className="absolute top-1.5 left-1.5 h-5 w-5 rounded-md bg-gray-900 text-white text-[10px] font-black flex items-center justify-center">
                  {b.number}
                </span>
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.imageUrl} alt={b.description} className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 text-gray-300" />
                    <p className="text-[10px] text-gray-500 leading-tight px-1">{b.description}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Textes à associer
        </p>
        {exercise.texts.map((text, i) => {
          const selected = answers[text.letter];
          const isCorrect = answered && selected === text.correctBild;
          const isWrong = answered && selected !== undefined && selected !== text.correctBild;

          return (
            <motion.div
              key={text.letter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
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
                  {text.letter}
                </span>
                <p className="flex-1 text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {text.content}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pl-8">
                <span className="text-[11px] text-gray-500 shrink-0 mr-1">Bild :</span>
                {exercise.bilder.map((b) => {
                  const checked = selected === b.number;
                  const isCorrectBtn = answered && b.number === text.correctBild;
                  const isWrongBtn = answered && checked && b.number !== text.correctBild;
                  return (
                    <button
                      key={b.number}
                      onClick={() => handleSelect(text.letter, b.number)}
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
                      {b.number}
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
    </div>
  );
}
