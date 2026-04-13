"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Brain, Flame, Trophy, Mic, BookOpen, PenLine,
  Headphones, ChevronRight, Star, Zap, Check, Sparkles, Globe, ArrowRight,
} from "lucide-react";
import { SECTOR_LABELS, SECTOR_ICONS } from "@/types";

/* ─── DATA ──────────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: Brain,
    title: "IA Adaptative",
    desc: "L'IA analyse tes erreurs en temps réel et calibre chaque exercice à ton niveau exact.",
    tag: "Smart",
    accent: "emerald",
  },
  {
    icon: Mic,
    title: "Zone de Parole",
    desc: "Pratique la conversation en privé avec l'IA. Roleplay avec un collègue, un client, un ami.",
    tag: "Exclusif",
    accent: "blue",
  },
  {
    icon: Flame,
    title: "Gamification Saine",
    desc: "Streaks, XP et badges pensés pour motiver sans jamais culpabiliser.",
    tag: "Anti-stress",
    accent: "orange",
  },
  {
    icon: Trophy,
    title: "Méthode Goethe & ÖSD",
    desc: "27 types d'exercices officiels. Prépare-toi pour les certifications A1 à C1.",
    tag: "Certifiant",
    accent: "violet",
  },
];

const skills = [
  { icon: BookOpen, label: "Lesen", sub: "Lecture", dot: "bg-blue-500" },
  { icon: PenLine, label: "Schreiben", sub: "Écriture", dot: "bg-violet-500" },
  { icon: Headphones, label: "Hören", sub: "Écoute", dot: "bg-amber-500" },
  { icon: Mic, label: "Sprechen", sub: "Expression", dot: "bg-emerald-500" },
  { icon: Zap, label: "Wortschatz", sub: "Vocabulaire", dot: "bg-pink-500" },
];

const levels = [
  { level: "A1", label: "Débutant", weeks: "8 sem.", w: "20%" },
  { level: "A2", label: "Élémentaire", weeks: "12 sem.", w: "36%" },
  { level: "B1", label: "Intermédiaire", weeks: "20 sem.", w: "52%" },
  { level: "B2", label: "Avancé", weeks: "28 sem.", w: "68%" },
  { level: "C1", label: "Expert", weeks: "40 sem.", w: "88%" },
];

const testimonials = [
  { name: "Sophie M.", role: "Développeuse · Berlin", text: "En 3 mois, je comprends mes collègues en stand-up. Le vocabulaire IT est incroyable.", avatar: "👩‍💻", level: "A2 → B1" },
  { name: "Thomas B.", role: "Manager · Munich", text: "Enfin une app qui adapte les leçons à mon secteur. Les réunions ne me font plus peur.", avatar: "👨‍💼", level: "B1 → B2" },
  { name: "Léa F.", role: "Infirmière · Vienne", text: "Le vocabulaire médical est précis et les dialogues sont ultra-réalistes.", avatar: "👩‍⚕️", level: "A1 → A2" },
];

const sectors = Object.entries(SECTOR_LABELS).filter(([k]) => k !== "AUTRE");

/* ─── ANIMATIONS ─────────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

/* ─── ACCENT COLORS ──────────────────────────────────────────────────────────── */
const accentMap: Record<string, { tag: string; dot: string }> = {
  emerald: { tag: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  blue:    { tag: "bg-blue-50 text-blue-700 border-blue-200",          dot: "bg-blue-500" },
  orange:  { tag: "bg-orange-50 text-orange-700 border-orange-200",    dot: "bg-orange-500" },
  violet:  { tag: "bg-violet-50 text-violet-700 border-violet-200",    dot: "bg-violet-500" },
};

/* ─── PAGE ───────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 h-15 flex items-center justify-between" style={{ height: "60px" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-heading">DF</span>
            </div>
            <span className="font-bold text-base font-heading text-gray-900">DeutschFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-gray-400 font-medium">
            {[["#features", "Fonctionnalités"], ["#sectors", "Secteurs"], ["#levels", "Niveaux"]].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-gray-900 transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex h-9 px-4 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all items-center">
              Connexion
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all">
              Commencer
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-28 pb-24 px-5 overflow-hidden bg-[#0a0a0f]">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-100 h-75 bg-blue-500/8 rounded-full blur-[80px]" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-md mb-6">
                  <Sparkles className="h-3 w-3" />
                  Méthode Goethe & ÖSD · IA Adaptative
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-5xl lg:text-6xl font-bold font-heading text-white leading-[1.08] mb-5"
              >
                Parle allemand
                <span className="block text-emerald-400">avec confiance.</span>
                <span className="block text-2xl lg:text-3xl font-medium text-white/30 mt-3">
                  Sans stress. Vraiment. 🇩🇪
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="text-base text-white/50 mb-8 leading-relaxed max-w-md mx-auto lg:mx-0"
              >
                L&apos;IA s&apos;adapte à ton niveau, ton rythme et ton secteur.
                Exercices inspirés des certifications officielles allemandes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center h-12 px-7 text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 rounded-lg transition-all"
                >
                  J&apos;ai déjà un compte
                </Link>
              </motion.div>

              {/* Trust */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-white/30"
              >
                <div className="flex -space-x-2">
                  {["🧑‍💻", "👩‍⚕️", "👨‍💼", "👩‍🎓"].map((e, i) => (
                    <div key={i} className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
                      {e}
                    </div>
                  ))}
                </div>
                <span><span className="text-white/70 font-semibold">2 400+</span> apprenants actifs</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
                <span>4.9/5</span>
              </motion.div>
            </div>

            {/* Demo card */}
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="shrink-0 w-full max-w-[320px]"
            >
              <DemoCard />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Skills strip ────────────────────────────────────────────── */}
      <section className="py-10 px-5 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-6">
            Les 4 compétences officielles + vocabulaire
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2.5"
          >
            {skills.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                variants={fadeUp}
                className="flex items-center gap-2.5 border border-gray-100 rounded-lg px-4 py-2.5 hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                <div>
                  <p className="font-semibold text-sm text-gray-800 leading-none">{s.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Fonctionnalités</p>
            <h2 className="text-4xl font-bold font-heading text-gray-900 leading-tight">
              Conçu pour vraiment progresser.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((f, i) => {
              const a = accentMap[f.accent];
              return (
                <motion.div
                  key={f.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors">
                      <f.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-gray-900">{f.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${a.tag}`}>
                          {f.tag}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Levels ──────────────────────────────────────────────────── */}
      <section id="levels" className="py-20 px-5 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Progression</p>
            <h2 className="text-4xl font-bold font-heading text-gray-900">
              De A1 à C1, à ton rythme.
            </h2>
          </motion.div>

          <div className="space-y-2.5">
            {levels.map((l, i) => (
              <motion.div
                key={l.level}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs font-heading">{l.level}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm mb-1.5">{l.label}</p>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gray-900 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: l.w }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium shrink-0">{l.weeks}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sectors ─────────────────────────────────────────────────── */}
      <section id="sectors" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Vocabulaire sectoriel</p>
            <h2 className="text-4xl font-bold font-heading text-gray-900">
              L&apos;allemand de ton secteur.
            </h2>
            <p className="text-gray-400 mt-3 text-base max-w-md">
              Développeur à Berlin ? Médecin à Vienne ? L&apos;IA adapte chaque leçon à ton domaine.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-2.5">
            {sectors.map(([key, label], i) => (
              <motion.div
                key={key}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-2 border border-gray-100 hover:border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 font-medium transition-all cursor-default hover:bg-gray-50"
              >
                <span className="text-base">{SECTOR_ICONS[key as keyof typeof SECTOR_ICONS]}</span>
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">Témoignages</p>
            <h2 className="text-3xl font-bold font-heading text-gray-900">Ce qu&apos;ils disent.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white border border-gray-100 rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.role}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md shrink-0">
                    {t.level}
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-0.5 mt-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-5 bg-[#0a0a0f] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-emerald-500/10 rounded-full blur-[80px]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-xl mx-auto text-center"
        >
          <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] mb-4">Commence maintenant</p>
          <h2 className="text-5xl font-bold font-heading text-white mb-5 leading-tight">
            Prêt à entrer dans le{" "}
            <span className="text-emerald-400">flow</span> ?
          </h2>
          <p className="text-white/40 text-lg mb-8">
            5 minutes par jour suffisent pour progresser.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-6 flex items-center justify-center gap-5 text-sm text-white/25">
            {["Gratuit", "Sans pub", "IA Adaptative", "Méthode Goethe"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white py-7 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center">
              <span className="text-white font-bold text-[9px] font-heading">DF</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">DeutschFlow © 2025</span>
          </div>
          <p className="text-gray-300 text-xs">
            Inspiré par Goethe-Institut & ÖSD · Propulsé par l&apos;IA DeutschFlow
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── DEMO CARD ──────────────────────────────────────────────────────────────── */
function DemoCard() {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
          Lesen · A2
        </span>
        <span className="text-[10px] text-white/30 font-medium">+15 XP</span>
      </div>

      {/* Text */}
      <div className="bg-white/4 border border-white/7 rounded-lg p-3">
        <p className="text-xs text-white/60 leading-relaxed">
          <span className="text-white/90 font-semibold">Stefan</span> arbeitet bei einer IT-Firma in Berlin.
          Jeden Morgen fährt er mit dem Fahrrad ins Büro.
        </p>
      </div>

      <p className="text-sm font-medium text-white/80">
        Comment Stefan se rend-il au travail ?
      </p>

      {/* Options */}
      <div className="space-y-1.5">
        {[
          { id: "A", text: "En voiture", correct: false },
          { id: "B", text: "À vélo", correct: true },
          { id: "C", text: "En train", correct: false },
        ].map((opt) => (
          <div
            key={opt.id}
            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs ${
              opt.correct
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-white/6 bg-white/2 text-white/30"
            }`}
          >
            <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
              opt.correct ? "bg-emerald-500 text-white" : "bg-white/5 text-white/30"
            }`}>
              {opt.id}
            </span>
            {opt.text}
            {opt.correct && <Check className="ml-auto h-3.5 w-3.5 text-emerald-400" />}
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
        <span className="text-base">🎉</span>
        <div>
          <p className="text-xs font-semibold text-emerald-400">Excellent !</p>
          <p className="text-[10px] text-emerald-400/60">«Fahrrad» = vélo en allemand</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-1 border-t border-white/6">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-orange-400">7 jours</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-white/25">XP total</span>
          <span className="text-xs font-bold text-emerald-400">1 240</span>
        </div>
      </div>
    </div>
  );
}
