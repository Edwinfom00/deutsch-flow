"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option { A: string; B: string; C: string }
interface Question {
  number: number;
  questionText: string;
  options: Option;
  correctAnswer: "A" | "B" | "C";
  explanation?: string;
  hint?: string;
}
interface Example {
  number: number;
  questionText: string;
  options: Option;
  correctAnswer: string;
  explanation?: string;
}

interface MultipleChoiceReadingExercise {
  type: string;
  instructions: string;
  readingText?: string | {
    title?: string;
    subtitle?: string;
    source?: string;
    content?: string;
    glossary?: string;
  };
  questions: Question[];
  example?: Example;
  timeLimit?: number;
  maxPoints?: number;
}

interface Props {
  exercise: MultipleChoiceReadingExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function MultipleChoiceReadingRenderer({ exercise, onAnswer, answered }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showText, setShowText] = useState(true);

  const handleSelect = (qNum: number, opt: string) => {
    if (answered) return;
    const next = { ...answers, [qNum]: opt };
    setAnswers(next);
    if (Object.keys(next).length === exercise.questions.length) {
      const correct = exercise.questions.filter((q) => next[q.number] === q.correctAnswer).length;
      const score = Math.round((correct / exercise.questions.length) * 100);
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

      {/* Texte de lecture */}
      {exercise.readingText && (
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <button onClick={() => setShowText(!showText)}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <BookOpen className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-600">
              {typeof exercise.readingText === "object" && exercise.readingText.title
                ? exercise.readingText.title
                : "Texte de lecture"}
            </span>
            {typeof exercise.readingText === "object" && exercise.readingText.source && (
              <span className="text-[10px] text-gray-400 italic ml-1">— {exercise.readingText.source}</span>
            )}
            <span className="ml-auto text-[10px] text-gray-400">{showText ? "Masquer" : "Afficher"}</span>
          </button>
          {showText && (
            <div className="p-4 max-h-72 overflow-y-auto space-y-3">
              {typeof exercise.readingText === "string" ? (
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{exercise.readingText}</p>
              ) : (
                <>
                  {exercise.readingText.subtitle && (
                    <p className="text-xs font-semibold text-gray-500 italic">{exercise.readingText.subtitle}</p>
                  )}
                  {exercise.readingText.content && (
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{exercise.readingText.content}</p>
                  )}
                  {exercise.readingText.glossary && (
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Glossaire</p>
                      {Array.isArray(exercise.readingText.glossary) ? (
                        <div className="grid grid-cols-2 gap-1">
                          {(exercise.readingText.glossary as Array<{ word: string; translation: string }>).map((g, i) => (
                            <div key={`gloss-${i}-${g.word}`} className="flex items-start gap-1.5 text-xs">
                              <span className="font-semibold text-gray-700 shrink-0">{g.word}</span>
                              <span className="text-gray-400">— {g.translation}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 leading-relaxed">{String(exercise.readingText.glossary)}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Exemple */}
      {exercise.example && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3.5 space-y-2">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Exemple (Bsp. {exercise.example.number})</p>
          <p className="text-sm text-blue-900 font-medium">{exercise.example.questionText}</p>
          <div className="flex gap-2">
            {(["A","B","C"] as const).map((opt) => (
              <div key={`ex-opt-${opt}`} className={cn(
                "flex items-start gap-1.5 px-2.5 py-1.5 rounded-md border text-xs",
                opt === exercise.example!.correctAnswer
                  ? "border-blue-400 bg-blue-100 text-blue-800 font-semibold"
                  : "border-blue-200 text-blue-600 opacity-60"
              )}>
                <span className="font-black shrink-0">{opt}</span>
                <span>{exercise.example!.options[opt]}</span>
              </div>
            ))}
          </div>
          {exercise.example.explanation && (
            <p className="text-[11px] text-blue-600 italic">{exercise.example.explanation}</p>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {exercise.questions.map((q, i) => {
          const selected = answers[q.number];
          const isCorrect = answered && selected === q.correctAnswer;
          const isWrong = answered && selected && selected !== q.correctAnswer;

          return (
            <motion.div key={`q-${q.number}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn("border rounded-md p-4 space-y-3",
                isCorrect && "border-emerald-200 bg-emerald-50",
                isWrong && "border-red-200 bg-red-50",
                !answered && "border-gray-200 bg-white")}>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-sm bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {q.number}
                </span>
                <p className="text-sm font-medium text-gray-900">{q.questionText}</p>
              </div>

              <div className="space-y-1.5">
                {(["A","B","C"] as const).map((opt) => {
                  const isSelected = selected === opt;
                  const isRight = answered && q.correctAnswer === opt;
                  const isSelectedWrong = answered && isSelected && opt !== q.correctAnswer;
                  return (
                    <button key={opt} onClick={() => handleSelect(q.number, opt)} disabled={answered}
                      className={cn(
                        "w-full flex items-start gap-2.5 p-2.5 rounded-md border text-left text-sm transition-all",
                        !answered && !isSelected && "border-gray-200 bg-white hover:border-gray-300",
                        !answered && isSelected && "border-blue-400 bg-blue-50",
                        isRight && "border-emerald-400 bg-emerald-50",
                        isSelectedWrong && "border-red-300 bg-red-50",
                        answered && !isSelected && !isRight && "opacity-40 border-gray-100 bg-gray-50",
                      )}>
                      <span className={cn(
                        "h-5 w-5 rounded-sm flex items-center justify-center text-[10px] font-black shrink-0",
                        !isSelected && !answered && "bg-gray-100 text-gray-500",
                        !answered && isSelected && "bg-blue-500 text-white",
                        isRight && "bg-emerald-500 text-white",
                        isSelectedWrong && "bg-red-400 text-white",
                      )}>{opt}</span>
                      <span className={cn(isRight ? "text-emerald-800 font-medium" : isSelectedWrong ? "text-red-700" : "text-gray-700")}>
                        {q.options[opt]}
                      </span>
                      {isRight && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />}
                      {isSelectedWrong && <XCircle className="h-4 w-4 text-red-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {answered && q.explanation && (
                <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">{q.explanation}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
