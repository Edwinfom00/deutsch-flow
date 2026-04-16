"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExerciseContent } from "@/types";
import { SKILL_LABELS } from "@/types";

import { MultipleChoiceRenderer } from "./renderers/MultipleChoiceRenderer";
import { TrueFalseRenderer } from "./renderers/TrueFalseRenderer";
import { FillInBlankRenderer } from "./renderers/FillInBlankRenderer";
import { FlashcardRenderer } from "./renderers/FlashcardRenderer";
import { SentenceBuilderRenderer } from "./renderers/SentenceBuilderRenderer";
import { WritingRenderer } from "./renderers/WritingRenderer";
import { MatchingRenderer } from "./renderers/MatchingRenderer";
import { HoerenMCRenderer, HoerenRFRenderer } from "./renderers/HoerenRenderer";
import { GrammatikTransformationRenderer } from "./renderers/GrammatikTransformationRenderer";
import { SprechenRenderer } from "./renderers/SprechenRenderer";
import { ReihenfolgeRenderer } from "./renderers/ReihenfolgeRenderer";
import { FehlerkorrekturRenderer } from "./renderers/FehlerkorrekturRenderer";
import { MatchingHeadlinesRenderer } from "./renderers/osd/MatchingHeadlinesRenderer";
import { MultipleChoiceReadingRenderer } from "./renderers/osd/MultipleChoiceReadingRenderer";
import { SituationAdMatchingRenderer } from "./renderers/osd/SituationAdMatchingRenderer";
import { OsdLueckentextRenderer } from "./renderers/osd/OsdLueckentextRenderer";
import { SchreibenOsdRenderer } from "./renderers/osd/SchreibenOsdRenderer";

export interface ExerciseResult {
  score: number;
  quality: number;
  timeSpentSeconds: number;
  feedback?: string;
}

interface ExerciseRendererProps {
  exercise: ExerciseContent;
  onComplete: (result: ExerciseResult) => void;
  onSkip?: () => void;
  /** Masquer le header skill/level/XP (ex: dans ImportedModellsatzPage qui a son propre header) */
  hideHeader?: boolean;
}

// ─── Types ÖSD qui gèrent leur propre feedback interne ───────────────────────
// Pour ces types, on n'affiche PAS le bloc feedback de ExerciseRenderer
// (ils ont leur propre UI de correction intégrée)
const OSD_SELF_CONTAINED_TYPES = new Set([
  "MATCHING_HEADLINES", "HEADLINE_MATCHING",
  "MULTIPLE_CHOICE_READING", "READING_COMPREHENSION", "LESEVERSTEHEN",
  "SITUATION_AD_MATCHING", "AD_MATCHING", "TEXT_MATCHING",
  "GRAMMATIK_LUECKENTEXT", "LESEN_LUECKENTEXT", "VOCAB_LUECKENTEXT",
  "SCHREIBEN_EMAIL", "SCHREIBEN_MEINUNG", "SCHREIBEN_BESCHREIBUNG",
  "SCHREIBEN_NOTIZ", "SCHREIBEN_ZUSAMMENFASSUNG",
]);

// Types ÖSD qui ont leur propre structure (consigne_FR, texte, etc.)
// → on ne ré-affiche pas le bloc "Instructions" générique
const OSD_TYPES_WITH_BUILTIN_INSTRUCTIONS = new Set([
  "MATCHING_HEADLINES", "HEADLINE_MATCHING",
  "MULTIPLE_CHOICE_READING", "READING_COMPREHENSION", "LESEVERSTEHEN",
  "SITUATION_AD_MATCHING", "AD_MATCHING", "TEXT_MATCHING",
  "GRAMMATIK_LUECKENTEXT",
  "SCHREIBEN_EMAIL", "SCHREIBEN_MEINUNG", "SCHREIBEN_BESCHREIBUNG",
  "SCHREIBEN_NOTIZ", "SCHREIBEN_ZUSAMMENFASSUNG",
]);

export function ExerciseRenderer({ exercise, onComplete, onSkip, hideHeader }: ExerciseRendererProps) {
  const [startTime] = useState(Date.now());
  const [result, setResult] = useState<ExerciseResult | null>(null);

  const rawType = ((exercise as unknown as Record<string, unknown>).type as string ?? "").toUpperCase();

  // Détecter si c'est un type ÖSD auto-contenu
  const isSelfContained = OSD_SELF_CONTAINED_TYPES.has(rawType) ||
    isOsdByStructure(exercise as unknown as Record<string, unknown>);

  // Détecter si le renderer a ses propres instructions
  const hasBuiltinInstructions = OSD_TYPES_WITH_BUILTIN_INSTRUCTIONS.has(rawType) ||
    isOsdByStructure(exercise as unknown as Record<string, unknown>);

  const handleAnswer = (score: number, quality: number, feedback?: string) => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const feedbackStr = feedback == null
      ? undefined
      : typeof feedback === "string"
      ? feedback
      : JSON.stringify(feedback);
    const r = { score, quality, timeSpentSeconds, feedback: feedbackStr };
    setResult(r);
    // On ne complete PAS ici — l'utilisateur doit cliquer "Exercice suivant"
    // (que ce soit un type standard ou ÖSD)
  };

  const handleNext = () => {
    if (result) onComplete(result);
  };

  const instructions = exercise.instructions
    || (exercise as unknown as Record<string, unknown>).consigne_FR as string
    || (exercise as unknown as Record<string, unknown>).consigne as string
    || "";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">

      {/* Header skill/level/XP — masquable */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            {SKILL_LABELS[exercise.skill]}
          </span>
          <span className="text-[11px] text-gray-400">
            Niveau {exercise.level} · +{exercise.xpReward} XP
          </span>
        </div>
      )}

      {/* Instructions — seulement si le renderer n'a pas les siennes */}
      {!hasBuiltinInstructions && instructions && (
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <p className="text-gray-900 font-medium leading-relaxed text-sm">{instructions}</p>
          {exercise.instructionsDe && (
            <p className="mt-1.5 text-gray-400 text-xs italic">{exercise.instructionsDe}</p>
          )}
        </div>
      )}

      {/* Renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={rawType || "unknown"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <ExerciseBody
            exercise={exercise}
            onAnswer={handleAnswer}
            answered={!!result}
          />
        </motion.div>
      </AnimatePresence>

      {/* Feedback + bouton Suivant — seulement pour les types NON auto-contenus */}
      {!isSelfContained && (
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-md border p-4 space-y-3",
                result.score >= 70 ? "bg-emerald-50 border-emerald-200" :
                result.score >= 40 ? "bg-amber-50 border-amber-200" :
                "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-center gap-2.5">
                {result.score >= 70
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                }
                <p className={cn(
                  "text-sm font-semibold",
                  result.score >= 70 ? "text-emerald-700" :
                  result.score >= 40 ? "text-amber-700" : "text-red-700"
                )}>
                  {result.score === 100 ? "Parfait !" :
                   result.score >= 70 ? "Très bien !" :
                   result.score >= 40 ? "Presque !" : "Pas encore — continue !"}
                </p>
              </div>
              {result.feedback && (
                <p className="text-sm text-gray-600 leading-relaxed">{result.feedback}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 h-8 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Suivant <ArrowRight className="h-3.5 w-3.5" />
                </button>
                {onSkip && !result && (
                  <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 h-8 px-3 rounded-md transition-colors">
                    Passer
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Pour les types auto-contenus : bouton Suivant simple après complétion */}
      {isSelfContained && result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-2 border-t border-gray-100"
        >
          <div className="flex items-center gap-2">
            {result.score >= 70
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              : <XCircle className="h-4 w-4 text-red-400" />
            }
            <span className={cn(
              "text-sm font-semibold",
              result.score >= 70 ? "text-emerald-700" : "text-red-600"
            )}>
              {result.score}%
            </span>
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 h-8 px-4 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Exercice suivant <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Détection ÖSD par structure (quand type absent ou non reconnu) ───────────
function isOsdByStructure(content: Record<string, unknown>): boolean {
  return !!(
    (content.texte && content.questions) ||
    content.grille_evaluation ||
    content.elements_obligatoires ||
    content.consigne_FR ||
    content.vocabulaire_cle ||
    content.script_audio
  );
}

// ─── Composant séparé pour le corps de l'exercice ────────────────────────────
// Séparé de ExerciseRenderer pour éviter les problèmes de hooks avec renderExercise()
function ExerciseBody({
  exercise,
  onAnswer,
  answered,
}: {
  exercise: ExerciseContent;
  onAnswer: (score: number, quality: number, feedback?: string) => void;
  answered: boolean;
}) {
  const content = exercise as unknown as Record<string, unknown>;
  const rawType = ((content.type as string) ?? "").toUpperCase();

  // ── Types ÖSD spécifiques ─────────────────────────────────────────────────
  if (rawType === "MATCHING_HEADLINES" || rawType === "HEADLINE_MATCHING")
    return <MatchingHeadlinesRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (rawType === "MULTIPLE_CHOICE_READING" || rawType === "READING_COMPREHENSION" || rawType === "LESEVERSTEHEN")
    return <MultipleChoiceReadingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  if (rawType === "SITUATION_AD_MATCHING" || rawType === "AD_MATCHING" || rawType === "TEXT_MATCHING")
    return <SituationAdMatchingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  // Lückentext ÖSD (structure avec texte.corps ou vocabulaire_cle ou consigne_FR)
  const hasOsdStructure = !!(content.texte || content.vocabulaire_cle || content.consigne_FR);
  if (
    (rawType === "GRAMMATIK_LUECKENTEXT" || rawType === "LESEN_LUECKENTEXT" || rawType === "VOCAB_LUECKENTEXT")
    && hasOsdStructure
  )
    return <OsdLueckentextRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  // Schreiben ÖSD
  if (
    content.grille_evaluation ||
    content.elements_obligatoires ||
    (["SCHREIBEN_EMAIL","SCHREIBEN_MEINUNG","SCHREIBEN_BESCHREIBUNG","SCHREIBEN_NOTIZ","SCHREIBEN_ZUSAMMENFASSUNG"].includes(rawType) && hasOsdStructure)
  )
    return <SchreibenOsdRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  // ── Détection par structure quand type absent ─────────────────────────────
  if (!rawType || rawType === "") {
    if (content.texte && content.questions)
      return <OsdLueckentextRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
    if (content.grille_evaluation || content.elements_obligatoires)
      return <SchreibenOsdRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
    if (content.script_audio) {
      const script = content.script_audio as { dialogue?: Array<{ locuteur: string; replique: string }> };
      const scriptText = script.dialogue?.map((d) => `${d.locuteur}: ${d.replique}`).join("\n") ?? "";
      return <HoerenMCRenderer exercise={{
        ...exercise,
        type: "HOEREN_MULTIPLE_CHOICE",
        script: scriptText,
        question: (content.questions as Array<{ question?: string }>)?.[0]?.question ?? "",
        options: (() => {
          const opts = (content.questions as Array<{ options?: Record<string, string> }>)?.[0]?.options ?? {};
          return Object.entries(opts).map(([id, text]) => ({
            id, text,
            isCorrect: id === (content.questions as Array<{ bonne_reponse?: string }>)?.[0]?.bonne_reponse,
          }));
        })(),
      } as never} onAnswer={onAnswer} answered={answered} />;
    }
  }

  // ── Types standard ────────────────────────────────────────────────────────
  if (rawType === "LESEN_MULTIPLE_CHOICE")
    return <MultipleChoiceRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "HOEREN_MULTIPLE_CHOICE")
    return <HoerenMCRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "LESEN_RICHTIG_FALSCH")
    return <TrueFalseRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "HOEREN_RICHTIG_FALSCH")
    return <HoerenRFRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "LESEN_LUECKENTEXT" || rawType === "VOCAB_LUECKENTEXT" || rawType === "GRAMMATIK_LUECKENTEXT")
    return <FillInBlankRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "VOCAB_FLASHCARD")
    return <FlashcardRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "GRAMMATIK_ORDNEN")
    return <SentenceBuilderRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "LESEN_REIHENFOLGE")
    return <ReihenfolgeRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "GRAMMATIK_FEHLERKORREKTUR")
    return <FehlerkorrekturRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "GRAMMATIK_TRANSFORMATION")
    return <GrammatikTransformationRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (["SCHREIBEN_EMAIL","SCHREIBEN_MEINUNG","SCHREIBEN_BESCHREIBUNG","SCHREIBEN_NOTIZ","SCHREIBEN_ZUSAMMENFASSUNG"].includes(rawType))
    return <WritingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (["LESEN_ZUORDNUNG","VOCAB_ZUORDNUNG","HOEREN_ZUORDNUNG","VOCAB_BILD"].includes(rawType))
    return <MatchingRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "HOEREN_ERGAENZUNG")
    return <FillInBlankRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (rawType === "VOCAB_SEKTOR")
    return <FlashcardRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;
  if (["SPRECHEN_DIALOG","SPRECHEN_ROLEPLAY","SPRECHEN_VORSTELLEN","SPRECHEN_BESCHREIBUNG","SPRECHEN_DISKUSSION"].includes(rawType))
    return <SprechenRenderer exercise={exercise as never} onAnswer={onAnswer} answered={answered} />;

  // ── Fallback ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-5 text-center space-y-3">
      <p className="text-xs text-gray-500">
        Type : <span className="font-mono text-gray-700">{rawType || "(inconnu)"}</span>
      </p>
      <p className="text-xs text-gray-400">Ce type d&apos;exercice n&apos;a pas encore de rendu dédié.</p>
      <button
        onClick={() => onAnswer(80, 4)}
        className="h-8 px-4 bg-gray-900 text-white text-xs font-semibold rounded-md"
      >
        Marquer comme fait
      </button>
    </div>
  );
}
