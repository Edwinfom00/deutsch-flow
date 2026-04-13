import { ReviewPage } from "@/modules/exercises/components/ReviewPage";
import { getDueReviews } from "@/modules/exercises/server/review.actions";
import { Suspense } from "react";

async function ReviewContent() {
  const data = await getDueReviews();
  return <ReviewPage initialData={data} />;
}

export default function ReviewRoute() {
  return (
    <Suspense fallback={
      <div className="p-5 max-w-5xl mx-auto space-y-5">
        <div className="space-y-1">
          <div className="h-4 w-20 bg-gray-200 rounded-sm animate-pulse" />
          <div className="h-3 w-56 bg-gray-100 rounded-sm animate-pulse" />
        </div>
        <div className="bg-white border border-gray-100 rounded-md p-8 text-center space-y-3 animate-pulse">
          <div className="h-10 w-10 bg-gray-100 rounded-md mx-auto" />
          <div className="h-4 w-48 bg-gray-200 rounded-sm mx-auto" />
          <div className="h-3 w-64 bg-gray-100 rounded-sm mx-auto" />
        </div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
