"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { SKILL_LABELS } from "@/types";
import type { Skill } from "@/types";
import type { getImportedModellsatz } from "../../server/import.actions";

type Props = { data: Awaited<ReturnType<typeof getImportedModellsatz>> };

const skillColors: Record<string, string> = {
  LESEN:     "bg-blue-50 text-blue-700 border-blue-200",
  SCHREIBEN: "bg-violet-50 text-violet-700 border-violet-200",
  HOEREN:    "bg-amber-50 text-amber-700 border-amber-200",
  SPRECHEN:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  WORTSCHATZ:"bg-pink-50 text-pink-700 border-pink-200",
  GRAMMATIK: "bg-orange-50 text-orange-700 border-orange-200",
};

export function ModellsatzTab({ data }: Props) {
  const [expanded, setExpanded] = useState<string | null>(data[0]?.importId ?? null);

  if (data.length === 0) {
    return (
      <div className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
        <div className="h-10 w-10 rounded-md bg-violet-50 flex items-center justify-center mx-auto">
          <GraduationCap className="h-5 w-5 text-violet-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">Aucun Modellsatz importé</p>
        <p className="text-xs text-gray-400">Importe un examen modèle Goethe/ÖSD dans l&apos;onglet &ldquo;Importer&rdquo;.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((group, gi) => (
        <motion.div key={group.importId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
          className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === group.importId ? null : group.importId)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="h-8 w-8 rounded-md bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
              <GraduationCap className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{group.fileName}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {group.totalExercises} exercice{group.totalExercises > 1 ? "s" : ""} · {new Date(group.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
            {expanded === group.importId ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
          </button>

          {expanded === group.importId && (
            <div className="border-t border-gray-100 p-4 space-y-4">
              {group.summary && (
                <p className="text-xs text-gray-500 italic">{group.summary}</p>
              )}
              {/* Par compétence */}
              <div className="space-y-3">
                {Object.entries(group.bySkill).map(([skill, exercises]) => (
                  <div key={skill}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${skillColors[skill] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {SKILL_LABELS[skill as Skill] ?? skill}
                      </span>
                      <span className="text-[10px] text-gray-400">{exercises.length} exercice{exercises.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="space-y-1.5 ml-2">
                      {exercises.map((ex) => {
                        const content = ex.content as { instructions?: string };
                        return (
                          <div key={ex.id} className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 rounded-md px-3 py-2">
                            <span className="text-gray-300 shrink-0 mt-0.5">—</span>
                            <span className="truncate">{content.instructions ?? ex.type.replace(/_/g, " ").toLowerCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
