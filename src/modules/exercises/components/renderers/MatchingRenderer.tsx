"use client";

import { useState, useMemo } from "react";
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
  const shuffledRight = useMemo(() => [...exercise.pairs].sort(() => Math.random() - 0.5).map((p) => p.right), []);

  const handleLeft = (id: string) => {
    if (answered) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRight = (right: string) => {
    if (answered || !selectedLeft) return;
    const next = { ...matches, [selectedLeft]: right };
    setMatches(next);
    setSelectedLeft(null);
    if (Object.keys(next).length === exercise.pairs.length) {
      const correct = exercise.pairs.filter((p) => next[p.id] === p.right).length;
      const score = Math.round((correct / exercise.pairs.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : 2);
    }
  };

  const status = (id: string) => {
    if (!answered || !matches[id]) return null;
    return matches[id] === exercise.pairs.find((p) => p.id === id)?.right ? "correct" : "wrong";
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">À associer</p>
          {exercise.pairs.map((pair, i) => {
            const s = status(pair.id);
            return (
              <motion.button key={pair.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => handleLeft(pair.id)} disabled={answered || !!matches[pair.id]}
                className={cn(
                  "w-full p-3 rounded-md border text-sm text-left transition-all",
                  selectedLeft === pair.id && "border-blue-400 bg-blue-50 text-blue-800",
                  matches[pair.id] && !answered && "border-gray-200 bg-gray-50 text-gray-400",
                  s === "correct" && "border-emerald-300 bg-emerald-50 text-emerald-800",
                  s === "wrong" && "border-red-300 bg-red-50 text-red-700",
                  !selectedLeft && !matches[pair.id] && !answered && "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}>
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">
            {selectedLeft ? "Clique pour associer" : "Sélectionne à gauche"}
          </p>
          {shuffledRight.map((right, i) => {
            const isMatched = Object.values(matches).includes(right);
            const matchedId = Object.entries(matches).find(([, v]) => v === right)?.[0];
            const isCorrectMatch = answered && matchedId && exercise.pairs.find((p) => p.id === matchedId)?.right === right;
            return (
              <motion.button key={right} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => handleRight(right)} disabled={answered || isMatched}
                className={cn(
                  "w-full p-3 rounded-md border text-sm text-left transition-all",
                  !isMatched && selectedLeft && !answered && "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 cursor-pointer",
                  !isMatched && !selectedLeft && !answered && "border-gray-200 bg-white text-gray-500",
                  isMatched && !answered && "border-gray-100 bg-gray-50 text-gray-400",
                  isCorrectMatch && "border-emerald-300 bg-emerald-50 text-emerald-800",
                  isMatched && answered && !isCorrectMatch && "border-red-200 bg-red-50 text-red-600",
                )}>
                {right}
              </motion.button>
            );
          })}
        </div>
      </div>

      {answered && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xs text-gray-500">
          {exercise.pairs.filter((p) => matches[p.id] === p.right).length} / {exercise.pairs.length} bonnes associations
        </motion.p>
      )}
    </div>
  );
}
