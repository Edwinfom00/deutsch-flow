import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">👋</div>
        <h1 className="text-3xl font-bold font-heading text-gray-900">
          Bon retour !
        </h1>
        <p className="text-gray-500">Continue ton apprentissage de l&apos;allemand</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8">
        <LoginForm />

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Créer un compte gratuit
            </Link>
          </p>
        </div>
      </div>

      {/* Social proof */}
      <p className="text-center text-sm text-gray-400">
        🇩🇪 Rejoint par <strong className="text-gray-600">2 400+</strong> apprenants francophones
      </p>
    </div>
  );
}
