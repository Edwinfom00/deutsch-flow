"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  OsdA2WetterMultiSelect,
  OsdRendererProps,
} from "../../../types/osd-a2.types";

export function WetterMultiSelectRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA2WetterMultiSelect>) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showScript, setShowScript] = useState(false);

  const toggle = (opt: string) => {
    if (answered) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  };

  const handleSubmit = () => {
    if (answered) return;
    const correctSet = new Set(exercise.correctOptions);
    const userArray = Array.from(selected);

    const correctSelected = userArray.filter((o) => correctSet.has(o)).length;
    const wrongSelected = userArray.filter((o) => !correctSet.has(o)).length;
    const total = exercise.correctOptions.length;

    let score: number;
    if (userArray.length === exercise.expectedSelectionCount) {
      score = Math.round((correctSelected / total) * 100);
    } else if (userArray.length === exercise.expectedSelectionCount + 1) {
      score = Math.max(0, Math.round((correctSelected / total) * 100) - 30);
    } else if (userArray.length > exercise.expectedSelectionCount + 1) {
      score = 0;
    } else {
      score = Math.round((correctSelected / total) * 100);
    }

    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    void wrongSelected;
  };

  const correctSet = new Set(exercise.correctOptions);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-2.5">
        <Volume2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Mode debug — pas d&apos;audio</p>
          <p className="text-[11px] text-amber-700">
            Cliquez sur « Afficher le script » pour lire le message.
          </p>
        </div>
        <button
          onClick={() => setShowScript((p) => !p)}
          className="h-7 px-2.5 text-[11px] font-semibold text-amber-700 border border-amber-300 rounded-md hover:bg-amber-100 flex items-center gap-1.5 shrink-0"
        >
          {showScript ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showScript ? "Masquer" : "Afficher"}
        </button>
      </div>

      {showScript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gray-900 text-white rounded-md p-4"
        >
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">
            Script audio (mode debug)
          </p>
          <p className="text-sm leading-relaxed italic">« {exercise.script} »</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-gray-300 rounded-md overflow-hidden bg-white"
      >
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">{exercise.topic}</h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Cocher exactement <span className="font-bold">{exercise.expectedSelectionCount}</span> réponses
          </p>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {exercise.options.map((opt) => {
            const checked = selected.has(opt);
            const isCorrect = answered && correctSet.has(opt);
            const wronglyChecked = answered && checked && !correctSet.has(opt);
            const missedCorrect = answered && !checked && correctSet.has(opt);

            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                disabled={answered}
                className={cn(
                  "h-12 px-3 rounded-md border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  checked && !answered && "bg-gray-900 text-white border-gray-900",
                  isCorrect && checked && "bg-emerald-500 text-white border-emerald-500",
                  wronglyChecked && "bg-red-400 text-white border-red-400",
                  missedCorrect && "bg-emerald-50 border-emerald-400 text-emerald-700",
                  !checked && !answered && "bg-white border-gray-300 text-gray-700 hover:border-gray-500",
                  answered && !checked && !isCorrect && "opacity-40 bg-white border-gray-200 text-gray-400",
                )}
              >
                {checked && (
                  <span className="text-current">×</span>
                )}
                {opt}
              </button>
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p
            className={cn(
              "text-xs font-semibold",
              selected.size === exercise.expectedSelectionCount
                ? "text-emerald-600"
                : selected.size > exercise.expectedSelectionCount
                ? "text-red-600"
                : "text-gray-500",
            )}
          >
            Sélectionné : {selected.size} / {exercise.expectedSelectionCount}
          </p>
          {!answered ? (
            <button
              onClick={handleSubmit}
              disabled={selected.size === 0}
              className="h-8 px-4 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
            >
              Valider
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              {selected.size === exercise.expectedSelectionCount &&
                Array.from(selected).every((s) => correctSet.has(s)) ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </span>
          )}
        </div>
      </motion.div>

      {answered && selected.size > exercise.expectedSelectionCount + 1 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-700">
            Vous avez coché plus de {exercise.expectedSelectionCount + 1} cases → 0 point selon le barème officiel ÖSD.
          </p>
        </div>
      )}
    </div>
  );
}
