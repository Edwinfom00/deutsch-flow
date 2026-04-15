"use client";

import { useState, useTransition, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search, FileCheck, GraduationCap, BookOpen, Globe,
  Download, ChevronLeft, ChevronRight, Loader2, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { copyPublicImport, getCommunityImports } from "../server/community.actions";
import { LEVEL_LABELS, CEFER_LEVELS } from "@/types";
import type { CEFRLevel } from "@/types";

type CommunityData = Awaited<ReturnType<typeof getCommunityImports>>;
type Item = CommunityData["items"][number];

const DOC_TYPE_CONFIG = {
  exercises:  { label: "Exercices",  icon: FileCheck,     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  modellsatz: { label: "Modellsatz", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  grammar:    { label: "Grammaire",  icon: BookOpen,      color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200" },
  unknown:    { label: "Document",   icon: Globe,         color: "text-gray-500",   bg: "bg-gray-100",  border: "border-gray-200" },
};

const LEVEL_COLORS: Record<string, string> = {
  A0: "bg-gray-100 text-gray-600", A1: "bg-emerald-50 text-emerald-700",
  A2: "bg-teal-50 text-teal-700",  B1: "bg-blue-50 text-blue-700",
  B2: "bg-violet-50 text-violet-700", C1: "bg-purple-50 text-purple-700",
  C2: "bg-gray-900 text-white",
};

function ImportCard({ item, onCopy }: { item: Item; onCopy: (id: string) => void }) {
  const cfg = DOC_TYPE_CONFIG[item.docType as keyof typeof DOC_TYPE_CONFIG] ?? DOC_TYPE_CONFIG.unknown;
  const Icon = cfg.icon;
  const result = item.result as { summary?: string; count?: number; chapters?: object[] } | null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200/70 rounded-md p-4 space-y-3 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`h-8 w-8 rounded-md ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${cfg.color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{item.fileName}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">par {item.authorName}</p>
          </div>
        </div>
        {item.level && (
          <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-sm shrink-0", LEVEL_COLORS[item.level] ?? "bg-gray-100 text-gray-600")}>
            {item.level}
          </span>
        )}
      </div>

      {result?.summary && (
        <p className="text-xs text-gray-500 italic leading-relaxed line-clamp-2">{result.summary}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
          {result?.count !== undefined && (
            <span className="text-[10px] text-gray-400">{result.count} exercice{result.count > 1 ? "s" : ""}</span>
          )}
          {result?.chapters && (
            <span className="text-[10px] text-gray-400">{(result.chapters as object[]).length} chapitre{(result.chapters as object[]).length > 1 ? "s" : ""}</span>
          )}
        </div>
        {!item.isOwn && (
          <button onClick={() => onCopy(item.id)}
            className="flex items-center gap-1 h-7 px-2.5 text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
            <Download className="h-3 w-3" />
            Copier
          </button>
        )}
        {item.isOwn && (
          <span className="text-[9px] text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-sm">Le tien</span>
        )}
      </div>
    </motion.div>
  );
}

export function CommunityPage({ initialData }: { initialData: CommunityData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | "ALL">(initialData.userLevel as CEFRLevel);
  const [isPending, startTransition] = useTransition();
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const refresh = useCallback((type: string, level: string, q: string, page: number) => {
    startTransition(async () => {
      const fresh = await getCommunityImports({
        docType: type === "ALL" ? undefined : type,
        level: level === "ALL" ? undefined : level,
        search: q || undefined,
        page,
      });
      setData(fresh);
    });
  }, []);

  const handleSearch = (q: string) => {
    setSearch(q);
    refresh(selectedType, selectedLevel, q, 1);
  };

  const handleType = (t: string) => {
    setSelectedType(t);
    refresh(t, selectedLevel, search, 1);
  };

  const handleLevel = (l: string) => {
    setSelectedLevel(l as CEFRLevel | "ALL");
    refresh(selectedType, l, search, 1);
  };

  const handlePage = (p: number) => {
    refresh(selectedType, selectedLevel, search, p);
  };

  const handleCopy = async (importId: string) => {
    setCopyingId(importId);
    try {
      await copyPublicImport(importId);
      router.push("/import/exercises");
    } catch {
      setCopyingId(null);
    }
  };

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <h1 className="text-[15px] font-semibold text-gray-900">Communauté</h1>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Documents partagés par la communauté · Niveau {selectedLevel} par défaut
        </p>
      </motion.div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher un document…"
            className="w-full h-9 pl-9 pr-4 border border-gray-200 rounded-md text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors" />
        </div>

        {/* Type */}
        <div className="flex gap-1.5 flex-wrap">
          {["ALL", "exercises", "modellsatz", "grammar"].map((t) => (
            <button key={t} onClick={() => handleType(t)}
              className={cn("h-9 px-3 text-xs font-medium rounded-md border transition-all",
                selectedType === t ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
              {t === "ALL" ? "Tous" : DOC_TYPE_CONFIG[t as keyof typeof DOC_TYPE_CONFIG]?.label ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* Filtre niveau */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => handleLevel("ALL")}
          className={cn("h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-all",
            selectedLevel === "ALL" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
          Tous niveaux
        </button>
        {CEFER_LEVELS.map((l) => (
          <button key={l} onClick={() => handleLevel(l)}
            className={cn("h-7 px-2.5 text-[11px] font-bold rounded-md border transition-all",
              selectedLevel === l
                ? cn("border-gray-900", LEVEL_COLORS[l])
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300")}>
            {l}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{data.total} document{data.total > 1 ? "s" : ""}</span>
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </div>

      {data.items.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white border border-gray-200/70 rounded-md p-10 text-center space-y-3">
          <Globe className="h-8 w-8 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-700">Aucun document partagé</p>
          <p className="text-xs text-gray-400">
            Sois le premier à partager un document pour ce niveau !
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {data.items.map((item) => (
              <ImportCard key={item.id} item={item}
                onCopy={copyingId ? () => {} : handleCopy} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => handlePage(data.page - 1)} disabled={data.page <= 1}
            className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => handlePage(p)}
                className={cn("h-8 w-8 rounded-md text-xs font-semibold transition-all",
                  p === data.page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50")}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => handlePage(data.page + 1)} disabled={data.page >= data.totalPages}
            className="h-8 w-8 rounded-md border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
