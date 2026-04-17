"use client";

import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileCheck, GraduationCap, BookOpen,
  CheckCircle2, XCircle, Loader2, AlertCircle, Brain, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import type { getImports } from "../../server/import.actions";

type ImportRecord = Awaited<ReturnType<typeof getImports>>[number];

const DOC_TYPE_CONFIG = {
  exercises:  { label: "Exercices",  icon: FileCheck,     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  modellsatz: { label: "Modellsatz", icon: GraduationCap, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  grammar:    { label: "Grammaire",  icon: BookOpen,      color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200" },
  unknown:    { label: "Document",   icon: FileCheck,     color: "text-gray-500",   bg: "bg-gray-100",  border: "border-gray-200" },
};

const STATUS_CONFIG = {
  pending:    { label: "En attente",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  processing: { label: "Analyse…",   color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  done:       { label: "Terminé",    color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  error:      { label: "Erreur",     color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
};

const ANALYSIS_STEPS = [
  "Extraction du texte…",
  "Détection du type de document…",
  "Analyse du contenu…",
  "Conversion en exercices…",
  "Génération du contenu supplémentaire…",
  "Finalisation…",
];

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AnalysisAnimation({ fileName }: { fileName: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targets = [15, 30, 50, 68, 85, 95];
    let i = 0;
    const tick = () => { if (i >= targets.length) return; setProgress(targets[i]); setStepIndex(i); i++; };
    tick();
    const id = setInterval(tick, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="h-9 w-9 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-blue-600" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-400 mt-0.5">Notre IA analyse ton document</p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden">
          <motion.div className="h-full bg-blue-500 rounded-sm"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={stepIndex} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }} transition={{ duration: 0.25 }}
            className="text-xs text-gray-400">{ANALYSIS_STEPS[stepIndex]}</motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-1.5">
        {ANALYSIS_STEPS.map((_, i) => (
          <div key={i} className={cn("flex-1 h-1 rounded-sm transition-all duration-500",
            i <= stepIndex ? "bg-blue-500" : "bg-gray-100")} />
        ))}
      </div>
    </motion.div>
  );
}

export function UploadTab({ initialImports }: { initialImports: ImportRecord[] }) {
  const [imports, setImports] = useState(initialImports);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzingFile, setAnalyzingFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  useEffect(() => {
    const processing = imports.filter(i => i.status === "pending" || i.status === "processing");
    if (processing.length === 0) { setAnalyzingFile(null); return; }

    let attempts = 0;
    const MAX_ATTEMPTS = 60; // 3 min max (60 × 3s)

    const interval = setInterval(async () => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        setAnalyzingFile(null);
        setUploadError("Le traitement prend trop de temps. Vérifie l'onglet Import plus tard.");
        return;
      }
      const { getImports } = await import("../../server/import.actions");
      const updated = await getImports();
      setImports(updated);
      if (!updated.some(i => i.status === "pending" || i.status === "processing")) {
        setAnalyzingFile(null);
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [imports]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") { setUploadError("Seuls les fichiers PDF sont acceptés."); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("Le fichier ne doit pas dépasser 10 MB."); return; }
    setUploadError(null);
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/import/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error ?? "Erreur lors de l'upload"); return; }
      setAnalyzingFile(file.name);
      const { getImports } = await import("../../server/import.actions");
      setImports(await getImports());
    } catch { setUploadError("Erreur réseau. Réessaie."); }
    finally { setIsUploading(false); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0]; if (file) handleFile(file);
  }, [handleFile]);

  const handleDelete = useCallback(async (imp: ImportRecord) => {
    const confirmed = await confirm({
      title: "Supprimer ce document ?",
      description: `"${imp.fileName}" et tous ses exercices associés seront définitivement supprimés. Cette action est irréversible.`,
      confirmLabel: "Supprimer",
      cancelLabel: "Annuler",
      variant: "destructive",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const { deleteImport } = await import("../../server/import.actions");
      await deleteImport(imp.id);
      setImports((prev) => prev.filter((i) => i.id !== imp.id));
    });
  }, [confirm]);

  return (
    <div className="space-y-5">
      <ConfirmDialog />
      {/* Types */}
      <div className="grid grid-cols-3 gap-3">
        {(["exercises", "modellsatz", "grammar"] as const).map((key, i) => {
          const cfg = DOC_TYPE_CONFIG[key];
          const Icon = cfg.icon;
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`border ${cfg.border} ${cfg.bg} rounded-md p-3.5 space-y-2`}>
              <Icon className={`h-4 w-4 ${cfg.color}`} />
              <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                {key === "exercises" && "Extraction + 5 exercices supplémentaires générés"}
                {key === "modellsatz" && "Extraction + 1 Modellsatz complet généré"}
                {key === "grammar" && "3 chapitres interactifs + exercices par règle"}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-md p-10 text-center cursor-pointer transition-all",
          isDragging ? "border-gray-900 bg-gray-50 scale-[1.01]" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-60"
        )}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div key="up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Upload en cours…</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3">
              <motion.div animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                <Upload className="h-8 w-8 text-gray-300" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-700">Glisse ton PDF ici ou clique pour choisir</p>
                <p className="text-xs text-gray-400 mt-1">PDF uniquement · Max 10 MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {uploadError && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{uploadError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analyzingFile && <AnalysisAnimation fileName={analyzingFile} />}
      </AnimatePresence>

      {/* Historique */}
      {imports.length > 0 && (
        <div className="bg-white border border-gray-200/70 rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600">Historique des imports</p>
            <span className="text-[10px] text-gray-400">{imports.length} document{imports.length > 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {imports.map((imp, i) => {
              const typeConfig = DOC_TYPE_CONFIG[imp.docType as keyof typeof DOC_TYPE_CONFIG] ?? DOC_TYPE_CONFIG.unknown;
              const statusConfig = STATUS_CONFIG[imp.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
              const TypeIcon = typeConfig.icon;
              const result = imp.result as { count?: number; summary?: string } | null;
              const isProcessing = imp.status === "pending" || imp.status === "processing";
              return (
                <motion.div key={imp.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }} className="px-4 py-3.5 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-md ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center shrink-0`}>
                      <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 truncate">{imp.fileName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatSize(imp.fileSize)} · {new Date(imp.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {isProcessing && <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}><Loader2 className="h-4 w-4 text-blue-400" /></motion.div>}
                      {imp.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      {imp.status === "error" && <XCircle className="h-4 w-4 text-red-400" />}
                      {!isProcessing && (
                        <button
                          onClick={() => handleDelete(imp)}
                          title="Supprimer ce document"
                          className="h-6 w-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {isProcessing && (
                    <div className="ml-11 h-1 bg-gray-100 rounded-sm overflow-hidden">
                      <motion.div className="h-full bg-blue-400 rounded-sm"
                        animate={{ width: ["20%", "80%", "20%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
                    </div>
                  )}
                  {imp.status === "done" && result && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="ml-11 space-y-0.5">
                      {result.summary && <p className="text-xs text-gray-500 italic">{result.summary}</p>}
                      {result.count !== undefined && (
                        <p className="text-xs text-emerald-700 font-medium">
                          {result.count} exercice{result.count > 1 ? "s" : ""} ajouté{result.count > 1 ? "s" : ""} — voir dans l&apos;onglet correspondant
                        </p>
                      )}
                    </motion.div>
                  )}
                  {imp.status === "error" && imp.errorMessage && (
                    <div className="ml-11 flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-red-700">Traitement échoué</p>
                        <p className="text-[11px] text-red-500 mt-0.5 leading-relaxed">{imp.errorMessage}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
