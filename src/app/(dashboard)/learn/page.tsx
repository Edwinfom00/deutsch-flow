import { Suspense } from "react";
import { LearnPage } from "@/modules/learn/components/LearnPage";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import LearnLoading from "./loading";

async function LearnContent() {
  const session = await requireAuth();
  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, session.user.id),
  });

  return (
    <LearnPage
      level={profile?.level ?? "A0"}
      sector={profile?.sector ?? "QUOTIDIEN"}
      goalMinutes={profile?.dailyGoalMinutes ?? 15}
    />
  );
}

export default function LearnRoute() {
  return (
    <Suspense fallback={<LearnLoading />}>
      <LearnContent />
    </Suspense>
  );
}
