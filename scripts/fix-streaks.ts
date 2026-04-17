import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { userProfile, streakHistory, dailySession } from "../src/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

async function recalcStreak(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Source de vérité : dailySession (xpEarned > 0)
  const sessions = await db
    .select({ date: dailySession.date })
    .from(dailySession)
    .where(and(eq(dailySession.userId, userId)));

  const activeDates = new Set(sessions.map((s) => s.date));

  if (activeDates.size === 0) return 0;

  let streak = 0;
  let checkDate = new Date();

  // Si aujourd'hui pas actif, commencer depuis hier
  if (!activeDates.has(today)) {
    checkDate = new Date(Date.now() - 86400000);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (activeDates.has(dateStr)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

async function main() {
  console.log("=== Recalcul des streaks ===\n");

  const profiles = await db.select().from(userProfile);
  console.log(`${profiles.length} utilisateur(s) à traiter\n`);

  for (const profile of profiles) {
    const correct = await recalcStreak(profile.userId);
    const stored = profile.currentStreak ?? 0;
    const newLongest = Math.max(correct, profile.longestStreak ?? 0);

    if (correct !== stored) {
      await db.update(userProfile).set({
        currentStreak: correct,
        longestStreak: newLongest,
        updatedAt: new Date(),
      }).where(eq(userProfile.userId, profile.userId));
      console.log(`  [CORRIGÉ] userId=${profile.userId} : ${stored} → ${correct} jours`);
    } else {
      console.log(`  [OK]      userId=${profile.userId} : ${stored} jours (inchangé)`);
    }
  }

  console.log("\nTerminé.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
