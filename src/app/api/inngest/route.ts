import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processDocumentFn } from "@/lib/inngest/functions/process-document";
import { generateModellsatzFn } from "@/lib/inngest/functions/generate-modellsatz";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processDocumentFn, generateModellsatzFn],
});
