"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Text {
  number: number;
  content: string;
  source?: string;
  correctAnswer: string;
  hint?: string;
}

interface Headline {
  letter: string;
  text: string;
}

interface MatchingHeadlinesExercise {
  type: string;
  instructions: string;
  texts: Text[];
  headlines: Headline[];
  timeLimit?: number;
  maxPoints?: number;
}

interface Props {
  exercise: MatchingHeadlinesExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function MatchingHeadlinesRenderer({ exercise, onAnswer, answered }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (textNumber: number, letter: string) => {
    if (answered) return;
    const next = { ...answers, [textNumber]: letter };
    setAnswers(next);

    if (Object.keys(next).length === exercise.texts.length) {
      const correct = exercise.texts.filter((t) => next[t.number] === t.correctAnswer).length;
      const score = Math.round((correct / exercise.texts.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-5">
      {/* Timer info */}
      {exercise.timeLimit && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>Temps recommandé : {Math.round(exercise.timeLimit / 60)} min</span>
          {exercise.maxPoints && <span className="ml-2">· {exercise.maxPoints} points</span>}
        </div>
      )}

      {/* Headlines palette */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Titres disponibles</p>
        <div className="flex flex-wrap gap-2">
          {exercise.headlines?.map((h) => (
            <div key={h.letter} className="flex items-start gap-2 bg-white border border-gray-200 rounded-md px-3 py-2 text-sm">
              <span className="font-black text-gray-900 shrink-0">{h.letter}</span>
              <span className="text-gray-700">{h.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Texts */}
      <div className="space-y-3">
        {exercise.texts.map((text, i) => {
          const selected = answers[text.number];
          const isCorrect = answered && selected === text.correctAnswer;
          const isWrong = answered && selected && selected !== text.correctAnswer;

          return (
            <motion.div key={`text-${text.number}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "border rounded-md overflow-hidden",
                isCorrect && "border-emerald-300",
                isWrong && "border-red-200",
                !answered && "border-gray-200"
              )}>
              {/* Text header */}
              <div className="flex items-start gap-3 p-4 bg-white">
                <span className="h-6 w-6 rounded-md bg-gray-900 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {text.number}
                </span>
                <div className="flex-1 min-w-0">
                  {text.source && <p className="text-[10px] text-gray-400 italic mb-1">{text.source}</p>}
                  <p className="text-sm text-gray-800 leading-relaxed">{text.content}</p>
                </div>
              </div>

              {/* Answer selector */}
              <div className={cn("px-4 py-3 border-t flex items-center gap-3",
                isCorrect ? "bg-emerald-50 border-emerald-200" :
                isWrong ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100")}>
                <p className="text-xs text-gray-500 shrink-0">Titre :</p>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.headlines?.map((h) => (
                    <button key={`btn-${text.number}-${h.letter}`} onClick={() => handleSelect(text.number, h.letter)}
                      disabled={answered}
                      className={cn(
                        "h-7 w-7 rounded-md text-xs font-black border transition-all",
                        selected === h.letter && !answered && "bg-gray-900 text-white border-gray-900",
                        answered && h.letter === text.correctAnswer && "bg-emerald-500 text-white border-emerald-500",
                        answered && selected === h.letter && h.letter !== text.correctAnswer && "bg-red-400 text-white border-red-400",
                        selected !== h.letter && !answered && "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                        answered && h.letter !== text.correctAnswer && selected !== h.letter && "opacity-30 bg-white text-gray-400 border-gray-200",
                      )}>
                      {h.letter}
                    </button>
                  ))}
                </div>
                {answered && (
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    {isCorrect
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <><XCircle className="h-4 w-4 text-red-400" /><span className="text-xs text-red-500">→ {text.correctAnswer}</span></>
                    }
                  </div>
                )}
              </div>

              {/* Hint after answer */}
              {answered && text.hint && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                  <p className="text-xs text-blue-600">{text.hint}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
