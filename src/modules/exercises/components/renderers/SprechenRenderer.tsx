"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  Mic,
  Square,
  Volume2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTTS, EL_VOICES, CEFR_RATE } from "@/lib/tts";
import { evalSpeakingResponse } from "../../server/speaking.actions";
import type { SpeakingEvalResult } from "../../server/speaking.actions";

// ── STT hook (Speech-to-Text via Web Speech API) ─────────────────────────────

type SpeechRecognitionCtor = new () => {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
};

function getSR(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as Record<string, unknown>).SpeechRecognition ??
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition ??
    null
  ) as SpeechRecognitionCtor | null;
}

function useSTT(onResult: (text: string) => void) {
  const [isListening,  setIsListening]  = useState(false);
  const [isSupported,  setIsSupported]  = useState(false);
  const recRef = useRef<{ stop(): void } | null>(null);

  useEffect(() => { setIsSupported(!!getSR()); }, []);

  const start = useCallback(() => {
    const SR = getSR();
    if (!SR) return;
    const rec = new SR();
    rec.lang            = "de-DE";
    rec.continuous      = false;
    rec.interimResults  = false;
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      if (t) onResult(t);
    };
    rec.onend   = () => setIsListening(false);
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
  level?: string;
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
  onAnswer: (score: number, quality: number, feedback?: string) => void;
  answered: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

export function SprechenRenderer({ exercise, onAnswer, answered }: Props) {
  const [response,    setResponse]    = useState("");
  const [showVocab,   setShowVocab]   = useState(false);
  const [evalResult,  setEvalResult]  = useState<SpeakingEvalResult | null>(null);
  const [isPending,   startTransition] = useTransition();

  const phrases    = exercise.targetPhrases ?? [];
  const vocab      = exercise.keyVocabulary ?? [];
  const objectives = exercise.objectives    ?? [];
  const level      = exercise.level         ?? "B1";

  const tts = useTTS();

  // ── Auto-play AI opener on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!exercise.aiOpener) return;
    const t = setTimeout(() => {
      tts.play(exercise.aiOpener!, {
        voiceId:      EL_VOICES.ai,
        playbackRate: CEFR_RATE[level] ?? 1.0,
      });
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── STT ───────────────────────────────────────────────────────────────────
  const handleTranscript = useCallback((text: string) => {
    setResponse((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const { isListening, isSupported, start, stop } = useSTT(handleTranscript);

  // ── Submit → AI evaluation ────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!response.trim() || isPending) return;

    startTransition(async () => {
      try {
        const result = await evalSpeakingResponse({
          scenario:      exercise.scenario,
          aiRole:        exercise.aiRole,
          userRole:      exercise.userRole,
          transcription: response,
          level: level as "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        });

        setEvalResult(result);

        // Build compact feedback string for ExerciseRenderer feedback panel
        const parts = [
          result.encouragement,
          result.grammarNotes.length        ? `Grammaire : ${result.grammarNotes.join(" | ")}`       : null,
          result.pronunciationTips.length   ? `Prononciation : ${result.pronunciationTips.join(" | ")}` : null,
          result.vocabularySuggestions.length ? `Vocabulaire : ${result.vocabularySuggestions.join(" | ")}` : null,
        ].filter(Boolean).join("\n");

        const quality = result.score >= 80 ? 5 : result.score >= 60 ? 4 : result.score >= 40 ? 3 : 2;
        onAnswer(result.score, quality, parts);
      } catch {
        // Graceful fallback if AI evaluation unavailable
        const wordCount = response.trim().split(/\s+/).length;
        const score     = wordCount >= 20 ? 80 : wordCount >= 10 ? 60 : 35;
        onAnswer(score, score >= 70 ? 4 : 3, "Réponse enregistrée.");
      }
    });
  };

  return (
    <div className="space-y-4">

      {/* ── Scenario card ─────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Situation
        </p>
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
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Objectifs
            </p>
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-gray-400 font-bold shrink-0">{i + 1}.</span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI opener bubble ──────────────────────────────────────────────── */}
      {exercise.aiOpener && (
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 flex-1">
            <p className="text-sm text-blue-900 font-medium">{exercise.aiOpener}</p>
            <button
              onClick={() =>
                tts.play(exercise.aiOpener!, {
                  voiceId:      EL_VOICES.ai,
                  playbackRate: CEFR_RATE[level] ?? 1.0,
                })
              }
              disabled={tts.isLoading || tts.isPlaying}
              className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              <Volume2 className="h-3 w-3" />
              {tts.isLoading ? "Chargement…" : tts.isPlaying ? "Lecture…" : "Réécouter"}
            </button>
          </div>
        </div>
      )}

      {/* ── User response ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <div className="h-7 w-7 rounded-md bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5 text-emerald-600" />
        </div>

        <div className="flex-1 space-y-2">

          {/* Prominent mic button — primary call-to-action */}
          {isSupported && !answered && (
            <button
              onClick={isListening ? stop : start}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-md border-2 font-medium text-sm transition-all",
                isListening
                  ? "border-red-400 bg-red-50 text-red-700 hover:bg-red-100"
                  : "border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
              )}
            >
              {isListening ? (
                <>
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
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Arrêter l&apos;enregistrement
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Parler en allemand
                </>
              )}
            </button>
          )}

          {/* Text area — secondary (keyboard input or STT result) */}
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={answered || isPending}
            placeholder={
              isSupported
                ? "Ta réponse apparaîtra ici après le micro, ou écris directement…"
                : "Écris ta réponse en allemand…"
            }
            rows={3}
            className={cn(
              "w-full px-4 py-3 border rounded-md text-sm text-gray-900 placeholder:text-gray-300 resize-none",
              "focus:outline-none focus:ring-1 transition-all",
              answered || isPending
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-70"
                : isListening
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-200 bg-white focus:border-gray-400 focus:ring-gray-300"
            )}
          />

          {/* Suggested phrases */}
          {phrases.length > 0 && !answered && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] text-gray-400 self-center">Phrases utiles :</span>
              {phrases.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setResponse((prev) => (prev ? `${prev} ${p}` : p))}
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

      {/* ── Key vocabulary toggle ─────────────────────────────────────────── */}
      {vocab.length > 0 && (
        <div>
          <button
            onClick={() => setShowVocab((v) => !v)}
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
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-md px-3 py-2"
                  >
                    <span className="text-sm font-medium text-gray-800">{v.word}</span>
                    <span className="text-xs text-gray-400">{v.translation}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Submit button ─────────────────────────────────────────────────── */}
      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={!response.trim() || isListening || isPending}
          className={cn(
            "h-10 px-6 text-sm font-semibold rounded-md transition-all flex items-center gap-2",
            response.trim() && !isListening && !isPending
              ? "bg-gray-900 hover:bg-gray-800 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Évaluation IA en cours…</>
          ) : (
            "Valider ma réponse"
          )}
        </button>
      )}

      {/* ── Rich AI feedback (shown after evaluation, before ExerciseRenderer panel) */}
      {answered && evalResult && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2.5"
        >
          {/* Submitted response */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              Ta réponse
            </p>
            <p className="text-sm text-gray-700 italic">&ldquo;{response}&rdquo;</p>
          </div>

          {/* Pronunciation */}
          {evalResult.pronunciationTips.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 space-y-1">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                Prononciation
              </p>
              {evalResult.pronunciationTips.map((tip, i) => (
                <p key={i} className="text-xs text-blue-700">· {tip}</p>
              ))}
            </div>
          )}

          {/* Grammar */}
          {evalResult.grammarNotes.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-md p-3 space-y-1">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                Grammaire
              </p>
              {evalResult.grammarNotes.map((note, i) => (
                <p key={i} className="text-xs text-amber-700">· {note}</p>
              ))}
            </div>
          )}

          {/* Vocabulary suggestions */}
          {evalResult.vocabularySuggestions.length > 0 && (
            <div className="bg-purple-50 border border-purple-100 rounded-md p-3 space-y-1">
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider">
                Vocabulaire
              </p>
              {evalResult.vocabularySuggestions.map((sug, i) => (
                <p key={i} className="text-xs text-purple-700">· {sug}</p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
