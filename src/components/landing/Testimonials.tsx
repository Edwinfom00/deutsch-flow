"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sophie M.",
    role: "Développeuse · Berlin",
    initials: "SM",
    text: "En 3 mois, je comprends mes collègues en stand-up. Le vocabulaire IT est précis et les scénarios de conversation sont ultra-réalistes.",
    level: "A2 → B1",
    feature: "Zone de Parole",
  },
  {
    name: "Thomas B.",
    role: "Manager · Munich",
    initials: "TB",
    text: "J'ai importé mon Modellsatz B2 et l'IA a généré des exercices supplémentaires du même niveau. Gain de temps énorme.",
    level: "B1 → B2",
    feature: "Import PDF",
  },
  {
    name: "Léa F.",
    role: "Infirmière · Vienne",
    initials: "LF",
    text: "Le vocabulaire médical est précis. Les révisions SM-2 font que je ne réapprends jamais ce que j'ai déjà maîtrisé.",
    level: "A1 → A2",
    feature: "Révisions SM-2",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 px-5 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Témoignages</p>
          <h2 className="text-3xl font-bold font-heading text-gray-900">Ce qu&apos;ils disent.</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-gray-900 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                  <p className="text-xs text-gray-400 truncate">{t.role}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm shrink-0">
                  {t.level}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-sm">
                  {t.feature}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
