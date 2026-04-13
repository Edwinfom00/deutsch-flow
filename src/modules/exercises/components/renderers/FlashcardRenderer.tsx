"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlashcardExercise } from "@/types";

interface Props {
  exercise: FlashcardExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

const RATINGS = [
  { q: 1, label: "Pas du tout", cls: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" },
  { q: 2, label: "Difficile",   cls: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100" },
  { q: 3, label: "Hésitant",    cls: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  { q: 4, label: "Bien",        cls: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  { q: 5, label: "Parfait",     cls: "border-green-300 bg-green-50 text-green-800 hover:bg-green-100" },
];

export function FlashcardRenderer({ exercise, onAnswer, answered }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const word = exercise.article ? `${exercise.article} ${exercise.word}` : exercise.word;

  return (
    <div className="space-y-5">
      <div className="relative h-48 cursor-pointer" style={{ perspective: "1000px" }}
        onClick={() => { setFlipped(!flipped); setRevealed(true); }}>
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white border border-gray-200 rounded-md p-6" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-4xl font-bold text-gray-900 tracking-wide">{word}</p>
            {exercise.article && (
              <p className="mt-2 text-xs text-gray-400">
                {exercise.article === "der" ? "masculin" : exercise.article === "die" ? "féminin" : "neutre"}
              </p>
            )}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-300">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Clique pour voir la traduction</span>
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-md p-6" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-3xl font-bold text-gray-900">{exercise.translation}</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 italic">"{exercise.exampleSentence}"</p>
              <p className="text-xs text-gray-400 mt-1">{exercise.exampleTranslation}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {revealed && !answered && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <p className="text-xs text-gray-500 text-center">Comment tu t&apos;en souviens ?</p>
            <div className="grid grid-cols-5 gap-1.5">
              {RATINGS.map(({ q, label, cls }) => (
                <button key={q} onClick={() => onAnswer(Math.round((q / 5) * 100), q)}
                  className={cn("py-2.5 rounded-md border text-xs font-medium transition-all", cls)}>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {exercise.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {exercise.tags.map((t) => (
            <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-sm">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
