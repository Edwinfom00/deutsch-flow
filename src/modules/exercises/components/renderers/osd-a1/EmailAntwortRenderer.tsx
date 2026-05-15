"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OsdA1EmailAntwort, OsdRendererProps } from "../../../types/osd-a1.types";

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function detectPointsCovered(response: string, points: string[]): number {
  const lower = response.toLowerCase();
  let covered = 0;
  for (const p of points) {
    const keywords = p
      .toLowerCase()
      .replace(/[?!.,;:]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["welchem", "welcher", "welches", "kommst", "möchtest", "bringst"].includes(w));
    if (keywords.some((k) => lower.includes(k))) covered++;
  }
  return covered;
}

export function EmailAntwortRenderer({
  exercise,
  onAnswer,
  answered,
}: OsdRendererProps<OsdA1EmailAntwort>) {
  const [response, setResponse] = useState("");
  const wordCount = countWords(response);
  const inRange = wordCount >= exercise.minWords && wordCount <= exercise.maxWords;

  const handleSubmit = () => {
    if (answered) return;
    const points = detectPointsCovered(response, exercise.responsePoints);
    const pointsRate = points / exercise.responsePoints.length;
    const lengthRate = inRange ? 1 : wordCount < exercise.minWords ? wordCount / exercise.minWords : exercise.maxWords / wordCount;
    const score = Math.round((pointsRate * 60 + lengthRate * 40));
    onAnswer(Math.min(100, score), score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2);
  };

  const pointsCovered = answered ? detectPointsCovered(response, exercise.responsePoints) : 0;

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700 leading-relaxed">{exercise.instructions}</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-md overflow-hidden bg-white"
      >
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-gray-500" />
          <p className="text-xs font-semibold text-gray-700">E-Mail reçu</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-[11px] text-gray-500 space-y-0.5">
            <p><span className="font-semibold">Von:</span> {exercise.receivedEmail.from}</p>
            <p><span className="font-semibold">Betreff:</span> {exercise.receivedEmail.subject}</p>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-3 mt-2">
            {exercise.receivedEmail.body}
          </p>
        </div>
      </motion.div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
          Points à traiter ({exercise.responsePoints.length})
        </p>
        <ul className="space-y-1.5">
          {exercise.responsePoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-blue-900">
              <span className="h-4 w-4 rounded-full bg-blue-200 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-700">Votre réponse</p>
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums",
              inRange ? "text-emerald-600" : wordCount > exercise.maxWords ? "text-red-600" : "text-gray-400",
            )}
          >
            {wordCount} / {exercise.minWords}-{exercise.maxWords} mots
          </span>
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={answered}
          rows={8}
          placeholder={`Liebe ${exercise.receivedEmail.from.split("@")[0]},\n\n...`}
          className="w-full p-4 text-sm text-gray-900 bg-white resize-y focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed leading-relaxed"
        />
      </div>

      {!answered && (
        <button
          onClick={handleSubmit}
          disabled={wordCount < Math.floor(exercise.minWords * 0.6)}
          className="h-10 px-5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-md transition-colors flex items-center gap-2"
        >
          <Send className="h-4 w-4" /> Senden
        </button>
      )}

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 rounded-md p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-800">E-Mail envoyé</p>
          </div>
          <p className="text-xs text-emerald-700">
            Points détectés : <span className="font-bold">{pointsCovered}/{exercise.responsePoints.length}</span>
            {" · "}Mots : <span className="font-bold">{wordCount}</span> (attendu {exercise.minWords}-{exercise.maxWords})
          </p>
          {pointsCovered < exercise.responsePoints.length && (
            <div className="flex items-start gap-2 pt-2 border-t border-emerald-200">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">
                Tu n&apos;as peut-être pas traité tous les points demandés. L&apos;évaluation finale par IA viendra plus tard.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
