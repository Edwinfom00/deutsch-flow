import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/modules/auth/components/LoginForm";

export const metadata: Metadata = { title: "Connexion — DeutschFlow" };

export default function LoginPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
          Bon retour
        </h1>
        <p className="text-sm text-gray-400">
          Continue ton apprentissage là où tu t&apos;es arrêté.
        </p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Switch */}
      <p className="text-center text-sm text-gray-400">
        Pas encore de compte ?{" "}
        <Link
          href="/register"
          className="text-gray-900 font-semibold hover:text-emerald-600 transition-colors underline underline-offset-2"
        >
          Créer un compte gratuit
        </Link>
      </p>
    </div>
  );
}
