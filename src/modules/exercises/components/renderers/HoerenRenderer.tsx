"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTTS, EL_VOICES, CEFR_RATE } from "@/lib/tts";

// ─── AudioPlayer ─────────────────────────────────────────────────────────────
// Shared audio player for all Hören exercise types.
//
// Features:
//   • Auto-plays on mount (after 600ms)
//   • Script locked for 12 s — prevents "just read it" cheating
//   • Speed selector: Lent (0.75×) / Normal (1.0×) / Rapide (1.2×)
//     (overrides the level-based default)
//   • Animated waveform while loading/playing
//   • Play counter shown ("écoute 2")

interface AudioPlayerProps {
  script: string;
  level?: string;
}

function AudioPlayer({ script, level }: AudioPlayerProps) {
  const defaultRate   = CEFR_RATE[level ?? "B1"] ?? 1.0;
  const [speed, setSpeed]               = useState<number>(defaultRate);
  const [scriptVisible, setScriptVisible] = useState(false);
  const [scriptLocked, setScriptLocked]   = useState(true);
  const [listenCount, setListenCount]     = useState(0);

  const { isLoading, isPlaying, play, stop } = useTTS();
  const autoPlayedRef = useRef(false);

  // Unlock script after 12 s regardless (prevents permanent lock-out)
  useEffect(() => {
    const t = setTimeout(() => setScriptLocked(false), 12_000);
    return () => clearTimeout(t);
  }, []);

  // Auto-play once on mount
  useEffect(() => {
    if (autoPlayedRef.current) return;
    autoPlayedRef.current = true;
    const t = setTimeout(async () => {
      await play(script, { voiceId: EL_VOICES.hoeren, playbackRate: speed });
      setListenCount((n) => n + 1);
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlayStop = async () => {
    if (isPlaying) {
      stop();
    } else {
      await play(script, { voiceId: EL_VOICES.hoeren, playbackRate: speed });
      setListenCount((n) => n + 1);
      setScriptLocked(false); // unlock after any manual replay too
    }
  };

  const handleSpeedChange = async (newRate: number) => {
    setSpeed(newRate);
    if (isPlaying) {
      stop();
      // Small delay so stop() finishes before play()
      await new Promise((r) => setTimeout(r, 80));
      await play(script, { voiceId: EL_VOICES.hoeren, playbackRate: newRate });
    }
  };

  const speeds = [
    { label: "Lent",   value: 0.75 },
    { label: "Normal", value: 1.0  },
    { label: "Rapide", value: 1.2  },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md overflow-hidden">

      {/* ── Header row ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap">

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-amber-600 shrink-0" />
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Dialogue audio
          </span>
          {listenCount > 0 && (
            <span className="text-[10px] text-amber-500 font-medium tabular-nums">
              · écoute {listenCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 bg-amber-100 rounded-md p-0.5">
            {speeds.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSpeedChange(s.value)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  speed === s.value
                    ? "bg-amber-500 text-white"
                    : "text-amber-600 hover:bg-amber-200"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Script toggle */}
          <button
            onClick={() => { if (!scriptLocked) setScriptVisible((v) => !v); }}
            disabled={scriptLocked}
            title={scriptLocked ? "Écoute d'abord avant de voir le script" : undefined}
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors",
              scriptLocked
                ? "text-amber-300 cursor-not-allowed"
                : "text-amber-600 hover:text-amber-800 hover:bg-amber-100"
            )}
          >
            {scriptVisible
              ? <><EyeOff className="h-3 w-3" /> Masquer</>
              : <><Eye className="h-3 w-3" />{scriptLocked ? "Verrouillé" : "Script"}</>
            }
          </button>

          {/* Play / Stop */}
          <button
            onClick={handlePlayStop}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-semibold transition-all",
              isLoading             && "bg-amber-200 text-amber-600 cursor-wait",
              isPlaying && !isLoading && "bg-amber-200 text-amber-800 hover:bg-amber-300",
              !isPlaying && !isLoading && "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            {isLoading ? (
              <>
                <div className="h-3 w-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Chargement…
              </>
            ) : isPlaying ? (
              <><VolumeX className="h-3.5 w-3.5" /> Arrêter</>
            ) : (
              <><Volume2 className="h-3.5 w-3.5" /> Réécouter</>
            )}
          </button>
        </div>
      </div>

      {/* ── Waveform while playing / loading ─────────────────────────────── */}
      <AnimatePresence>
        {(isPlaying || isLoading) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-amber-100"
          >
            <div className="px-4 py-2 flex items-center gap-2">
              <span className="text-[11px] text-amber-600">
                {isLoading ? "Génération de l'audio ElevenLabs…" : "Lecture en cours…"}
              </span>
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-4">
                  {[3, 5, 9, 14, 9, 5, 3].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-0.5 bg-amber-500 rounded-full"
                      animate={{ height: [`${h}px`, "14px", `${h}px`] }}
                      transition={{
                        duration: 0.5 + i * 0.04,
                        repeat: Infinity,
                        delay: i * 0.08,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Script (unlocked after 12 s or manual replay) ────────────────── */}
      <AnimatePresence>
        {scriptVisible && !scriptLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-200 px-4 py-3">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1.5">
                Transcription
              </p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {script}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Exercise interfaces ──────────────────────────────────────────────────────

interface HoerenMCExercise {
  type: string;
  script: string;
  question: string;
  level?: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation?: string;
}

interface HoerenRFExercise {
  type: string;
  script: string;
  level?: string;
  statements: Array<{ id: string; statement: string; answer: "RICHTIG" | "FALSCH" }>;
}

// ─── HoerenMCRenderer ────────────────────────────────────────────────────────

export function HoerenMCRenderer({
  exercise,
  onAnswer,
  answered,
}: {
  exercise: HoerenMCExercise;
  onAnswer: (s: number, q: number) => void;
  answered: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (answered) return;
    setSelected(id);
    const isCorrect = exercise.options.find((o) => o.id === id)?.isCorrect ?? false;
    onAnswer(isCorrect ? 100 : 0, isCorrect ? 5 : 1);
  };

  return (
    <div className="space-y-4">
      <AudioPlayer script={exercise.script} level={exercise.level} />
      <p className="text-sm font-medium text-gray-900">{exercise.question}</p>
      <div className="space-y-2">
        {exercise.options.map((opt, i) => {
          const isSelected  = selected === opt.id;
          const showResult  = answered && isSelected;
          return (
            <motion.button
              key={opt.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(opt.id)}
              disabled={answered}
              className={cn(
                "w-full flex items-center gap-3 p-3.5 rounded-md border text-left text-sm transition-all",
                !answered                                      && "hover:border-gray-300 hover:bg-gray-50",
                !isSelected && !answered                       && "border-gray-200 bg-white text-gray-700",
                isSelected  && !answered                       && "border-blue-400 bg-blue-50 text-blue-800",
                showResult  &&  opt.isCorrect                  && "border-emerald-400 bg-emerald-50 text-emerald-800",
                showResult  && !opt.isCorrect                  && "border-red-300 bg-red-50 text-red-700",
                answered && !isSelected &&  opt.isCorrect      && "border-emerald-300 bg-emerald-50/50 text-emerald-700",
                answered && !isSelected && !opt.isCorrect      && "border-gray-100 bg-gray-50 text-gray-400",
              )}
            >
              <span className={cn(
                "shrink-0 h-6 w-6 rounded-md border-2 flex items-center justify-center text-[11px] font-bold",
                !isSelected                                    && "border-gray-300 text-gray-400",
                isSelected  && !answered                       && "border-blue-500 bg-blue-500 text-white",
                showResult  &&  opt.isCorrect                  && "border-emerald-500 bg-emerald-500 text-white",
                showResult  && !opt.isCorrect                  && "border-red-400 bg-red-400 text-white",
                answered && !isSelected &&  opt.isCorrect      && "border-emerald-400 bg-emerald-400 text-white",
              )}>
                {opt.id.toUpperCase()}
              </span>
              <span className="flex-1">{opt.text}</span>
              {showResult && opt.isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {answered && exercise.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-md p-3"
        >
          <p className="text-blue-700 text-sm">{exercise.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── HoerenRFRenderer ────────────────────────────────────────────────────────

export function HoerenRFRenderer({
  exercise,
  onAnswer,
  answered,
}: {
  exercise: HoerenRFExercise;
  onAnswer: (s: number, q: number) => void;
  answered: boolean;
}) {
  const [userAnswers, setUserAnswers] = useState<Record<string, "RICHTIG" | "FALSCH">>({});

  const handleSelect = useCallback((id: string, answer: "RICHTIG" | "FALSCH") => {
    if (answered) return;
    const next = { ...userAnswers, [id]: answer };
    setUserAnswers(next);
    if (Object.keys(next).length === exercise.statements.length) {
      const correct = exercise.statements.filter((s) => next[s.id] === s.answer).length;
      const score   = Math.round((correct / exercise.statements.length) * 100);
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : 3);
    }
  }, [answered, userAnswers, exercise.statements, onAnswer]);

  return (
    <div className="space-y-4">
      <AudioPlayer script={exercise.script} level={exercise.level} />
      <div className="space-y-2.5">
        {exercise.statements.map((s, i) => {
          const ua        = userAnswers[s.id];
          const isCorrect = answered && ua === s.answer;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "border rounded-md p-3.5 space-y-2.5",
                answered &&  isCorrect          && "border-emerald-200 bg-emerald-50",
                answered && !isCorrect && ua    && "border-red-200 bg-red-50",
                !answered                       && "border-gray-200 bg-white"
              )}
            >
              <p className="text-sm text-gray-800">{s.statement}</p>
              <div className="flex gap-2">
                {(["RICHTIG", "FALSCH"] as const).map((val) => {
                  const isSelected = ua === val;
                  const isRight    = answered && s.answer === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(s.id, val)}
                      disabled={answered}
                      className={cn(
                        "px-4 py-1.5 rounded-md border text-xs font-semibold transition-all",
                        !isSelected && !answered && "border-gray-200 text-gray-500 hover:border-gray-400",
                        isSelected  && !answered && "border-blue-400 bg-blue-50 text-blue-700",
                        isRight                  && "border-emerald-400 bg-emerald-50 text-emerald-700",
                        answered && isSelected && !isRight && "border-red-300 bg-red-50 text-red-600",
                      )}
                    >
                      {val === "RICHTIG" ? "Richtig" : "Falsch"}
                    </button>
                  );
                })}
              </div>
              {answered && !isCorrect && ua && (
                <p className="text-xs text-amber-600">
                  Bonne réponse : {s.answer === "RICHTIG" ? "Richtig" : "Falsch"}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
