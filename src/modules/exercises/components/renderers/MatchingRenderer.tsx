"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MatchingExercise } from "@/types";

interface Props {
  exercise: MatchingExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function MatchingRenderer({ exercise, onAnswer, answered }: Props) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const shuffledRight = [...exercise.pairs]
    .sort(() => Math.random() - 0.5)
    .map((p) => p.right);

  const handleLeftClick = (id: string) => {
    if (answered) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (right: string) => {
    if (answered || !selectedLeft) return;

    const newMatches = { ...matches, [selectedLeft]: right };
    setMatches(newMatches);
    setSelectedLeft(null);

    if (Object.keys(newMatches).length === exercise.pairs.length) {
      let correct = 0;
      exercise.pairs.forEach((pair) => {
        if (newMatches[pair.id] === pair.right) correct++;
      });
      const score = Math.round((correct / exercise.pairs.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : 2);
    }
  };

  const getMatchStatus = (id: string) => {
    if (!answered || !matches[id]) return null;
    const pair = exercise.pairs.find((p) => p.id === id);
    return matches[id] === pair?.right ? "correct" : "wrong";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Colonne gauche */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 text-center mb-2">À associer</p>
          {exercise.pairs.map((pair, i) => {
            const status = getMatchStatus(pair.id);
            return (
              <motion.button
                key={pair.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleLeftClick(pair.id)}
                disabled={answered || !!matches[pair.id]}
                className={cn(
                  "w-full p-3 rounded-xl border text-sm text-left transition-all",
                  selectedLeft === pair.id && "border-blue-500 bg-blue-500/15 text-blue-200",
                  matches[pair.id] && !answered && "border-zinc-700 bg-zinc-800 text-zinc-500",
                  status === "correct" && "border-green-500 bg-green-500/10 text-green-200",
                  status === "wrong" && "border-red-500 bg-red-500/10 text-red-200",
                  !selectedLeft && !matches[pair.id] && !answered && "border-zinc-800 bg-zinc-900/40 text-zinc-200 hover:border-zinc-600",
                )}
              >
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        {/* Colonne droite */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 text-center mb-2">
            {selectedLeft ? "Clique pour associer" : "Sélectionne d'abord à gauche"}
          </p>
          {shuffledRight.map((right, i) => {
            const isMatched = Object.values(matches).includes(right);
            const matchedPairId = Object.entries(matches).find(([, v]) => v === right)?.[0];
            const isCorrectMatch = answered && matchedPairId && exercise.pairs.find(p => p.id === matchedPairId)?.right === right;

            return (
              <motion.button
                key={right}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleRightClick(right)}
                disabled={answered || isMatched}
                className={cn(
                  "w-full p-3 rounded-xl border text-sm text-left transition-all",
                  !isMatched && selectedLeft && !answered && "border-amber-500/50 bg-amber-500/5 text-amber-200 hover:border-amber-500 cursor-pointer",
                  !isMatched && !selectedLeft && !answered && "border-zinc-800 bg-zinc-900/40 text-zinc-400",
                  isMatched && !answered && "border-zinc-700 bg-zinc-800/50 text-zinc-500",
                  isCorrectMatch && "border-green-500 bg-green-500/10 text-green-200",
                  isMatched && answered && !isCorrectMatch && "border-red-500/50 bg-red-500/5 text-red-300",
                )}
              >
                {right}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Score partiel */}
      {answered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-zinc-400"
        >
          {exercise.pairs.filter(p => matches[p.id] === p.right).length} / {exercise.pairs.length} bonnes associations
        </motion.div>
      )}
    </div>
  );
}
