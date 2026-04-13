import { Suspense } from "react";
import { notFound } from "next/navigation";
import { WordDetailPage } from "@/modules/exercises/components/WordDetailPage";
import { getWordDetail } from "@/modules/exercises/server/vocabulary.actions";

async function WordContent({ id }: { id: string }) {
  try {
    const data = await getWordDetail(id);
    return <WordDetailPage data={data} />;
  } catch {
    notFound();
  }
}

function WordSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-md" />
        <div className="h-4 w-32 bg-gray-200 rounded-sm" />
      </div>
      <div className="bg-white border border-gray-100 rounded-md p-5 space-y-3">
        <div className="h-8 w-48 bg-gray-200 rounded-sm" />
        <div className="h-3 w-24 bg-gray-100 rounded-sm" />
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full bg-gray-100 rounded-sm" />
          <div className="h-4 w-4/5 bg-gray-100 rounded-sm" />
          <div className="h-3 w-3/5 bg-gray-50 rounded-sm" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-white border border-gray-100 rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default async function WordDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<WordSkeleton />}>
      <WordContent id={id} />
    </Suspense>
  );
}
