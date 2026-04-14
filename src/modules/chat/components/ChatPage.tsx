"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, RotateCcw, Zap } from "lucide-react";
import { sendTutorMessage, analyzeGermanText } from "../server/chat.actions";
import type { ChatMessage } from "../server/chat.actions";

const SUGGESTIONS = [
  "Comment utilise-t-on le Dativ ?",
  "Quelle est la différence entre 'weil' et 'denn' ?",
  "Aide-moi à conjuguer 'sein' au passé",
  "Qu'est-ce que le Konjunktiv II ?",
  "Explique-moi les articles (der, die, das)",
  "Traduis : 'Je voudrais un café, s'il vous plaît'",
];

export function ChatPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [analyzeMode, setAnalyzeMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isPending]);

  const send = (text: string) => {
    if (!text.trim() || isPending) return;
    const userMsg: ChatMessage = { role: "user", text: text.trim() };
    setInput("");

    startTransition(async () => {
      if (analyzeMode) {
        setHistory((prev) => [...prev, userMsg]);
        try {
          const result = await analyzeGermanText(text.trim());
          let reply = "";
          if (result.isCorrect) {
            reply = `Votre phrase est correcte ! Niveau estimé : **${result.level}**.\n\n`;
          } else {
            reply = `**Correction :** ${result.corrected ?? text}\n\n`;
            if (result.errors.length > 0) {
              reply += "**Erreurs :**\n" + result.errors.map((e) =>
                `• "${e.original}" → "${e.correction}" _(${e.rule})_`
              ).join("\n") + "\n\n";
            }
          }
          if (result.vocabulary.length > 0) {
            reply += "**Vocabulaire clé :**\n" + result.vocabulary.map((v) =>
              `• ${v.word} = ${v.translation}${v.note ? ` _(${v.note})_` : ""}`
            ).join("\n") + "\n\n";
          }
          reply += `💡 ${result.tip}`;
          setHistory((prev) => [...prev, { role: "assistant", text: reply }]);
        } catch {
          setHistory((prev) => [...prev, { role: "assistant", text: "Une erreur s'est produite. Réessaie." }]);
        }
      } else {
        setHistory((prev) => [...prev, userMsg]);
        try {
          const { reply } = await sendTutorMessage({
            history,
            userMessage: text.trim(),
          });
          setHistory((prev) => [...prev, { role: "assistant", text: reply }]);
        } catch {
          setHistory((prev) => [...prev, { role: "assistant", text: "Une erreur s'est produite. Réessaie." }]);
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
            <Bot className="h-4 w-4 text-emerald-500" />
            Tuteur IA
          </h1>
          <p className="text-[11px] text-gray-400 mt-0.5">Pose tes questions en français ou pratique l'allemand librement</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnalyzeMode((v) => !v)}
            className={`flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold transition-colors border ${
              analyzeMode
                ? "bg-violet-50 text-violet-600 border-violet-200"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            <Zap className="h-3 w-3" />
            Analyser
          </button>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-semibold text-gray-400 hover:text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {history.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full pb-20 text-center"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 shadow-sm shadow-emerald-500/30">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-[15px] font-semibold text-gray-800 mb-1">Ton tuteur allemand personnel</h2>
            <p className="text-[12px] text-gray-400 max-w-sm mb-6">
              Pose des questions, fais corriger tes phrases, ou explore la grammaire allemande à ton rythme.
            </p>
            {analyzeMode && (
              <div className="mb-4 px-3 py-2 bg-violet-50 border border-violet-100 rounded-md text-[11px] text-violet-600 font-medium">
                Mode Analyser activé — colle une phrase allemande pour obtenir une analyse détaillée
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-[11px] text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all leading-tight"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {history.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-7 w-7 rounded-md bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-md text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gray-900 text-white rounded-br-sm"
                    : "bg-white border border-gray-200/80 text-gray-800 rounded-bl-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                }`}
              >
                {msg.role === "assistant" ? formatMessage(msg.text) : msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="h-7 w-7 rounded-md bg-emerald-500 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-md rounded-bl-sm px-3.5 py-2.5">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-1.5 bg-gray-400 rounded-full"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white shrink-0">
        {analyzeMode && (
          <p className="text-[10px] text-violet-500 font-medium mb-1.5 flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" /> Mode analyse — colle une phrase allemande à corriger
          </p>
        )}
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={analyzeMode ? "Colle une phrase allemande à analyser…" : "Pose une question ou écris en allemand…"}
            rows={3}
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors min-h-[36px] max-h-[120px] overflow-y-auto"
          />
          <button
            onClick={() => send(input)}
            disabled={isPending || !input.trim()}
            className="h-9 w-9 bg-gray-900 hover:bg-gray-700 disabled:opacity-30 text-white rounded-md flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 mt-1.5">Entrée pour envoyer · Maj+Entrée pour un saut de ligne</p>
      </div>
    </div>
  );
}

function formatMessage(text: string) {
  const lines = text.split("\n");

  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let tableBuffer: string[] = [];

  lines.forEach((line, i) => {
    // =========================
    // CODE BLOCK ```
    // =========================
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-gray-900 text-gray-100 p-3 rounded text-[12px] overflow-auto">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // =========================
    // TABLE
    // =========================
    if (line.includes("|")) {
      tableBuffer.push(line);
      return;
    } else if (tableBuffer.length > 0) {
      elements.push(renderTable(tableBuffer, i));
      tableBuffer = [];
    }

    // =========================
    // TITRES
    // =========================
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) {
      const level = heading[1].length;
      const content = inlineFormat(heading[2]);

      const sizes = ["text-xl", "text-lg", "text-base", "text-sm"];
      return elements.push(
        <p key={i} className={`${sizes[level - 1] || "text-sm"} font-bold mt-2`}>
          {content}
        </p>
      );
    }

    // =========================
    // BLOCKQUOTE
    // =========================
    if (line.startsWith(">")) {
      return elements.push(
        <blockquote key={i} className="border-l-2 pl-2 text-gray-500 italic">
          {inlineFormat(line.slice(1).trim())}
        </blockquote>
      );
    }

    // =========================
    // LISTES (bullet)
    // =========================
    const ulMatch = line.match(/^[-•*]\s+(.+)/);
    if (ulMatch) {
      return elements.push(
        <li key={i} className="ml-4 list-disc text-[13px]">
          {inlineFormat(ulMatch[1])}
        </li>
      );
    }

    // =========================
    // LISTES NUMÉROTÉES
    // =========================
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      return elements.push(
        <li key={i} className="ml-4 list-decimal text-[13px]">
          {inlineFormat(olMatch[1])}
        </li>
      );
    }

    // =========================
    // LIGNE VIDE
    // =========================
    if (line.trim() === "") {
      return elements.push(<div key={i} className="h-2" />);
    }

    // =========================
    // TEXTE NORMAL
    // =========================
    elements.push(
      <p key={i} className="text-[13px] leading-relaxed">
        {inlineFormat(line)}
      </p>
    );
  });

  // flush table si fin de texte
  if (tableBuffer.length > 0) {
    elements.push(renderTable(tableBuffer, "table-end"));
  }

  return elements;
}
// Gras et italique inline
function inlineFormat(text: string): React.ReactNode[] {
  const regex =
    /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g;

  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    // **bold**
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // *italic* or _italic_
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={i} className="italic text-gray-500">
          {part.slice(1, -1)}
        </em>
      );
    }

    // `code`
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="bg-gray-100 px-1 rounded text-[12px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }

    // [link](url)
    const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          className="text-blue-600 underline"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}
function renderTable(lines: string[], key: any) {
  const rows = lines.map((line) =>
    line.split("|").map((cell) => cell.trim()).filter(Boolean)
  );

  if (rows.length < 2) return null;

  const headers = rows[0];
  const body = rows.slice(2); // skip separator

  return (
    <table key={key} className="table-auto border-collapse my-2 text-[13px]">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="border px-2 py-1 bg-gray-100 text-left">
              {inlineFormat(h)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} className="border px-2 py-1">
                {inlineFormat(cell)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
