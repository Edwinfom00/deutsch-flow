"use client";

import { motion } from "framer-motion";
import { GiSeedling, GiOpenBook, GiSpeaker, GiBullseye, GiRocketFlight } from "react-icons/gi";
import { useOnboardingStore } from "../model/onboarding.store";
import type { CEFRLevel } from "@/types";

const options: {
  value: CEFRLevel;
  badge: string;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  {
    value: "A0",
    badge: "A0",
    label: "Jamais appris",
    sub: "Je pars de zéro, aucune base en allemand",
    icon: GiSeedling,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    value: "A1",
    badge: "A1",
    label: "Débutant",
    sub: "Je connais quelques mots — Guten Tag, Danke…",
    icon: GiOpenBook,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    value: "A2",
    badge: "A2",
    label: "Élémentaire",
    sub: "Je peux me présenter et comprendre des phrases simples",
    icon: GiSpeaker,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    value: "B1",
    badge: "B1",
    label: "Intermédiaire",
    sub: "Je comprends l'essentiel et me débrouille en conversation",
    icon: GiBullseye,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    value: "B2",
    badge: "B2",
    label: "Avancé",
    sub: "Je parle avec aisance et comprends des textes complexes",
    icon: GiRocketFlight,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

export function StepLevel() {
  const { data, setData, next } = useOnboardingStore();

  const select = (value: CEFRLevel) => {
    setData({ level: value });
    setTimeout(next, 180);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape 1 sur 4</p>
        <h2 className="text-2xl font-bold font-heading text-gray-900">
          Où en es-tu en allemand ?
        </h2>
        <p className="text-sm text-gray-400">
          Sois honnête — l&apos;IA s&apos;adapte à ton vrai niveau.
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const selected = data.level === opt.value;

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
              {/* Icon + badge */}
              <div className={`h-11 w-11 rounded-lg ${opt.bg} flex flex-col items-center justify-center shrink-0 gap-0.5`}>
                <Icon className={`h-4 w-4 ${opt.color}`} />
                <span className={`text-[10px] font-black ${opt.color} leading-none`}>
                  {opt.badge}
                </span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{opt.sub}</p>
              </div>

              {/* Radio */}
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
