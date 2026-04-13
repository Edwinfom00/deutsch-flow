"use client";

import { motion } from "framer-motion";
import { MdFlightTakeoff, MdWork, MdSchool, MdEmojiEvents, MdMusicNote } from "react-icons/md";
import { useOnboardingStore } from "../model/onboarding.store";
import type { Goal } from "@/types";

const options: {
  value: Goal;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    value: "VOYAGE",
    label: "Voyager",
    sub: "Vacances, tourisme, découverte de l'Allemagne",
    icon: MdFlightTakeoff,
    color: "text-sky-600",
    bg: "bg-sky-50",
  },
  {
    value: "TRAVAIL",
    label: "Travailler",
    sub: "Intégrer une équipe ou une entreprise allemande",
    icon: MdWork,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "ETUDES",
    label: "Étudier",
    sub: "Université, échanges Erasmus, études à l'étranger",
    icon: MdSchool,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    value: "CERTIFICATION",
    label: "Certification",
    sub: "Préparer Goethe, ÖSD ou TestDaF",
    icon: MdEmojiEvents,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    value: "LOISIR",
    label: "Par plaisir",
    sub: "Culture, films, musique, curiosité personnelle",
    icon: MdMusicNote,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

export function StepGoal() {
  const { data, setData, next } = useOnboardingStore();

  const select = (value: Goal) => {
    setData({ goal: value });
    setTimeout(next, 180);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape 2 sur 4</p>
        <h2 className="text-2xl font-bold font-heading text-gray-900">
          Pourquoi tu apprends l&apos;allemand ?
        </h2>
        <p className="text-sm text-gray-400">L&apos;IA adapte les scénarios à ton objectif.</p>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const selected = data.goal === opt.value;

          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              onClick={() => select(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                selected
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`h-11 w-11 rounded-lg ${opt.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${opt.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{opt.sub}</p>
              </div>
              <div className={`h-4 w-4 rounded-full border-2 shrink-0 transition-all ${
                selected
                  ? "border-gray-900 bg-gray-900"
                  : "border-gray-200 group-hover:border-gray-400"
              }`} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
