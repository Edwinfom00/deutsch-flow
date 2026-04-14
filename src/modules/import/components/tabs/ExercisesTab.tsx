"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import type { getImportedExercises } from "../../server/import.actions";

type Props = { data: Awaited<ReturnType<typeof getImportedExercises>> };

const masteryConfig = {
  new:      { label: "Nouveau",  color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  learning: { label: "En cours", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  mastered: { label: "Maîtrisé", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export function ExercisesTab({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data[0]?.importId ?? null);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
        <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center mx-auto">
          <FileCheck className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Aucun exercice importé</p>
        <p className="text-xs text-gray-400">Importe un PDF d&apos;exercices dans l&apos;onglet &ldquo;Importer&rdquo;.</p>
      </div>
    );
  }

  const totalExercises = data.reduce((s, d) => s + d.exercises.length, 0);
  const dueCount = data.reduce((s, d) => s + d.exercises.filter(e => e.isDue).length, 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Fichiers", value: data.length },
          { label: "Exercices", value: totalExercises },
          { label: "À réviser", value: dueCount },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200/70 rounded-md p-3.5">
            <p className="text-2xl font-bold text-gray-900 font-heading">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Par fichier */}
      <div className="space-y-2">
        {data.map((group, gi) => (
          <motion.div key={group.importId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gi * 0.06 }}
            className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === group.importId ? null : group.importId)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <FileCheck className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{group.fileName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {group.exercises.length} exercice{group.exercises.length > 1 ? "s" : ""} · {new Date(group.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {group.exercises.filter(e => e.isDue).length > 0 && (
                  <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                    <RotateCcw className="h-2.5 w-2.5" />
                    {group.exercises.filter(e => e.isDue).length} à réviser
                  </span>
                )}
                {expanded === group.importId ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>
            </button>

            {expanded === group.importId && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {group.exercises.map((ex, i) => {
                  const m = masteryConfig[ex.mastery as keyof typeof masteryConfig];
                  const content = ex.content as { instructions?: string };
                  return (
                    <motion.div key={ex.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-sm">
                            {SKILL_LABELS[ex.skill as Skill]}
                          </span>
                          <span className="text-[10px] text-gray-400">{ex.type.replace(/_/g, " ").toLowerCase()}</span>
                        </div>
                        {content.instructions && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{content.instructions}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-sm border", m.bg, m.color, m.border)}>
                          {m.label}
                        </span>
                        {ex.isDue && <RotateCcw className="h-3 w-3 text-red-400" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
