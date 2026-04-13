"use server";

import { db } from "@/lib/db";
import { dailySession, skillPerformance } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, desc } from "drizzle-orm";

export async function getLearnHistory() {
  const session = await assertAuth();
  const uid = session.user.id;

  const [sessions, skills] = await Promise.all([
    db.select().from(dailySession)
      .where(eq(dailySession.userId, uid))
      .orderBy(desc(dailySession.date))
      .limit(10),
    db.select().from(skillPerformance)
      .where(eq(skillPerformance.userId, uid)),
  ]);

  return { sessions, skills };
}
