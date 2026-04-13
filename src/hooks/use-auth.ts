"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook client — retourne la session et l'état de chargement.
 * Redirige automatiquement si `redirectTo` est fourni et que l'utilisateur n'est pas connecté.
 */
export function useAuth(options?: { redirectTo?: string; redirectIfFound?: string }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    // Pas connecté → rediriger vers la page de connexion
    if (!session && options?.redirectTo) {
      router.replace(options.redirectTo);
    }

    // Connecté → rediriger si on veut protéger une page publique (ex: /login)
    if (session && options?.redirectIfFound) {
      router.replace(options.redirectIfFound);
    }
  }, [session, isPending, router, options?.redirectTo, options?.redirectIfFound]);

  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading: isPending,
    isAuthenticated: !!session,
  };
}
