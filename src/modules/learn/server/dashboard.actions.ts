"use server";

import { db } from "@/lib/db";
import { userProfile, dailySession, streakHistory } from "@/lib/db/schema";
import { getServerSession } from "@/lib/session";
import { eq, desc, and, gte } from "drizzle-orm";

export async function getDashboardData() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const uid = session.user.id;
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const [profile, recentSessions, weekHistory] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),
    db.select().from(dailySession)
      .where(eq(dailySession.userId, uid))
      .orderBy(desc(dailySession.date))
      .limit(7),
    db.select().from(streakHistory)
      .where(and(eq(streakHistory.userId, uid), gte(streakHistory.date, sevenDaysAgo)))
      .orderBy(streakHistory.date),
  ]);

  const todaySession = recentSessions.find((s) => s.date === today);

  return {
    user: { name: session.user.name, email: session.user.email },
    profile,
    todayXp: todaySession?.xpEarned ?? 0,
    todayExercises: todaySession?.exercisesCompleted ?? 0,
    weekHistory,
    recentSessions,
  };
}
