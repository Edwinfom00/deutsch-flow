import { Suspense } from "react";
import { getProfileSettings } from "@/modules/profile/server/settings.actions";
import { SettingsPage } from "@/modules/profile/components/SettingsPage";
import { Skeleton } from "@/components/ui/skeleton";

async function SettingsContent() {
  const settings = await getProfileSettings();
  return <SettingsPage settings={settings} />;
}

function SettingsSkeleton() {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-4">
      <Skeleton className="h-4 w-24" />
      <div className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-8 w-24 ml-auto" />
      </div>
      <div className="bg-white border border-gray-200/70 rounded-md p-5 space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-8 w-24 ml-auto" />
      </div>
    </div>
  );
}

export default function SettingsRoute() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
