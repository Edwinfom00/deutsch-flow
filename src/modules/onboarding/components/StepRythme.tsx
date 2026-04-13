"use client";

import { motion } from "framer-motion";
import { MdCoffee, MdDirectionsRun, MdFitnessCenter, MdBolt } from "react-icons/md";
import { useOnboardingStore } from "../model/onboarding.store";

const options: {
  value: number;
  label: string;
  sub: string;
  tag: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  tagClass: string;
}[] = [
  {
    value: 5,
    label: "5 min / jour",
    sub: "Casual — juste maintenir le contact",
    tag: "Détendu",
    icon: MdCoffee,
    color: "text-amber-600",
    bg: "bg-amber-50",
    tagClass: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    value: 10,
    label: "10 min / jour",
    sub: "Régulier — progression constante",
    tag: "Populaire",
    icon: MdDirectionsRun,
    color: "text-sky-600",
    bg: "bg-sky-50",
    tagClass: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    value: 15,
    label: "15 min / jour",
    sub: "Sérieux — résultats en 3 mois",
    tag: "Recommandé",
    icon: MdFitnessCenter,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: 30,
    label: "30 min / jour",
    sub: "Intensif — progression rapide",
    tag: "Pro",
    icon: MdBolt,
    color: "text-violet-600",
    bg: "bg-violet-50",
    tagClass: "bg-violet-50 text-violet-600 border-violet-200",
  },
];

export function StepRythme() {
  const { data, setData, next } = useOnboardingStore();

  const select = (value: number) => {
    setData({ dailyGoalMinutes: value });
    setTimeout(next, 180);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape 4 sur 4</p>
        <h2 className="text-2xl font-bold font-heading text-gray-900">
          Combien de temps par jour ?
        </h2>
        <p className="text-sm text-gray-400">Tu pourras changer ça à tout moment.</p>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const selected = data.dailyGoalMinutes === opt.value;

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
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${opt.tagClass}`}>
                    {opt.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{opt.sub}</p>
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
