"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function useTTS(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "de-DE";
    utt.rate = 0.88;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    utt.onstart = () => setIsPlaying(true);
    utt.onend = () => setIsPlaying(false);
    utt.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utt);
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return { isPlaying, speak, stop };
}

function AudioPlayer({ script }: { script: string }) {
  const { isPlaying, speak, stop } = useTTS(script);
  const [scriptVisible, setScriptVisible] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Dialogue audio</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setScriptVisible(!scriptVisible)}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors">
            {scriptVisible ? "Masquer" : "Script"}
          </button>
          <button
            onClick={isPlaying ? stop : speak}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold transition-all",
              isPlaying ? "bg-amber-200 text-amber-800 hover:bg-amber-300" : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {isPlaying ? <><VolumeX className="h-3.5 w-3.5" />Arrêter</> : <><Volume2 className="h-3.5 w-3.5" />Écouter</>}
          </button>
        </div>
      </div>

      {isPlaying && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-amber-600">Lecture en cours…</span>
          <div className="flex gap-0.5 items-end h-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div key={i} className="w-0.5 bg-amber-500 rounded-full"
                animate={{ height: ["3px", "14px", "3px"] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
            ))}
          </div>
        </div>
      )}

      {scriptVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-amber-200 pt-3">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{script}</p>
        </motion.div>
      )}
    </div>
  );
}

interface HoerenMCExercise {
  type: string; script: string; question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation?: string;
}
interface HoerenRFExercise {
  type: string; script: string;
  statements: Array<{ id: string; statement: string; answer: "RICHTIG" | "FALSCH" }>;
}

export function HoerenMCRenderer({ exercise, onAnswer, answered }: { exercise: HoerenMCExercise; onAnswer: (s: number, q: number) => void; answered: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    const isCorrect = exercise.options.find((o) => o.id === id)?.isCorrect ?? false;
    onAnswer(isCorrect ? 100 : 0, isCorrect ? 5 : 1);
  };

  return (
    <div className="space-y-4">
      <AudioPlayer script={exercise.script} />
      <p className="text-sm font-medium text-gray-900">{exercise.question}</p>
      <div className="space-y-2">
        {exercise.options.map((opt, i) => {
          const isSelected = selected === opt.id;
          const showResult = answered && isSelected;
          return (
            <motion.button key={opt.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(opt.id)} disabled={answered}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-md border text-left text-sm transition-all",
                !answered && "hover:border-gray-300 hover:bg-gray-50",
                !isSelected && !answered && "border-gray-200 bg-white text-gray-700",
                isSelected && !answered && "border-blue-400 bg-blue-50 text-blue-800",
                showResult && opt.isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                showResult && !opt.isCorrect && "border-red-300 bg-red-50 text-red-700",
                answered && !isSelected && opt.isCorrect && "border-emerald-300 bg-emerald-50/50 text-emerald-700",
                answered && !isSelected && !opt.isCorrect && "border-gray-100 bg-gray-50 text-gray-400",
              )}>
              <span className={cn(
                "shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center text-[11px] font-bold",
                !isSelected && "border-gray-300 text-gray-400",
                isSelected && !answered && "border-blue-500 bg-blue-500 text-white",
                showResult && opt.isCorrect && "border-emerald-500 bg-emerald-500 text-white",
                showResult && !opt.isCorrect && "border-red-400 bg-red-400 text-white",
                answered && !isSelected && opt.isCorrect && "border-emerald-400 bg-emerald-400 text-white",
              )}>{opt.id.toUpperCase()}</span>
              <span className="flex-1">{opt.text}</span>
              {showResult && opt.isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
            </motion.button>
          );
        })}
      </div>
      {answered && exercise.explanation && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-blue-700 text-sm">{exercise.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

export function HoerenRFRenderer({ exercise, onAnswer, answered }: { exercise: HoerenRFExercise; onAnswer: (s: number, q: number) => void; answered: boolean }) {
  const [userAnswers, setUserAnswers] = useState<Record<string, "RICHTIG" | "FALSCH">>({});

  const handleSelect = (id: string, answer: "RICHTIG" | "FALSCH") => {
    if (answered) return;
    const next = { ...userAnswers, [id]: answer };
    setUserAnswers(next);
    if (Object.keys(next).length === exercise.statements.length) {
      const correct = exercise.statements.filter((s) => next[s.id] === s.answer).length;
      const score = Math.round((correct / exercise.statements.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : 3);
    }
  };

  return (
    <div className="space-y-4">
      <AudioPlayer script={exercise.script} />
      <div className="space-y-2.5">
        {exercise.statements.map((s, i) => {
          const ua = userAnswers[s.id];
          const isCorrect = answered && ua === s.answer;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={cn(
                "border rounded-md p-3.5 space-y-2.5",
                answered && isCorrect && "border-emerald-200 bg-emerald-50",
                answered && !isCorrect && ua && "border-red-200 bg-red-50",
                !answered && "border-gray-200 bg-white"
              )}>
              <p className="text-sm text-gray-800">{s.statement}</p>
              <div className="flex gap-2">
                {(["RICHTIG", "FALSCH"] as const).map((val) => {
                  const isSelected = ua === val;
                  const isRight = answered && s.answer === val;
                  return (
                    <button key={val} onClick={() => handleSelect(s.id, val)} disabled={answered}
                      className={cn(
                        "px-4 py-1.5 rounded-md border text-xs font-semibold transition-all",
                        !isSelected && !answered && "border-gray-200 text-gray-500 hover:border-gray-400",
                        isSelected && !answered && "border-blue-400 bg-blue-50 text-blue-700",
                        isRight && "border-emerald-400 bg-emerald-50 text-emerald-700",
                        answered && isSelected && !isRight && "border-red-300 bg-red-50 text-red-600",
                      )}>
                      {val === "RICHTIG" ? "Richtig" : "Falsch"}
                    </button>
                  );
                })}
              </div>
              {answered && !isCorrect && ua && (
                <p className="text-xs text-amber-600">Bonne réponse : {s.answer === "RICHTIG" ? "Richtig" : "Falsch"}</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
