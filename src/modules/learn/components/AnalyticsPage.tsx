"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, Zap, BookOpen, Clock, Target,
  Flame, Trophy, Brain, CheckCircle2, AlertCircle, Calendar,
} from "lucide-react";
import type { getAnalyticsData } from "../server/analytics.actions";

type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.07 } }),
};

const card = "bg-white border border-gray-200/70 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

function XpChart({ data }: { data: AnalyticsData["chart30"] }) {
  const BAR_MAX_H = 64;
  const maxXp = Math.max(...data.map((d) => d.xp), 1);
  // Afficher 1 label sur 5
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-0.5 h-20">
        {data.map((day, i) => {
          const barH = day.xp > 0 ? Math.max(Math.round((day.xp / maxXp) * BAR_MAX_H), 6) : 3;
          const isToday = day.date === today;
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center group relative">
              {/* Tooltip */}
              {day.xp > 0 && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  +{day.xp} XP
                </div>
              )}
              <motion.div
                className={`w-full rounded-sm ${isToday ? "bg-emerald-500" : day.xp > 0 ? "bg-gray-800" : "bg-gray-100"}`}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{ duration: 0.4, delay: i * 0.015, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
          );
        })}
      </div>
      {/* Labels — 1 sur 5 */}
      <div className="flex gap-0.5">
        {data.map((day, i) => (
          <div key={day.date} className="flex-1 text-center">
            {i % 5 === 0 && (
              <span className="text-[8px] text-gray-400">
                {new Date(day.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillBar({ skill }: { skill: AnalyticsData["skills"][number] }) {
  const colors = {
    good:   { bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-50 border-emerald-200" },
    medium: { bar: "bg-amber-400",   text: "text-amber-700",   badge: "bg-amber-50 border-amber-200" },
    weak:   { bar: "bg-red-400",     text: "text-red-700",     badge: "bg-red-50 border-red-200" },
  }[skill.status];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700">{skill.label}</span>
          {skill.status === "weak" && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${colors.badge} ${colors.text}`}>
              À travailler
            </span>
          )}
          {skill.status === "good" && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${colors.badge} ${colors.text}`}>
              Maîtrisé
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400">{skill.totalAttempts} exercices</span>
          <span className={`text-xs font-bold ${colors.text}`}>{skill.avgScore}%</span>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${skill.avgScore}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

export function AnalyticsPage({ data }: { data: AnalyticsData }) {
  const {
    level, nextLevel, totalXp, xpInLevel, xpNeededForNext, xpProgressPct,
    totalSessions, totalExercises, totalTimeSeconds, avgScoreGlobal,
    avgDailyXp, activeDays30, currentStreak, longestStreak, totalTracked,
    examEstimate, chart30, skills,
  } = data;

  return (
    <div className="p-5 max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[15px] font-semibold text-gray-900">Analytiques</h1>
        <p className="text-xs text-gray-400 mt-0.5">Suivi de ta progression sur 90 jours</p>
      </motion.div>

      {/* Métriques globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Sessions totales",  value: totalSessions,           sub: "ces 90 derniers jours",   icon: BookOpen, iconBg: "bg-blue-50",    iconColor: "text-blue-500" },
          { label: "Exercices faits",   value: totalExercises,           sub: "toutes sessions confondues", icon: Brain,    iconBg: "bg-violet-50",  iconColor: "text-violet-500" },
          { label: "Temps total",       value: formatTime(totalTimeSeconds), sub: "d'apprentissage actif",  icon: Clock,    iconBg: "bg-amber-50",   iconColor: "text-amber-500" },
          { label: "Score moyen",       value: `${avgScoreGlobal}%`,    sub: "toutes compétences",      icon: Trophy,   iconBg: "bg-emerald-50", iconColor: "text-emerald-500" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} custom={i} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className={`h-6 w-6 rounded-md ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 font-heading leading-none">{s.value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{s.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        {/* Colonne gauche (2/3) */}
        <div className="lg:col-span-2 space-y-4">

          {/* Graphique XP 30 jours */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">XP gagnés</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">30 derniers jours</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900 font-heading">
                  {chart30.reduce((s, d) => s + d.xp, 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400">XP ce mois</p>
              </div>
            </div>
            <XpChart data={chart30} />
          </motion.div>

          {/* Performances par compétence */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Performance par compétence</p>
              <TrendingUp className="h-3.5 w-3.5 text-gray-300" />
            </div>
            {skills.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Aucune donnée encore — commence une session !</p>
            ) : (
              <div className="space-y-4">
                {skills.map((s) => <SkillBar key={s.skill} skill={s} />)}
              </div>
            )}
          </motion.div>

          {/* Niveau XP */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Progression de niveau</p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs font-black">{level}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{xpInLevel} XP</p>
                  <p className="text-[10px] text-gray-400">dans ce niveau</p>
                </div>
              </div>
              {nextLevel && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{xpNeededForNext} XP requis</p>
                  <p className="text-[10px] text-gray-400">pour passer {nextLevel}</p>
                </div>
              )}
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgressPct}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">{xpProgressPct}% vers {nextLevel ?? "niveau max"}</p>
          </motion.div>
        </div>

        {/* Colonne droite (1/3) */}
        <div className="space-y-4">

          {/* Estimation examen */}
          {examEstimate ? (
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-gray-900 rounded-md p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[40px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Estimation examen</p>
                </div>
                <p className="text-lg font-bold text-white font-heading leading-tight">
                  Goethe {examEstimate.level}
                </p>
                <p className="text-white/50 text-xs mt-1">{examEstimate.date}</p>
                <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/50">Jours restants</span>
                    <span className="text-[11px] font-semibold text-white">{examEstimate.daysLeft}j</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/50">XP / jour actuel</span>
                    <span className="text-[11px] font-semibold text-white">{avgDailyXp} XP</span>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 mt-2">
                  Basé sur ton rythme des 30 derniers jours
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Estimation examen</p>
              </div>
              <p className="text-xs text-gray-500">
                {totalSessions < 3
                  ? "Fais au moins 3 sessions pour obtenir une estimation."
                  : "Tu as déjà atteint le niveau cible 🎉"}
              </p>
            </motion.div>
          )}

          {/* Streak stats */}
          <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4 space-y-3"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Assiduité</p>
            {[
              { label: "Streak actuel",  value: `${currentStreak}j`, icon: Flame,      color: "text-orange-500", bg: "bg-orange-50" },
              { label: "Meilleur streak", value: `${longestStreak}j`, icon: Trophy,     color: "text-amber-500",  bg: "bg-amber-50" },
              { label: "Jours actifs",   value: `${activeDays30}/30`, icon: Target,     color: "text-blue-500",   bg: "bg-blue-50" },
              { label: "XP / jour actif", value: `${avgDailyXp}`,    icon: Zap,         color: "text-violet-500", bg: "bg-violet-50" },
            ].map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 w-6 rounded-md ${row.bg} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 ${row.color}`} />
                    </div>
                    <span className="text-xs text-gray-600">{row.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{row.value}</span>
                </div>
              );
            })}
          </motion.div>

          {/* SM-2 tracking */}
          <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className={card + " p-4"}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Mémoire à long terme</p>
            <p className="text-3xl font-bold text-gray-900 font-heading leading-none">{totalTracked}</p>
            <p className="text-[11px] text-gray-400 mt-1">exercices suivis en SM-2</p>
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                La répétition espacée garantit que ces contenus restent en mémoire sur le long terme.
              </p>
            </div>
          </motion.div>

          {/* Conseil personnalisé */}
          {skills.length > 0 && (
            <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Conseil IA</p>
              </div>
              {(() => {
                const weakest = skills[0];
                const strongest = skills[skills.length - 1];
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-700">
                        Concentre-toi sur <span className="font-semibold">{weakest.label}</span> ({weakest.avgScore}%) — c&apos;est ta compétence la plus faible.
                      </p>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-gray-700">
                        <span className="font-semibold">{strongest.label}</span> est ton point fort ({strongest.avgScore}%) — continue !
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
