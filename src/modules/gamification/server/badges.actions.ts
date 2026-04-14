"use server";

import { db } from "@/lib/db";
import { badge, userBadge, userProfile, dailySession } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { BADGE_DEFINITIONS } from "../badges.config";

// ─── Seeder des badges en DB ──────────────────────────────────────────────────
export async function seedBadges() {
  for (const def of BADGE_DEFINITIONS) {
    const existing = await db.query.badge.findFirst({ where: eq(badge.id, def.id) });
    if (!existing) {
      await db.insert(badge).values({
        id: def.id,
        name: def.nameFr,
        nameFr: def.nameFr,
        description: def.descFr,
        descriptionFr: def.descFr,
        icon: def.icon,
        category: def.category as never,
        xpBonus: def.xpBonus,
        condition: JSON.stringify(def.condition),
        isActive: true,
      });
    }
  }
}

// ─── Vérifier et attribuer les badges mérités ─────────────────────────────────
export async function checkAndAwardBadges() {
  const session = await assertAuth();
  const uid = session.user.id;

  await seedBadges();

  const [profile, earnedBadges, sessions] = await Promise.all([
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),
    db.select({ badgeId: userBadge.badgeId }).from(userBadge).where(eq(userBadge.userId, uid)),
    db.select().from(dailySession).where(eq(dailySession.userId, uid)),
  ]);

  if (!profile) return [];

  const earned = new Set(earnedBadges.map((b) => b.badgeId));
  const newBadges: string[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earned.has(def.id)) continue;

    const cond = def.condition;
    let met = false;

    if (cond.type === "streak") {
      met = (profile.currentStreak ?? 0) >= cond.value;
    } else if (cond.type === "xp") {
      met = (profile.totalXp ?? 0) >= cond.value;
    } else if (cond.type === "sessions") {
      met = sessions.length >= cond.value;
    }

    if (met) {
      await db.insert(userBadge).values({
        id: nanoid(),
        userId: uid,
        badgeId: def.id,
        earnedAt: new Date(),
      });
      // Bonus XP
      if (def.xpBonus > 0) {
        const { sql } = await import("drizzle-orm");
        await db.update(userProfile).set({
          totalXp: sql`${userProfile.totalXp} + ${def.xpBonus}`,
          updatedAt: new Date(),
        }).where(eq(userProfile.userId, uid));
      }
      newBadges.push(def.id);
    }
  }

  return newBadges;
}

// ─── Récupérer tous les badges avec statut ────────────────────────────────────
export async function getBadges() {
  const session = await assertAuth();
  const uid = session.user.id;

  await seedBadges();

  const [allBadges, earned, profile, sessions] = await Promise.all([
    db.select().from(badge).where(eq(badge.isActive, true)),
    db.select().from(userBadge).where(eq(userBadge.userId, uid)),
    db.query.userProfile.findFirst({ where: eq(userProfile.userId, uid) }),
    db.select().from(dailySession).where(eq(dailySession.userId, uid)),
  ]);

  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  const badgesWithStatus = allBadges.map((b) => {
    const cond = JSON.parse(b.condition) as { type: string; value: number };
    let progress = 0;

    if (cond.type === "streak") progress = Math.min(profile?.currentStreak ?? 0, cond.value);
    else if (cond.type === "xp") progress = Math.min(profile?.totalXp ?? 0, cond.value);
    else if (cond.type === "sessions") progress = Math.min(sessions.length, cond.value);

    return {
      ...b,
      earned: earnedMap.has(b.id),
      earnedAt: earnedMap.get(b.id) ?? null,
      progress,
      target: cond.value,
      progressPct: Math.round((progress / cond.value) * 100),
    };
  });

  // Trier : gagnés en premier, puis par progression décroissante
  return badgesWithStatus.sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return b.progressPct - a.progressPct;
  });
}
