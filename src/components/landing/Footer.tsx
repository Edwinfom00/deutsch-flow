import Link from "next/link";
import { BookOpen, GraduationCap, Zap, Shield, Mail } from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

const PRODUCT_LINKS = [
  { label: "Fonctionnalités",      href: "#features" },
  { label: "Comment ça marche",    href: "#how" },
  { label: "Secteurs",             href: "#sectors" },
  { label: "Témoignages",          href: "#testimonials" },
];

const LEARN_LINKS = [
  { label: "Commencer gratuitement", href: "/register", icon: Zap },
  { label: "Se connecter",           href: "/login",    icon: null },
  { label: "Exercices importés",     href: "/import",   icon: BookOpen },
  { label: "Modellsatz ÖSD",         href: "/import",   icon: GraduationCap },
];

const LEGAL_LINKS = [
  { label: "Confidentialité", href: "#" },
  { label: "Conditions",      href: "#" },
  { label: "Cookies",         href: "#" },
];

const SOCIAL_LINKS = [
  { label: "GitHub",   href: "https://github.com/Edwinfom00",   icon: FaGithub },
  { label: "Twitter",  href: "https://x.com/EdwinFom",  icon: FaXTwitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: FaLinkedinIn },
  { label: "Contact",  href: "mailto:edwinfom05@gmail.com", icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-[#0a0a0f] text-white">

      {/* Corps principal */}
      <div className="max-w-6xl mx-auto px-5 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Colonne 1 — Marque */}
          <div className="space-y-5 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-md bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                <span className="text-white font-bold text-xs font-heading">DF</span>
              </div>
              <span className="font-bold text-base font-heading text-white">DeutschFlow</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-56">
              La plateforme d&apos;apprentissage de l&apos;allemand conçue pour les francophones. Méthode ÖSD, IA adaptative, répétition espacée.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="h-8 w-8 rounded-md bg-white/6 border border-white/8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/12 hover:border-white/20 transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Colonne 2 — Produit */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Produit</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Apprendre */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Apprendre</p>
            <ul className="space-y-2.5">
              {LEARN_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Certifications */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Certifications</p>
            <div className="space-y-2.5">
              {[
                { code: "A1–A2", label: "Goethe-Zertifikat" },
                { code: "B1–B2", label: "ÖSD Zertifikat" },
                { code: "C1–C2", label: "Goethe C-Prüfung" },
              ].map((c) => (
                <div key={c.code} className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-white/30 bg-white/6 border border-white/10 px-1.5 py-0.5 rounded-sm font-mono">
                    {c.code}
                  </span>
                  <span className="text-sm text-white/50">{c.label}</span>
                </div>
              ))}
            </div>

            {/* Badge conformité */}
            <div className="flex items-center gap-2 mt-4 bg-white/4 border border-white/8 rounded-md px-3 py-2.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-white/40 leading-tight">
                Contenu aligné sur le cadre européen commun de référence (CECRL)
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Séparateur */}
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-px bg-white/6" />
      </div>

      {/* Bas de page */}
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Copyright */}
          <div className="flex items-center gap-2 text-xs text-white/25">
            <span>© 2026 DeutschFlow.</span>
            <span className="hidden sm:inline">Conçu par</span>
            <a
              href="https://www.edwinfom.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors hidden sm:inline"
            >
              Edwin Fom
            </a>
          </div>

          {/* Liens légaux */}
          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.label} className="flex items-center gap-4">
                <Link href={l.href} className="text-xs text-white/25 hover:text-white/60 transition-colors">
                  {l.label}
                </Link>
                {i < LEGAL_LINKS.length - 1 && (
                  <span className="text-white/10">·</span>
                )}
              </span>
            ))}
          </div>

        </div>
      </div>

    </footer>
  );
}
