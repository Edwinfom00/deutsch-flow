"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SentenceBuilderExercise } from "@/types";

interface Props {
  exercise: SentenceBuilderExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function SentenceBuilderRenderer({ exercise, onAnswer, answered }: Props) {
  const [words, setWords] = useState([...exercise.words].sort(() => Math.random() - 0.5));
  const [showHint, setShowHint] = useState(false);

  const handleCheck = () => {
    const userSentence = words.join(" ");
    const isCorrect = userSentence.toLowerCase() === exercise.solution.toLowerCase();
    onAnswer(isCorrect ? 100 : 30, isCorrect ? 5 : 2);
  };

  return (
    <div className="space-y-5">
      {/* Zone de construction */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 min-h-16">
        <p className="text-xs text-zinc-500 mb-3">Réordonne les mots :</p>
        <Reorder.Group
          axis="x"
          values={words}
          onReorder={setWords}
          className="flex flex-wrap gap-2"
        >
          {words.map((word) => (
            <Reorder.Item
              key={word}
              value={word}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-sm font-medium cursor-grab active:cursor-grabbing select-none transition-colors",
                answered ? "border-zinc-700 text-zinc-400" : "border-blue-500/50 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
              )}
            >
              {word}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Phrase construite */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg px-4 py-3">
        <p className="text-zinc-200 text-sm">
          <span className="text-zinc-500 text-xs mr-2">Ta phrase:</span>
          {words.join(" ")}
        </p>
      </div>

      {/* Indice */}
      {exercise.hint && (
        <div>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Voir l&apos;indice
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
            >
              <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <p className="text-amber-300 text-sm">{exercise.hint}</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Bouton vérifier */}
      {!answered && (
        <button
          onClick={handleCheck}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium h-10 px-5 rounded-lg transition-colors"
        >
          Vérifier
        </button>
      )}

      {/* Solution affichée après réponse */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
        >
          <p className="text-xs text-zinc-400 mb-1">Solution correcte :</p>
          <p className="text-green-200 font-medium">{exercise.solution}</p>
        </motion.div>
      )}
    </div>
  );
}
