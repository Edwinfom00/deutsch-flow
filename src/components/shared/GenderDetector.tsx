"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GERMAN_DICT } from "@/data/german-dictionary";
import { cn } from "@/lib/utils";

const ARTICLE_STYLE = {
  der: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", label: "der — masculin" },
  die: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", label: "die — féminin" },
  das: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", label: "das — neutre" },
};

function detectArticle(word: string): "der" | "die" | "das" | null {
  if (!word || word.length < 2) return null;
  const trimmed = word.trim().replace(/[.,;:!?()]/g, "");
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  const entry = GERMAN_DICT[capitalized] ?? GERMAN_DICT[trimmed];
  return entry?.article ?? null;
}

function getLastCapitalizedWord(text: string): string | null {
  const words = text.split(/\s+/);
  const last = words[words.length - 1];
  if (!last) return null;
  const clean = last.replace(/[.,;:!?()]/g, "");
  if (clean.length < 2) return null;
  if (clean[0] === clean[0].toUpperCase() && clean[0] !== clean[0].toLowerCase()) return clean;
  return null;
}

interface Props {
  text: string;
  className?: string;
}

export function GenderDetector({ text, className }: Props) {
  const [detected, setDetected] = useState<{ word: string; article: "der" | "die" | "das" } | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const word = getLastCapitalizedWord(text);
      if (!word) { setVisible(false); return; }
      const article = detectArticle(word);
      if (article) {
        setDetected({ word, article });
        setVisible(true);
      } else {
        setVisible(false);
      }
    }, 400);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text]);

  const style = detected ? ARTICLE_STYLE[detected.article] : null;

  return (
    <AnimatePresence>
      {visible && detected && style && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold",
            style.bg, style.border, style.text, className
          )}
        >
          <span className="font-black">{detected.article}</span>
          <span className="font-normal opacity-70">{detected.word}</span>
          <span className="text-[9px] opacity-50 font-normal">·</span>
          <span className="text-[10px] font-normal opacity-70">{style.label.split(" — ")[1]}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
