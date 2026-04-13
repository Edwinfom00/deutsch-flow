"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammatikTransformationExercise {
  type: string;
  sourceText: string;
  transformationType: string;
  solution: string;
  hint?: string;
}

interface Props {
  exercise: GrammatikTransformationExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function GrammatikTransformationRenderer({ exercise, onAnswer, answered }: Props) {
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const handleCheck = () => {
    const isCorrect = normalize(input) === normalize(exercise.solution);
    setChecked(true);
    onAnswer(isCorrect ? 100 : 30, isCorrect ? 5 : 2);
  };

  return (
    <div className="space-y-4">
      {/* Transformation type badge */}
      <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-md px-3 py-1.5">
        <ArrowRight className="h-3.5 w-3.5 text-violet-500" />
        <span className="text-xs font-semibold text-violet-700">{exercise.transformationType}</span>
      </div>

      {/* Source sentence */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phrase originale</p>
        <p className="text-gray-900 font-medium text-sm">{exercise.sourceText}</p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ta transformation</p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={answered}
          placeholder="Écris la phrase transformée…"
          className={cn(
            "w-full h-11 px-4 border rounded-md text-sm text-gray-900 placeholder:text-gray-300 transition-all",
            "focus:outline-none focus:ring-1",
            answered ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70" :
            "border-gray-200 bg-white focus:border-gray-400 focus:ring-gray-300"
          )}
          onKeyDown={(e) => { if (e.key === "Enter" && !answered) handleCheck(); }}
        />
      </div>

      {/* Hint */}
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

      {/* Check button */}
      {!answered && (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className={cn(
            "h-9 px-5 text-sm font-medium rounded-md transition-colors",
            input.trim() ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          Vérifier
        </button>
      )}

      {/* Solution */}
      {answered && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-md p-4 space-y-2",
            normalize(input) === normalize(exercise.solution)
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-gray-50 border border-gray-200"
          )}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Solution correcte</p>
          <p className={cn(
            "font-semibold text-sm",
            normalize(input) === normalize(exercise.solution) ? "text-emerald-800" : "text-gray-800"
          )}>
            {exercise.solution}
          </p>
          {normalize(input) !== normalize(exercise.solution) && input.trim() && (
            <p className="text-xs text-gray-500">Ta réponse : <span className="text-red-600">{input}</span></p>
          )}
        </motion.div>
      )}
    </div>
  );
}
