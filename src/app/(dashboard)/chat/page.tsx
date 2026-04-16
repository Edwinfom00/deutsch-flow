import { Bot, Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-52px)] p-5">
      <div className="max-w-sm w-full text-center space-y-5">

        <div className="h-14 w-14 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto relative">
          <Bot className="h-7 w-7 text-gray-400" />
          <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <Wrench className="h-2.5 w-2.5 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-base font-bold text-gray-900">Tuteur IA — en cours de refonte</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Cette fonctionnalité est temporairement indisponible. Nous la refondons entièrement pour t&apos;offrir un tuteur vraiment utile.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-left space-y-2.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ce qui arrive</p>
          {[
            "Corrections grammaticales contextuelles",
            "Explications adaptées à ton niveau CEFR",
            "Mémoire de tes erreurs récurrentes",
            "Exercices générés à la demande",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-gray-300 mt-0.5 shrink-0">—</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour au dashboard
        </Link>

      </div>
    </div>
  );
}
