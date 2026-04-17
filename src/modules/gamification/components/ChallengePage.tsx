"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Swords, Trophy, Clock, ArrowRight, CheckCircle2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { getChallengeData } from "../server/challenge.actions";

type ChallengeData = Awaited<ReturnType<typeof getChallengeData>>;

const card = "bg-white border border-gray-200/70 rounded-md";

export function ChallengePage({ data }: { data: ChallengeData }) {
  const expiresIn = Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 86400000));
  const myScore = data.myRole === "challenger" ? data.challenger.score : data.challenged?.score ?? null;
  const opponentScore = data.myRole === "challenger" ? data.challenged?.score ?? null : data.challenger.score;
  const myCompleted = data.myRole === "challenger" ? data.challenger.completed : data.challenged?.completed ?? false;
  const opponentName = data.myRole === "challenger" ? (data.challenged?.name ?? "En attente…") : data.challenger.name;

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Swords className="h-4 w-4 text-amber-500" />
          <h1 className="text-[15px] font-semibold text-gray-900">Défi Modellsatz</h1>
        </div>
        <p className="text-xs text-gray-400">
          {data.status === "done" ? "Défi terminé" : data.status === "open" ? "En attente d'un adversaire" : "En cours"}
          {expiresIn > 0 && data.status !== "done" && ` · expire dans ${expiresIn}j`}
        </p>
      </motion.div>

      {/* Scores */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className={card + " p-5"}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "Toi", score: myScore, completed: myCompleted, isMe: true },
            { name: opponentName, score: opponentScore, completed: data.challenged?.completed ?? false, isMe: false },
          ].map((p, i) => (
            <div key={i} className={cn("rounded-md p-4 text-center space-y-2 border",
              p.isMe ? "bg-gray-900 border-gray-900" : "bg-gray-50 border-gray-200")}>
              <p className={cn("text-xs font-semibold truncate", p.isMe ? "text-white/60" : "text-gray-400")}>{p.name}</p>
              {p.completed && p.score !== null ? (
                <p className={cn("text-3xl font-black font-heading", p.isMe ? "text-white" : "text-gray-900")}>
                  {p.score}%
                </p>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <Timer className={cn("h-4 w-4", p.isMe ? "text-white/40" : "text-gray-300")} />
                  <p className={cn("text-sm font-medium", p.isMe ? "text-white/40" : "text-gray-400")}>
                    {p.isMe ? "Pas encore joué" : "En attente"}
                  </p>
                </div>
              )}
              {p.completed && (
                <CheckCircle2 className={cn("h-4 w-4 mx-auto", p.isMe ? "text-emerald-400" : "text-emerald-500")} />
              )}
            </div>
          ))}
        </div>

        {data.winner && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-md py-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-bold text-amber-700">{data.winner} remporte le défi !</p>
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="space-y-3">
        {!myCompleted && data.importId && (
          <Link href={`/import/modellsatz`}
            className="flex items-center justify-between gap-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md px-5 py-3.5 transition-colors">
            <div>
              <p className="text-sm font-semibold">Faire le Modellsatz</p>
              <p className="text-xs text-white/40 mt-0.5">Ton score sera enregistré automatiquement</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        )}

        {data.status === "open" && !data.isChallenged && (
          <div className={card + " p-4 space-y-2"}>
            <p className="text-xs font-semibold text-gray-600">Partager ce défi</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
              <p className="text-xs text-gray-500 truncate flex-1 font-mono">
                {typeof window !== "undefined" ? window.location.href : ""}
              </p>
            </div>
            <p className="text-[10px] text-gray-400">Envoie ce lien à ton ami pour qu&apos;il rejoigne le défi</p>
          </div>
        )}

        <Link href="/league" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowRight className="h-3.5 w-3.5" />
          Voir le classement
        </Link>
      </motion.div>
    </div>
  );
}
