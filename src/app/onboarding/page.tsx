import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/session";
import { OnboardingWizard } from "@/modules/onboarding/components/OnboardingWizard";

export const metadata: Metadata = { title: "Bienvenue — DeutschFlow" };

export default async function OnboardingPage() {
  const session = await requireAuth();

  // Si l'onboarding est déjà complété, aller au dashboard
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, session.user.id),
  });

  if (profile?.onboardingCompleted) redirect("/dashboard");

  return <OnboardingWizard />;
}
