import { Suspense } from "react";
import { SpeakPage } from "@/modules/speak/components/SpeakPage";
import { getScenarios } from "@/modules/speak/server/speak.actions";

async function SpeakContent() {
  const data = await getScenarios();
  return <SpeakPage initialData={data} />;
}

function SpeakSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="space-y-1">
        <div className="h-4 w-32 bg-gray-200 rounded-sm" />
        <div className="h-3 w-56 bg-gray-100 rounded-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 bg-white border border-gray-100 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function SpeakRoute() {
  return (
    <Suspense fallback={<SpeakSkeleton />}>
      <SpeakContent />
    </Suspense>
  );
}
