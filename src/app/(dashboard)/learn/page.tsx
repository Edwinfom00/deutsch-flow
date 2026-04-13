import { LearnPage } from "@/modules/learn/components/LearnPage";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function LearnRoute() {
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
