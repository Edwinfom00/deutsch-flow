"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WritingExercise } from "@/types";

interface Correction {
  original: string;
  correction: string;
  explanation: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  corrections: Correction[];
  encouragement: string;
  modelAnswer?: string;
}

interface Props {
  exercise: WritingExercise;
  onAnswer: (score: number, quality: number, feedback?: string) => void;
  answered: boolean;
}

export function WritingRenderer({ exercise, onAnswer, answered }: Props) {
  const [text, setText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = exercise.minWords ?? 30;
  const maxWords = exercise.maxWords ?? 200;
  const isEnough = wordCount >= minWords;

  const handleSubmit = async () => {
    if (!isEnough || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/exercises/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseContent: exercise, userResponse: text, level: exercise.level }),
      });
      const ev: Evaluation = await res.json();
      setEvaluation(ev);
      const score = ev.score ?? 70;
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2, ev.feedback);
    } catch {
      const fallback: Evaluation = {
        score: 70,
        feedback: "Bonne tentative ! Continue comme ça.",
        corrections: [],
        encouragement: "Tu progresses !",
      };
      setEvaluation(fallback);
      onAnswer(70, 4, fallback.feedback);
    } finally {
      setIsEvaluating(false);
    }
  };

  const scoreColor = evaluation
    ? evaluation.score >= 80 ? "text-emerald-700" : evaluation.score >= 60 ? "text-amber-700" : "text-red-600"
    : "";
  const scoreBg = evaluation
    ? evaluation.score >= 80 ? "bg-emerald-50 border-emerald-200" : evaluation.score >= 60 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"
    : "";

  return (
    <div className="space-y-4">
      {/* Consigne */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
        <p className="text-gray-800 text-sm leading-relaxed">{exercise.prompt}</p>

        {exercise.rubric && exercise.rubric.length > 0 && (
          <div className="border-t border-gray-200 pt-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Points à traiter</p>
            {exercise.rubric.map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 font-semibold mt-0.5 shrink-0">{i + 1}.</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        {exercise.template && (
          <div className="border-t border-gray-200 pt-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Structure suggérée</p>
            <pre className="text-xs text-gray-500 whitespace-pre-wrap font-mono bg-white border border-gray-200 rounded-md p-3">
              {exercise.template}
            </pre>
          </div>
        )}
      </div>

      {/* Zone de rédaction */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={answered || isEvaluating}
          placeholder="Schreibe hier auf Deutsch…"
          className={cn(
            "w-full h-44 bg-white border rounded-md p-4 text-gray-900 placeholder:text-gray-300 resize-none text-sm leading-relaxed",
            "focus:outline-none focus:ring-1 transition-all",
            answered ? "border-gray-200 opacity-70 cursor-not-allowed" :
            "border-gray-200 focus:border-gray-400 focus:ring-gray-300"
          )}
        />
        <div className={cn(
          "absolute bottom-3 right-3 text-[11px] font-mono transition-colors",
          wordCount < minWords ? "text-gray-300" : wordCount > maxWords ? "text-red-500" : "text-emerald-600"
        )}>
          {wordCount} / {minWords}–{maxWords}
        </div>
      </div>

      {/* Phrases utiles */}
      {(exercise as unknown as { useful_phrases?: string[] }).useful_phrases && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-gray-400">Phrases utiles :</span>
          {(exercise as unknown as { useful_phrases: string[] }).useful_phrases.map((p, i) => (
            <button key={i} onClick={() => setText((prev) => prev + (prev ? " " : "") + p)}
              disabled={answered}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition-colors">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Bouton soumettre */}
      {!answered && (
        <button onClick={handleSubmit} disabled={!isEnough || isEvaluating}
          className={cn(
            "flex items-center gap-2 text-sm font-medium h-9 px-5 rounded-md transition-all",
            isEnough && !isEvaluating ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}>
          {isEvaluating
            ? <><Loader2 className="h-4 w-4 animate-spin" />Correction en cours…</>
            : <><Send className="h-3.5 w-3.5" />Soumettre pour correction</>
          }
        </button>
      )}

      {!isEnough && !answered && text.length > 0 && (
        <p className="text-xs text-gray-400">{minWords - wordCount} mot{minWords - wordCount > 1 ? "s" : ""} minimum</p>
      )}

      {/* ── Correction complète ── */}
      <AnimatePresence>
        {evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Score + feedback global */}
            <div className={cn("border rounded-md p-4 space-y-2", scoreBg)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {evaluation.score >= 70
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <XCircle className="h-4 w-4 text-red-500" />
                  }
                  <span className={cn("text-sm font-bold", scoreColor)}>
                    Score : {evaluation.score}/100
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{evaluation.feedback}</p>
              {evaluation.encouragement && (
                <p className="text-xs text-gray-500 italic">{evaluation.encouragement}</p>
              )}
            </div>

            {/* Corrections détaillées */}
            {evaluation.corrections && evaluation.corrections.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3" />
                  Corrections ({evaluation.corrections.length})
                </p>
                {evaluation.corrections.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white border border-gray-200 rounded-md p-3.5 space-y-1.5"
                  >
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="text-sm text-red-600 line-through font-medium">{c.original}</span>
                      <span className="text-gray-300 text-sm">→</span>
                      <span className="text-sm text-emerald-700 font-semibold">{c.correction}</span>
                    </div>
                    <p className="text-xs text-gray-500">{c.explanation}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Exemple de réponse modèle — toujours affiché après évaluation */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Exemple de réponse corrigée</p>
              {evaluation.modelAnswer ? (
                <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">{evaluation.modelAnswer}</p>
              ) : (
                <p className="text-sm text-blue-400 italic">Exemple non disponible pour cet exercice.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
