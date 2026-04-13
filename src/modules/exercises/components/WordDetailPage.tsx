"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Volume2, BookOpen, Lightbulb } from "lucide-react";
import { useCallback } from "react";
import type { getWordDetail } from "../server/vocabulary.actions";

type WordDetail = Awaited<ReturnType<typeof getWordDetail>>;

function highlightWord(sentence: string, word: string) {
  const regex = new RegExp(`(${word}\\w*)`, "gi");
  const parts = sentence.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <strong key={i} className="text-gray-900 font-bold">{part}</strong>
      : <span key={i}>{part}</span>
  );
}

const masteryConfig = {
  new:      { label: "Nouveau",  color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  learning: { label: "En cours", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  mastered: { label: "Maîtrisé", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.06 } }),
};

export function WordDetailPage({ data }: { data: WordDetail }) {
  const m = masteryConfig[data.mastery as keyof typeof masteryConfig];

  const speak = useCallback(() => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(data.article ? `${data.article} ${data.word}` : data.word);
    utt.lang = "de-DE";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find((v) => v.lang.startsWith("de"));
    if (deVoice) utt.voice = deVoice;
    window.speechSynthesis.speak(utt);
  }, [data.word, data.article]);

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">

      {/* Back */}
      <Link href="/vocabulary" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Vocabulaire
      </Link>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">

        {/* Word + meta */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              {data.article && (
                <span className="text-lg text-gray-400 font-normal">{data.article}</span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 font-heading">{data.word}</h1>
              <button onClick={speak} className="text-gray-300 hover:text-gray-600 transition-colors ml-1" title="Écouter la prononciation">
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-400">{data.wordType}</span>
              {data.plural && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">Pl. <span className="font-medium text-gray-600">{data.plural}</span></span>
                </>
              )}
              <span className="text-gray-200">·</span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-sm">{data.level}</span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-sm border shrink-0 ${m.bg} ${m.color} ${m.border}`}>
            {m.label}
          </span>
        </div>

        {/* Traduction */}
        <div className="flex items-center gap-2 py-2 border-t border-gray-50">
          <span className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider w-16 shrink-0">FR</span>
          <p className="text-base font-semibold text-gray-700">{data.translation}</p>
        </div>

        {/* Définition en allemand */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Définition</span>
            </div>
            <button
              onClick={() => {
                if (!("speechSynthesis" in window)) return;
                window.speechSynthesis.cancel();
                const utt = new SpeechSynthesisUtterance(data.definitionDe);
                utt.lang = "de-DE";
                utt.rate = 0.85;
                const voices = window.speechSynthesis.getVoices();
                const deVoice = voices.find((v) => v.lang.startsWith("de"));
                if (deVoice) utt.voice = deVoice;
                window.speechSynthesis.speak(utt);
              }}
              className="text-gray-300 hover:text-gray-600 transition-colors"
              title="Écouter la définition"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-md p-4 space-y-2">
            <p className="text-sm text-gray-900 leading-relaxed font-medium">{data.definitionDe}</p>
            <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{data.definitionFr}</p>
          </div>
        </div>

        {/* Astuce */}
        {data.tip && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-md p-3">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">{data.tip}</p>
          </div>
        )}
      </motion.div>

      {/* Synonymes + Antonymes */}
      {(data.allSynonyms.length > 0 || data.antonyms.length > 0) && (
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-3">
          {data.allSynonyms.length > 0 && (
            <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Synonymes</p>
              <div className="flex flex-wrap gap-1.5">
                {data.allSynonyms.map((s) => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.antonyms.length > 0 && (
            <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Antonymes</p>
              <div className="flex flex-wrap gap-1.5">
                {data.antonyms.map((a) => (
                  <span key={a} className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 10 phrases */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="space-y-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          10 phrases d&apos;exemple
        </p>
        <div className="space-y-2.5">
          {data.sentences.map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-white border border-gray-200/70 rounded-md p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-gray-900 leading-relaxed font-medium flex-1">
                  {highlightWord(s.de, data.word)}
                </p>
                <button
                  onClick={() => {
                    if (!("speechSynthesis" in window)) return;
                    window.speechSynthesis.cancel();
                    const utt = new SpeechSynthesisUtterance(s.de);
                    utt.lang = "de-DE";
                    utt.rate = 0.85;
                    const voices = window.speechSynthesis.getVoices();
                    const deVoice = voices.find((v) => v.lang.startsWith("de"));
                    if (deVoice) utt.voice = deVoice;
                    window.speechSynthesis.speak(utt);
                  }}
                  className="text-gray-200 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-gray-50 pt-2">
                <p className="text-xs text-gray-400 italic flex-1">{s.fr}</p>
                <span className="text-[9px] text-gray-300 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-sm">{s.context}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SM-2 info */}
      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-gray-50 border border-gray-100 rounded-md p-4 flex items-center justify-between text-xs text-gray-400">
        <span>{data.repetitions} répétition{data.repetitions > 1 ? "s" : ""}</span>
        <span>Prochain rappel dans {data.interval} jour{data.interval > 1 ? "s" : ""}</span>
        <Link href="/review" className="text-gray-600 font-medium hover:text-gray-900 transition-colors">
          Réviser maintenant →
        </Link>
      </motion.div>
    </div>
  );
}
