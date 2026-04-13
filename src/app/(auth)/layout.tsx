import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, PenLine, Headphones, Mic, Zap, Trophy } from "lucide-react";
import { requireGuest } from "@/lib/session";

export const metadata: Metadata = {
  title: "DeutschFlow",
};

const highlights = [
  { icon: BookOpen, label: "Lesen", sub: "Lecture", color: "text-blue-400" },
  { icon: PenLine, label: "Schreiben", sub: "Écriture", color: "text-violet-400" },
  { icon: Headphones, label: "Hören", sub: "Écoute", color: "text-amber-400" },
  { icon: Mic, label: "Sprechen", sub: "Expression", color: "text-emerald-400" },
  { icon: Zap, label: "Wortschatz", sub: "Vocabulaire", color: "text-pink-400" },
  { icon: Trophy, label: "Goethe", sub: "Certifiant", color: "text-orange-400" },
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await requireGuest();
  return (
    <div className="min-h-screen bg-white flex">

      {/* ── LEFT PANEL — Branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] bg-[#0a0a0f] flex-col relative overflow-hidden">

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow accents */}
        <div className="absolute top-0 left-0 w-125 h-125 bg-emerald-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-100 h-100 bg-blue-500/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="relative z-10 p-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-sm font-heading">DF</span>
            </div>
            <span className="font-bold text-lg font-heading text-white">DeutschFlow</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-16 pb-12">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-widest uppercase border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-md">
              Méthode Goethe & ÖSD
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold font-heading text-white leading-[1.1] mb-5">
            Parle allemand
            <span className="block text-emerald-400">avec confiance.</span>
          </h1>

          <p className="text-white/50 text-base leading-relaxed max-w-sm mb-10">
            L&apos;IA s&apos;adapte à ton niveau, ton rythme et ton secteur.
            Exercices officiels A1 → C1.
          </p>

          {/* Skills grid */}
          <div className="grid grid-cols-3 gap-2.5 max-w-sm">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="flex flex-col gap-1.5 bg-white/4 border border-white/7 rounded-lg p-3 hover:bg-white/7 transition-colors"
              >
                <h.icon className={`h-4 w-4 ${h.color}`} />
                <p className="text-white text-xs font-semibold leading-none">{h.label}</p>
                <p className="text-white/40 text-[10px] leading-none">{h.sub}</p>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["🧑‍💻", "👩‍⚕️", "👨‍💼", "👩‍🎓"].map((e, i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
                  {e}
                </div>
              ))}
            </div>
            <p className="text-white/40 text-sm">
              <span className="text-white/80 font-semibold">2 400+</span> apprenants actifs
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative z-10 px-12 xl:px-16 py-6 border-t border-white/6">
          <p className="text-white/25 text-xs">
            Propulsé par l&apos;IA DeutschFlow · Inspiré par Goethe-Institut & ÖSD
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs font-heading">DF</span>
            </div>
            <span className="font-bold text-base font-heading text-gray-900">DeutschFlow</span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour
          </Link>
        </header>

        {/* Desktop back link */}
        <div className="hidden lg:flex items-center justify-end px-10 py-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5">
            <span>←</span> Retour à l&apos;accueil
          </Link>
        </div>

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-100">
            {children}
          </div>
        </main>

        <footer className="px-6 py-5 text-center">
          <p className="text-xs text-gray-300">© 2025 DeutschFlow</p>
        </footer>
      </div>
    </div>
  );
}
