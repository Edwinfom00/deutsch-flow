import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { Check } from "lucide-react";

export const metadata: Metadata = { title: "Créer un compte" };

const perks = [
  "Gratuit, sans carte bancaire",
  "IA adaptée à ton niveau",
  "Méthode Goethe & ÖSD",
  "Vocabulaire sectoriel (IT, santé…)",
];

export default function RegisterPage() {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">🚀</div>
        <h1 className="text-3xl font-bold font-heading text-gray-900">
          Commence ton aventure
        </h1>
        <p className="text-gray-500">Parle allemand avec confiance en 3 mois</p>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-2 gap-2">
        {perks.map((p) => (
          <div key={p} className="flex items-center gap-2 text-sm text-gray-600">
            <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="h-3 w-3 text-emerald-600" />
            </div>
            {p}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
        <RegisterForm />

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
