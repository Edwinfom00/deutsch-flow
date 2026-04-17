"use server";

import { db } from "@/lib/db";
import { streakChallenge, importedExercise, importedExerciseResult, user, userProfile } from "@/lib/db/schema";
import { assertAuth } from "@/lib/session";
import { eq, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createChallenge(importId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const expiresAt = new Date(Date.now() + 7 * 86400000);

  const [challenge] = await db.insert(streakChallenge).values({
    id: nanoid(),
    challengerId: uid,
    importId,
    status: "open",
    expiresAt,
  }).returning();

  return { challengeId: challenge.id };
}

export async function joinChallenge(challengeId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const challenge = await db.query.streakChallenge.findFirst({
    where: eq(streakChallenge.id, challengeId),
  });

  if (!challenge) throw new Error("Défi introuvable");
  if (challenge.challengerId === uid) throw new Error("Tu ne peux pas rejoindre ton propre défi");
  if (challenge.status !== "open") throw new Error("Ce défi n'est plus disponible");
  if (new Date() > challenge.expiresAt) throw new Error("Ce défi a expiré");

  await db.update(streakChallenge).set({
    challengedId: uid,
    status: "active",
    updatedAt: new Date(),
  }).where(eq(streakChallenge.id, challengeId));

  return { joined: true, importId: challenge.importId };
}

export async function submitChallengeScore(challengeId: string, score: number) {
  const session = await assertAuth();
  const uid = session.user.id;

  const challenge = await db.query.streakChallenge.findFirst({
    where: eq(streakChallenge.id, challengeId),
  });

  if (!challenge) throw new Error("Défi introuvable");

  const isChallenger = challenge.challengerId === uid;
  const isChallenged = challenge.challengedId === uid;
  if (!isChallenger && !isChallenged) throw new Error("Tu ne participes pas à ce défi");

  const update = isChallenger
    ? { challengerScore: score, challengerCompleted: true }
    : { challengedScore: score, challengedCompleted: true };

  const bothDone =
    (isChallenger && challenge.challengedCompleted) ||
    (isChallenged && challenge.challengerCompleted);

  await db.update(streakChallenge).set({
    ...update,
    status: bothDone ? "done" : "active",
    updatedAt: new Date(),
  }).where(eq(streakChallenge.id, challengeId));

  return { submitted: true };
}

export async function getChallengeData(challengeId: string) {
  const session = await assertAuth();
  const uid = session.user.id;

  const challenge = await db.query.streakChallenge.findFirst({
    where: eq(streakChallenge.id, challengeId),
  });

  if (!challenge) throw new Error("Défi introuvable");

  const [challenger, challenged] = await Promise.all([
    db.query.user.findFirst({ where: eq(user.id, challenge.challengerId) }),
    challenge.challengedId
      ? db.query.user.findFirst({ where: eq(user.id, challenge.challengedId) })
      : Promise.resolve(null),
  ]);

  return {
    id: challenge.id,
    importId: challenge.importId,
    status: challenge.status,
    expiresAt: challenge.expiresAt,
    isChallenger: challenge.challengerId === uid,
    isChallenged: challenge.challengedId === uid,
    myRole: challenge.challengerId === uid ? "challenger" : "challenged",
    challenger: {
      name: challenger?.name ?? "Inconnu",
      score: challenge.challengerScore,
      completed: challenge.challengerCompleted,
    },
    challenged: challenged ? {
      name: challenged.name,
      score: challenge.challengedScore,
      completed: challenge.challengedCompleted,
    } : null,
    winner:
      challenge.status === "done" && challenge.challengerScore !== null && challenge.challengedScore !== null
        ? challenge.challengerScore >= challenge.challengedScore
          ? challenger?.name ?? "Challenger"
          : challenged?.name ?? "Challengé"
        : null,
  };
}

export async function getMyChallenges() {
  const session = await assertAuth();
  const uid = session.user.id;

  const rows = await db.select().from(streakChallenge)
    .where(
      or(
        eq(streakChallenge.challengerId, uid),
        eq(streakChallenge.challengedId, uid)
      )
    )
    .orderBy(streakChallenge.createdAt);

  return rows;
}
