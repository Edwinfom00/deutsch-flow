"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, User, Bot, ChevronDown, ChevronUp, Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Web Speech API STT hook ───────────────────────────────────────────────────
function useSTT(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof window.SpeechRecognition }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "de-DE";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) onResult(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);

    recRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, start, stop };
}

// ─────────────────────────────────────────────────────────────────────────────

interface SprechenExercise {
  type: string;
  scenario: string;
  aiRole: string;
  userRole: string;
  aiOpener?: string;
  targetPhrases?: string[];
  keyVocabulary?: Array<{ word: string; translation: string }>;
  objectives?: string[];
}

interface Props {
  exercise: SprechenExercise;
  onAnswer: (score: number, quality: number) => void;
  answered: boolean;
}

export function SprechenRenderer({ exercise, onAnswer, answered }: Props) {
  const [response, setResponse] = useState("");
  const [showVocab, setShowVocab] = useState(false);

  const phrases = exercise.targetPhrases ?? [];
  const vocab = exercise.keyVocabulary ?? [];
  const objectives = exercise.objectives ?? [];

  const handleTranscript = useCallback((text: string) => {
    setResponse((prev) => prev ? `${prev} ${text}` : text);
  }, []);

  const { isListening, isSupported, start, stop } = useSTT(handleTranscript);

  const handleSubmit = () => {
    if (!response.trim()) return;
    const wordCount = response.trim().split(/\s+/).length;
    const score = wordCount >= 20 ? 85 : wordCount >= 10 ? 65 : 40;
    onAnswer(score, score >= 80 ? 4 : score >= 60 ? 3 : 2);
  };

  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Situation</p>
        <p className="text-sm text-gray-700 leading-relaxed">{exercise.scenario}</p>

        <div className="flex gap-4 pt-1">
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">IA :</span> {exercise.aiRole}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Toi :</span> {exercise.userRole}
            </span>
          </div>
        </div>

        {objectives.length > 0 && (
          <div className="border-t border-gray-200 pt-3 space-y-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Objectifs</p>
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-gray-400 font-bold shrink-0">{i + 1}.</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI opener */}
      {exercise.aiOpener && (
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 flex-1">
            <p className="text-sm text-blue-900 font-medium">{exercise.aiOpener}</p>
          </div>
        </div>
      )}

      {/* User response */}
      <div className="flex gap-3">
        <div className="h-7 w-7 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="relative">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              disabled={answered}
              placeholder="Réponds en allemand… ou utilise le micro"
              rows={3}
              className={cn(
                "w-full px-4 py-3 pr-12 border rounded-md text-sm text-gray-900 placeholder:text-gray-300 resize-none",
                "focus:outline-none focus:ring-1 transition-all",
                isListening && "border-red-300 bg-red-50/30",
                answered ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70" :
                !isListening ? "border-gray-200 bg-white focus:border-gray-400 focus:ring-gray-300" : ""
              )}
            />
            {/* Mic button inside textarea */}
            {isSupported && !answered && (
              <button
                onClick={isListening ? stop : start}
                title={isListening ? "Arrêter l'enregistrement" : "Parler en allemand"}
                className={cn(
                  "absolute right-3 top-3 h-7 w-7 rounded-md flex items-center justify-center transition-all",
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {isListening
                  ? <Square className="h-3 w-3 fill-white" />
                  : <Mic className="h-3.5 w-3.5" />
                }
              </button>
            )}
          </div>

          {/* Recording indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2"
              >
                <div className="flex gap-0.5 items-end h-4">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-red-500 rounded-full"
                      animate={{ height: ["3px", "14px", "3px"] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-red-600 font-medium">Écoute en cours… parle en allemand</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phrases utiles */}
          {phrases.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-gray-400 self-center">Phrases utiles :</span>
              {phrases.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setResponse((prev) => prev ? `${prev} ${p}` : p)}
                  disabled={answered}
                  className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vocabulary toggle */}
      {vocab.length > 0 && (
        <div>
          <button
            onClick={() => setShowVocab(!showVocab)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Vocabulaire clé
            {showVocab ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <AnimatePresence>
            {showVocab && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 grid grid-cols-2 gap-1.5 overflow-hidden"
              >
                {vocab.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
                    <span className="text-sm font-medium text-gray-800">{v.word}</span>
                    <span className="text-xs text-gray-400">{v.translation}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Submit */}
      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={!response.trim() || isListening}
          className={cn(
            "h-9 px-5 text-sm font-medium rounded-md transition-colors",
            response.trim() && !isListening
              ? "bg-gray-900 hover:bg-gray-800 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          Valider ma réponse
        </button>
      )}

      {/* Feedback */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-md p-4"
        >
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Ta réponse</p>
          <p className="text-sm text-gray-700 italic">&ldquo;{response}&rdquo;</p>
        </motion.div>
      )}
    </div>
  );
}
