import { Suspense } from "react";
import { ImportedExercisesPage } from "@/modules/import/components/ImportedExercisesPage";
import { getImportedExercisesByType } from "@/modules/import/server/imported-content.actions";

async function Content() {
  const data = await getImportedExercisesByType("exercises");
  return <ImportedExercisesPage data={data} />;
}

export default function ImportExercisesRoute() {
  return (
    <Suspense fallback={<div className="p-5 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-4 w-32 bg-gray-200 rounded-sm" />
      <div className="h-64 bg-white border border-gray-100 rounded-md" />
    </div>}>
      <Content />
    </Suspense>
  );
}
