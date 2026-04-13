import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffbf0] flex flex-col">
      {/* Header */}
      <header className="p-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
            <span className="text-white font-bold text-sm font-heading">DF</span>
          </div>
          <span className="font-bold text-base font-heading text-gray-800">DeutschFlow</span>
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">
          ← Retour
        </Link>
      </header>

      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
