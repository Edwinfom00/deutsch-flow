import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicProfile } from "@/modules/gamification/server/public-profile.actions";
import { PublicProfilePage } from "@/modules/gamification/components/PublicProfilePage";

async function Content({ userId }: { userId: string }) {
  const profile = await getPublicProfile(userId);
  if (!profile) notFound();
  return <PublicProfilePage profile={profile} />;
}

export default async function PublicProfileRoute({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <Suspense
      fallback={
        <div className="p-5 max-w-3xl mx-auto space-y-5 animate-pulse">
          <div className="h-3 w-28 bg-gray-200 rounded-sm" />
          <div className="h-36 bg-white border border-gray-100 rounded-md" />
          <div className="h-48 bg-white border border-gray-100 rounded-md" />
          <div className="h-64 bg-white border border-gray-100 rounded-md" />
        </div>
      }
    >
      <Content userId={userId} />
    </Suspense>
  );
}
