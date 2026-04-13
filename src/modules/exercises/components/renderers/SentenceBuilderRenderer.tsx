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
    const isCorrect = words.join(" ").toLowerCase() === exercise.solution.toLowerCase();
    onAnswer(isCorrect ? 100 : 30, isCorrect ? 5 : 2);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-14">
        <p className="text-xs text-gray-400 mb-2.5">Réordonne les mots :</p>
        <Reorder.Group axis="x" values={words} onReorder={setWords} className="flex flex-wrap gap-2">
          {words.map((word) => (
            <Reorder.Item key={word} value={word}
              className={cn(
                "px-3 py-1.5 rounded-md border text-sm font-medium select-none transition-colors",
                answered ? "border-gray-200 text-gray-400 bg-gray-50 cursor-default" :
                "border-gray-300 bg-white text-gray-800 cursor-grab active:cursor-grabbing hover:border-gray-400"
              )}>
              {word}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      <div className="bg-white border border-gray-200 rounded-md px-4 py-2.5">
        <span className="text-xs text-gray-400 mr-2">Ta phrase :</span>
        <span className="text-sm text-gray-800">{words.join(" ")}</span>
      </div>

      {exercise.hint && (
        <div>
          {!showHint ? (
            <button onClick={() => setShowHint(true)} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-600 transition-colors">
              <Lightbulb className="h-3.5 w-3.5" /> Voir l&apos;indice
            </button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm">{exercise.hint}</p>
            </motion.div>
          )}
        </div>
      )}

      {!answered && (
        <button onClick={handleCheck} className="h-9 px-5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-md transition-colors">
          Vérifier
        </button>
      )}

      {answered && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5">
          <p className="text-xs text-gray-500 mb-1">Solution correcte :</p>
          <p className="text-emerald-800 font-semibold text-sm">{exercise.solution}</p>
        </motion.div>
      )}
    </div>
  );
}
