"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Flame,
  Trophy,
  Mic,
  BookOpen,
  PenLine,
  Headphones,
  ChevronRight,
  Star,
  Zap,
  Check,
  Sparkles,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SECTOR_LABELS, SECTOR_ICONS } from "@/types";

/* ─────────────────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    emoji: "🧠",
    title: "IA Adaptative",
    desc: "L'IA analyse tes erreurs en temps réel et calibre chaque exercice à ton niveau exact. Jamais trop facile, jamais trop dur.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    badge: "Smart",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: Mic,
    emoji: "🎙️",
    title: "Zone de Parole",
    desc: "Pratique la conversation en privé avec l'IA. Aucun jugement, aucun stress. Roleplay avec un collègue, un client, un ami.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    badge: "Exclusif",
    badgeBg: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Flame,
    emoji: "🔥",
    title: "Gamification Saine",
    desc: "Streaks, XP et badges pensés pour motiver sans jamais culpabiliser. Le Streak Shield pardonne une journée manquée.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    badge: "Anti-stress",
    badgeBg: "bg-orange-100 text-orange-700",
  },
  {
    icon: Trophy,
    emoji: "🏆",
    title: "Méthode Goethe & ÖSD",
    desc: "27 types d'exercices officiels : Lesen, Schreiben, Hören, Sprechen. Prépare-toi pour les certifications A1 à C1.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    badge: "Certifiant",
    badgeBg: "bg-purple-100 text-purple-700",
  },
];

const skills = [
  { icon: BookOpen, label: "Lesen", sublabel: "Lecture", color: "bg-blue-500", light: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: PenLine, label: "Schreiben", sublabel: "Écriture", color: "bg-violet-500", light: "bg-violet-50 text-violet-600 border-violet-100" },
  { icon: Headphones, label: "Hören", sublabel: "Écoute", color: "bg-amber-500", light: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: Mic, label: "Sprechen", sublabel: "Expression orale", color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { icon: Zap, label: "Wortschatz", sublabel: "Vocabulaire", color: "bg-pink-500", light: "bg-pink-50 text-pink-600 border-pink-100" },
];

const sectors = Object.entries(SECTOR_LABELS).filter(([key]) => key !== "AUTRE");

const testimonials = [
  { name: "Sophie M.", role: "Développeuse · Berlin", text: "En 3 mois, je comprends mes collègues en stand-up. Le vocabulaire IT est 🔥", avatar: "👩‍💻", level: "A2 → B1" },
  { name: "Thomas B.", role: "Manager · Munich", text: "Enfin une app qui adapte les leçons à mon secteur. Les réunions ne me font plus peur.", avatar: "👨‍💼", level: "B1 → B2" },
  { name: "Léa F.", role: "Infirmière · Vienne", text: "Le vocabulaire médical est précis et les dialogues sont ultra-réalistes.", avatar: "👩‍⚕️", level: "A1 → A2" },
];

const levels = [
  { level: "A1", label: "Débutant", weeks: "8 sem.", color: "bg-emerald-400" },
  { level: "A2", label: "Élémentaire", weeks: "12 sem.", color: "bg-teal-400" },
  { level: "B1", label: "Intermédiaire", weeks: "20 sem.", color: "bg-blue-400" },
  { level: "B2", label: "Avancé", weeks: "28 sem.", color: "bg-violet-400" },
  { level: "C1", label: "Expert", weeks: "40 sem.", color: "bg-purple-500" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATIONS
───────────────────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fffbf0] text-[#1a1a2e] overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
              <span className="text-white font-bold text-sm font-heading">DF</span>
            </div>
            <span className="font-bold text-lg font-heading text-gray-900">DeutschFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Fonctionnalités</a>
            <a href="#sectors" className="hover:text-emerald-600 transition-colors">Secteurs</a>
            <a href="#levels" className="hover:text-emerald-600 transition-colors">Niveaux</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center h-9 px-4 text-sm font-medium text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:scale-[1.02]"
            >
              Commencer
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-5 relative overflow-hidden">
        {/* Blobs décoratifs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-56 h-56 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">

            {/* Texte */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  Méthode Goethe & ÖSD · IA Adaptative
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl lg:text-6xl font-bold font-heading text-gray-900 leading-[1.15] mb-6"
              >
                Parle allemand
                <span className="block text-emerald-500">avec confiance.</span>
                <span className="block text-3xl lg:text-4xl font-medium text-gray-400 mt-2">
                  Sans stress. Vraiment. 🇩🇪
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                L&apos;IA s&apos;adapte à ton niveau, ton rythme et ton secteur (IT, business, santé…).
                Exercices inspirés des certifications officielles allemandes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 h-13 px-7 text-base font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 hover:scale-[1.02] transition-all"
                  style={{ height: "52px" }}
                >
                  Commencer gratuitement
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-[52px] px-7 text-base font-medium text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                >
                  J&apos;ai déjà un compte
                </Link>
              </motion.div>

              {/* Trust */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400"
              >
                <div className="flex -space-x-2">
                  {["🧑‍💻", "👩‍⚕️", "👨‍💼", "👩‍🎓"].map((e, i) => (
                    <div key={i} className="h-8 w-8 rounded-full bg-white border-2 border-[#fffbf0] flex items-center justify-center text-sm shadow-sm">
                      {e}
                    </div>
                  ))}
                </div>
                <span><strong className="text-gray-700">2 400+</strong> apprenants actifs</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>4.9/5</span>
              </motion.div>
            </div>

            {/* Card démo flottante */}
            <motion.div
              initial={{ opacity: 0, x: 24, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex-shrink-0 w-full max-w-sm"
            >
              <DemoCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Skills Banner ──────────────────────────────────────────── */}
      <section className="py-10 px-5 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Les 4 compétences officielles + vocabulaire
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {skills.map((skill, i) => (
              <motion.div
                key={skill.label}
                custom={i}
                variants={fadeUp}
                className={`flex items-center gap-2.5 border rounded-xl px-4 py-2.5 ${skill.light}`}
              >
                <skill.icon className="h-4 w-4" />
                <div>
                  <p className="font-semibold text-sm leading-none">{skill.label}</p>
                  <p className="text-[11px] opacity-70 mt-0.5">{skill.sublabel}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              Conçu pour vraiment{" "}
              <span className="text-emerald-500">progresser</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              L&apos;allemand est difficile. DeutschFlow transforme chaque minute en apprentissage concret.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`bg-white rounded-2xl border ${f.border} p-7 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center text-2xl shrink-0`}>
                    {f.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold font-heading text-gray-900">{f.title}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.badgeBg}`}>
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Levels ─────────────────────────────────────────────────── */}
      <section id="levels" className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-3">
              De A1 à C1,{" "}
              <span className="text-purple-500">à ton rythme</span>
            </h2>
            <p className="text-gray-500">Chaque niveau correspond aux certifications officielles Goethe & ÖSD</p>
          </motion.div>

          <div className="space-y-3">
            {levels.map((l, i) => (
              <motion.div
                key={l.level}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100"
              >
                <div className={`h-10 w-10 rounded-xl ${l.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white font-bold text-sm font-heading">{l.level}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{l.label}</p>
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${l.color} rounded-full`}
                      style={{ width: `${20 * (i + 1)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-400 shrink-0 font-medium">{l.weeks}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sectors ────────────────────────────────────────────────── */}
      <section id="sectors" className="py-24 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <Globe className="h-3.5 w-3.5" />
              Vocabulaire sectoriel
            </span>
            <h2 className="text-4xl font-bold font-heading text-gray-900 mb-4">
              L&apos;allemand de{" "}
              <span className="text-orange-500">ton secteur</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Développeur à Berlin ? Médecin à Vienne ? L&apos;IA adapte chaque leçon à ton domaine.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {sectors.map(([key, label], i) => (
              <motion.div
                key={key}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-2xl px-5 py-3 text-sm text-gray-600 font-medium transition-all cursor-default shadow-sm"
              >
                <span className="text-lg">{SECTOR_ICONS[key as keyof typeof SECTOR_ICONS]}</span>
                <span>{label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-emerald-50">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold font-heading text-center text-gray-900 mb-10"
          >
            Ce qu&apos;ils disent 💬
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-card border border-emerald-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {t.level}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-0.5 mt-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ──────────────────────────────────────────────── */}
      <section className="py-28 px-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-5xl font-bold font-heading text-gray-900 mb-5 leading-tight">
            Prêt à entrer dans le{" "}
            <span className="text-emerald-500">flow</span> ?
          </h2>
          <p className="text-gray-500 text-xl mb-8">
            5 minutes par jour suffisent pour progresser. Commence maintenant, c&apos;est gratuit.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 h-[56px] px-10 text-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 hover:scale-[1.02] transition-all"
          >
            Démarrer gratuitement
            <ChevronRight className="h-5 w-5" />
          </Link>
          <div className="mt-5 flex items-center justify-center gap-5 text-sm text-gray-400">
            {["Gratuit", "Sans pub", "IA Adaptative", "Méthode Goethe"].map((item) => (
              <span key={item} className="flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-heading">DF</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">DeutschFlow © 2025</span>
          </div>
          <p className="text-gray-400 text-sm">
            Inspiré par Goethe-Institut & ÖSD · Propulsé par l&apos;IA Claude
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO CARD — Preview interactive d'un exercice
───────────────────────────────────────────────────────────────────────────── */
function DemoCard() {
  return (
    <div className="bg-white rounded-3xl shadow-card-hover border border-gray-100 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
          Lesen · A2
        </span>
        <span className="text-xs text-gray-400 font-medium">+15 XP</span>
      </div>

      {/* Question */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-medium">Lis le texte et réponds</p>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>Stefan</strong> arbeitet bei einer IT-Firma in Berlin. Jeden Morgen
            fährt er mit dem Fahrrad ins Büro. Er mag seinen Job sehr.
          </p>
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-gray-800">
        Comment Stefan se rend-il au travail ?
      </p>

      {/* Options */}
      <div className="space-y-2">
        {[
          { id: "a", text: "En voiture", wrong: true },
          { id: "b", text: "À vélo", correct: true },
          { id: "c", text: "En train", wrong: true },
        ].map((opt) => (
          <div
            key={opt.id}
            className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
              opt.correct
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 font-medium"
                : "border-gray-100 bg-gray-50 text-gray-400"
            }`}
          >
            <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
              opt.correct ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 text-gray-400"
            }`}>
              {opt.id.toUpperCase()}
            </span>
            {opt.text}
            {opt.correct && <Check className="ml-auto h-4 w-4 text-emerald-500" />}
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-lg">🎉</span>
        <div>
          <p className="text-sm font-semibold text-emerald-700">Excellent !</p>
          <p className="text-xs text-emerald-600">«Fahrrad» = vélo en allemand</p>
        </div>
      </div>

      {/* Streak mini */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-bold text-orange-500">7 jours</span>
          <span className="text-xs text-gray-400">de suite</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">XP total</span>
          <span className="text-sm font-bold text-emerald-600">1 240</span>
        </div>
      </div>
    </div>
  );
}
