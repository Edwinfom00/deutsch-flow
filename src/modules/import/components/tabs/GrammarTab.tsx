"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, Volume2, Lightbulb } from "lucide-react";
import type { getImportedGrammar } from "../../server/import.actions";

type Props = { data: Awaited<ReturnType<typeof getImportedGrammar>> };

type Chapter = {
  title: string;
  rule: string;
  ruleDe: string;
  examples: Array<{ de: string; fr: string; highlight?: string }>;
  tip: string;
};

function speakDE(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "de-DE";
  utt.rate = 0.88;
  const voices = window.speechSynthesis.getVoices();
  const deVoice = voices.find((v) => v.lang.startsWith("de"));
  if (deVoice) utt.voice = deVoice;
  window.speechSynthesis.speak(utt);
}

function ChapterCard({ chapter, index }: { chapter: Chapter; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white border border-gray-200/70 rounded-md overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="h-7 w-7 rounded-md bg-gray-900 flex items-center justify-center shrink-0">
          <span className="text-white text-[10px] font-black">{index + 1}</span>
        </div>
        <p className="flex-1 text-sm font-semibold text-gray-900 truncate">{chapter.title}</p>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 p-4 space-y-4">
              {/* Règle en allemand */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Règle</p>
                  <button onClick={() => speakDE(chapter.ruleDe)}
                    className="text-gray-300 hover:text-gray-600 transition-colors">
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-md p-3.5 space-y-2">
                  <p className="text-sm text-gray-900 font-medium leading-relaxed">{chapter.ruleDe}</p>
                  <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{chapter.rule}</p>
                </div>
              </div>

              {/* Exemples */}
              {chapter.examples?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Exemples</p>
                  <div className="space-y-1.5">
                    {chapter.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 bg-white border border-gray-100 rounded-md px-3 py-2.5">
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-gray-900 font-medium">{ex.de}</p>
                            <button onClick={() => speakDE(ex.de)}
                              className="text-gray-200 hover:text-gray-500 transition-colors shrink-0">
                              <Volume2 className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 italic">{ex.fr}</p>
                        </div>
                        {ex.highlight && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm shrink-0">
                            {ex.highlight}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Astuce */}
              {chapter.tip && (
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-md p-3">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">{chapter.tip}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function GrammarTab({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data[0]?.importId ?? null);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
        <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center mx-auto">
          <BookOpen className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Aucun livre de grammaire importé</p>
        <p className="text-xs text-gray-400">Importe un PDF de grammaire dans l&apos;onglet &ldquo;Importer&rdquo;.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((book, bi) => (
        <div key={book.importId} className="space-y-3">
          {/* Book header */}
          <button
            onClick={() => setExpanded(expanded === book.importId ? null : book.importId)}
            className="w-full flex items-center gap-3 bg-white border border-gray-200/70 rounded-md px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{book.fileName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {book.chapters.length} chapitre{book.chapters.length > 1 ? "s" : ""} · {book.exerciseCount} exercice{book.exerciseCount > 1 ? "s" : ""} · {new Date(book.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
            {expanded === book.importId
              ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
              : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            }
          </button>

          {/* Chapters */}
          <AnimatePresence>
            {expanded === book.importId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2 pl-2"
              >
                {book.summary && (
                  <p className="text-xs text-gray-500 italic px-1 mb-3">{book.summary}</p>
                )}
                {book.chapters.length === 0 ? (
                  <p className="text-xs text-gray-400 px-1">Aucun chapitre extrait.</p>
                ) : (
                  book.chapters.map((chapter, ci) => (
                    <ChapterCard
                      key={ci}
                      chapter={chapter as Chapter}
                      index={ci}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
