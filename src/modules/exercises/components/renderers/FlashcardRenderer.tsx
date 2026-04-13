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

const QUALITY_LABELS = [
  { q: 1, label: "Pas du tout", color: "bg-red-600 hover:bg-red-500", emoji: "😕" },
  { q: 2, label: "Difficile", color: "bg-orange-600 hover:bg-orange-500", emoji: "😬" },
  { q: 3, label: "Hésitant", color: "bg-amber-600 hover:bg-amber-500", emoji: "🤔" },
  { q: 4, label: "Bien", color: "bg-green-600 hover:bg-green-500", emoji: "😊" },
  { q: 5, label: "Parfait !", color: "bg-emerald-600 hover:bg-emerald-500", emoji: "🎯" },
];

export function FlashcardRenderer({ exercise, onAnswer, answered }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const wordDisplay = exercise.article
    ? `${exercise.article} ${exercise.word}`
    : exercise.word;

  return (
    <div className="space-y-5">
      {/* Flashcard 3D flip */}
      <div
        className="relative h-52 cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => { setFlipped(!flipped); setRevealed(true); }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Face avant — Mot allemand */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 border border-zinc-700 rounded-2xl p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-4xl font-bold text-white tracking-wide">{wordDisplay}</p>
            {exercise.article && (
              <p className="mt-2 text-sm text-zinc-500">
                {exercise.article === "der" ? "masculin" : exercise.article === "die" ? "féminin" : "neutre"}
              </p>
            )}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-600">
              <RotateCw className="h-3.5 w-3.5" />
              <span>Clique pour voir la traduction</span>
            </div>
          </div>

          {/* Face arrière — Traduction + exemple */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/50 border border-blue-700/40 rounded-2xl p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-3xl font-bold text-blue-200">{exercise.translation}</p>
            <div className="mt-4 text-center">
              <p className="text-sm text-zinc-300 italic">"{exercise.exampleSentence}"</p>
              <p className="text-xs text-zinc-500 mt-1">{exercise.exampleTranslation}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Évaluation de mémorisation (après avoir retourné) */}
      <AnimatePresence>
        {revealed && !answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-center text-sm text-zinc-400">
              Comment tu t&apos;en souviens ?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {QUALITY_LABELS.map(({ q, label, color, emoji }) => (
                <button
                  key={q}
                  onClick={() => onAnswer(Math.round((q / 5) * 100), q)}
                  className={cn(
                    "flex flex-col items-center gap-1 py-3 rounded-xl text-white text-xs font-medium transition-all",
                    color
                  )}
                >
                  <span className="text-lg">{emoji}</span>
                  <span className="leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags */}
      {exercise.tags && exercise.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {exercise.tags.map((tag) => (
            <span key={tag} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
