"use client";

import { motion } from "framer-motion";
import {
  Brain, Mic, Flame, Trophy, FileUp, BookOpen,
  RotateCcw, GraduationCap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Adaptative",
    desc: "Chaque session est générée selon ton niveau, ton secteur et tes lacunes identifiées. L'IA apprend avec toi.",
    tag: "Smart",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: Mic,
    title: "Zone de Parole",
    desc: "Dialogue en temps réel avec l'IA dans des scénarios réalistes — réunion IT, consultation médicale, entretien.",
    tag: "Exclusif",
    tagClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: FileUp,
    title: "Import de documents",
    desc: "Importe un PDF d'exercices, un Modellsatz ou un livre de grammaire. L'IA l'analyse et crée du contenu interactif.",
    tag: "Nouveau",
    tagClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    icon: RotateCcw,
    title: "Révisions intelligentes",
    desc: "L'algorithme SM-2 calcule le moment optimal pour revoir chaque exercice. Jamais trop tôt, jamais trop tard.",
    tag: "SM-2",
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    icon: BookOpen,
    title: "Vocabulaire interactif",
    desc: "Chaque mot a sa définition en allemand, 10 phrases d'exemple avec TTS, synonymes et antonymes.",
    tag: "Immersif",
    tagClass: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    icon: Flame,
    title: "Gamification saine",
    desc: "Streaks, XP, badges et classement hebdomadaire. Conçu pour motiver sans jamais culpabiliser.",
    tag: "Anti-stress",
    tagClass: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    icon: GraduationCap,
    title: "Méthode Goethe & ÖSD",
    desc: "27 types d'exercices officiels couvrant Lesen, Schreiben, Hören et Sprechen. De A0 à C2.",
    tag: "Certifiant",
    tagClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    icon: Trophy,
    title: "Classement hebdomadaire",
    desc: "Compète avec d'autres apprenants chaque semaine. Ton XP de la semaine détermine ton rang.",
    tag: "Compétitif",
    tagClass: "bg-gray-100 text-gray-600 border-gray-200",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
};

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-5">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-14">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Fonctionnalités</p>
          <h2 className="text-4xl font-bold font-heading text-gray-900 leading-tight max-w-xl">
            Tout ce qu&apos;il faut pour vraiment progresser.
          </h2>
          <p className="text-gray-400 mt-3 max-w-lg">
            Pas juste des exercices. Un système complet qui s&apos;adapte, mémorise et évolue avec toi.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className="group border border-gray-100 rounded-md p-5 hover:border-gray-200 hover:shadow-sm transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${f.tagClass}`}>
                    {f.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
