"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, BookMarked } from "lucide-react";

type WordEntry = {
  word: string;
  article: string | null;
  translation: string;
  exampleDe: string;
  exampleFr: string;
  wordType: string;
  tip: string | null;
  level: string;
};

interface Props {
  word: WordEntry;
}

export function WordOfDayWidget({ word }: Props) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip when word changes (new day)
  useEffect(() => setFlipped(false), [word.word]);

  const speakWord = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(word.article ? `${word.article} ${word.word}` : word.word);
    utt.lang = "de-DE";
    utt.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 text-white rounded-md p-4 relative overflow-hidden"
    >
      {/* Decorative bg circle */}
      <div className="absolute -top-6 -right-6 h-24 w-24 bg-white/5 rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 h-20 w-20 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <BookMarked className="h-3.5 w-3.5 text-white/40" />
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Mot du jour</p>
          </div>
          <span className="text-[9px] font-bold text-white/30 bg-white/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
            {word.level} · {word.wordType}
          </span>
        </div>

        <div
          className="cursor-pointer select-none"
          onClick={() => setFlipped((v) => !v)}
        >
          <motion.div
            key={flipped ? "fr" : "de"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!flipped ? (
              <>
                <div className="flex items-baseline gap-2 mb-1">
                  {word.article && (
                    <span className="text-[13px] text-white/50 font-medium">{word.article}</span>
                  )}
                  <span className="text-2xl font-bold font-heading leading-none">{word.word}</span>
                </div>
                <p className="text-[11px] text-white/50 mt-1">
                  Appuie pour voir la traduction
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-emerald-400 leading-tight">{word.translation}</p>
                <p className="text-[11px] text-white/50 mt-1">
                  Appuie pour voir l'allemand
                </p>
              </>
            )}
          </motion.div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
          <p className="text-[12px] text-white/80 italic leading-snug">„{word.exampleDe}"</p>
          <p className="text-[11px] text-white/40 leading-snug">{word.exampleFr}</p>
        </div>

        {word.tip && (
          <p className="mt-2.5 text-[10px] text-white/50 leading-snug">
            💡 {word.tip}
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); speakWord(); }}
          className="mt-3 flex items-center gap-1 text-[10px] text-white/40 hover:text-white/70 transition-colors"
        >
          <Volume2 className="h-3 w-3" />
          Écouter la prononciation
        </button>
      </div>
    </motion.div>
  );
}
