"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTICLE_RULES, ARTICLE_COLORS, RELIABILITY_LABELS } from "@/data/article-rules";
import { getMoreExamples } from "../server/article-rules.actions";

type Article = "der" | "die" | "das";

const ARTICLE_LABELS: Record<Article, string> = {
  der: "Masculin",
  die: "Féminin",
  das: "Neutre",
};

const FILTER_ALL = "all" as const;
type Filter = Article | typeof FILTER_ALL;

export function ArticleRulesPage() {
  const [filter, setFilter] = useState<Filter>(FILTER_ALL);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [extras, setExtras] = useState<Record<string, Array<{ word: string; sentence: string; translation: string }>>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = ARTICLE_RULES.filter((r) => filter === FILTER_ALL || r.article === filter);

  const handleExpand = (suffix: string) => {
    setExpanded((prev) => (prev === suffix ? null : suffix));
  };

  const handleLoadMore = (rule: typeof ARTICLE_RULES[number]) => {
    if (extras[rule.suffix] || loading) return;
    setLoading(rule.suffix);
    startTransition(async () => {
      try {
        const results = await getMoreExamples(rule.suffix, rule.article, rule.rule);
        setExtras((prev) => ({ ...prev, [rule.suffix]: results }));
      } catch {
        setExtras((prev) => ({ ...prev, [rule.suffix]: [] }));
      } finally {
        setLoading(null);
      }
    });
  };

  const counts = {
    all: ARTICLE_RULES.length,
    der: ARTICLE_RULES.filter((r) => r.article === "der").length,
    die: ARTICLE_RULES.filter((r) => r.article === "die").length,
    das: ARTICLE_RULES.filter((r) => r.article === "das").length,
  };

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-5">

      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Règles des articles</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {ARTICLE_RULES.length} règles par suffixe · cliquer pour voir les exemples et en générer plus
        </p>
      </div>

      <div className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mémo couleurs</p>
        <div className="grid grid-cols-3 gap-3">
          {(["der", "die", "das"] as Article[]).map((a) => {
            const c = ARTICLE_COLORS[a];
            return (
              <div key={a} className={cn("rounded-md border p-3 text-center", c.bg, c.border)}>
                <p className={cn("text-xl font-black font-heading", c.text)}>{a}</p>
                <p className={cn("text-xs font-semibold mt-0.5", c.text)}>{ARTICLE_LABELS[a]}</p>
                <div className={cn("h-1 rounded-sm mt-2 mx-auto w-8", c.badge)} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {([FILTER_ALL, "der", "die", "das"] as Filter[]).map((f) => {
          const isActive = filter === f;
          const c = f !== FILTER_ALL ? ARTICLE_COLORS[f as Article] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "cursor-pointer h-8 px-3 text-xs font-semibold rounded-md border transition-all",
                isActive && f === FILTER_ALL && "bg-gray-900 text-white border-gray-900",
                isActive && f !== FILTER_ALL && c && `${c.bg} ${c.text} ${c.border}`,
                !isActive && "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              )}
            >
              {f === FILTER_ALL ? `Tous (${counts.all})` : `${f} — ${ARTICLE_LABELS[f as Article]} (${counts[f as Article]})`}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map((rule, i) => {
          const c = ARTICLE_COLORS[rule.article];
          const rel = RELIABILITY_LABELS[rule.reliability];
          const isOpen = expanded === rule.suffix;
          const ruleExtras = extras[rule.suffix];
          const isLoadingThis = loading === rule.suffix;

          return (
            <motion.div
              key={rule.suffix}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn("bg-white border rounded-md overflow-hidden transition-colors", isOpen ? c.border : "border-gray-200/70")}
            >
              <button
                onClick={() => handleExpand(rule.suffix)}
                className="cursor-pointer w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors"
              >
                <div className={cn("h-9 w-14 rounded-md flex items-center justify-center shrink-0 border font-black text-sm", c.bg, c.border, c.text)}>
                  {rule.article}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900">{rule.suffix}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-sm border", rel.color)}>
                      {rel.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">{rule.rule}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex gap-1">
                    {rule.examples.slice(0, 3).map((ex) => (
                      <span key={ex} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-sm", c.bg, c.text)}>
                        {ex.split(" ")[1]}
                      </span>
                    ))}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-gray-300 transition-transform", isOpen && "rotate-180")} />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={cn("border-t px-4 py-4 space-y-4", c.border, c.bg)}>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Exemples de base</p>
                        <div className="flex flex-wrap gap-2">
                          {rule.examples.map((ex) => (
                            <span key={ex} className={cn("text-xs font-semibold px-2.5 py-1 rounded-md border bg-white", c.border, c.text)}>
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>

                      {rule.exceptions && rule.exceptions.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Exceptions</p>
                          <div className="flex flex-wrap gap-2">
                            {rule.exceptions.map((ex) => (
                              <span key={ex} className="text-xs font-semibold px-2.5 py-1 rounded-md border bg-amber-50 border-amber-200 text-amber-700">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {ruleExtras && ruleExtras.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-violet-500" />
                            Exemples générés par notre IA
                          </p>
                          <div className="space-y-2">
                            {ruleExtras.map((ex, j) => (
                              <motion.div
                                key={j}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: j * 0.06 }}
                                className="bg-white border border-gray-100 rounded-md px-3 py-2.5 space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", c.text)} />
                                  <span className={cn("text-sm font-bold", c.text)}>{ex.word}</span>
                                </div>
                                <p className="text-xs text-gray-700 ml-5">{ex.sentence}</p>
                                <p className="text-[11px] text-gray-400 italic ml-5">{ex.translation}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!ruleExtras && (
                        <button
                          onClick={() => handleLoadMore(rule)}
                          disabled={!!isLoadingThis}
                          className={cn(
                            "cursor-pointer flex items-center gap-1.5 text-xs font-semibold h-8 px-3 rounded-md border transition-colors",
                            "bg-white border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-50"
                          )}
                        >
                          {isLoadingThis
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Génération…</>
                            : <><Sparkles className="h-3.5 w-3.5 text-violet-500" />Générer plus d&apos;exemples</>
                          }
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
