import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-7 px-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-gray-900 flex items-center justify-center">
            <span className="text-white font-bold text-[9px] font-heading">EF</span>
          </div>
          <span className="text-gray-400 text-sm font-medium"><Link href='https://www.edwinfom.dev' target="_blank" className=" cursor-pointer hover:underline">Edwin Fom</Link>  © 2026</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-gray-300">
          <Link href="/login" className="hover:text-gray-600 transition-colors">Connexion</Link>
          <Link href="/register" className="hover:text-gray-600 transition-colors">Créer un compte</Link>
          <span>Inspiré par Goethe-Institut & ÖSD</span>
        </div>
      </div>
    </footer>
  );
}
