import { Suspense } from "react";
import { ImportTabs } from "@/modules/import/components/ImportTabs";
import {
  getImports,
  getImportedExercises,
  getImportedModellsatz,
  getImportedGrammar,
} from "@/modules/import/server/import.actions";

async function ImportContent() {
  const [imports, exercises, modellsatz, grammar] = await Promise.all([
    getImports(),
    getImportedExercises(),
    getImportedModellsatz(),
    getImportedGrammar(),
  ]);

  return (
    <ImportTabs
      initialImports={imports}
      exercises={exercises}
      modellsatz={modellsatz}
      grammar={grammar}
    />
  );
}

function ImportSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="h-4 w-40 bg-gray-200 rounded-sm" />
      <div className="flex gap-2">
        {[0,1,2,3].map(i => <div key={i} className="h-9 w-28 bg-gray-100 rounded-md" />)}
      </div>
      <div className="h-48 bg-white border border-gray-100 rounded-md" />
    </div>
  );
}

export default function ImportRoute() {
  return (
    <Suspense fallback={<ImportSkeleton />}>
      <ImportContent />
    </Suspense>
  );
}
