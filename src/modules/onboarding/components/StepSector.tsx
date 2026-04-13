"use client";

import { motion } from "framer-motion";
import {
  MdComputer, MdBusinessCenter, MdLocalHospital,
  MdGavel, MdFlight, MdHome, MdCategory,
} from "react-icons/md";
import { useOnboardingStore } from "../model/onboarding.store";
import { SECTOR_LABELS } from "@/types";
import type { Sector } from "@/types";

const sectorMeta: Record<Sector, { icon: React.ElementType; color: string; bg: string }> = {
  IT:        { icon: MdComputer,       color: "text-blue-600",   bg: "bg-blue-50" },
  BUSINESS:  { icon: MdBusinessCenter, color: "text-amber-600",  bg: "bg-amber-50" },
  SANTE:     { icon: MdLocalHospital,  color: "text-red-500",    bg: "bg-red-50" },
  DROIT:     { icon: MdGavel,          color: "text-violet-600", bg: "bg-violet-50" },
  TOURISME:  { icon: MdFlight,         color: "text-sky-600",    bg: "bg-sky-50" },
  QUOTIDIEN: { icon: MdHome,           color: "text-emerald-600",bg: "bg-emerald-50" },
  AUTRE:     { icon: MdCategory,       color: "text-gray-500",   bg: "bg-gray-100" },
};

const sectors = Object.entries(SECTOR_LABELS) as [Sector, string][];

export function StepSector() {
  const { data, setData, next } = useOnboardingStore();

  const select = (value: Sector) => {
    setData({ sector: value });
    setTimeout(next, 180);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape 3 sur 4</p>
        <h2 className="text-2xl font-bold font-heading text-gray-900">
          Dans quel domaine travailles-tu ?
        </h2>
        <p className="text-sm text-gray-400">Le vocabulaire sera adapté à ton secteur.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sectors.map(([key, label], i) => {
          const { icon: Icon, color, bg } = sectorMeta[key];
          const selected = data.sector === key;

          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={() => select(key)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all group ${
                selected
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="font-medium text-gray-800 text-sm leading-tight">{label}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
