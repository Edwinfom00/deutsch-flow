"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{ height: "60px" }}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-xs font-heading">DF</span>
          </div>
          <span className="font-bold text-base font-heading text-gray-900">DeutschFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm text-gray-400 font-medium">
          {[["#features", "Fonctionnalités"], ["#how", "Comment ça marche"], ["#sectors", "Secteurs"]].map(([href, label]) => (
            <a key={href} href={href} className="hover:text-gray-900 transition-colors">{label}</a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex h-9 px-4 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-all items-center">
            Connexion
          </Link>
          <Link href="/register" className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-all">
            Commencer
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
