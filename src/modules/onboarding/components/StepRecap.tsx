"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { useOnboardingStore } from "../model/onboarding.store";
import { completeOnboarding } from "../server/onboarding.actions";
import { SECTOR_LABELS, SECTOR_ICONS, GOAL_LABELS, LEVEL_LABELS } from "@/types";
import type { CEFRLevel, Goal, Sector } from "@/types";

export function StepRecap() {
  const router = useRouter();
  const { data } = useOnboardingStore();
  const [loading, setLoading] = useState(false);

  const rows = [
    {
      label: "Niveau",
      value: data.level ? LEVEL_LABELS[data.level] : "—",
      badge: data.level ?? "",
    },
    {
      label: "Objectif",
      value: data.goal ? GOAL_LABELS[data.goal as Goal] : "—",
      badge: null,
    },
    {
      label: "Secteur",
      value: data.sector ? `${SECTOR_ICONS[data.sector as Sector]} ${SECTOR_LABELS[data.sector as Sector]}` : "—",
      badge: null,
    },
    {
      label: "Rythme",
      value: data.dailyGoalMinutes ? `${data.dailyGoalMinutes} min / jour` : "—",
      badge: null,
    },
  ];

  const handleStart = async () => {
    if (!data.level || !data.goal || !data.sector || !data.dailyGoalMinutes) return;
    setLoading(true);
    try {
      await completeOnboarding({
        level: data.level as CEFRLevel,
        goal: data.goal as Goal,
        sector: data.sector as Sector,
        dailyGoalMinutes: data.dailyGoalMinutes,
      });
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-4xl mb-3"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold font-heading text-gray-900">Ton plan est prêt !</h2>
        <p className="text-sm text-gray-400">L&apos;IA a tout ce qu&apos;il faut pour personnaliser ton parcours.</p>
      </div>

      {/* Recap card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden"
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-4 py-3.5 ${
              i < rows.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-20 shrink-0">
              {row.label}
            </span>
            <span className="text-sm font-semibold text-gray-900 text-right">
              {row.badge ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-md bg-gray-900 flex items-center justify-center text-white text-[10px] font-bold">
                    {row.badge}
                  </span>
                  {row.value}
                </span>
              ) : row.value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Motivational note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5"
      >
        <span className="text-lg mt-0.5">💡</span>
        <p className="text-sm text-emerald-700 leading-relaxed">
          {data.dailyGoalMinutes && data.dailyGoalMinutes <= 10
            ? "Même 5 minutes par jour font une vraie différence. La régularité bat l'intensité."
            : "Avec ce rythme, tu peux atteindre le niveau suivant en moins de 3 mois."}
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleStart}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-colors disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Préparation...</>
        ) : (
          <>Commencer mon apprentissage <ArrowRight className="h-4 w-4" /></>
        )}
      </motion.button>
    </div>
  );
}
