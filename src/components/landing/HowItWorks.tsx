"use client";

import { motion } from "framer-motion";
import { UserCheck, Brain, RotateCcw, TrendingUp } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: UserCheck,
    title: "Onboarding en 2 min",
    desc: "Choisis ton niveau, ton secteur et ton objectif. L'IA configure ton parcours personnalisé.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    n: "02",
    icon: Brain,
    title: "Sessions IA quotidiennes",
    desc: "5 à 8 exercices générés en temps réel, adaptés à tes lacunes et à ton secteur professionnel.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    n: "03",
    icon: RotateCcw,
    title: "Révisions automatiques",
    desc: "L'algorithme SM-2 planifie tes révisions au moment optimal. Chaque exercice est régénéré par l'IA.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    n: "04",
    icon: TrendingUp,
    title: "Progression mesurée",
    desc: "XP, streak, badges et classement hebdomadaire. Tu vois ta progression en temps réel.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-20 px-5 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Comment ça marche</p>
          <h2 className="text-4xl font-bold font-heading text-gray-900">Simple. Efficace. Continu.</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-200/70 rounded-md p-5 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div className={`h-9 w-9 rounded-md ${s.bg} border ${s.border} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <span className="text-[10px] font-black text-gray-200">{s.n}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-gray-200" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
