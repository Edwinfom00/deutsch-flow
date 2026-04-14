import { Suspense } from "react";
import { getStreakData } from "@/modules/gamification/server/streak.actions";
import { StreakPage } from "@/modules/gamification/components/StreakPage";

async function StreakContent() {
  const data = await getStreakData();
  return <StreakPage data={data} />;
}

function StreakSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded-sm" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white border border-gray-100 rounded-md" />
        ))}
      </div>
      <div className="h-14 bg-white border border-gray-100 rounded-md" />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="h-52 bg-white border border-gray-100 rounded-md" />
        <div className="h-52 bg-white border border-gray-100 rounded-md" />
      </div>
      <div className="h-64 bg-white border border-gray-100 rounded-md" />
    </div>
  );
}

export default function StreakRoute() {
  return (
    <Suspense fallback={<StreakSkeleton />}>
      <StreakContent />
    </Suspense>
  );
}
