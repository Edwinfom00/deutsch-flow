"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Send, X, Volume2, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { sendMessage, evaluateConversation, generateMoreScenarios } from "../server/speak.actions";
import type { Scenario, Message } from "../server/speak.actions";
import type { getScenarios } from "../server/speak.actions";
import { cn } from "@/lib/utils";

type SpeakData = Awaited<ReturnType<typeof getScenarios>>;

const difficultyConfig = {
  facile:    { label: "Facile",    color: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-200" },
  moyen:     { label: "Moyen",     color: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-200" },
  difficile: { label: "Difficile", color: "text-red-600",     bg: "bg-red-50",      border: "border-red-200" },
};

function useSTT(onResult: (t: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recRef = useRef<unknown>(null);

  useEffect(() => {
    const SR = (window as never as Record<string, unknown>).SpeechRecognition ??
      (window as never as Record<string, unknown>).webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const start = useCallback(() => {
    const SR = ((window as never as Record<string, unknown>).SpeechRecognition ??
      (window as never as Record<string, unknown>).webkitSpeechRecognition) as new () => {
        lang: string; continuous: boolean; interimResults: boolean;
        onresult: ((e: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void) | null;
        onend: (() => void) | null;
        onerror: (() => void) | null;
        start(): void; stop(): void;
      };
    if (!SR) return;
    const rec = new SR();
    rec.lang = "de-DE";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      if (t) onResult(t);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    (recRef.current as { stop(): void } | null)?.stop();
    setIsListening(false);
  }, []);

  return { isListening, isSupported, start, stop };
}

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

type EvaluationResult = {
  score: number; fluency: string; grammar: string; vocabulary: string;
  corrections: Array<{ original: string; correction: string; explanation: string }>;
  encouragement: string; usefulPhrases: string[];
};

export function SpeakPage({ initialData }: { initialData: SpeakData }) {
  const [scenarios, setScenarios] = useState<Scenario[]>(initialData.scenarios);
  const { level, sector } = initialData;
  const [selected, setSelected] = useState<Scenario | null>(null);
  const [phase, setPhase] = useState<"select" | "chat" | "result">("select");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  const handleGenerateMore = () => {
    setIsGeneratingMore(true);
    startTransition(async () => {
      try {
        const newScenarios = await generateMoreScenarios();
        setScenarios((prev) => [...prev, ...newScenarios]);
      } finally {
        setIsGeneratingMore(false);
      }
    });
  };

  const handleTranscript = useCallback((t: string) => {
    setInput((prev) => prev ? `${prev} ${t}` : t);
  }, []);
  
  const { isListening, isSupported, start, stop } = useSTT(handleTranscript);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = (scenario: Scenario) => {
    setSelected(scenario);
    setMessages([{ role: "ai", text: scenario.opener }]);
    setPhase("chat");
    setTimeout(() => speakDE(scenario.opener), 300);
  };

  const handleSend = () => {
    if (!input.trim() || !selected || isPending) return;
    const userMsg = input.trim();
    setInput("");
    const newHistory: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(newHistory);

    startTransition(async () => {
      const res = await sendMessage({
        scenario: selected,
        history: newHistory,
        userMessage: userMsg,
        level,
      });
      const aiMsg: Message = { role: "ai", text: res.reply, feedback: res.feedback ?? undefined };
      setMessages((prev) => [...prev, aiMsg]);
      speakDE(res.reply);
      if (res.isConversationEnd) {
        setTimeout(() => handleEnd([...newHistory, aiMsg]), 1500);
      }
    });
  };

  const handleEnd = (history: Message[]) => {
    setIsEvaluating(true);
    startTransition(async () => {
      const ev = await evaluateConversation({ scenario: selected!, history, level });
      setEvaluation(ev as EvaluationResult);
      setIsEvaluating(false);
      setPhase("result");
    });
  };

  const reset = () => {
    setSelected(null);
    setMessages([]);
    setInput("");
    setEvaluation(null);
    setPhase("select");
  };

  // ── Sélection scénario ────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="p-5 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[15px] font-semibold text-gray-900">Zone de Parole</h1>
            <p className="text-xs text-gray-400 mt-0.5">Dialogue en allemand avec notre IA · Niveau {level}</p>
          </div>
          <button
            onClick={handleGenerateMore}
            disabled={isGeneratingMore || isPending}
            className="flex items-center gap-1.5 h-9 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-60 shrink-0"
          >
            {isGeneratingMore
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Génération…</>
              : <>+ 5 nouveaux scénarios</>
            }
          </button>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {scenarios.map((s, i) => (
            <ScenarioCard key={s.id} scenario={s} index={i} onSelect={startConversation} />
          ))}
        </div>
      </div>
    );
  }

  // ── Résultats ─────────────────────────────────────────────────────────────
  if (phase === "result" && evaluation) {
    const ev = evaluation;
    const scoreColor = ev.score >= 75 ? "bg-emerald-500" : ev.score >= 50 ? "bg-amber-400" : "bg-red-400";

    return (
      <div className="p-5 max-w-6xl mx-auto space-y-5">
        <button onClick={reset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Choisir un autre scénario
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score */}
          <div className="bg-white border border-gray-200/70 rounded-md p-5 text-center space-y-3">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`h-14 w-14 rounded-md mx-auto flex items-center justify-center ${scoreColor}`}>
              <span className="text-white text-2xl font-black font-heading">{ev.score}</span>
            </motion.div>
            <p className="text-base font-bold text-gray-900 font-heading">{selected?.title}</p>
            <p className="text-sm text-gray-400">{ev.encouragement}</p>
          </div>

          {/* Feedback par critère */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Fluidité", value: ev.fluency },
              { label: "Grammaire", value: ev.grammar },
              { label: "Vocabulaire", value: ev.vocabulary },
            ].map((c) => (
              <div key={c.label} className="bg-white border border-gray-200/70 rounded-md p-3 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
                <p className="text-xs text-gray-600 leading-relaxed">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Corrections */}
          {ev.corrections.length > 0 && (
            <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-600">Corrections</p>
              </div>
              <div className="divide-y divide-gray-50">
                {ev.corrections.map((c, i) => (
                  <div key={i} className="px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-red-500 line-through">{c.original}</span>
                      <span className="text-gray-300">→</span>
                      <span className="text-sm text-emerald-700 font-semibold">{c.correction}</span>
                    </div>
                    <p className="text-xs text-gray-400">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phrases utiles */}
          {ev.usefulPhrases.length > 0 && (
            <div className="bg-gray-50 border border-gray-100 rounded-md p-4 space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phrases utiles pour ce scénario</p>
              <div className="space-y-1.5">
                {ev.usefulPhrases.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-gray-700 font-medium">{p}</p>
                    <button onClick={() => speakDE(p)} className="text-gray-300 hover:text-gray-600 transition-colors ml-auto shrink-0">
                      <Volume2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={reset} className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-md transition-colors">
            Nouveau scénario
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Chat ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-52px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 h-12 border-b border-gray-100 bg-white shrink-0">
        <button onClick={reset} className="text-gray-300 hover:text-gray-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{selected?.title}</p>
          <p className="text-[10px] text-gray-400 truncate">{selected?.aiRole} · Niveau {level}</p>
        </div>
        <button
          onClick={() => handleEnd(messages)}
          disabled={messages.filter((m) => m.role === "user").length < 2 || isPending || isEvaluating}
          className="flex items-center gap-1.5 h-7 px-3 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:border-gray-300 disabled:opacity-40 transition-colors"
        >
          {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Terminer"}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              <div className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                msg.role === "ai" ? "bg-blue-100 text-blue-700" : "bg-gray-900 text-white"
              )}>
                {msg.role === "ai" ? "IA" : "Tu"}
              </div>

              <div className={cn("space-y-1 max-w-[75%]", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-md px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "ai"
                    ? "bg-white border border-gray-200 text-gray-900"
                    : "bg-gray-900 text-white"
                )}>
                  {msg.text}
                  {msg.role === "ai" && (
                    <button onClick={() => speakDE(msg.text)}
                      className="ml-2 text-gray-300 hover:text-gray-500 transition-colors inline-flex items-center">
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {msg.feedback && (
                  <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1">
                    {msg.feedback}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isPending && (
          <div className="flex gap-2.5">
            <div className="h-7 w-7 rounded-md bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">IA</div>
            <div className="bg-white border border-gray-200 rounded-md px-4 py-2.5 flex items-center gap-1.5">
              {[0,1,2].map(i => (
                <motion.div key={i} className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-gray-100 bg-white shrink-0">
        {isListening && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5 items-end h-4">
              {[0,1,2,3].map(i => (
                <motion.div key={i} className="w-0.5 bg-red-500 rounded-full"
                  animate={{ height: ["3px", "14px", "3px"] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
              ))}
            </div>
            <span className="text-xs text-red-600 font-medium">Écoute… parle en allemand</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {isSupported && (
            <button onClick={isListening ? stop : start}
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center shrink-0 transition-all",
                isListening ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}>
              {isListening ? <Square className="h-4 w-4 fill-white" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Schreibe auf Deutsch…"
            disabled={isPending}
            className="flex-1 h-10 px-4 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors disabled:opacity-60"
          />
          <button onClick={handleSend} disabled={!input.trim() || isPending || isListening}
            className="h-10 w-10 rounded-md bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario, index, onSelect }: { scenario: Scenario; index: number; onSelect: (s: Scenario) => void }) {
  const d = difficultyConfig[scenario.difficulty as keyof typeof difficultyConfig] ?? difficultyConfig.moyen;
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(scenario)}
      className="bg-white border border-gray-200 rounded-md p-4 text-left hover:border-gray-300 hover:shadow-sm transition-all space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-tight">{scenario.title}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border shrink-0 ${d.bg} ${d.color} ${d.border}`}>
          {d.label}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{scenario.description}</p>
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
        <span className="font-medium text-gray-600">{scenario.aiRole}</span>
        <span>·</span>
        <span>{scenario.sector}</span>
      </div>
    </motion.button>
  );
}
