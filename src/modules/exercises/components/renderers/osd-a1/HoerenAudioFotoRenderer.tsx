"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, ImageIcon, Volume2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1HoerenAudioFoto, OsdRendererProps } from "../../../types/osd-a1.types";

export function HoerenAudioFotoRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1HoerenAudioFoto>) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showScripts, setShowScripts] = useState(false);

  const usedFotos = new Set(exercise.audioTexts.map((t) => t.correctFoto));
  const distractorFotos = exercise.fotos.filter((f) => !usedFotos.has(f.letter));

  const handleSelect = (textNum: number, fotoLetter: string) => {
    if (answered) return;
    const next = { ...answers, [textNum]: fotoLetter };
    setAnswers(next);

    if (Object.keys(next).length === exercise.audioTexts.length) {
      const correct = exercise.audioTexts.filter((t) => next[t.number] === t.correctFoto).length;
      const score = Math.round((correct / exercise.audioTexts.length) * 100);
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
            Cliquez sur « Afficher les scripts » pour lire chaque enregistrement.
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

      {distractorFotos.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-700">
            {distractorFotos.length === 1
              ? "Attention : 1 photo n'a aucune correspondance."
              : `Attention : ${distractorFotos.length} photos n'ont aucune correspondance.`}
          </p>
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Photos disponibles
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {exercise.fotos.map((f) => {
            const isDistractor = !usedFotos.has(f.letter);
            return (
              <div
                key={f.letter}
                className={cn(
                  "relative border rounded-md p-2 bg-white aspect-square flex flex-col items-center justify-center text-center gap-1.5",
                  answered && isDistractor && "border-amber-300 bg-amber-50/40",
                  answered && !isDistractor && "border-gray-200",
                  !answered && "border-gray-200",
                )}
              >
                <span className="absolute top-1.5 left-1.5 h-5 w-5 rounded-md bg-gray-900 text-white text-[10px] font-black flex items-center justify-center">
                  {f.letter}
                </span>
                {f.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.imageUrl} alt={f.description} className="w-full h-full object-cover rounded-sm" />
                ) : (
                  <>
                    <ImageIcon className="h-5 w-5 text-gray-300" />
                    <p className="text-[10px] text-gray-500 leading-tight px-1">{f.description}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Enregistrements à associer
        </p>
        {exercise.audioTexts.map((audio, i) => {
          const selected = answers[audio.number];
          const isCorrect = answered && selected === audio.correctFoto;
          const isWrong = answered && selected !== undefined && selected !== audio.correctFoto;

          return (
            <motion.div
              key={audio.number}
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
                <span className="h-6 w-6 rounded-md bg-violet-600 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {audio.number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500">Text {audio.number}</p>
                  {showScripts && (
                    <p className="text-[12px] text-gray-700 italic mt-1 leading-relaxed">
                      « {audio.script} »
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pl-8">
                <span className="text-[11px] text-gray-500 shrink-0 mr-1">Foto :</span>
                {exercise.fotos.map((f) => {
                  const checked = selected === f.letter;
                  const isCorrectBtn = answered && f.letter === audio.correctFoto;
                  const isWrongBtn = answered && checked && f.letter !== audio.correctFoto;
                  return (
                    <button
                      key={f.letter}
                      onClick={() => handleSelect(audio.number, f.letter)}
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
                      {f.letter}
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
