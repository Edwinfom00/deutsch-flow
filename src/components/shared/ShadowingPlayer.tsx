"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, MicOff, RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  lang?: string;
  onComplete?: (attempts: number) => void;
}

function Waveform({ active, color }: { active: boolean; color: string }) {
  const bars = [3, 6, 10, 14, 10, 6, 3, 5, 9, 13, 9, 5, 3];
  return (
    <div className="flex items-end gap-0.5 h-5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className={cn("w-0.5 rounded-full", color)}
          animate={active ? { height: [`${h}px`, "16px", `${h}px`] } : { height: "3px" }}
          transition={{ duration: 0.4 + i * 0.03, repeat: active ? Infinity : 0, delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}

export function ShadowingPlayer({ text, lang = "de-DE", onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "playing" | "recording" | "done">("idle");
  const [attempts, setAttempts] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.82;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    setPhase("playing");
    utt.onend = () => setPhase("idle");
    window.speechSynthesis.speak(utt);
  }, [text, lang]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      setRecordingTime(0);
      setPhase("recording");
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      mr.start();
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setAttempts((a) => {
          const next = a + 1;
          if (next >= 3) { setPhase("done"); onComplete?.(next); }
          else setPhase("idle");
          return next;
        });
      };
    } catch {
      setPhase("idle");
    }
  }, [onComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
  }, []);

  const reset = () => { setPhase("idle"); setAttempts(0); setRecordingTime(0); };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5 text-gray-400" />
          <p className="text-xs font-semibold text-gray-600">Shadowing</p>
          <span className="text-[9px] text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-sm">
            {attempts}/3 répétitions
          </span>
        </div>
        {attempts > 0 && phase !== "done" && (
          <button onClick={reset} className="cursor-pointer text-gray-300 hover:text-gray-500 transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        <p className="text-sm text-gray-800 font-medium leading-relaxed">{text}</p>

        <AnimatePresence mode="wait">
          {phase === "done" ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-semibold">3 répétitions complétées</span>
            </motion.div>
          ) : (
            <motion.div key="controls" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3">
              <button onClick={speak} disabled={phase === "playing" || phase === "recording"}
                className={cn(
                  "cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-all",
                  phase === "playing"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 disabled:opacity-40"
                )}>
                <Volume2 className="h-3.5 w-3.5" />
                {phase === "playing" ? "Écoute…" : "Écouter"}
              </button>

              {phase !== "recording" ? (
                <button onClick={startRecording} disabled={phase === "playing"}
                  className="cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-40">
                  <Mic className="h-3.5 w-3.5" />
                  Répéter
                </button>
              ) : (
                <button onClick={stopRecording}
                  className="cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold bg-red-600 text-white transition-colors">
                  <MicOff className="h-3.5 w-3.5" />
                  Arrêter ({recordingTime}s)
                </button>
              )}

              <Waveform active={phase === "playing" || phase === "recording"}
                color={phase === "recording" ? "bg-red-400" : "bg-blue-400"} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("flex-1 h-1 rounded-sm transition-all duration-300",
              i < attempts ? "bg-emerald-500" : "bg-gray-200")} />
          ))}
        </div>
      </div>
    </div>
  );
}
