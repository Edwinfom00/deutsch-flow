import { getAnalyticsData } from "@/modules/learn/server/analytics.actions";
import { AnalyticsPage } from "@/modules/learn/components/AnalyticsPage";
import { redirect } from "next/navigation";

export default async function Page() {
  const data = await getAnalyticsData().catch(() => null);
  if (!data) redirect("/login");
  return <AnalyticsPage data={data} />;
}
