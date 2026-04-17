import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processDocumentFn } from "@/lib/inngest/functions/process-document";
import { generateModellsatzFn } from "@/lib/inngest/functions/generate-modellsatz";
import { generateWordOfDayFn } from "@/lib/inngest/functions/word-of-day";
import { generatePhraseDuJourFn } from "@/lib/inngest/functions/phrase-du-jour";
import { generateVerbsFn } from "@/lib/inngest/functions/generate-verbs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocumentFn,
    generateModellsatzFn,
    generateWordOfDayFn,
    generatePhraseDuJourFn,
    generateVerbsFn,
  ],
});
