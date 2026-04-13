"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lightbulb, BookOpen, Clock, Zap, Target, Flame } from "lucide-react";

const TIPS: { icon: React.ElementType; iconColor: string; title: string; body: string }[] = [
  {
    icon: BookOpen,
    iconColor: "text-blue-400",
    title: "Le saviez-vous ?",
    body: "L'allemand est la langue maternelle la plus parlée en Europe, avec plus de 100 millions de locuteurs natifs.",
  },
  {
    icon: Target,
    iconColor: "text-emerald-400",
    title: "Astuce Goethe",
    body: "Les examens Goethe évaluent 4 compétences : Lesen, Schreiben, Hören et Sprechen. Notre IA couvre les 4 dans chaque session.",
  },
  {
    icon: Brain,
    iconColor: "text-violet-400",
    title: "Spaced Repetition",
    body: "Revoir un mot au bon moment multiplie par 3 la vitesse de mémorisation. C'est l'algorithme SM-2 intégré dans chaque session.",
  },
  {
    icon: Zap,
    iconColor: "text-amber-400",
    title: "Vocabulaire sectoriel",
    body: "Un développeur à Berlin utilise des mots très différents d'un médecin à Vienne. Tes exercices sont adaptés à ton secteur.",
  },
  {
    icon: Clock,
    iconColor: "text-sky-400",
    title: "La règle des 5 minutes",
    body: "5 minutes par jour pendant 6 mois valent mieux que 2 heures par semaine. La régularité bat l'intensité.",
  },
  {
    icon: Flame,
    iconColor: "text-orange-400",
    title: "Le streak effect",
    body: "Après 7 jours consécutifs, le cerveau commence à automatiser l'habitude. Tiens bon cette première semaine.",
  },
  {
    icon: Lightbulb,
    iconColor: "text-yellow-400",
    title: "Parler sans peur",
    body: "Les germanophones apprécient les efforts des étrangers. Même un allemand imparfait crée une vraie connexion.",
  },
  {
    icon: Target,
    iconColor: "text-teal-400",
    title: "Le niveau B1",
    body: "Le niveau B1 est le seuil d'autonomie : tu peux te débrouiller seul dans la plupart des situations du quotidien.",
  },
  {
    icon: BookOpen,
    iconColor: "text-indigo-400",
    title: "Certification Goethe",
    body: "Le certificat Goethe B2 est reconnu par la plupart des universités et employeurs allemands comme preuve de compétence.",
  },
  {
    icon: Brain,
    iconColor: "text-pink-400",
    title: "Apprendre par l'immersion",
    body: "Regarder des séries allemandes avec sous-titres allemands active les mêmes zones cérébrales que l'apprentissage formel.",
  },
];

const STEPS = [
  "Analyse de ton profil…",
  "Sélection des compétences…",
  "Génération des exercices…",
  "Calibrage du niveau…",
  "Finalisation de la session…",
];

interface Props { level: string; count: number }

export function GeneratingScreen({ level, count }: Props) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    const targets = [15, 35, 58, 78, 92];
    let i = 0;
    const tick = () => {
      if (i >= targets.length) return;
      setProgress(targets[i]);
      setStepIndex(i);
      i++;
    };
    tick();
    const id = setInterval(tick, 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTipIndex((p) => (p + 1) % TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const tip = TIPS[tipIndex];
  const TipIcon = tip.icon;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Subtle top accent line */}
      <div className="fixed top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent" />

      <div className="w-full max-w-sm space-y-10">

        {/* Icon + title */}
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex h-12 w-12 rounded-md bg-gray-900 items-center justify-center"
          >
            <Brain className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading">
              Préparation de ta session
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {count} exercices · Niveau {level}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2.5">
          <div className="h-1 bg-gray-100 rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-gray-900 rounded-sm"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.25 }}
              className="text-xs text-gray-400 text-center"
            >
              {STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Tip card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-gray-50 border border-gray-100 rounded-md p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <TipIcon className={`h-3.5 w-3.5 ${tip.iconColor}`} />
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {tip.title}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tip.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5">
          {TIPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-sm transition-all duration-300 ${
                i === tipIndex ? "w-4 bg-gray-900" : "w-1 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
