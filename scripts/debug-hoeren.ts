import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { exercise } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const rows = await db.select().from(exercise)
    .where(eq(exercise.type, "HOEREN_MULTIPLE_CHOICE"))
    .limit(3);

  for (const row of rows) {
    console.log("\n── HOEREN_MULTIPLE_CHOICE ──");
    const c = row.content as Record<string, unknown>;
    console.log("question:", c.question);
    console.log("options type:", Array.isArray(c.options) ? "ARRAY" : typeof c.options);
    console.log("options:", JSON.stringify(c.options, null, 2).slice(0, 400));
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
