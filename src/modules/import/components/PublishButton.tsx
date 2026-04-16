"use client";

import { useState, useTransition } from "react";
import { Globe, Lock, Loader2, Users, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toggleImportPublic } from "../server/community.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CEFRLevel } from "@/types";

// ─── Messages par niveau ──────────────────────────────────────────────────────
const PUBLISH_MESSAGES: Record<CEFRLevel, { de: string; fr: string }> = {
  A0: {
    de: "Möchtest du das teilen? Andere können es sehen.",
    fr: "Ce contenu sera visible par tous les apprenants de niveau A0.",
  },
  A1: {
    de: "Möchtest du das teilen? Andere Lernende können es sehen und benutzen.",
    fr: "Ce contenu sera visible par tous les apprenants de niveau A1.",
  },
  A2: {
    de: "Willst du diesen Inhalt mit der Community teilen? Andere Lernende auf deinem Niveau können ihn nutzen.",
    fr: "Ce contenu sera partagé avec les apprenants de niveau A2.",
  },
  B1: {
    de: "Möchtest du diesen Inhalt veröffentlichen? Andere Lernende auf dem Niveau B1 können ihn sehen und verwenden.",
    fr: "Ce contenu sera visible par les apprenants de niveau B1 dans la communauté.",
  },
  B2: {
    de: "Bist du sicher, dass du diesen Inhalt veröffentlichen möchtest? Er wird für alle B2-Lernenden in der Community sichtbar sein.",
    fr: "Ce contenu sera accessible à tous les apprenants de niveau B2 dans la communauté.",
  },
  C1: {
    de: "Möchtest du diesen Inhalt für die Community freigeben? Alle Lernenden auf dem Niveau C1 werden Zugang dazu haben.",
    fr: "Ce contenu sera partagé avec les apprenants de niveau C1 dans la communauté.",
  },
  C2: {
    de: "Sind Sie sicher, dass Sie diesen Inhalt veröffentlichen möchten? Er wird für alle C2-Lernenden in der Community zugänglich sein.",
    fr: "Ce contenu sera accessible à tous les apprenants de niveau C2 dans la communauté.",
  },
};

const UNPUBLISH_MESSAGES: Record<CEFRLevel, { de: string; fr: string }> = {
  A0: { de: "Möchtest du das nicht mehr teilen?", fr: "Ce contenu ne sera plus visible dans la communauté." },
  A1: { de: "Möchtest du das nicht mehr teilen? Andere können es dann nicht mehr sehen.", fr: "Ce contenu sera retiré de la communauté." },
  A2: { de: "Willst du diesen Inhalt aus der Community entfernen?", fr: "Ce contenu ne sera plus accessible aux autres apprenants." },
  B1: { de: "Möchtest du diesen Inhalt aus der Community entfernen? Er wird dann nicht mehr öffentlich sichtbar sein.", fr: "Ce contenu sera retiré de la communauté et ne sera plus visible." },
  B2: { de: "Bist du sicher, dass du diesen Inhalt aus der Community entfernen möchtest?", fr: "Ce contenu sera retiré de la communauté." },
  C1: { de: "Möchtest du diesen Inhalt aus der Community zurückziehen? Er wird für andere Lernende nicht mehr sichtbar sein.", fr: "Ce contenu sera retiré de la communauté." },
  C2: { de: "Sind Sie sicher, dass Sie diesen Inhalt aus der Community zurückziehen möchten?", fr: "Ce contenu ne sera plus accessible aux autres apprenants." },
};

interface Props {
  importId: string;
  isPublic: boolean;
  level?: CEFRLevel | null;
  onToggle?: (isPublic: boolean) => void;
}

export function PublishButton({ importId, isPublic: initialPublic, level, onToggle }: Props) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [open, setOpen] = useState(false);
  // "idle" | "loading" | "success"
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [, startTransition] = useTransition();

  const effectiveLevel: CEFRLevel = level ?? "B1";
  const messages = isPublic ? UNPUBLISH_MESSAGES[effectiveLevel] : PUBLISH_MESSAGES[effectiveLevel];

  const handleConfirm = () => {
    setStatus("loading");
    startTransition(async () => {
      const result = await toggleImportPublic(importId);
      setIsPublic(result.isPublic);
      onToggle?.(result.isPublic);
      setStatus("success");
      // Fermer après l'animation de succès
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1400);
    });
  };

  const handleOpenChange = (next: boolean) => {
    // Empêcher la fermeture pendant le chargement ou l'animation de succès
    if (status === "loading" || status === "success") return;
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Bouton déclencheur */}
      <button
        onClick={() => setOpen(true)}
        title={isPublic ? "Rendre privé" : "Partager avec la communauté"}
        className={cn(
          "flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold rounded-md border transition-all",
          isPublic
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
        )}
      >
        {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
        <span className="hidden sm:inline">{isPublic ? "Public" : "Privé"}</span>
      </button>

      <DialogContent showCloseButton={status === "idle"} className="max-w-sm overflow-hidden">
        <AnimatePresence mode="wait">
          {status === "success" ? (
            /* ── Écran de succès ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-3 py-4 text-center"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                className={cn(
                  "h-14 w-14 rounded-md flex items-center justify-center",
                  isPublic ? "bg-emerald-500" : "bg-gray-200"
                )}
              >
                <CheckCircle2 className="h-7 w-7 text-white" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="space-y-1"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {isPublic ? "Contenu publié" : "Contenu retiré"}
                </p>
                <p className="text-xs text-gray-400">
                  {isPublic
                    ? `Visible par les apprenants de niveau ${effectiveLevel}`
                    : "Ce contenu n'est plus visible dans la communauté"}
                </p>
              </motion.div>
              {/* Barre de progression avant fermeture */}
              <motion.div className="w-full h-0.5 bg-gray-100 rounded-sm overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-emerald-500 rounded-sm"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.3, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          ) : (
            /* ── Écran de confirmation ── */
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center shrink-0",
                    isPublic ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"
                  )}>
                    {isPublic
                      ? <Lock className="h-4 w-4 text-red-500" />
                      : <Users className="h-4 w-4 text-emerald-600" />
                    }
                  </div>
                  <DialogTitle>
                    {isPublic ? "Rendre privé" : "Partager avec la communauté"}
                  </DialogTitle>
                </div>
                <div className="space-y-3">
                  {/* Message en allemand adapté au niveau */}
                  <div className="bg-muted rounded-md px-4 py-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Auf Deutsch · Niveau {effectiveLevel}
                    </p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">
                      {messages.de}
                    </p>
                  </div>
                  {/* Description courte en français */}
                  <DialogDescription>
                    {messages.fr}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <DialogFooter className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={status === "loading"}
                >
                  Annuler
                </Button>
                <Button
                  variant={isPublic ? "destructive" : "default"}
                  size="sm"
                  onClick={handleConfirm}
                  disabled={status === "loading"}
                  className={cn(
                    !isPublic && "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                  )}
                >
                  {status === "loading" ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />Chargement…</>
                  ) : isPublic ? (
                    "Rendre privé"
                  ) : (
                    "Publier"
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
