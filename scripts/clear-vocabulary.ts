import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { exercise, spacedRepetition, wordDetailCache } from "../src/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
  const vocabExercises = await db
    .select({ id: exercise.id })
    .from(exercise)
    .where(eq(exercise.type, "VOCAB_FLASHCARD"));

  const ids = vocabExercises.map((e) => e.id);
  console.log(`Mots VOCAB_FLASHCARD trouvés : ${ids.length}`);

  if (ids.length === 0) {
    console.log("Rien à supprimer.");
    process.exit(0);
  }

  await db.delete(wordDetailCache).where(inArray(wordDetailCache.exerciseId, ids));
  console.log(`  wordDetailCache supprimé`);

  await db.delete(spacedRepetition).where(inArray(spacedRepetition.exerciseId, ids));
  console.log(`  spacedRepetition supprimé`);

  await db.delete(exercise).where(inArray(exercise.id, ids));
  console.log(`  exercise supprimé`);

  console.log(`\nTerminé — ${ids.length} mots supprimés.`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Erreur :", e);
  process.exit(1);
});
