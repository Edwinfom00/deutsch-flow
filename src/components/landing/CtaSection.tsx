"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-28 px-5 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-emerald-500/10 rounded-full blur-[80px]" />

      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="relative z-10 max-w-xl mx-auto text-center">
        <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-[0.2em] mb-4">Commence maintenant</p>
        <h2 className="text-5xl font-bold font-heading text-white mb-5 leading-tight">
          Prêt à entrer dans le{" "}
          <span className="text-emerald-400">flow</span> ?
        </h2>
        <p className="text-white/40 text-lg mb-8">
          5 minutes par jour suffisent. Gratuit, sans carte bancaire.
        </p>
        <Link href="/register"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 rounded-md shadow-lg shadow-emerald-500/25 transition-all">
          Démarrer gratuitement
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="mt-6 flex items-center justify-center gap-5 text-sm text-white/25 flex-wrap">
          {["Gratuit", "Sans pub", "IA Adaptative", "Méthode Goethe", "Import PDF"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <Check className="h-3 w-3 text-emerald-500" />
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
