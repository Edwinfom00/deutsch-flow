import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Récupère la session côté serveur (Server Components, Server Actions, Route Handlers).
 * Retourne null si non connecté.
 */
export async function getServerSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ?? null;
}

/**
 * Récupère la session et redirige vers /login si non connecté.
 * À utiliser dans les Server Components protégés.
 */
export async function requireAuth(redirectTo = "/login") {
  const session = await getServerSession();
  if (!session?.user?.id) redirect(redirectTo);
  return session;
}

/**
 * Récupère la session et redirige vers /dashboard si déjà connecté.
 * À utiliser sur les pages publiques (login, register).
 */
export async function requireGuest(redirectTo = "/dashboard") {
  const session = await getServerSession();
  if (session?.user?.id) redirect(redirectTo);
  return null;
}

/**
 * Vérifie la session dans une Server Action.
 * Lance une erreur si non connecté (ne redirige pas).
 */
export async function assertAuth() {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session;
}
