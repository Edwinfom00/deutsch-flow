"use client";

import { motion } from "framer-motion";
import { SECTOR_LABELS } from "@/types";
import type { Sector } from "@/types";
import {
  MdComputer, MdBusinessCenter, MdLocalHospital,
  MdGavel, MdFlight, MdHome,
} from "react-icons/md";

const sectorMeta: Partial<Record<Sector, { icon: React.ElementType; color: string; bg: string; example: string }>> = {
  IT:        { icon: MdComputer,       color: "text-blue-600",   bg: "bg-blue-50",   example: "Stand-up, code review, ticket Jira" },
  BUSINESS:  { icon: MdBusinessCenter, color: "text-amber-600",  bg: "bg-amber-50",  example: "Réunion client, négociation, email formel" },
  SANTE:     { icon: MdLocalHospital,  color: "text-red-500",    bg: "bg-red-50",    example: "Consultation, ordonnance, urgences" },
  DROIT:     { icon: MdGavel,          color: "text-violet-600", bg: "bg-violet-50", example: "Contrat, conformité, tribunal" },
  TOURISME:  { icon: MdFlight,         color: "text-sky-600",    bg: "bg-sky-50",    example: "Hôtel, transport, visite guidée" },
  QUOTIDIEN: { icon: MdHome,           color: "text-emerald-600",bg: "bg-emerald-50",example: "Courses, voisins, administration" },
};

const sectors = (Object.entries(SECTOR_LABELS) as [Sector, string][]).filter(([k]) => k !== "AUTRE");

export function Sectors() {
  return (
    <section id="sectors" className="py-24 px-5">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Vocabulaire sectoriel</p>
          <h2 className="text-4xl font-bold font-heading text-gray-900">L&apos;allemand de ton métier.</h2>
          <p className="text-gray-400 mt-3 max-w-md">
            Développeur à Berlin ? Médecin à Vienne ? Chaque leçon utilise le vocabulaire exact de ton domaine.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {sectors.map(([key, label], i) => {
            const meta = sectorMeta[key];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <motion.div key={key}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="border border-gray-100 rounded-md p-4 hover:border-gray-200 hover:bg-gray-50 transition-all space-y-2.5">
                <div className={`h-8 w-8 rounded-md ${meta.bg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{meta.example}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
