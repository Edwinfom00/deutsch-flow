"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrilleItem {
  critere: string;
  points_max: number;
  description_FR: string;
}

interface ExpressionUtile {
  usage: string;
  expression: string;
}

interface SchreibenOsdExercise {
  type?: string;
  titre?: string;
  consigne_FR?: string;
  instructions?: string;
  elements_obligatoires?: string[];
  grille_evaluation?: GrilleItem[];
  expressions_utiles?: ExpressionUtile[];
  exemple_reponse_modele?: { texte?: string; note_FR?: string };
  points_max_total?: number;
  duree_recommandee_minutes?: number;
  minWords?: number;
  maxWords?: number;
}

interface Evaluation {
  score: number;
  feedback: string;
  corrections: Array<{ original: string; correction: string; explanation: string }>;
  encouragement: string;
  modelAnswer?: string;
}

interface Props {
  exercise: SchreibenOsdExercise;
  onAnswer: (score: number, quality: number, feedback?: string) => void;
  answered: boolean;
}

export function SchreibenOsdRenderer({ exercise, onAnswer, answered }: Props) {
  const [text, setText] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  // modelAnswer affiché systématiquement — plus besoin d'un toggle

  const consigne = exercise.consigne_FR ?? exercise.instructions ?? exercise.titre ?? "";
  const minWords = exercise.minWords ?? 80;
  const maxWords = exercise.maxWords ?? 150;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isEnough = wordCount >= minWords;

  const handleSubmit = async () => {
    if (!isEnough || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/exercises/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseContent: {
            type: "SCHREIBEN_EMAIL",
            instructions: consigne,
            prompt: consigne,
            rubric: exercise.elements_obligatoires ?? [],
            level: "B1",
          },
          userResponse: text,
          level: "B1",
        }),
      });
      const ev: Evaluation = await res.json();
      setEvaluation(ev);
      const score = ev.score ?? 70;
      onAnswer(score, score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : 2, ev.feedback);
    } catch {
      const fallback: Evaluation = { score: 70, feedback: "Bonne tentative !", corrections: [], encouragement: "Continue !" };
      setEvaluation(fallback);
      onAnswer(70, 4, fallback.feedback);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Consigne */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-3">
        <p className="text-sm text-gray-800 leading-relaxed font-medium">{consigne}</p>

        {/* Éléments obligatoires */}
        {exercise.elements_obligatoires && exercise.elements_obligatoires.length > 0 && (
          <div className="border-t border-gray-200 pt-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Éléments obligatoires</p>
            {exercise.elements_obligatoires.map((el, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                <span>{el}</span>
              </div>
            ))}
          </div>
        )}

        {/* Grille d'évaluation */}
        {exercise.grille_evaluation && exercise.grille_evaluation.length > 0 && (
          <div className="border-t border-gray-200 pt-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Critères ({exercise.points_max_total} pts)
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {exercise.grille_evaluation.map((g, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-md px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">{g.critere}</span>
                    <span className="text-[10px] font-bold text-gray-400">{g.points_max} pts</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{g.description_FR}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Durée */}
        {exercise.duree_recommandee_minutes && (
          <p className="text-[10px] text-gray-400">Durée recommandée : {exercise.duree_recommandee_minutes} min</p>
        )}
      </div>

      {/* Expressions utiles */}
      {exercise.expressions_utiles && exercise.expressions_utiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expressions utiles</p>
          <div className="flex flex-wrap gap-1.5">
            {exercise.expressions_utiles.map((e, i) => (
              <button key={i} onClick={() => setText((prev) => prev ? `${prev} ${e.expression}` : e.expression)}
                disabled={answered}
                title={e.usage}
                className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-md transition-colors">
                {e.expression}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de rédaction */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={answered || isEvaluating}
          placeholder="Schreibe hier auf Deutsch…"
          className={cn(
            "w-full h-44 bg-white border rounded-md p-4 text-gray-900 placeholder:text-gray-300 resize-none text-sm leading-relaxed",
            "focus:outline-none focus:ring-1 transition-all",
            answered ? "border-gray-200 opacity-70 cursor-not-allowed" :
            "border-gray-200 focus:border-gray-400 focus:ring-gray-300"
          )}
        />
        <div className={cn(
          "absolute bottom-3 right-3 text-[11px] font-mono transition-colors",
          wordCount < minWords ? "text-gray-300" : wordCount > maxWords ? "text-red-500" : "text-emerald-600"
        )}>
          {wordCount} / {minWords}–{maxWords}
        </div>
      </div>

      {!answered && (
        <button onClick={handleSubmit} disabled={!isEnough || isEvaluating}
          className={cn(
            "flex items-center gap-2 text-sm font-medium h-9 px-5 rounded-md transition-all",
            isEnough && !isEvaluating ? "bg-gray-900 hover:bg-gray-800 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}>
          {isEvaluating ? <><Loader2 className="h-4 w-4 animate-spin" />Correction…</> : <><Send className="h-3.5 w-3.5" />Soumettre</>}
        </button>
      )}

      {/* Correction */}
      {evaluation && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className={cn("border rounded-md p-4 space-y-2",
            evaluation.score >= 70 ? "bg-emerald-50 border-emerald-200" :
            evaluation.score >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200")}>
            <div className="flex items-center gap-2">
              {evaluation.score >= 70
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                : <AlertCircle className="h-4 w-4 text-amber-500" />}
              <span className={cn("text-sm font-bold",
                evaluation.score >= 70 ? "text-emerald-700" : evaluation.score >= 50 ? "text-amber-700" : "text-red-700")}>
                {evaluation.score}/100
              </span>
            </div>
            <p className="text-sm text-gray-700">{evaluation.feedback}</p>
            {evaluation.encouragement && <p className="text-xs text-gray-500 italic">{evaluation.encouragement}</p>}
          </div>

          {evaluation.corrections.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Corrections</p>
              {evaluation.corrections.map((c, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-md p-3 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-red-500 line-through">{c.original}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-sm text-emerald-700 font-semibold">{c.correction}</span>
                  </div>
                  <p className="text-xs text-gray-500">{c.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Exemple de réponse modèle — toujours affiché après évaluation */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Exemple de mail corrigé</p>
            </div>
            {(evaluation.modelAnswer || exercise.exemple_reponse_modele?.texte) ? (
              <>
                <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-line">
                  {evaluation.modelAnswer ?? exercise.exemple_reponse_modele?.texte}
                </p>
                {exercise.exemple_reponse_modele?.note_FR && (
                  <p className="text-xs text-blue-500 italic">{exercise.exemple_reponse_modele.note_FR}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-blue-400 italic">Exemple non disponible pour cet exercice.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
