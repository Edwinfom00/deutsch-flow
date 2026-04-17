"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupWord } from "@/data/german-dictionary";
import { cn } from "@/lib/utils";

const ARTICLE_COLORS = {
  der: "text-blue-600 bg-blue-50 border-blue-200",
  die: "text-red-600 bg-red-50 border-red-200",
  das: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const TYPE_LABELS: Record<string, string> = {
  Nomen: "Nom",
  Verb: "Verbe",
  Adjektiv: "Adjectif",
  Adverb: "Adverbe",
  Präposition: "Préposition",
  Konjunktion: "Conjonction",
  Phrase: "Expression",
};

interface PopoverProps {
  word: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

function WordPopover({ word, anchorRect, onClose }: PopoverProps) {
  const entry = lookupWord(word);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  if (!entry) return null;

  const top = anchorRect.bottom + window.scrollY + 6;
  const left = Math.max(8, Math.min(anchorRect.left + window.scrollX, window.innerWidth - 220));

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.12 }}
      style={{ position: "absolute", top, left, zIndex: 50, width: 200 }}
      className="bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
    >
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.article && (
            <span className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-sm border",
              ARTICLE_COLORS[entry.article]
            )}>
              {entry.article}
            </span>
          )}
          <span className="text-sm font-bold text-gray-900">{word}</span>
          <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-sm ml-auto">
            {TYPE_LABELS[entry.type] ?? entry.type}
          </span>
        </div>
        <p className="text-xs text-gray-600 font-medium">{entry.translation}</p>
      </div>
    </motion.div>
  );
}

interface ClickableTextProps {
  text: string;
  className?: string;
}

export function ClickableText({ text, className }: ClickableTextProps) {
  const [activeWord, setActiveWord] = useState<{ word: string; rect: DOMRect } | null>(null);

  const tokenize = (input: string): Array<{ token: string; isWord: boolean }> => {
    const parts = input.split(/(\s+|[.,;:!?()[\]{}«»"'„"–—…])/);
    return parts.map((p) => ({
      token: p,
      isWord: /^[A-Za-zÄÖÜäöüß]{2,}$/.test(p),
    }));
  };

  const tokens = tokenize(text);

  const handleClick = (token: string, e: React.MouseEvent<HTMLSpanElement>) => {
    const entry = lookupWord(token);
    if (!entry) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    if (activeWord?.word === token) {
      setActiveWord(null);
    } else {
      setActiveWord({ word: token, rect });
    }
  };

  return (
    <span className={cn("relative", className)}>
      {tokens.map((t, i) => {
        if (!t.isWord) return <span key={i}>{t.token}</span>;
        const known = !!lookupWord(t.token);
        const isActive = activeWord?.word === t.token;
        return (
          <span
            key={i}
            onClick={known ? (e) => handleClick(t.token, e) : undefined}
            className={cn(
              known && "cursor-pointer rounded-sm transition-colors",
              known && !isActive && "underline decoration-dotted decoration-gray-300 hover:decoration-gray-500 hover:bg-gray-50",
              known && isActive && "bg-amber-100 underline decoration-amber-400"
            )}
          >
            {t.token}
          </span>
        );
      })}
      <AnimatePresence>
        {activeWord && (
          <WordPopover
            word={activeWord.word}
            anchorRect={activeWord.rect}
            onClose={() => setActiveWord(null)}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
