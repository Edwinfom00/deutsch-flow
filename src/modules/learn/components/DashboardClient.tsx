"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Flame, Zap, BookOpen, Mic, Trophy,
  ArrowRight, Target, Clock, TrendingUp,
} from "lucide-react";
import { LEVEL_LABELS, SECTOR_LABELS, GOAL_LABELS, SECTOR_ICONS } from "@/types";
import type { CEFRLevel, Sector, Goal } from "@/types";
import type { getDashboardData } from "../server/dashboard.actions";
import type { getWordOfDay } from "../server/word-of-day.actions";
import { WordOfDayWidget } from "./WordOfDayWidget";
import { PhraseDuJourWidget } from "./PhraseDuJourWidget";
import type { getPhraseDuJour } from "../server/phrase-du-jour.actions";

type WordEntry = NonNullable<Awaited<ReturnType<typeof getWordOfDay>>>;
type PhraseEntry = NonNullable<Awaited<ReturnType<typeof getPhraseDuJour>>>;

type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;

const LEVEL_NEXT: Record<CEFRLevel, CEFRLevel | null> = {
  A0: "A1", A1: "A2", A2: "B1", B1: "B2", B2: "C1", C1: "C2", C2: null,
};
const XP_PER_LEVEL: Record<CEFRLevel, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: 9999,
};


const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.06 } }),
};

const card = "bg-white border border-gray-200/70 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

export function DashboardClient({ data, wordOfDay, phraseDuJour }: { data: DashboardData; wordOfDay: WordEntry | null; phraseDuJour: PhraseEntry | null }) {
  const { user, profile, todayXp, todayExercises, recentSessions } = data;
  const level = (profile?.level ?? "A0") as CEFRLevel;
  const nextLevel = LEVEL_NEXT[level];
  const xpForNext = XP_PER_LEVEL[level];
  const totalXp = profile?.totalXp ?? 0;
  const xpProgress = Math.min((totalXp % xpForNext) / xpForNext, 1);
  const dailyGoal = profile?.dailyGoalMinutes ?? 15;
  const streak = profile?.currentStreak ?? 0;

  const quickActions = [
    { label: "Commencer une leçon", sub: `Lesen · ${level}`, href: "/learn", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Zone de Parole", sub: "Dialogue IA", href: "/speak", icon: Mic, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Révisions du jour", sub: "Spaced repetition", href: "/review", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50" },
    { label: "Mes badges", sub: "Voir la progression", href: "/badges", icon: Trophy, color: "text-amber-500", bg: "bg-amber-50" },
  ];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split("T")[0];
    const s = recentSessions.find((r) => r.date === d);
    return { date: d, xp: s?.xpEarned ?? 0, done: (s?.xpEarned ?? 0) > 0 };
  });

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">

      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between pt-1"
      >
        <div>
          <h1 className="text-[15px] font-semibold text-gray-900">
            Bonjour, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Link
          href="/learn"
          className="flex items-center gap-1.5 h-8 px-3 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors"
        >
          Nouvelle leçon
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Niveau", value: level, sub: LEVEL_LABELS[level], icon: Target, iconBg: "bg-gray-900", iconColor: "text-white" },
          { label: "XP total", value: totalXp.toLocaleString(), sub: `+${todayXp} aujourd'hui`, icon: Zap, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
          { label: "Streak", value: `${streak}j`, sub: streak > 0 ? "Continue !" : "Commence aujourd'hui", icon: Flame, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
          { label: "Exercices", value: String(todayExercises), sub: "aujourd'hui", icon: BookOpen, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} custom={i} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`h-6 w-6 rounded-md ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 font-heading leading-none">{stat.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Left — 2/3 */}
        <div className="lg:col-span-2 space-y-4">

          {/* XP progress */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Progression vers {nextLevel ?? "niveau max"}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {totalXp % xpForNext}
                  <span className="text-gray-400 font-normal text-xs ml-1">/ {xpForNext} XP</span>
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">{level}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-gray-300" />
                {nextLevel && (
                  <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500 text-[9px] font-black">{nextLevel}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden">
              <motion.div
                className="h-full bg-gray-900 rounded-sm"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress * 100}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          </motion.div>

          {/* Weekly activity */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Activité — 7 derniers jours
            </p>
            {(() => {
              const BAR_MAX_H = 56; // px — hauteur max de la barre (hors label)
              const maxXp = Math.max(...last7.map((d) => d.xp), 1);
              const today = new Date().toISOString().split("T")[0];
              return (
                <div className="flex items-end gap-2">
                  {last7.map((day, i) => {
                    const barH = day.xp > 0 ? Math.max(Math.round((day.xp / maxXp) * BAR_MAX_H), 10) : 4;
                    const label = new Date(day.date).toLocaleDateString("fr-FR", { weekday: "short" });
                    const isToday = day.date === today;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                        <motion.div
                          className={`w-full rounded-sm ${day.done ? "bg-emerald-500" : "bg-gray-200"}`}
                          initial={{ height: 0 }}
                          animate={{ height: barH }}
                          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                        />
                        <span className={`text-[9px] capitalize ${isToday ? "text-blue-500 font-semibold" : "text-gray-400"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>

          {/* Quick actions */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Actions rapides</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-md hover:border-gray-200 hover:bg-gray-50/80 transition-all"
                  >
                    <div className={`h-8 w-8 rounded-md ${a.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${a.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{a.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.sub}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Phrase du jour — pleine largeur sous les actions rapides */}
          {phraseDuJour && (
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
              <PhraseDuJourWidget phrase={phraseDuJour} />
            </motion.div>
          )}
        </div>

        {/* Right — 1/3 */}
        <div className="space-y-4">

          {/* Profile */}
          <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Mon profil</p>
            <div className="space-y-0">
              {[
                { label: "Niveau", value: `${level} — ${LEVEL_LABELS[level]}` },
                { label: "Secteur", value: `${SECTOR_ICONS[profile?.sector as Sector ?? "QUOTIDIEN"]} ${SECTOR_LABELS[profile?.sector as Sector ?? "QUOTIDIEN"]}` },
                { label: "Objectif", value: GOAL_LABELS[profile?.goal as Goal ?? "LOISIR"] },
                { label: "Rythme", value: `${dailyGoal} min / jour` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <span className="text-[11px] text-gray-400 shrink-0">{row.label}</span>
                  <span className="text-[12px] font-semibold text-gray-900 text-right max-w-35 truncate ml-2">{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Daily goal */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Objectif du jour</p>
              <Clock className="h-3.5 w-3.5 text-gray-300" />
            </div>
            {(() => {
              const goalExercises = dailyGoal <= 5 ? 3 : dailyGoal <= 15 ? 5 : 8;
              const remaining = Math.max(0, goalExercises - todayExercises);
              const done = todayExercises >= goalExercises;
              return (
                <>
                  <div className="flex items-baseline gap-1 mb-2.5">
                    <span className="text-3xl font-bold text-gray-900 font-heading leading-none">{todayExercises}</span>
                    <span className="text-xs text-gray-400">/ {goalExercises} exercices</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden mb-2">
                    <motion.div
                      className={`h-full rounded-sm ${done ? "bg-emerald-500" : "bg-gray-900"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((todayExercises / goalExercises) * 100, 100)}%` }}
                      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {done ? "🎉 Objectif atteint !" : `${remaining} restant${remaining > 1 ? "s" : ""}`}
                  </p>
                </>
              );
            })()}
          </motion.div>

          {/* Mot du jour */}
          {wordOfDay && (
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible">
              <WordOfDayWidget word={wordOfDay} />
            </motion.div>
          )}

          {/* Streak card */}
          <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Streak actuel</p>
              <Flame className="h-3.5 w-3.5 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900 font-heading leading-none">{streak}</span>
              <span className="text-xs text-gray-400">jours consécutifs</span>
            </div>
            <div className="flex gap-1 mt-3">
              {last7.map((day) => (
                <div
                  key={day.date}
                  className={`flex-1 h-1.5 rounded-sm ${day.done ? "bg-orange-400" : "bg-gray-200"}`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
