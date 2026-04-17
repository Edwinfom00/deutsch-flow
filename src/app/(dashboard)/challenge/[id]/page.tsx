import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getChallengeData, joinChallenge } from "@/modules/gamification/server/challenge.actions";
import { ChallengePage } from "@/modules/gamification/components/ChallengePage";

async function Content({ id }: { id: string }) {
  let data;
  try {
    data = await getChallengeData(id);
  } catch {
    notFound();
  }
  return <ChallengePage data={data} />;
}

export default async function ChallengeRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="p-5 max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded-sm" />
        <div className="h-48 bg-white border border-gray-100 rounded-md" />
      </div>
    }>
      <Content id={id} />
    </Suspense>
  );
}
