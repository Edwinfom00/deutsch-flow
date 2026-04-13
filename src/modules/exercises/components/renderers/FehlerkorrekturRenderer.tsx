"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FehlerError {
  position: string;
  correction: string;
  explanation: string;
}

interface FehlerkorrekturExercise {
  type: string;
  text: string;
  errors: FehlerError[];
}

interface Props {
  exercise: FehlerkorrekturExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function FehlerkorrekturRenderer({ exercise, onAnswer, answered }: Props) {
  const [found, setFound] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggle = (i: number) => {
    if (answered) return;
    setFound((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleCheck = () => {
    setSubmitted(true);
    const correct = exercise.errors.filter((_, i) => found.has(i)).length;
    const score = Math.round((correct / exercise.errors.length) * 100);
    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  // Highlight les erreurs dans le texte
  const renderText = () => {
    let result = exercise.text;
    const highlights: Array<{ start: number; end: number; index: number }> = [];

    exercise.errors.forEach((err, i) => {
      const idx = result.indexOf(err.position);
      if (idx !== -1) highlights.push({ start: idx, end: idx + err.position.length, index: i });
    });

    if (highlights.length === 0) {
      return <span className="text-gray-800">{result}</span>;
    }

    highlights.sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let cursor = 0;

    for (const h of highlights) {
      if (h.start > cursor) parts.push(<span key={cursor}>{result.slice(cursor, h.start)}</span>);
      const isFound = found.has(h.index);
      const isCorrect = answered && isFound;
      const isMissed = answered && !isFound;
      parts.push(
        <button
          key={h.start}
          onClick={() => toggle(h.index)}
          disabled={answered}
          className={cn(
            "inline rounded px-0.5 font-medium transition-all",
            !answered && !isFound && "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer underline decoration-dotted",
            !answered && isFound && "bg-red-200 text-red-800 line-through",
            isCorrect && "bg-emerald-100 text-emerald-800 line-through",
            isMissed && "bg-red-100 text-red-700 underline decoration-wavy",
          )}
        >
          {exercise.errors[h.index].position}
        </button>
      );
      cursor = h.end;
    }
    if (cursor < result.length) parts.push(<span key={cursor}>{result.slice(cursor)}</span>);
    return parts;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md p-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Clique sur les mots incorrects pour les identifier. Il y a <strong>{exercise.errors.length} erreur{exercise.errors.length > 1 ? "s" : ""}</strong> dans ce texte.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-sm text-gray-800 leading-8">{renderText()}</p>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300" />
          Erreur potentielle
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-200 border border-red-300" />
          Sélectionné
        </span>
        <span className="text-gray-300">·</span>
        <span>{found.size} / {exercise.errors.length} identifié{found.size > 1 ? "s" : ""}</span>
      </div>

      {!answered && (
        <button
          onClick={handleCheck}
          disabled={found.size === 0}
          className={cn(
            "h-9 px-5 text-sm font-medium rounded-md transition-colors",
            found.size > 0 ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          Vérifier
        </button>
      )}

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Corrections</p>
          {exercise.errors.map((err, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 bg-white border border-gray-200 rounded-md p-3"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-red-600 line-through font-medium">{err.position}</span>
                  <span className="text-gray-300">→</span>
                  <span className="text-sm text-emerald-700 font-semibold">{err.correction}</span>
                </div>
                <p className="text-xs text-gray-500">{err.explanation}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
