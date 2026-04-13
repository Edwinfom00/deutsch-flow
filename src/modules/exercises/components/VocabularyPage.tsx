"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, BookOpen, Loader2, RotateCcw, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { generateVocabWords } from "../server/vocabulary.actions";
import { SECTOR_LABELS, SECTOR_ICONS } from "@/types";
import type { Sector, CEFRLevel } from "@/types";
import type { getVocabulary } from "../server/vocabulary.actions";

type Word = Awaited<ReturnType<typeof getVocabulary>>[number];

const masteryConfig = {
  new:      { label: "Nouveau",  color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  learning: { label: "En cours", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  mastered: { label: "Maîtrisé", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

function WordCard({ word }: { word: Word }) {
  const m = masteryConfig[word.mastery as keyof typeof masteryConfig];

  return (
    <Link href={`/vocabulary/${word.exerciseId}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="h-32 bg-white border border-gray-200 rounded-md p-3.5 flex flex-col justify-between hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
            {word.article && (
              <span className="text-gray-400 font-normal text-xs mr-1">{word.article}</span>
            )}
            {word.word}
          </p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 ${m.bg} ${m.color} ${m.border}`}>
            {m.label}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500 truncate">{word.translation}</p>
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex gap-1 min-w-0 overflow-hidden">
              {word.tags.slice(0, 2).map((t) => (
                <span key={t} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-sm truncate max-w-16">{t}</span>
              ))}
            </div>
            <span className="text-[9px] text-gray-300 shrink-0">
              {word.isDue ? "À réviser" : `dans ${word.interval}j`}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function VocabularyPage({ words: initialWords, level, sector }: {
  words: Word[];
  level: string;
  sector: string;
}) {
  const [words] = useState(initialWords);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "due" | "mastered" | "learning" | "new">("all");
  const [generated, setGenerated] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    setIsGenerating(true);
    startTransition(async () => {
      try {
        const count = await generateVocabWords({
          sector: sector as Sector,
          level: level as CEFRLevel,
          count: 5,
        });
        setGenerated((p) => p + count);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const filtered = words.filter((w) => {
    const matchSearch = !search ||
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.translation.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "due" ? w.isDue :
      w.mastery === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: words.length,
    due: words.filter((w) => w.isDue).length,
    learning: words.filter((w) => w.mastery === "learning").length,
    mastered: words.filter((w) => w.mastery === "mastered").length,
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Vocabulaire</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {SECTOR_ICONS[sector as Sector]} {SECTOR_LABELS[sector as Sector]} · Niveau {level}
          </p>
        </div>
        <button onClick={handleGenerate} disabled={isGenerating || isPending}
          className="flex items-center gap-1.5 h-9 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-60 shrink-0">
          {isGenerating || isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Génération…</>
            : <><Plus className="h-3.5 w-3.5" />5 nouveaux mots</>
          }
        </button>
      </motion.div>

      {/* Notification */}
      <AnimatePresence>
        {generated > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500 shrink-0" />
            {generated} mot{generated > 1 ? "s" : ""} ajouté{generated > 1 ? "s" : ""} — recharge la page pour les voir
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total",      value: stats.total,    icon: BookOpen,    color: "text-gray-500",    bg: "bg-gray-100" },
          { label: "À réviser",  value: stats.due,      icon: RotateCcw,   color: "text-red-500",     bg: "bg-red-50" },
          { label: "En cours",   value: stats.learning, icon: TrendingUp,  color: "text-amber-500",   bg: "bg-amber-50" },
          { label: "Maîtrisés",  value: stats.mastered, icon: Zap,         color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border border-gray-200/70 rounded-md p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className={`h-6 w-6 rounded-md ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 font-heading">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un mot…"
            className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "due", "new", "learning", "mastered"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`h-9 px-3 text-xs font-medium rounded-md border transition-all ${
                filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}>
              {f === "all" ? "Tous" : f === "due" ? "À réviser" : f === "new" ? "Nouveaux" : f === "learning" ? "En cours" : "Maîtrisés"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center mx-auto">
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {words.length === 0 ? "Aucun mot encore" : "Aucun résultat"}
          </p>
          <p className="text-xs text-gray-400">
            {words.length === 0
              ? "Génère tes premiers mots ou fais une session de leçons."
              : "Essaie un autre filtre ou terme de recherche."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((word) => (
            <WordCard key={word.srId} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
