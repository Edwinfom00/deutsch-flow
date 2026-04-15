import { db } from "../src/lib/db";
import { importedExercise } from "../src/lib/db/schema";
import { writeFileSync } from "fs";

async function main() {
  const rows = await db.select().from(importedExercise).limit(200);

  // Chercher les exercices Schreiben
  const schreiben = rows.filter((r) => {
    const content = r.content as Record<string, unknown>;
    const t = ((content.type as string) ?? r.type ?? "").toUpperCase();
    const comp = ((content.competence as string) ?? "").toUpperCase();
    return t.includes("SCHREIBEN") || comp.includes("SCHREIBEN") || comp.includes("ÉCRIT") || comp.includes("ECRITURE");
  });

  console.log(`\n=== ${schreiben.length} exercices Schreiben ===\n`);
  for (const row of schreiben) {
    const content = row.content as Record<string, unknown>;
    console.log("DB TYPE:", row.type, "| SKILL:", row.skill);
    console.log("CONTENT TYPE:", content.type ?? "ABSENT");
    console.log("CONTENT KEYS:", Object.keys(content).join(", "));
    console.log(JSON.stringify(content, null, 2).slice(0, 800));
    console.log("---");
  }

  // Aussi afficher tous les types uniques
  const byOriginalType: Record<string, object[]> = {};
  for (const row of rows) {
    const content = row.content as Record<string, unknown>;
    const originalType = (content.type as string) ?? row.type;
    if (!byOriginalType[originalType]) byOriginalType[originalType] = [];
    byOriginalType[originalType].push(content);
  }

  console.log("\n=== Tous les types originaux ===");
  for (const [type, exs] of Object.entries(byOriginalType)) {
    const keys = Object.keys(exs[0] as object).join(", ");
    console.log(`${type} (${exs.length}x) — keys: ${keys}`);
  }

  writeFileSync("scripts/imports-snapshot.json", JSON.stringify(byOriginalType, null, 2));
  console.log(`\nSnapshot: ${rows.length} exercices, ${Object.keys(byOriginalType).length} types`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
