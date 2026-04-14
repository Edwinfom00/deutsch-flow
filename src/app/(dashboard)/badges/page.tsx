import { Suspense } from "react";
import { BadgesPage } from "@/modules/gamification/components/BadgesPage";
import { getBadges } from "@/modules/gamification/server/badges.actions";

async function BadgesContent() {
  const badges = await getBadges();
  return <BadgesPage badges={badges} />;
}

function BadgesSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="h-4 w-20 bg-gray-200 rounded-sm" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-32 bg-white border border-gray-100 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function BadgesRoute() {
  return (
    <Suspense fallback={<BadgesSkeleton />}>
      <BadgesContent />
    </Suspense>
  );
}
