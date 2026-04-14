import { Suspense } from "react";
import { LeaguePage } from "@/modules/gamification/components/LeaguePage";
import { getLeagueData } from "@/modules/gamification/server/league.actions";

async function LeagueContent() {
  const data = await getLeagueData();
  return <LeaguePage data={data} />;
}

function LeagueSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="h-4 w-28 bg-gray-200 rounded-sm" />
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => <div key={i} className="h-20 bg-white border border-gray-100 rounded-md" />)}
      </div>
      <div className="bg-white border border-gray-100 rounded-md overflow-hidden">
        {Array.from({length: 8}).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
            <div className="h-4 w-6 bg-gray-200 rounded-sm" />
            <div className="h-8 w-8 bg-gray-100 rounded-md" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-24 bg-gray-200 rounded-sm" />
              <div className="h-2 w-16 bg-gray-100 rounded-sm" />
            </div>
            <div className="h-3 w-12 bg-gray-200 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeagueRoute() {
  return (
    <Suspense fallback={<LeagueSkeleton />}>
      <LeagueContent />
    </Suspense>
  );
}
