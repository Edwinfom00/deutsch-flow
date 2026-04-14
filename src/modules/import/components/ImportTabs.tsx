"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileCheck, GraduationCap, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadTab } from "./tabs/UploadTab";
import { ExercisesTab } from "./tabs/ExercisesTab";
import { ModellsatzTab } from "./tabs/ModellsatzTab";
import { GrammarTab } from "./tabs/GrammarTab";
import type {
  getImports, getImportedExercises,
  getImportedModellsatz, getImportedGrammar,
} from "../server/import.actions";

type Props = {
  initialImports: Awaited<ReturnType<typeof getImports>>;
  exercises: Awaited<ReturnType<typeof getImportedExercises>>;
  modellsatz: Awaited<ReturnType<typeof getImportedModellsatz>>;
  grammar: Awaited<ReturnType<typeof getImportedGrammar>>;
};

const tabs = [
  { id: "upload",     label: "Importer",   icon: Upload,       desc: "Nouveau document" },
  { id: "exercises",  label: "Exercices",  icon: FileCheck,    desc: "Exercices importés" },
  { id: "modellsatz", label: "Modellsatz", icon: GraduationCap,desc: "Examens modèles" },
  { id: "grammar",    label: "Grammaire",  icon: BookOpen,     desc: "Livres importés" },
] as const;

type TabId = typeof tabs[number]["id"];

export function ImportTabs({ initialImports, exercises, modellsatz, grammar }: Props) {
  const [active, setActive] = useState<TabId>("upload");

  const counts: Record<TabId, number> = {
    upload: initialImports.filter(i => i.status === "pending" || i.status === "processing").length,
    exercises: exercises.length,
    modellsatz: modellsatz.length,
    grammar: grammar.length,
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Documents importés</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Importe un PDF — exercices, Modellsatz ou grammaire — et notre IA le transforme en contenu interactif.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-gray-100 pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-md border border-b-0 transition-all relative -mb-px",
                isActive
                  ? "bg-white border-gray-200 text-gray-900 z-10"
                  : "bg-transparent border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {counts[tab.id] > 0 && (
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-sm",
                  tab.id === "upload"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                )}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {active === "upload"     && <UploadTab initialImports={initialImports} />}
          {active === "exercises"  && <ExercisesTab data={exercises} />}
          {active === "modellsatz" && <ModellsatzTab data={modellsatz} />}
          {active === "grammar"    && <GrammarTab data={grammar} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
