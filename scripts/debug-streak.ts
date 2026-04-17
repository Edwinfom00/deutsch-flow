import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { streakHistory, dailySession, userProfile } from "../src/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
  const profiles = await db.select({ userId: userProfile.userId, currentStreak: userProfile.currentStreak })
    .from(userProfile);

  for (const p of profiles) {
    const h = await db.select().from(streakHistory)
      .where(eq(streakHistory.userId, p.userId))
      .orderBy(desc(streakHistory.date)).limit(10);

    const s = await db.select().from(dailySession)
      .where(eq(dailySession.userId, p.userId))
      .orderBy(desc(dailySession.date)).limit(10);

    console.log(`\n── userId: ${p.userId} (streak stocké: ${p.currentStreak}) ──`);
    console.log("streakHistory (10 derniers):", h.map((r) => `${r.date}=${r.completed}`).join(", ") || "(vide)");
    console.log("dailySessions (10 derniers):", s.map((r) => `${r.date}:${r.xpEarned}xp`).join(", ") || "(vide)");
  }

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
