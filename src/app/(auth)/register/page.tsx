import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Créer un compte — DeutschFlow" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold font-heading text-gray-900 tracking-tight">
          Crée ton compte
        </h1>
        <p className="text-sm text-gray-400">
          Gratuit, sans carte bancaire. Commence en 30 secondes.
        </p>
      </div>

      {/* Form */}
      <RegisterForm />

      {/* Switch */}
      <p className="text-center text-sm text-gray-400">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="text-gray-900 font-semibold hover:text-emerald-600 transition-colors underline underline-offset-2"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
