import { Suspense } from "react";
import { NightReviewPage } from "@/modules/exercises/components/NightReviewPage";
import { getNightReviewItems } from "@/modules/exercises/server/night-review.actions";

async function Content() {
  const items = await getNightReviewItems();
  return <NightReviewPage items={items} />;
}

export default function NightReviewRoute() {
  return (
    <Suspense fallback={
      <div className="p-5 max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded-sm" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white border border-gray-100 rounded-md" />
          ))}
        </div>
      </div>
    }>
      <Content />
    </Suspense>
  );
}
