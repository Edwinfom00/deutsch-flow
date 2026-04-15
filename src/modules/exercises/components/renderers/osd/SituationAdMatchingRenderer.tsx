"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Situation {
  number: number;
  text: string;
  keywords?: string[];
  correctAnswer: string | null;
  pedagogicalHint?: string;
}

interface Ad {
  letter: string;
  title?: string;
  text: string;
}

interface Example {
  number: string;
  situation: string;
  correctAnswer: string;
}

interface SituationAdMatchingExercise {
  type: string;
  instructions: string;
  situations: Situation[];
  ads?: Ad[];
  annonces?: Ad[];
  advertisements?: Ad[];
  examples?: Example[];
  timeLimit?: number;
  maxPoints?: number;
}

interface Props {
  exercise: SituationAdMatchingExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function SituationAdMatchingRenderer({ exercise, onAnswer, answered }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAds, setShowAds] = useState(true);

  const allSituations = exercise.situations ?? [];
  // Chercher les annonces dans tous les champs possibles
  const allAds = exercise.ads ?? exercise.annonces ?? exercise.advertisements ?? [];
  const letters = allAds.length > 0
    ? allAds.map((a) => a.letter)
    : ["A","B","C","D","E","F","G","H","I","K","L","M"];

  const handleSelect = (sitNum: number, letter: string) => {
    if (answered) return;
    const next = { ...answers, [sitNum]: letter };
    setAnswers(next);
    if (Object.keys(next).length === allSituations.length) {
      // Calculer le score uniquement sur les situations avec correctAnswer connu
      const withAnswer = allSituations.filter((s) => s.correctAnswer !== null && s.correctAnswer !== undefined);
      if (withAnswer.length === 0) {
        // Pas de réponses connues — score basé sur la participation
        onAnswer(80, 4);
        return;
      }
      const correct = withAnswer.filter((s) => next[s.number] === s.correctAnswer).length;
      const score = Math.round((correct / withAnswer.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-4">
      {/* Meta */}
      {(exercise.timeLimit || exercise.maxPoints) && (
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {exercise.timeLimit && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{Math.round(exercise.timeLimit / 60)} min</span>}
          {exercise.maxPoints && <span>{exercise.maxPoints} points</span>}
        </div>
      )}

      {/* Exemples */}
      {exercise.examples && exercise.examples.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3.5 space-y-2">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Exemples</p>
          {exercise.examples.map((ex) => (
            <div key={ex.number} className="flex items-center gap-2 text-xs text-blue-800">
              <span className="font-bold shrink-0">Bsp. {ex.number}:</span>
              <span className="flex-1">{ex.situation}</span>
              <span className="font-black bg-blue-200 px-1.5 py-0.5 rounded-sm shrink-0">{ex.correctAnswer}</span>
            </div>
          ))}
        </div>
      )}

      {/* Annonces */}
      {allAds.length > 0 ? (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <button onClick={() => setShowAds(!showAds)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <span className="text-xs font-semibold text-gray-600">Annonces ({allAds.length})</span>
            <span className="text-[10px] text-gray-400">{showAds ? "Masquer" : "Afficher"}</span>
          </button>
          {showAds && (
            <div className="p-3 grid grid-cols-2 gap-2">
              {allAds.map((ad) => (
                <div key={ad.letter} className="bg-white border border-gray-100 rounded-md p-3 space-y-1">
                  <span className="text-xs font-black text-gray-900">{ad.letter}</span>
                  {ad.title && <p className="text-xs font-semibold text-gray-700">{ad.title}</p>}
                  <p className="text-[11px] text-gray-600 leading-relaxed">{ad.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-700">
          Les annonces (A–M) ne sont pas disponibles dans ce document. Associe chaque situation au numéro de l&apos;annonce correspondante selon ta lecture du document original.
        </div>
      )}

      {/* Situations */}
      <div className="space-y-2.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Situations à associer</p>
        {allSituations.map((sit, i) => {
          const selected = answers[sit.number];
          const isCorrect = answered && sit.correctAnswer && selected === sit.correctAnswer;
          const isWrong = answered && sit.correctAnswer && selected && selected !== sit.correctAnswer;
          const noAnswerKnown = !sit.correctAnswer;

          return (
            <motion.div key={sit.number} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn("border rounded-md p-3.5 space-y-2.5",
                isCorrect && "border-emerald-200 bg-emerald-50",
                isWrong && "border-red-200 bg-red-50",
                !answered && "border-gray-200 bg-white")}>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-sm bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {sit.number}
                </span>
                <p className="text-sm text-gray-800 leading-relaxed">{sit.text}</p>
              </div>

              {sit.keywords && sit.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-7">
                  {sit.keywords.map((kw) => (
                    <span key={kw} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm">{kw}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 ml-7 flex-wrap">
                <p className="text-xs text-gray-500 shrink-0">Annonce :</p>
                <div className="flex flex-wrap gap-1.5">
                  {/* Bouton 0 = aucune annonce */}
                  <button onClick={() => handleSelect(sit.number, "0")} disabled={answered}
                    className={cn(
                      "h-7 w-7 rounded-md text-xs font-black border transition-all",
                      selected === "0" && !answered && "bg-gray-900 text-white border-gray-900",
                      answered && sit.correctAnswer === "0" && "bg-emerald-500 text-white border-emerald-500",
                      answered && selected === "0" && sit.correctAnswer !== "0" && "bg-red-400 text-white border-red-400",
                      selected !== "0" && !answered && "bg-white text-gray-400 border-gray-200 hover:border-gray-400",
                      answered && "0" !== sit.correctAnswer && selected !== "0" && "opacity-25 bg-white text-gray-400 border-gray-200",
                    )}>
                    0
                  </button>
                  {letters.map((letter) => (
                    <button key={letter} onClick={() => handleSelect(sit.number, letter)} disabled={answered}
                      className={cn(
                        "h-7 w-7 rounded-md text-xs font-black border transition-all",
                        selected === letter && !answered && "bg-gray-900 text-white border-gray-900",
                        answered && sit.correctAnswer === letter && "bg-emerald-500 text-white border-emerald-500",
                        answered && selected === letter && sit.correctAnswer !== letter && "bg-red-400 text-white border-red-400",
                        selected !== letter && !answered && "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                        answered && letter !== sit.correctAnswer && selected !== letter && "opacity-25 bg-white text-gray-400 border-gray-200",
                      )}>
                      {letter}
                    </button>
                  ))}
                </div>
                {answered && (
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    {noAnswerKnown ? (
                      <span className="text-xs text-gray-400 italic">Réponse non disponible</span>
                    ) : isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <><XCircle className="h-4 w-4 text-red-400" /><span className="text-xs text-red-500">→ {sit.correctAnswer}</span></>
                    )}
                  </div>
                )}
              </div>

              {answered && sit.pedagogicalHint && (
                <p className="text-xs text-blue-600 italic ml-7">{sit.pedagogicalHint}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
