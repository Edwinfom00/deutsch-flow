import { Suspense } from "react";
import { CommunityPage } from "@/modules/import/components/CommunityPage";
import { getCommunityImports } from "@/modules/import/server/community.actions";

async function CommunityContent({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const data = await getCommunityImports({
    docType: params.type,
    level: params.level,
    search: params.q,
    page: params.page ? Number(params.page) : 1,
  });
  return <CommunityPage initialData={data} />;
}

export default function CommunityRoute({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  return (
    <Suspense fallback={
      <div className="p-5 max-w-5xl mx-auto space-y-5 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 rounded-sm" />
        <div className="flex gap-2">
          {[0,1,2,3].map(i => <div key={i} className="h-9 w-24 bg-gray-100 rounded-md" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-32 bg-white border border-gray-100 rounded-md" />)}
        </div>
      </div>
    }>
      <CommunityContent searchParams={searchParams} />
    </Suspense>
  );
}
