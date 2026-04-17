"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GermanKeyboard } from "@/components/ui/german-keyboard";
import { ClickableText } from "@/components/shared/ClickableText";

interface Question {
  number?: number;
  id?: number;
  numero?: number;
  questionText?: string;
  question?: string;
  affirmation?: string;
  sentence?: string;
  options?: Record<string, string>;
  correctAnswer?: string;
  bonne_reponse?: string;
  explanation?: string;
  explication_FR?: string;
}

interface OsdLueckentextExercise {
  type: string;
  instructions?: string;
  consigne_FR?: string;
  texte?: { corps?: string; titre_texte?: string };
  text?: string;
  questions: Question[];
  vocabulaire_cle?: Array<{ mot?: string; word?: string; traduction?: string; translation?: string }>;
  maxPoints?: number;
}

interface Props {
  exercise: OsdLueckentextExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function OsdLueckentextRenderer({ exercise, onAnswer, answered }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showVocab, setShowVocab] = useState(false);
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const questions = exercise.questions ?? [];
  const textContent = exercise.texte?.corps ?? exercise.text ?? "";
  const textTitle = exercise.texte?.titre_texte;

  // Normaliser la clé de réponse correcte (correctAnswer ou bonne_reponse)
  const getCorrect = (q: Question) => q.correctAnswer ?? q.bonne_reponse ?? "";
  // Normaliser la clé de question (questionText, question, affirmation, sentence)
  const getQuestionText = (q: Question) => q.questionText ?? q.question ?? q.affirmation ?? q.sentence ?? "";
  // Normaliser la clé numérique
  const getKey = (q: Question, i: number): string =>
    `q-${q.number ?? q.numero ?? q.id ?? i}`;

  const handleSelect = (key: string, value: string) => {
    if (answered) return;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (Object.keys(next).length === questions.length) {
      const correct = questions.filter((q, i) => {
        const k = getKey(q, i);
        return next[k] === getCorrect(q);
      }).length;
      const score = Math.round((correct / questions.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
    }
  };

  return (
    <div className="space-y-4">
      {/* Texte */}
      {textContent && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
          {textTitle && <p className="text-xs font-semibold text-gray-500 italic">{textTitle}</p>}
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
            <ClickableText text={textContent} />
          </p>
        </div>
      )}

      {/* Vocabulaire clé */}
      {exercise.vocabulaire_cle && exercise.vocabulaire_cle.length > 0 && (
        <div>
          <button onClick={() => setShowVocab(!showVocab)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {showVocab ? "Masquer" : "Voir"} le vocabulaire clé ({exercise.vocabulaire_cle.length} mots)
          </button>
          {showVocab && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {exercise.vocabulaire_cle.map((v, i) => (
                <div key={`vocab-${i}`} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md px-3 py-1.5">
                  <span className="text-xs font-medium text-gray-800">{v.mot ?? v.word}</span>
                  <span className="text-[10px] text-gray-400">{v.traduction ?? v.translation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-2.5">
        {questions.map((q, i) => {
          const key = getKey(q, i);
          const displayNum = q.number ?? q.numero ?? q.id ?? (i + 1);
          const correct = getCorrect(q);
          const questionText = getQuestionText(q);
          const selected = answers[key];
          const isCorrect = answered && selected === correct;
          const isWrong = answered && !!selected && selected !== correct;
          const options = q.options ?? {};
          const explanation = q.explanation ?? (q as { explication_FR?: string }).explication_FR ?? "";

          return (
            <motion.div key={String(key)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn("border rounded-md p-3.5 space-y-2.5",
                isCorrect && "border-emerald-200 bg-emerald-50",
                isWrong && "border-red-200 bg-red-50",
                !answered && "border-gray-200 bg-white")}>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-sm bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {String(displayNum)}
                </span>
                <p className="text-sm text-gray-800">{questionText}</p>
              </div>

              {Object.keys(options).length > 0 ? (
                <div className="flex flex-wrap gap-1.5 ml-7">
                  {Object.entries(options).map(([letter, text]) => {
                    const isSelected = selected === letter;
                    const isRight = answered && correct === letter;
                    const isSelectedWrong = answered && isSelected && letter !== correct;
                    return (
                      <button key={letter} onClick={() => handleSelect(key, letter)} disabled={answered}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-all",
                          !answered && !isSelected && "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                          !answered && isSelected && "border-blue-400 bg-blue-50 text-blue-800",
                          isRight && "border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold",
                          isSelectedWrong && "border-red-300 bg-red-50 text-red-700",
                          answered && !isSelected && !isRight && "opacity-30",
                        )}>
                        <span className="font-black">{letter}</span>
                        <span>{typeof text === "string" ? text : JSON.stringify(text)}</span>
                        {isRight && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {isSelectedWrong && <XCircle className="h-3 w-3 text-red-400" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="ml-7 space-y-1.5">
                  <input type="text" disabled={answered}
                    ref={(el) => { inputRefs.current[key] = el; }}
                    value={selected ?? ""}
                    onChange={(e) => handleSelect(key, e.target.value)}
                    onFocus={() => setFocusedKey(key)}
                    placeholder="Ta réponse…"
                    className={cn(
                      "h-8 px-3 border rounded-md text-sm w-48 focus:outline-none transition-colors",
                      answered && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                      answered && isWrong && "border-red-300 bg-red-50 text-red-700",
                      !answered && "border-gray-200 focus:border-gray-400"
                    )} />
                  {focusedKey === key && (
                    <GermanKeyboard
                      inputRef={{ current: inputRefs.current[key] } as React.RefObject<HTMLInputElement>}
                      value={selected ?? ""}
                      onInsert={(val) => handleSelect(key, val)}
                      disabled={answered}
                    />
                  )}
                </div>
              )}

              {answered && (
                <div className="ml-7 flex items-center gap-2 flex-wrap">
                  {isCorrect
                    ? <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Correct</span>
                    : <span className="text-xs text-red-500 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />Réponse : <strong>{correct}</strong></span>
                  }
                  {explanation && <span className="text-xs text-gray-400 italic">— {explanation}</span>}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
