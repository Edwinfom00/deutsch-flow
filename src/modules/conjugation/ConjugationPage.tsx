"use client";

import { useState, useMemo, useRef, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Shuffle, Eye, EyeOff, CheckCircle2, XCircle,
  RefreshCw, BookOpen, Sparkles, Loader2, Lightbulb,
  MessageSquare, AlertTriangle, Database, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VERBS, PERSONS, type VerbData, type Tense, type Person } from "@/data/german-verbs";
import { GermanKeyboard } from "@/components/ui/german-keyboard";
import { getVerbContext, generateStoryChallenge, getVerbsForUser, triggerVerbGeneration } from "./conjugation.actions";
import type { VerbContext, StoryChallenge, CachedVerb } from "./conjugation.actions";

const TENSES: Tense[] = ["Präsens", "Präteritum", "Perfekt", "Futur I"];

const TENSE_COLORS: Record<Tense, string> = {
  Präsens: "bg-blue-50 border-blue-200 text-blue-700",
  Präteritum: "bg-violet-50 border-violet-200 text-violet-700",
  Perfekt: "bg-amber-50 border-amber-200 text-amber-700",
  "Futur I": "bg-emerald-50 border-emerald-200 text-emerald-700",
};

const TENSE_HEADER: Record<Tense, string> = {
  Präsens: "bg-blue-100 text-blue-800",
  Präteritum: "bg-violet-100 text-violet-800",
  Perfekt: "bg-amber-100 text-amber-800",
  "Futur I": "bg-emerald-100 text-emerald-800",
};

type Mode = "explore" | "practice" | "story";

interface PracticeAnswer {
  tense: Tense;
  person: Person;
  value: string;
  revealed: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export function ConjugationPage() {
  const [query, setQuery] = useState("");
  const [allVerbs, setAllVerbs] = useState<(VerbData | CachedVerb)[]>(VERBS);
  const [dbVerbCount, setDbVerbCount] = useState(0);
  const [dbLoading, setDbLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState<VerbData | CachedVerb>(VERBS[0]);
  const [mode, setMode] = useState<Mode>("explore");
  const [visibleTenses, setVisibleTenses] = useState<Set<Tense>>(new Set(TENSES));
  const [hiddenCells, setHiddenCells] = useState<Set<string>>(new Set());
  const [verbContext, setVerbContext] = useState<VerbContext | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [story, setStory] = useState<StoryChallenge | null>(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyAnswers, setStoryAnswers] = useState<Record<string, string>>({});
  const [storyChecked, setStoryChecked] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, PracticeAnswer>>({});
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [practiceTarget, setPracticeTarget] = useState<Array<{ tense: Tense; person: Person }>>([]);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const [focusedStoryBlank, setFocusedStoryBlank] = useState<string | null>(null);
  const practiceInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const storyInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [, startTransition] = useTransition();

  useEffect(() => {
    getVerbsForUser().then((cached) => {
      if (cached.length > 0) {
        const merged = [
          ...VERBS,
          ...cached.filter((c) => !VERBS.some((v) => v.infinitive === c.infinitive)),
        ];
        setAllVerbs(merged);
        setDbVerbCount(cached.length);
      }
      setDbLoading(false);
    }).catch(() => setDbLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allVerbs;
    return allVerbs.filter(
      (v) => v.infinitive.toLowerCase().includes(q) || v.translation.toLowerCase().includes(q)
    );
  }, [query, allVerbs]);

  const handleSelect = (verb: VerbData | CachedVerb) => {
    setSelected(verb);
    setQuery("");
    setMode("explore");
    setHiddenCells(new Set());
    setPracticeAnswers({});
    setPracticeChecked(false);
    setVerbContext(null);
    setShowContext(false);
    setStory(null);
    setStoryAnswers({});
    setStoryChecked(false);
  };

  const randomVerb = () => {
    const others = allVerbs.filter((v) => v.infinitive !== selected.infinitive);
    handleSelect(others[Math.floor(Math.random() * others.length)]);
  };

  const handleGenerate = () => {
    setGenerating(true);
    startTransition(async () => {
      try {
        await triggerVerbGeneration();
        setTimeout(async () => {
          const cached = await getVerbsForUser();
          if (cached.length > 0) {
            const merged = [
              ...VERBS,
              ...cached.filter((c) => !VERBS.some((v) => v.infinitive === c.infinitive)),
            ];
            setAllVerbs(merged);
            setDbVerbCount(cached.length);
          }
          setGenerating(false);
        }, 5000);
      } catch {
        setGenerating(false);
      }
    });
  };

  const toggleTense = (tense: Tense) => {
    setVisibleTenses((prev) => {
      const next = new Set(prev);
      if (next.has(tense)) { if (next.size > 1) next.delete(tense); }
      else next.add(tense);
      return next;
    });
  };

  const toggleCell = (key: string) => {
    setHiddenCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const loadContext = () => {
    const cached = selected as CachedVerb;
    if (cached.sentences && Object.keys(cached.sentences).length > 0) {
      setVerbContext({ sentences: cached.sentences, irregularityNote: cached.irregularityNote ?? null, memoryTip: cached.memoryTip ?? null });
      setShowContext((v) => !v);
      return;
    }
    if (verbContext) { setShowContext((v) => !v); return; }
    setContextLoading(true);
    startTransition(async () => {
      try {
        const ctx = await getVerbContext(selected.infinitive, selected.translation, selected.isIrregular);
        setVerbContext(ctx);
        setShowContext(true);
      } finally {
        setContextLoading(false);
      }
    });
  };

  const startPractice = () => {
    const pool: Array<{ tense: Tense; person: Person }> = [];
    visibleTenses.forEach((t) => PERSONS.forEach((p) => pool.push({ tense: t, person: p })));
    const targets = shuffleArray(pool).slice(0, Math.min(6, pool.length));
    setPracticeTarget(targets);
    const init: Record<string, PracticeAnswer> = {};
    targets.forEach(({ tense, person }) => {
      init[`${tense}|${person}`] = { tense, person, value: "", revealed: false };
    });
    setPracticeAnswers(init);
    setPracticeChecked(false);
    setFocusedCell(null);
    setMode("practice");
  };

  const startStory = () => {
    const cached = selected as CachedVerb;
    if (cached.story?.blanks?.length && cached.story.blanks.length > 0) {
      setStory(cached.story);
      setStoryAnswers({});
      setStoryChecked(false);
      setMode("story");
      return;
    }
    setStoryLoading(true);
    setStory(null);
    setStoryAnswers({});
    setStoryChecked(false);
    setMode("story");
    startTransition(async () => {
      try {
        const s = await generateStoryChallenge(selected.infinitive, selected.translation);
        setStory(s);
      } finally {
        setStoryLoading(false);
      }
    });
  };

  const practiceScore = useMemo(() => {
    if (!practiceChecked) return null;
    const correct = practiceTarget.filter(({ tense, person }) => {
      const key = `${tense}|${person}`;
      return normalize(practiceAnswers[key]?.value ?? "") === normalize(selected.conjugations[tense][person]);
    }).length;
    return { correct, total: practiceTarget.length };
  }, [practiceChecked, practiceTarget, practiceAnswers, selected]);

  const storyScore = useMemo(() => {
    if (!storyChecked || !story) return null;
    const correct = story.blanks.filter((b) => normalize(storyAnswers[b.id] ?? "") === normalize(b.answer)).length;
    return { correct, total: story.blanks.length };
  }, [storyChecked, story, storyAnswers]);

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">Conjugaison</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400">{allVerbs.length} verbes</p>
            {dbVerbCount > 0 && (
              <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Database className="h-2.5 w-2.5" />{dbVerbCount} de ton secteur
              </span>
            )}
            {dbLoading && <Loader2 className="h-3 w-3 text-gray-300 animate-spin" />}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleGenerate} disabled={generating}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors disabled:opacity-50">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            Générer des verbes
          </button>
          <button onClick={randomVerb} className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md border border-gray-200 hover:border-gray-400 text-gray-600 transition-colors">
            <Shuffle className="h-3.5 w-3.5" /> Aléatoire
          </button>
          {mode !== "explore" && (
            <button onClick={() => setMode("explore")} className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md border border-gray-200 hover:border-gray-400 text-gray-600 transition-colors">
              Explorer
            </button>
          )}
          {mode !== "practice" && (
            <button onClick={startPractice} className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-colors">
              <BookOpen className="h-3.5 w-3.5" /> S&apos;entraîner
            </button>
          )}
          <button onClick={startStory} disabled={storyLoading} className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-8 px-3 rounded-md bg-violet-600 hover:bg-violet-700 text-white transition-colors disabled:opacity-50">
            {storyLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Défi histoire
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un verbe… (ex: gehen, manger)"
          className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
        <AnimatePresence>
          {query && filtered.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {filtered.map((v) => (
                <button key={v.infinitive} onClick={() => handleSelect(v)}
                  className="cursor-pointer w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0">
                  <span className="text-sm font-semibold text-gray-800">{v.infinitive}</span>
                  <span className="text-xs text-gray-400">{v.translation}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Verb header */}
      <div className="flex items-start gap-3 flex-wrap">
        <div className="bg-white border border-gray-200 rounded-md px-5 py-3 flex items-center gap-4">
          <div>
            <p className="text-xl font-bold text-gray-900">{selected.infinitive}</p>
            <p className="text-sm text-gray-400 mt-0.5">{selected.translation}</p>
          </div>
          <div className="flex flex-col gap-1">
            {selected.isIrregular && (
              <span className="text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-200 px-2 py-0.5 rounded-sm">IRRÉGULIER</span>
            )}
            {selected.auxiliary && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">Aux. : {selected.auxiliary}</span>
            )}
            {selected.participle && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">P.II : {selected.participle}</span>
            )}
          </div>
        </div>

        {/* Bouton contexte IA */}
        <button onClick={loadContext} disabled={contextLoading}
          className="cursor-pointer flex items-center gap-1.5 text-xs font-medium h-9 px-3 rounded-md border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 transition-colors disabled:opacity-50">
          {contextLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
          {showContext ? "Masquer les exemples" : "Voir des exemples IA"}
        </button>

        {/* Tense pills — seulement en explore/practice */}
        {mode !== "story" && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {TENSES.map((t) => (
              <button key={t} onClick={() => toggleTense(t)}
                className={cn("cursor-pointer text-[11px] font-semibold px-3 py-1.5 rounded-md border transition-all",
                  visibleTenses.has(t) ? TENSE_COLORS[t] : "border-gray-200 bg-white text-gray-300")}>
                {t}
              </button>
            ))}
            {mode === "explore" && (
              <>
                <button onClick={() => { const all = new Set<string>(); TENSES.forEach((t) => PERSONS.forEach((p) => all.add(`${t}|${p}`))); setHiddenCells(all); }}
                  className="cursor-pointer flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 ml-2 transition-colors">
                  <EyeOff className="h-3 w-3" /> tout cacher
                </button>
                <button onClick={() => setHiddenCells(new Set())}
                  className="cursor-pointer flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye className="h-3 w-3" /> tout voir
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Contexte IA — phrases d'exemple + note irrégularité */}
      <AnimatePresence>
        {showContext && verbContext && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="space-y-3">
            {verbContext.irregularityNote && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-md p-3.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Pattern irrégulier</p>
                  <p className="text-xs text-rose-700 leading-relaxed">{verbContext.irregularityNote}</p>
                </div>
              </div>
            )}
            {verbContext.memoryTip && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-md p-3.5">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">{verbContext.memoryTip}</p>
              </div>
            )}
            <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <p className="text-xs font-semibold text-gray-600">Phrases d&apos;exemple au Präsens</p>
              </div>
              <div className="divide-y divide-gray-50">
                {PERSONS.map((person) => {
                  const key = `${person}|Präsens`;
                  const ex = verbContext.sentences?.[key];
                  if (!ex) return null;
                  return (
                    <div key={person} className="flex items-start gap-3 px-4 py-2.5">
                      <span className="text-[11px] text-gray-400 font-medium w-16 shrink-0 mt-0.5">{person}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium">{ex.de}</p>
                        <p className="text-[11px] text-gray-400 italic mt-0.5">{ex.fr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EXPLORE MODE ── */}
      {mode === "explore" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleTenses.size}, minmax(0, 1fr))` }}>
          {TENSES.filter((t) => visibleTenses.has(t)).map((tense) => (
            <motion.div key={tense} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
              <div className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider", TENSE_HEADER[tense])}>{tense}</div>
              <div className="divide-y divide-gray-50">
                {PERSONS.map((person) => {
                  const key = `${tense}|${person}`;
                  const form = selected.conjugations[tense][person];
                  const isHidden = hiddenCells.has(key);
                  return (
                    <button key={person} onClick={() => toggleCell(key)}
                      className="cursor-pointer w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50/80 transition-colors text-left group">
                      <span className="text-[11px] text-gray-400 font-medium w-16 shrink-0">{person}</span>
                      <span className={cn("text-sm font-semibold transition-all",
                        isHidden ? "blur-[5px] select-none text-gray-300 group-hover:blur-[2px]" : "text-gray-800")}>
                        {form}
                      </span>
                      {isHidden && <Eye className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── PRACTICE MODE ── */}
      {mode === "practice" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-600">Complète les <strong>{practiceTarget.length}</strong> formes.</p>
            {practiceChecked && practiceScore && (
              <span className={cn("text-xs font-bold px-3 py-1 rounded-md border",
                practiceScore.correct === practiceScore.total ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : practiceScore.correct >= practiceScore.total / 2 ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-600 border-red-200")}>
                {practiceScore.correct}/{practiceScore.total} correctes
              </span>
            )}
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(visibleTenses.size, 2)}, minmax(0, 1fr))` }}>
            {TENSES.filter((t) => visibleTenses.has(t)).map((tense) => (
              <div key={tense} className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm">
                <div className={cn("px-4 py-2 text-[11px] font-bold uppercase tracking-wider", TENSE_HEADER[tense])}>{tense}</div>
                <div className="divide-y divide-gray-50">
                  {PERSONS.map((person) => {
                    const key = `${tense}|${person}`;
                    const isTarget = practiceTarget.some((t) => t.tense === tense && t.person === person);
                    const form = selected.conjugations[tense][person];
                    const answer = practiceAnswers[key];
                    if (!isTarget) return (
                      <div key={person} className="flex items-center justify-between px-4 py-2">
                        <span className="text-[11px] text-gray-400 font-medium w-16 shrink-0">{person}</span>
                        <span className="text-sm text-gray-500">{form}</span>
                      </div>
                    );
                    const isCorrect = practiceChecked && normalize(answer?.value ?? "") === normalize(form);
                    const isWrong = practiceChecked && !isCorrect;
                    return (
                      <div key={person} className="flex items-center gap-2 px-4 py-1.5">
                        <span className="text-[11px] text-gray-400 font-medium w-16 shrink-0">{person}</span>
                        {answer?.revealed ? (
                          <span className="text-sm font-semibold text-blue-600 flex-1">{form}</span>
                        ) : (
                          <input type="text"
                            ref={(el) => { practiceInputRefs.current[key] = el; }}
                            value={answer?.value ?? ""} disabled={practiceChecked}
                            onFocus={() => setFocusedCell(key)}
                            onChange={(e) => setPracticeAnswers((prev) => ({ ...prev, [key]: { ...prev[key], value: e.target.value } }))}
                            className={cn("flex-1 h-7 px-2 border rounded text-sm focus:outline-none transition-colors",
                              !practiceChecked && "border-gray-200 focus:border-gray-400",
                              isCorrect && "border-emerald-300 bg-emerald-50 text-emerald-800",
                              isWrong && "border-red-300 bg-red-50 text-red-700")} />
                        )}
                        {practiceChecked && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        {practiceChecked && isWrong && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <XCircle className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-xs font-semibold text-gray-600">{form}</span>
                          </div>
                        )}
                        {!practiceChecked && !answer?.revealed && (
                          <button onClick={() => setPracticeAnswers((prev) => ({ ...prev, [key]: { ...prev[key], revealed: true } }))}
                            className="cursor-pointer text-[10px] text-gray-300 hover:text-gray-500 transition-colors shrink-0" title="Révéler">
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {focusedCell && !practiceChecked && practiceAnswers[focusedCell] && !practiceAnswers[focusedCell].revealed && (
            <GermanKeyboard
              inputRef={{ current: practiceInputRefs.current[focusedCell] } as React.RefObject<HTMLInputElement>}
              value={practiceAnswers[focusedCell]?.value ?? ""}
              onInsert={(val) => setPracticeAnswers((prev) => ({ ...prev, [focusedCell]: { ...prev[focusedCell], value: val } }))}
              disabled={practiceChecked} />
          )}
          <div className="flex items-center gap-2">
            {!practiceChecked ? (
              <button onClick={() => setPracticeChecked(true)}
                disabled={practiceTarget.every((t) => { const k = `${t.tense}|${t.person}`; return !practiceAnswers[k]?.value.trim() && !practiceAnswers[k]?.revealed; })}
                className="cursor-pointer h-9 px-5 text-sm font-medium rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                Corriger
              </button>
            ) : (
              <button onClick={startPractice}
                className="cursor-pointer flex items-center gap-1.5 h-9 px-5 text-sm font-medium rounded-md bg-gray-900 hover:bg-gray-800 text-white transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Réessayer
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STORY CHALLENGE MODE ── */}
      {mode === "story" && (
        <div className="space-y-4">
          {storyLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-[#0a0a0f] rounded-md p-6 flex flex-col items-center gap-4 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-10 w-10 rounded-md bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-white">Notre IA écrit une histoire…</p>
                <p className="text-xs text-white/40 mt-1">avec <span className="text-violet-400 font-semibold">{selected.infinitive}</span> conjugué à différentes personnes</p>
              </div>
            </motion.div>
          )}

          {story && !storyLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white border border-gray-200/70 rounded-md p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-1">Défi histoire</p>
                    <h2 className="text-base font-bold text-gray-900">{story.title}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{story.context}</p>
                  </div>
                  {storyChecked && storyScore && (
                    <span className={cn("text-xs font-bold px-3 py-1.5 rounded-md border shrink-0",
                      storyScore.correct === storyScore.total ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : storyScore.correct >= storyScore.total / 2 ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-red-50 text-red-600 border-red-200")}>
                      {storyScore.correct}/{storyScore.total}
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-md p-4 text-sm text-gray-800 leading-8">
                  {story.story.split(/(\[BLANK_\d+\])/g).map((part, i) => {
                    const blankMatch = part.match(/\[BLANK_(\d+)\]/);
                    if (!blankMatch) return <span key={i}>{part}</span>;
                    const blankId = `BLANK_${blankMatch[1]}`;
                    const blank = story.blanks.find((b) => b.id === blankId);
                    if (!blank) return <span key={i}>{part}</span>;
                    const val = storyAnswers[blankId] ?? "";
                    const isCorrect = storyChecked && normalize(val) === normalize(blank.answer);
                    const isWrong = storyChecked && !isCorrect;
                    return (
                      <span key={i} className="inline-flex items-center gap-1 mx-0.5">
                        <input type="text"
                          ref={(el) => { storyInputRefs.current[blankId] = el; }}
                          value={val} disabled={storyChecked}
                          onFocus={() => setFocusedStoryBlank(blankId)}
                          onChange={(e) => setStoryAnswers((prev) => ({ ...prev, [blankId]: e.target.value }))}
                          placeholder="___"
                          title={blank.hint}
                          className={cn(
                            "h-7 px-2 border rounded text-sm font-semibold focus:outline-none transition-colors text-center",
                            "w-24",
                            !storyChecked && "border-violet-300 bg-violet-50 text-violet-800 focus:border-violet-500",
                            isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                            isWrong && "border-red-300 bg-red-50 text-red-700"
                          )} />
                        {storyChecked && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                        {storyChecked && isWrong && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">{blank.answer}</span>
                        )}
                      </span>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {story.blanks.map((b) => (
                    <span key={b.id} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-sm">
                      {b.id.replace("BLANK_", "#")} — {b.hint}
                    </span>
                  ))}
                </div>
              </div>

              {focusedStoryBlank && !storyChecked && (
                <GermanKeyboard
                  inputRef={{ current: storyInputRefs.current[focusedStoryBlank] } as React.RefObject<HTMLInputElement>}
                  value={storyAnswers[focusedStoryBlank] ?? ""}
                  onInsert={(val) => setStoryAnswers((prev) => ({ ...prev, [focusedStoryBlank]: val }))}
                  disabled={storyChecked} />
              )}

              <div className="flex items-center gap-2">
                {!storyChecked ? (
                  <button onClick={() => setStoryChecked(true)}
                    disabled={story.blanks.every((b) => !storyAnswers[b.id]?.trim())}
                    className="cursor-pointer h-9 px-5 text-sm font-medium rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                    Corriger l&apos;histoire
                  </button>
                ) : (
                  <button onClick={startStory}
                    className="cursor-pointer flex items-center gap-1.5 h-9 px-5 text-sm font-medium rounded-md bg-violet-600 hover:bg-violet-700 text-white transition-colors">
                    <Sparkles className="h-3.5 w-3.5" /> Nouvelle histoire
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
