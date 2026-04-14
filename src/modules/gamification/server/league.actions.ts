"use server";

import { db } from "@/lib/db";
import { leagueMember, userProfile, user } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, desc, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

function getWeekNumber(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function getLeagueData() {
  const session = await assertAuth();
  const uid = session.user.id;
  const week = getWeekNumber();

  // S'assurer que l'utilisateur est dans la ligue de cette semaine
  const existing = await db.query.leagueMember.findFirst({
    where: and(eq(leagueMember.userId, uid), eq(leagueMember.weekNumber, week)),
  });

  if (!existing) {
    await db.insert(leagueMember).values({
      id: nanoid(), userId: uid, weekNumber: week, weekXp: 0,
    });
  }

  // Sync XP de la semaine depuis dailySession
  const { dailySession } = await import("@/lib/db/schema");
  const { gte } = await import("drizzle-orm");
  const weekStart = getWeekStart();

  const [weekSessions] = await db
    .select({ total: sql<number>`sum(${dailySession.xpEarned})` })
    .from(dailySession)
    .where(and(eq(dailySession.userId, uid), gte(dailySession.date, weekStart)));

  const weekXp = weekSessions?.total ?? 0;

  await db.update(leagueMember).set({ weekXp, updatedAt: new Date() })
    .where(and(eq(leagueMember.userId, uid), eq(leagueMember.weekNumber, week)));

  // Récupérer tous les membres de la ligue cette semaine avec leur profil
  const members = await db
    .select({
      id: leagueMember.id,
      userId: leagueMember.userId,
      weekXp: leagueMember.weekXp,
      name: user.name,
      level: userProfile.level,
    })
    .from(leagueMember)
    .innerJoin(user, eq(leagueMember.userId, user.id))
    .innerJoin(userProfile, eq(leagueMember.userId, userProfile.userId))
    .where(eq(leagueMember.weekNumber, week))
    .orderBy(desc(leagueMember.weekXp))
    .limit(50);

  // Calculer les rangs
  const ranked = members.map((m, i) => ({ ...m, rank: i + 1 }));
  const myRank = ranked.find((m) => m.userId === uid);

  // Stats semaine précédente
  const lastWeek = getLastWeekNumber();
  const [lastWeekMe] = await db.select().from(leagueMember)
    .where(and(eq(leagueMember.userId, uid), eq(leagueMember.weekNumber, lastWeek)));

  return {
    week,
    weekStart,
    members: ranked,
    myUserId: uid,
    myRank: myRank?.rank ?? null,
    myWeekXp: weekXp,
    lastWeekXp: lastWeekMe?.weekXp ?? 0,
    lastWeekRank: lastWeekMe?.rank ?? null,
  };
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getLastWeekNumber(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
