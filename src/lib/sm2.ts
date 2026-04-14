/**
 * Algorithme SM-2 (SuperMemo 2) pour la répétition espacée.
 * Utilisé dans learn.actions, review.actions et exercise.actions.
 */

export interface SM2State {
  easeFactor: number;   // facteur de facilité, min 1.3
  interval: number;     // intervalle en jours avant la prochaine révision
  repetitions: number;  // nombre de révisions réussies consécutives
}

export interface SM2Result extends SM2State {
  nextReviewAt: Date;
}

/**
 * Calcule le nouvel état SM-2 et la date de prochaine révision.
 * @param current - État actuel (utilise les valeurs par défaut si absent)
 * @param quality - Note de qualité 0-5 (≥3 = bonne réponse)
 */
export function computeSM2(
  current: Partial<SM2State> | null | undefined,
  quality: number,
): SM2Result {
  let ef = current?.easeFactor ?? 2.5;
  let interval = current?.interval ?? 1;
  let reps = current?.repetitions ?? 0;

  if (quality >= 3) {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ef);
    reps += 1;
  } else {
    reps = 0;
    interval = 1;
  }

  ef = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { easeFactor: ef, interval, repetitions: reps, nextReviewAt };
}
