"use client";

import { motion } from "framer-motion";
import { Flame, Zap, BookOpen, Mic, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { getBadges } from "../server/badges.actions";

type Badge = Awaited<ReturnType<typeof getBadges>>[number];

const iconMap: Record<string, React.ElementType> = {
  Flame, Zap, BookOpen, Mic, Trophy,
};

const categoryLabels: Record<string, string> = {
  STREAK: "Régularité",
  XP: "Expérience",
  MILESTONE: "Étapes",
  SKILL: "Compétences",
  SECTOR: "Secteur",
  SOCIAL: "Social",
};

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const Icon = iconMap[badge.icon] ?? Trophy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "bg-white border rounded-md p-4 space-y-3 transition-all",
        badge.earned
          ? "border-gray-200 shadow-sm"
          : "border-gray-100 opacity-60"
      )}
    >
      {/* Icon */}
      <div className="flex items-start justify-between">
        <div className={cn(
          "h-10 w-10 rounded-md flex items-center justify-center",
          badge.earned ? "bg-amber-50" : "bg-gray-100"
        )}>
          <Icon className={cn("h-5 w-5", badge.earned ? "text-amber-500" : "text-gray-400")} />
        </div>
        {badge.earned && (
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-sm">
            Obtenu
          </span>
        )}
      </div>

      {/* Info */}
      <div>
        <p className={cn("text-sm font-semibold leading-tight", badge.earned ? "text-gray-900" : "text-gray-500")}>
          {badge.nameFr}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{badge.descriptionFr}</p>
      </div>

      {/* Progress */}
      {!badge.earned && (
        <div className="space-y-1">
          <div className="h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-gray-400 rounded-sm"
              initial={{ width: 0 }}
              animate={{ width: `${badge.progressPct}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <p className="text-[9px] text-gray-400 text-right">
            {badge.progress} / {badge.target}
          </p>
        </div>
      )}

      {badge.earned && badge.earnedAt && (
        <p className="text-[9px] text-gray-300">
          {new Date(badge.earnedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      )}

      {/* XP bonus */}
      {badge.xpBonus > 0 && (
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] text-amber-600 font-semibold">+{badge.xpBonus} XP</span>
        </div>
      )}
    </motion.div>
  );
}

export function BadgesPage({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned);
  const categories = [...new Set(badges.map((b) => b.category))];

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[15px] font-semibold text-gray-900">Badges</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {earned.length} / {badges.length} obtenus
        </p>
      </motion.div>

      {/* Progress global */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-200/70 rounded-md p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-700">{earned.length} badges obtenus</span>
          <span className="text-gray-400">{badges.length - earned.length} restants</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
          <motion.div
            className="h-full bg-amber-400 rounded-sm"
            initial={{ width: 0 }}
            animate={{ width: `${badges.length > 0 ? (earned.length / badges.length) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </motion.div>

      {/* Par catégorie */}
      {categories.map((cat) => {
        const catBadges = badges.filter((b) => b.category === cat);
        return (
          <div key={cat} className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {categoryLabels[cat] ?? cat}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {catBadges.map((b, i) => (
                <BadgeCard key={b.id} badge={b} index={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
