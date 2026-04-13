"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WritingExercise } from "@/types";

interface Props {
  exercise: WritingExercise;
  onAnswer: (score: number, quality: number, feedback?: string) => void;
  answered: boolean;
}

export function WritingRenderer({ exercise, onAnswer, answered }: Props) {
  const [text, setText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = exercise.minWords ?? 30;
  const maxWords = exercise.maxWords ?? 200;
  const isEnoughWords = wordCount >= minWords;

  const handleSubmit = async () => {
    if (!isEnoughWords || isEvaluating) return;
    setIsEvaluating(true);

    try {
      // Évaluation via l'API route
      const res = await fetch("/api/exercises/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseContent: exercise,
          userResponse: text,
          level: exercise.level,
        }),
      });

      const evaluation = await res.json();
      const score = evaluation.score ?? 70;
      const quality = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2;
      onAnswer(score, quality, evaluation.feedback);
    } catch {
      // Fallback sans évaluation IA
      onAnswer(70, 4, "Bonne tentative ! L'IA n'était pas disponible pour l'évaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Consigne */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
        <p className="text-white leading-relaxed">{exercise.prompt}</p>

        {/* Points à traiter */}
        {exercise.rubric && exercise.rubric.length > 0 && (
          <div className="border-t border-zinc-800 pt-3 space-y-1.5">
            <p className="text-xs text-zinc-500 uppercase tracking-wide">À traiter :</p>
            {exercise.rubric.map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <span className="text-blue-400 font-bold mt-0.5">{i + 1}.</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Template */}
        {exercise.template && (
          <div className="border-t border-zinc-800 pt-3">
            <p className="text-xs text-zinc-500 mb-2">Structure suggérée :</p>
            <pre className="text-xs text-zinc-400 whitespace-pre-wrap font-mono bg-zinc-900 rounded-lg p-3">
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
          placeholder="Schreibe hier auf Deutsch... (Écris ici en allemand)"
          className={cn(
            "w-full h-48 bg-zinc-900 border rounded-xl p-4 text-white placeholder:text-zinc-600 resize-none",
            "text-sm leading-relaxed focus:outline-none focus:ring-2 transition-all",
            answered
              ? "border-zinc-700 opacity-80 cursor-not-allowed"
              : "border-zinc-700 focus:border-blue-500 focus:ring-blue-500/20",
          )}
        />

        {/* Compteur de mots */}
        <div className={cn(
          "absolute bottom-3 right-3 text-xs font-mono transition-colors",
          wordCount < minWords ? "text-zinc-600" : wordCount > maxWords ? "text-red-400" : "text-green-400"
        )}>
          {wordCount} / {minWords}–{maxWords} mots
        </div>
      </div>

      {/* Phrases utiles */}
      {(exercise as unknown as { useful_phrases?: string[] }).useful_phrases && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500">Phrases utiles :</span>
          {(exercise as unknown as { useful_phrases: string[] }).useful_phrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => setText((prev) => prev + (prev ? " " : "") + phrase)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-full transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Bouton soumettre */}
      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={!isEnoughWords || isEvaluating}
          className={cn(
            "flex items-center gap-2 text-sm font-medium h-10 px-5 rounded-lg transition-all",
            isEnoughWords && !isEvaluating
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {isEvaluating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              L&apos;IA évalue ta réponse...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Soumettre pour correction IA
            </>
          )}
        </button>
      )}

      {!isEnoughWords && !answered && text.length > 0 && (
        <p className="text-xs text-zinc-500">
          Encore {minWords - wordCount} mot{minWords - wordCount > 1 ? "s" : ""} minimum
        </p>
      )}
    </div>
  );
}
