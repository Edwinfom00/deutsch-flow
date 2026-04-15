"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Zap,
  Trophy,
  BookOpen,
  Mic,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LEVEL_LABELS } from "@/types";
import type { PublicProfile } from "../server/public-profile.actions";
import type { CEFRLevel } from "@/types";

// ─── Icônes de badges ─────────────────────────────────────────────────────────
const BADGE_ICONS: Record<string, React.ElementType> = {
  Flame: Flame,
  Zap: Zap,
  Trophy: Trophy,
  BookOpen: BookOpen,
  Mic: Mic,
};

// ─── Couleurs par catégorie de badge ─────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  STREAK:    { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-200" },
  XP:        { bg: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-200" },
  SKILL:     { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200"   },
  MILESTONE: { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200" },
  SOCIAL:    { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200"},
  SECTOR:    { bg: "bg-pink-50",    text: "text-pink-600",    border: "border-pink-200"   },
};

// ─── Niveau CEFR → couleur ────────────────────────────────────────────────────
const LEVEL_COLORS: Record<CEFRLevel, { bg: string; text: string; border: string }> = {
  A0: { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200"   },
  A1: { bg: "bg-green-50",    text: "text-green-700",   border: "border-green-200"  },
  A2: { bg: "bg-teal-50",     text: "text-teal-700",    border: "border-teal-200"   },
  B1: { bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-200"   },
  B2: { bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200" },
  C1: { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"  },
  C2: { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200"    },
};

const card = "bg-white border border-gray-200/70 rounded-md";

export function PublicProfilePage({ profile }: { profile: PublicProfile }) {
  const router = useRouter();
  const lc = LEVEL_COLORS[profile.level];

  return (
    <div className="p-5 max-w-3xl mx-auto space-y-5">

      {/* Retour */}
      <motion.button
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au classement
      </motion.button>

      {/* Hero profil */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className={card + " p-6"}
      >
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="h-16 w-16 rounded-md bg-gray-900 flex items-center justify-center shrink-0">
            <span className="text-2xl font-black text-white">
              {profile.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900 font-heading">
                {profile.name}
              </h1>
              <span className={cn(
                "text-[11px] font-bold px-2 py-0.5 rounded-md border",
                lc.bg, lc.text, lc.border
              )}>
                {profile.level} · {LEVEL_LABELS[profile.level]}
              </span>
            </div>

            {/* Barre XP niveau */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{profile.xpInLevel.toLocaleString("fr-FR")} XP</span>
                <span>{profile.xpForLevel.toLocaleString("fr-FR")} XP pour le niveau suivant</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-sm", lc.bg.replace("bg-", "bg-").replace("-50", "-400"))}
                  initial={{ width: 0 }}
                  animate={{ width: `${profile.levelProgressPct}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                  style={{ backgroundColor: undefined }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "XP total",       value: profile.totalXp.toLocaleString("fr-FR"), icon: Zap,      color: "text-yellow-500" },
            { label: "Streak actuel",  value: `${profile.currentStreak}j`,             icon: Flame,    color: "text-orange-500" },
            { label: "Meilleur streak",value: `${profile.longestStreak}j`,             icon: TrendingUp,color: "text-blue-500"  },
            { label: "Badges",         value: profile.badges.length,                   icon: Trophy,   color: "text-violet-500" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-center space-y-1"
              >
                <Icon className={cn("h-4 w-4 mx-auto", s.color)} />
                <p className="text-base font-bold text-gray-900 leading-none">{s.value}</p>
                <p className="text-[10px] text-gray-400">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Activité 30 jours */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={card + " overflow-hidden"}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-xs font-semibold text-gray-600">Activité — 30 derniers jours</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-400 inline-block" />
              {profile.activeDays30d} jours actifs
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              {profile.xp30d.toLocaleString("fr-FR")} XP
            </span>
          </div>
        </div>

        <div className="p-4">
          {/* Grille calendrier */}
          <div className="grid grid-cols-10 gap-1">
            {profile.activityDays.map((day, i) => {
              const intensity = day.xp === 0 ? 0
                : day.xp < profile.maxDayXp * 0.25 ? 1
                : day.xp < profile.maxDayXp * 0.5  ? 2
                : day.xp < profile.maxDayXp * 0.75 ? 3
                : 4;
              const colors = [
                "bg-gray-100",
                "bg-emerald-100",
                "bg-emerald-200",
                "bg-emerald-400",
                "bg-emerald-600",
              ];
              const label = new Date(day.date).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short",
              });
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.012, duration: 0.2 }}
                  title={`${label} · ${day.xp} XP`}
                  className={cn(
                    "aspect-square rounded-sm cursor-default transition-transform hover:scale-110",
                    colors[intensity]
                  )}
                />
              );
            })}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-gray-400">Moins</span>
            {["bg-gray-100", "bg-emerald-100", "bg-emerald-200", "bg-emerald-400", "bg-emerald-600"].map((c) => (
              <span key={c} className={cn("h-2.5 w-2.5 rounded-sm", c)} />
            ))}
            <span className="text-[10px] text-gray-400">Plus</span>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className={card + " overflow-hidden"}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-gray-400" />
          <p className="text-xs font-semibold text-gray-600">
            Badges obtenus
            <span className="ml-1.5 text-gray-400 font-normal">({profile.badges.length})</span>
          </p>
        </div>

        {profile.badges.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            Aucun badge encore obtenu.
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {profile.badges.map((b, i) => {
              const Icon = BADGE_ICONS[b.icon] ?? Trophy;
              const cc = CATEGORY_COLORS[b.category] ?? CATEGORY_COLORS.MILESTONE;
              const earnedDate = new Date(b.earnedAt).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric",
              });
              return (
                <motion.div
                  key={b.badgeId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18 + i * 0.04 }}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-md border",
                    cc.bg, cc.border
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center shrink-0 bg-white/60 border",
                    cc.border
                  )}>
                    <Icon className={cn("h-4 w-4", cc.text)} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-xs font-bold leading-tight", cc.text)}>
                      {b.name}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                      {b.description}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">{earnedDate}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

    </div>
  );
}
