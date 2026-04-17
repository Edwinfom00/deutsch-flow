"use client";

import { useState, useTransition } from "react";
import { Swords, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { createChallenge } from "../server/challenge.actions";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

interface Props {
  importId: string;
  fileName: string;
}

export function ChallengeButton({ importId, fileName }: Props) {
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCreate = async () => {
    const ok = await confirm({
      title: "Créer un défi",
      description: `Défie un ami sur "${fileName}". Un lien sera généré — partage-le pour qu'il puisse faire le même Modellsatz et comparer vos scores.`,
      confirmLabel: "Créer le défi",
      variant: "default",
    });
    if (!ok) return;

    startTransition(async () => {
      const { challengeId } = await createChallenge(importId);
      const url = `${window.location.origin}/challenge/${challengeId}`;
      setLink(url);
    });
  };

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <ConfirmDialog />
      {!link ? (
        <button
          onClick={handleCreate}
          disabled={isPending}
          title="Défier un ami"
          className="cursor-pointer flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Swords className="h-3 w-3" />}
          <span className="hidden sm:inline">Défier</span>
        </button>
      ) : (
        <button
          onClick={handleCopy}
          className={cn(
            "cursor-pointer flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-semibold rounded-md border transition-all",
            copied
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700"
          )}
        >
          {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          <span className="hidden sm:inline">{copied ? "Copié !" : "Copier le lien"}</span>
        </button>
      )}
    </>
  );
}
