"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, MessageSquareQuote, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Phrase {
  phraseDe: string;
  phraseFr: string;
  context: string;
  tip?: string | null;
}

interface Props {
  phrase: Phrase;
}

export function PhraseDuJourWidget({ phrase }: Props) {
  const [revealed, setRevealed] = useState(false);

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(phrase.phraseDe);
    utt.lang = "de-DE";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    window.speechSynthesis.speak(utt);
  }, [phrase.phraseDe]);

  return (
    <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageSquareQuote className="h-3.5 w-3.5 text-violet-500" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Phrase du jour</p>
        </div>
        <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm">
          {phrase.context}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 leading-relaxed flex-1">
            {phrase.phraseDe}
          </p>
          <button
            onClick={speak}
            className="cursor-pointer text-gray-300 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
            title="Écouter"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setRevealed((v) => !v)}
          className="cursor-pointer text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          {revealed ? "Masquer la traduction" : "Voir la traduction"}
        </button>

        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-gray-500 italic"
          >
            {phrase.phraseFr}
          </motion.p>
        )}
      </div>

      {phrase.tip && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">{phrase.tip}</p>
        </div>
      )}
    </div>
  );
}
