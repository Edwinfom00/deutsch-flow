"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Volume2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1HoerenNotizen, OsdRendererProps } from "../../../types/osd-a1.types";

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.,;]/g, "");
}

function isAccepted(input: string, correct: string, variants?: string[]): boolean {
  const n = normalize(input);
  if (n.length === 0) return false;
  if (n === normalize(correct)) return true;
  return variants?.some((v) => normalize(v) === n) ?? false;
}

export function HoerenNotizenRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1HoerenNotizen>) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showScript, setShowScript] = useState(false);

  const handleSubmit = () => {
    if (answered) return;
    const correct = exercise.notes.filter((n) =>
      isAccepted(values[n.id] ?? "", n.correctAnswer, n.acceptedVariants),
    ).length;
    const score = Math.round((correct / exercise.notes.length) * 100);
    onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  const allFilled = exercise.notes.every((n) => (values[n.id] ?? "").trim().length > 0);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3.5 flex items-start gap-2.5">
        <Volume2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 mb-0.5">Mode debug — pas d&apos;audio</p>
          <p className="text-[11px] text-amber-700">
            Cliquez sur « Afficher le script » pour lire le contenu du message.
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
        className="border-2 border-dashed border-gray-300 rounded-md p-5 bg-yellow-50/40"
      >
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span>!! Notizen !!</span>
        </p>

        <div className="space-y-3">
          {exercise.notes.map((note) => {
            const val = values[note.id] ?? "";
            const ok = answered && isAccepted(val, note.correctAnswer, note.acceptedVariants);
            const wrong = answered && val.length > 0 && !ok;

            return (
              <div key={note.id} className="flex items-baseline gap-2 flex-wrap">
                <label
                  htmlFor={note.id}
                  className="text-sm text-gray-800 font-medium shrink-0"
                >
                  {note.label}
                </label>
                <input
                  id={note.id}
                  type="text"
                  disabled={answered}
                  placeholder={note.placeholder}
                  value={val}
                  onChange={(e) =>
                    setValues((p) => ({ ...p, [note.id]: e.target.value }))
                  }
                  className={cn(
                    "flex-1 min-w-[120px] h-8 px-2 border-b-2 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed",
                    ok && "border-emerald-500 text-emerald-700",
                    wrong && "border-red-400 text-red-600",
                    !answered && "border-gray-400 focus:border-gray-900 text-gray-900",
                    answered && !ok && !wrong && "border-gray-300 text-gray-400",
                  )}
                />
                {answered && (
                  <span className="flex items-center gap-1.5 shrink-0">
                    {ok ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-xs text-gray-500">
                          → <span className="font-semibold text-emerald-700">{note.correctAnswer}</span>
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {!answered && (
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="mt-5 h-9 px-5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-md transition-colors"
          >
            Notizen prüfen
          </button>
        )}
      </motion.div>
    </div>
  );
}
