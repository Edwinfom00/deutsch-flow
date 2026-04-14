"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Trophy, TrendingUp } from "lucide-react";
import type { getStreakData } from "../server/streak.actions";

type StreakData = NonNullable<Awaited<ReturnType<typeof getStreakData>>>;

const WEEKDAY_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.3, delay: i * 0.06 },
  }),
};

const card = "bg-white border border-gray-200/70 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

export function StreakPage({ data }: { data: StreakData }) {
  const {
    totalXp, currentStreak, longestStreak, level,
    xpForLevel, xpInLevel, levelProgressPct,
    streakDays, xpDays, xpEvents,
  } = data;

  const today = new Date().toISOString().split("T")[0];
  const maxXp = Math.max(...xpDays.map((d) => d.xp), 1);

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-1"
      >
        <h1 className="text-[15px] font-semibold text-gray-900">Streak &amp; XP</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Streak actuel", value: `${currentStreak}j`, sub: currentStreak > 0 ? "Continue !" : "Commence aujourd'hui", icon: Flame, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
          { label: "Record", value: `${longestStreak}j`, sub: "Meilleur streak", icon: Trophy, iconBg: "bg-amber-50", iconColor: "text-amber-500" },
          { label: "XP total", value: totalXp.toLocaleString("fr-FR"), sub: `Niveau ${level}`, icon: Zap, iconBg: "bg-yellow-50", iconColor: "text-yellow-500" },
          { label: "Niveau actuel", value: level, sub: `${xpInLevel} / ${xpForLevel} XP`, icon: TrendingUp, iconBg: "bg-blue-50", iconColor: "text-blue-500" },
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
              <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{stat.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* XP vers prochain niveau */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">XP vers prochain niveau</p>
          <span className="text-xs font-semibold text-gray-900">
            {xpInLevel.toLocaleString("fr-FR")}
            <span className="text-gray-400 font-normal ml-1">/ {xpForLevel.toLocaleString("fr-FR")} XP</span>
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-sm overflow-hidden">
          <motion.div
            className="h-full bg-gray-900 rounded-sm"
            initial={{ width: 0 }}
            animate={{ width: `${levelProgressPct}%` }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">{levelProgressPct}% complété</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Calendrier streak 30 jours */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Calendrier streak — 30 jours
          </p>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_SHORT.map((d) => (
              <div key={d} className="text-center text-[9px] text-gray-300 font-medium">{d}</div>
            ))}
          </div>
          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {streakDays.map((day) => {
              const isToday = day.date === today;
              return (
                <div
                  key={day.date}
                  title={day.date}
                  className={[
                    "aspect-square rounded-sm",
                    day.completed ? "bg-emerald-400" : "bg-gray-100",
                    isToday ? "ring-1 ring-gray-900 ring-offset-1" : "",
                  ].join(" ")}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              <span className="text-[10px] text-gray-400">Complété</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-gray-100" />
              <span className="text-[10px] text-gray-400">Manqué</span>
            </div>
          </div>
        </motion.div>

        {/* Activité XP 30 jours */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Activité XP — 30 jours
          </p>
          <div className="flex items-end gap-0.5 h-24">
            {xpDays.map((day, i) => {
              const pct = day.xp > 0 ? Math.max((day.xp / maxXp) * 100, 10) : 0;
              const isToday = day.date === today;
              const label = new Date(day.date + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric" });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                  <motion.div
                    className={`w-full rounded-sm ${isToday ? "bg-gray-900" : day.xp > 0 ? "bg-gray-700" : "bg-gray-100"}`}
                    initial={{ height: 0 }}
                    animate={{ height: day.xp > 0 ? `${pct}%` : "3px" }}
                    transition={{ duration: 0.4, delay: i * 0.015 }}
                  />
                  {(i === 0 || i === 14 || i === 29) && (
                    <span className="text-[8px] text-gray-300">{label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Historique XP */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Historique XP — 20 derniers événements
        </p>
        {xpEvents.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">Aucun événement XP pour l&apos;instant.</p>
        ) : (
          <div className="space-y-0">
            {xpEvents.map((event, i) => (
              <motion.div
                key={event.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-md bg-yellow-50 flex items-center justify-center shrink-0">
                    <Zap className="h-3 w-3 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-gray-900">{event.reason}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(event.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-emerald-600">+{event.amount} XP</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
