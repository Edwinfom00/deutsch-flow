"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, Star, Check, Zap, Flame } from "lucide-react";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative pt-28 pb-24 px-5 overflow-hidden bg-[#0a0a0f]">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-100 bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-100 h-75 bg-blue-500/8 rounded-full blur-[80px]" />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-md mb-6">
                <Sparkles className="h-3 w-3" />
                Méthode Goethe & ÖSD · IA Adaptative
              </span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
              className="text-5xl lg:text-6xl font-bold font-heading text-white leading-[1.08] mb-5">
              Parle allemand
              <span className="block text-emerald-400">avec confiance.</span>
              <span className="block text-2xl lg:text-3xl font-medium text-white/30 mt-3">
                Sans stress. Vraiment.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}
              className="text-base text-white/50 mb-8 leading-relaxed max-w-md mx-auto lg:mx-0">
              Sessions IA personnalisées, Zone de Parole, révisions intelligentes, import de documents.
              Tout ce qu&apos;il faut pour progresser vraiment.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-md shadow-lg shadow-emerald-500/25 transition-all">
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center h-12 px-7 text-sm font-medium text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80 rounded-md transition-all">
                J&apos;ai déjà un compte
              </Link>
            </motion.div>

            {/* Trust */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-white/30">
              <div className="flex -space-x-2">
                {["S", "T", "L", "M"].map((l, i) => (
                  <div key={i} className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white/60">
                    {l}
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

          {/* Right — stats card */}
          <motion.div initial={{ opacity: 0, x: 20, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="shrink-0 w-full max-w-xs">
            <StatsCard />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function StatsCard() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-md p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
          Tableau de bord
        </span>
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">7j</span>
        </div>
      </div>

      {/* XP bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-white/40">Niveau B1 → B2</span>
          <span className="text-white/60 font-semibold">840 / 1200 XP</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-sm overflow-hidden">
          <motion.div className="h-full bg-emerald-500 rounded-sm"
            initial={{ width: 0 }} animate={{ width: "70%" }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }} />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Sessions", value: "24", icon: Zap, color: "text-amber-400" },
          { label: "Mots appris", value: "312", icon: Check, color: "text-blue-400" },
          { label: "Badges", value: "8", icon: Star, color: "text-violet-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/4 border border-white/6 rounded-md p-2.5 text-center">
              <Icon className={`h-3.5 w-3.5 ${s.color} mx-auto mb-1`} />
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-white/30">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-semibold text-white/20 uppercase tracking-wider">Activité récente</p>
        {[
          { text: "Session Lesen complétée", xp: "+18 XP", color: "text-blue-400" },
          { text: "Modellsatz B1 importé", xp: "+45 XP", color: "text-violet-400" },
          { text: "Conversation IA — IT", xp: "+22 XP", color: "text-emerald-400" },
        ].map((a, i) => (
          <div key={i} className="flex items-center justify-between text-[10px]">
            <span className="text-white/40 truncate">{a.text}</span>
            <span className={`font-bold shrink-0 ml-2 ${a.color}`}>{a.xp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
